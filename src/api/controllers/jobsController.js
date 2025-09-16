import { db } from "../../db/db";

export const getJobs = async (schema, request, serverReady) => {
  await serverReady;

  const page = Number(request.queryParams.page) || 1;
  const pageSize = Number(request.queryParams.pageSize) || 20;
  const search = request.queryParams.search || "";
  const status = request.queryParams.status || "";
  const sort = request.queryParams.sort || "order";

  let jobs = await db.jobs.toArray();

  // Apply filters
  if (search) {
    const searchLower = search.toLowerCase();
    jobs = jobs.filter(
      (job) =>
        job.attrs.title.toLowerCase().includes(searchLower) ||
        job.attrs.tags.some((tag) => tag.toLowerCase().includes(searchLower))
    );
  }

  if (status) {
    jobs = jobs.filter((job) => job.status === status);
  }

  // Apply sorting
  jobs.sort((a, b) => {
    if (sort === "order") {
      return a.order - b.order;
    }
    return a.title.localeCompare(b.title);
  });

  // Apply pagination
  const total = jobs.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageJobs = jobs.slice(start, end);

  // pageJobs.map(j => console.log("Page job:",j.attrs));

  return {
    jobs: pageJobs.map((j) => j),
    total,
    page,
    pageSize,
  };
};

export const getJobsById = async (schema, request, serverReady) => {
  await serverReady;

  const id = request.params.id;
  const job = await db.jobs.get(id);

  // console.log(job);

  if (!job) {
    return new Response(404, {}, { error: "Job not found" });
  }
  return job;
};

export const addJobs = async (schema, request) => {
  let attrs = JSON.parse(request.requestBody);

  if (!attrs.title) {
    return new Response(400, {}, { error: "Title is required" });
  }

  attrs.slug =
    attrs.slug ||
    attrs.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const existingJob = await db.jobs.where("slug").equals(attrs.slug).first();
  if (existingJob) {
    return new Response(400, {}, { error: "Slug must be unique" });
  }

  attrs.status = attrs.status || "active";
  attrs.tags = attrs.tags || [];

  const last = await db.jobs.orderBy("order").last();
  attrs.order =
    typeof attrs.order === "number" ? attrs.order : last ? last.order + 1 : 0;

  const id = await db.jobs.add(attrs);
  return { ...attrs, id };
};

export const updateJob = async (schema, request, serverReady) => {
  await serverReady;
  const id = request.params.id;
  const attrs = JSON.parse(request.requestBody);
  const job = schema.jobs.find(id);

  // console.log("Received PATCH for job:", id, attrs);

  if (!job) {
    return new Response(404, {}, { error: "Job not found" });
  }
  // Validate title if being updated
  if (attrs.title !== undefined && !attrs.title) {
    return new Response(400, {}, { error: "Title is required" });
  }

  // Check slug uniqueness if being updated
  if (attrs.slug !== undefined) {
    const existingJob = schema.jobs.findBy({ slug: attrs.slug });
    if (existingJob && existingJob.id !== id) {
      return new Response(400, {}, { error: "Slug must be unique" });
    }
  }
  await job.update(attrs);

  try {
    await db.jobs.put(job.attrs);

    const verifyUpdate = async (retryCount = 0) => {
      const verifyDb = await db.jobs.get(id);

      if (!verifyDb) {
        throw new Error("Failed to retrieve updated job from IndexedDB");
      }

      if (verifyDb.status !== attrs.status) {
        if (retryCount < 3) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return verifyUpdate(retryCount + 1);
        }
        throw new Error("Failed to persist status update after retries");
      }

      return verifyDb;
    };
    // Wait for verification with retries
    await verifyUpdate();
  } catch (error) {
    console.log("IndexedDB job update verification failed:", error);
  }
  // console.log(job);

  return job;
};

export const reorderJobs = async (schema, request, serverReady) => {
  await serverReady;
  const id = request.params.id;
  const { fromOrder, toOrder } = JSON.parse(request.requestBody);

  // Occasionally return error to test rollback
  if (Math.random() < 0.1) {
    return new Response(500, {}, { error: "Random reorder failure" });
  }

  const job = schema.jobs.find(id);
  if (!job) {
    return new Response(404, {}, { error: "Job not found" });
  }

  // Get all jobs between the old and new positions
  const allJobs = schema.jobs.all().models;
  const min = Math.min(fromOrder, toOrder);
  const max = Math.max(fromOrder, toOrder);
  const affectedJobs = allJobs.filter(
    (j) => j.attrs.order >= min && j.attrs.order <= max
  );

  // Update orders
  if (fromOrder < toOrder) {
    // Moving down
    affectedJobs.forEach((j) => {
      if (j.id !== id && j.attrs.order <= toOrder) {
        j.update({ order: j.attrs.order - 1 });
      }
    });
  } else {
    // Moving up
    affectedJobs.forEach((j) => {
      if (j.id !== id && j.attrs.order >= toOrder) {
        j.update({ order: j.attrs.order + 1 });
      }
    });
  }

  // Update the moved job
  job.update({ order: toOrder });

  try {
    await db.jobs.put(job.attrs);

    const verifyUpdate = async (retryCount = 0) => {
      const verifyDb = await db.jobs.get(id);

      if (!verifyDb) {
        throw new Error("Failed to retrieve updated job from IndexedDB");
      }

      if (verifyDb.status !== toOrder) {
        if (retryCount < 3) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return verifyUpdate(retryCount + 1);
        }
        throw new Error("Failed to persist status update after retries");
      }

      return verifyDb;
    };
    // Wait for verification with retries
    await verifyUpdate();
  } catch (error) {
    console.log("IndexedDB job update verification failed:", error);
  }

  return job;
};
