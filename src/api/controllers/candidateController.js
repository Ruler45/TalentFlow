import { db } from "../../db/db";

const getCandidate = async function (schema, request, serverReady) {
  // Wait for server to be ready
  await serverReady;

  const page = Number(request.queryParams.page) || 1;
  const pageSize = Number(request.queryParams.pageSize) || 20;
  const stage = request.queryParams.stage || null;

  // Get candidates using schema's collection
  const collection = schema.candidates;
  const all = collection.all();

  let allCandidates = all.models || [];

  // Apply stage filter if provided
  if (stage) {
    allCandidates = allCandidates.filter(
      (model) => model.attrs.stage === stage
    );
  }

  const total = allCandidates.length;

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const slice = allCandidates.slice(start, end).map((model) => {
    const job = schema.jobs.find(model.attrs.jobId);
    return {
      ...model.attrs,
      jobTitle: job ? job.attrs.title : "Unknown Position",
    };
  });

  return {
    candidates: slice,
    total,
  };
};

const addCandidate = async function (schema, request, serverReady) {
  await serverReady;

  let attrs = JSON.parse(request.requestBody);

  // Add initial timeline entry
  attrs.timeline = [
    {
      date: new Date().toISOString(),
      status: attrs.stage || "applied",
    },
  ];

  try {
    // Create in Mirage first
    const candidate = schema.candidates.create(attrs);

    // Then store in IndexedDB
    try {
      await db.candidates.add({
        ...candidate.attrs,
        id: Number(candidate.id),
      });

      // Function to verify the creation with retries
      const verifyCreation = async (retryCount = 0) => {
        const verifyDb = await db.candidates.get(Number(candidate.id));

        if (!verifyDb) {
          if (retryCount < 3) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            return verifyCreation(retryCount + 1);
          }
          throw new Error("Failed to verify candidate creation after retries");
        }

        return verifyDb;
      };

      // Wait for verification with retries
      await verifyCreation();
    } catch (dbError) {
      console.error("IndexedDB creation failed:", dbError);
      // Continue with Mirage response even if IndexedDB fails
    }

    // Return consistent response format
    return {
      id: candidate.id,
      name: candidate.attrs.name,
      email: candidate.attrs.email,
      stage: candidate.attrs.stage,
      timeline: candidate.attrs.timeline || [],
    };
  } catch (error) {
    return new Response(
      500,
      {},
      {
        error: "Failed to create candidate",
        details: error.message,
      }
    );
  }
};

const getCandidateById = async function (schema, request, serverReady) {
  // Wait for server to be ready
  await serverReady;

  let candidate = schema.candidates.find(request.params.id);

  if (!candidate) {
    return new Response(404, {}, { error: "Not found" });
  }

  // Get associated job
  const job = schema.jobs.find(candidate.attrs.jobId);

  // Ensure we return the attributes with proper structure
  return {
    id: candidate.id,
    name: candidate.attrs.name,
    email: candidate.attrs.email,
    stage: candidate.attrs.stage,
    timeline: candidate.attrs.timeline || [],
    jobId: candidate.attrs.jobId,
    jobTitle: job ? job.attrs.title : "Unknown Position",
  };
};

const updateCandidate = async function (schema, request, serverReady) {
  // Wait for server to be ready
  await serverReady;

  let id = request.params.id;
  let attrs = JSON.parse(request.requestBody);

  let candidate = schema.candidates.find(id);
  if (!candidate) return new Response(404, {}, { error: "Not found" });

  // Ensure timeline exists
  let timeline = [...(candidate.attrs.timeline || [])];

  // Only add new timeline entry if stage changed
  if (attrs.stage && attrs.stage !== candidate.attrs.stage) {
    timeline.push({
      date: new Date().toISOString(),
      status: attrs.stage,
    });
  }

  // Update candidate with new data and timeline
  const updatedAttrs = {
    ...candidate.attrs,
    ...attrs,
    timeline,
  };

  try {
    // Update Mirage first

    try {
      // Then update IndexedDB and wait for it to complete

      await candidate.update(updatedAttrs);
      // await db.candidates.delete(id);
      await db.candidates.put({ ...updatedAttrs });

      // Function to verify the update with retries
      const verifyUpdate = async (retryCount = 0) => {
        const verifyDb = await db.candidates.get(id);

        if (!verifyDb) {
          throw new Error(
            "Failed to retrieve updated candidate from IndexedDB"
          );
        }

        if (verifyDb.stage !== updatedAttrs.stage) {
          if (retryCount < 3) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            return verifyUpdate(retryCount + 1);
          }
          throw new Error("Failed to persist stage update after retries");
        }

        return verifyDb;
      };

      // Wait for verification with retries
      await verifyUpdate();
    } catch (dbError) {
      console.error("IndexedDB update failed:", dbError);
      // Continue with Mirage response even if IndexedDB fails
    }

    // Get the updated candidate from schema to ensure we have the latest state
    const updatedCandidate = schema.candidates.find(id);

    // Ensure consistent response format using schema data
    const response = {
      id: updatedCandidate.id,
      name: updatedCandidate.attrs.name,
      email: updatedCandidate.attrs.email,
      stage: updatedCandidate.attrs.stage,
      timeline: updatedCandidate.attrs.timeline || [],
    };

    return response;
  } catch (error) {
    return new Response(
      500,
      {},
      {
        error: "Failed to update candidate",
        details: error.message,
      }
    );
  }
};
export { getCandidate, addCandidate, getCandidateById, updateCandidate };
