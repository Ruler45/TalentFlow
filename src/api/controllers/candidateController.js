import { db } from "../../db/db";

const getCandidate = async function (schema, request, serverReady) {
  // Wait for server to be ready
  await serverReady;

  const page = Number(request.queryParams.page) || 1;
  const pageSize = Number(request.queryParams.pageSize) || 20;
  const stage = request.queryParams.stage || null;

  try {
    // Get all candidates from IndexedDB
    let allCandidates = await db.candidates.toArray();

    // If no candidates in DB, try to sync from schema
    if (allCandidates.length === 0) {
      console.log('No candidates in DB, syncing from schema');
      const schemaCollection = schema.candidates.all();
      const schemaCandidates = schemaCollection.models || [];
      
      // Sync schema candidates to IndexedDB
      await Promise.all(schemaCandidates.map(async (model) => {
        try {
          await db.candidates.put({
            ...model.attrs,
            id: model.id,  // Keep ID as string
          });
        } catch (syncError) {
          console.error('Failed to sync candidate to IndexedDB:', syncError);
        }
      }));

      // Fetch again after sync
      allCandidates = await db.candidates.toArray();
    }

    // Apply stage filter if provided
    const filteredCandidates = stage 
      ? allCandidates.filter(candidate => candidate.stage === stage)
      : allCandidates;

    // Calculate pagination
    const total = filteredCandidates.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    // Get the paginated slice and add job titles
    const paginatedCandidates = await Promise.all(
      filteredCandidates.slice(start, end).map(async (candidate) => {
        const job = schema.jobs.find(candidate.jobId);
        return {
          ...candidate,
          jobTitle: job ? job.attrs.title : "Unknown Position",
        };
      })
    );

    // Return paginated results
    return {
      candidates: paginatedCandidates,
      total,
    };

  } catch (error) {
    console.error("Error in getCandidate:", error);
    return new Response(500, {}, {
      error: "Failed to retrieve candidates",
      details: error.message
    });
  }
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
        id: candidate.id,  // Keep ID as string
      });

      // Function to verify the creation with retries
      const verifyCreation = async (retryCount = 0) => {
        const verifyDb = await db.candidates.get(candidate.id);

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

  const id = request.params.id;

  try {
    // Get candidate from both IndexedDB and schema
    const [dbCandidate, schemaCandidate] = await Promise.all([
      db.candidates.get(id),
      Promise.resolve(schema.candidates.find(id))
    ]);

    // If neither source has the candidate, return 404
    if (!dbCandidate && !schemaCandidate) {
      return new Response(404, {}, { error: "Not found" });
    }

    // Prefer IndexedDB data but fall back to schema if needed
    const candidate = dbCandidate || (schemaCandidate ? schemaCandidate.attrs : null);

    // If we have schema data but no DB data, sync to DB
    if (!dbCandidate && schemaCandidate) {
      try {
        await db.candidates.put({
          ...schemaCandidate.attrs,
          id: id,
          timeline: schemaCandidate.attrs.timeline || []
        });
      } catch (dbError) {
        console.error("Failed to sync candidate to IndexedDB:", dbError);
        // Continue with schema data
      }
    }

    // Get associated job
    const job = schema.jobs.find(candidate.jobId);

    // Return merged data with consistent structure
    return {
      id: candidate.id,
      name: candidate.name,
      email: candidate.email,
      stage: candidate.stage,
      timeline: candidate.timeline || [],
      jobId: candidate.jobId,
      jobTitle: job ? job.attrs.title : "Unknown Position",
    };
  } catch (error) {
    console.error("Error in getCandidateById:", error);
    return new Response(500, {}, { 
      error: "Failed to retrieve candidate",
      details: error.message 
    });
  }
};

const updateCandidate = async function (schema, request, serverReady) {
  // Wait for server to be ready
  await serverReady;

  const id = request.params.id;
  let attrs = JSON.parse(request.requestBody);

  // Check IndexedDB first
  const dbCandidate = await db.candidates.get(id);
  
  // Only fallback to schema if not in DB
  if (!dbCandidate) {
    const schemaCandidate = schema.candidates.find(id);
    if (!schemaCandidate) {
      return new Response(404, {}, { error: "Not found" });
    }
  }

  // Get the current stage from DB or schema
  const currentStage = dbCandidate ? dbCandidate.stage : schema.candidates.find(id).attrs.stage;
  
  // Ensure timeline exists - prefer IndexedDB timeline
  let timeline = [...(dbCandidate?.timeline || [])];

  // Only add new timeline entry if stage is actually changing from the current stage
  if (attrs.stage && attrs.stage !== currentStage) {
    console.log('Stage change detected:', { 
      from: currentStage, 
      to: attrs.stage,
      candidateId: id 
    });
    timeline.push({
      date: new Date().toISOString(),
      status: attrs.stage,
    });
  }

  // Update candidate with new data and timeline
  const updatedAttrs = {
    ...(dbCandidate || schema.candidates.find(id).attrs), // Use DB data or schema as fallback
    ...attrs,
    timeline,
  };

  try {
    // Update schema first
    const schemaCandidate = schema.candidates.find(id);
    await schemaCandidate.update(updatedAttrs);

    try {
      // Update IndexedDB
      await db.candidates.put({
        ...updatedAttrs,
        id: id, // Keep ID as string
        timeline: timeline // Ensure timeline is included
      });

      // Function to verify the update with retries
      const verifyUpdate = async (retryCount = 0) => {
        const verifyDb = await db.candidates.get(id);

        if (!verifyDb) {
          if (retryCount < 3) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            return verifyUpdate(retryCount + 1);
          }
          throw new Error("Failed to retrieve updated candidate from IndexedDB");
        }

        // Verify both stage and timeline are updated
        if (verifyDb.stage !== updatedAttrs.stage || 
            JSON.stringify(verifyDb.timeline) !== JSON.stringify(timeline)) {
          if (retryCount < 3) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            return verifyUpdate(retryCount + 1);
          }
          throw new Error("Failed to persist updates after retries");
        }

        return verifyDb;
      };

      // Wait for verification with retries
      await verifyUpdate();
    } catch (dbError) {
      console.error("IndexedDB update failed:", dbError);
      throw dbError; // Propagate the error instead of silently continuing
    }

    // Get the updated candidate from both schema and DB to ensure consistency
    const updatedCandidate = schema.candidates.find(id);
    const dbCandidate = await db.candidates.get(id);

    if (!updatedCandidate || !dbCandidate) {
      throw new Error("Failed to retrieve updated candidate");
    }

    // Use DB data as source of truth, but fall back to schema if needed
    const response = {
      id: dbCandidate.id || updatedCandidate.id,
      name: dbCandidate.name || updatedCandidate.attrs.name,
      email: dbCandidate.email || updatedCandidate.attrs.email,
      stage: dbCandidate.stage || updatedCandidate.attrs.stage,
      timeline: dbCandidate.timeline || updatedCandidate.attrs.timeline || [],
      jobId: dbCandidate.jobId || updatedCandidate.attrs.jobId,
    };

    // Add job title if available
    const job = schema.jobs.find(response.jobId);
    if (job) {
      response.jobTitle = job.attrs.title;
    }

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
