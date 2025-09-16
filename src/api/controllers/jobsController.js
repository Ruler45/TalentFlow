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
    await db.jobs.put({...job.attrs,attrs});

    const verifyUpdate = async (retryCount = 0) => {
      const verifyDb = await db.jobs.get(id);

      if (!verifyDb) {
        throw new Error("Failed to retrieve updated job from IndexedDB");
      }

      if (verifyDb.order !== job.attrs.order) {
        if (retryCount < 3) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return verifyUpdate(retryCount + 1);
        }
        throw new Error("Failed to persist order update after retries");
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

  // Get all jobs from IndexedDB
  let allJobs = await db.jobs.toArray();
  
  // Sort jobs by order to ensure correct reordering
  allJobs.sort((a, b) => a.order - b.order);
  
  // Find the jobs that need to be reordered
  const min = Math.min(fromOrder, toOrder);
  const max = Math.max(fromOrder, toOrder);
  
  // Update orders in all affected jobs
  const updatedJobs = allJobs.map(dbJob => {
    // Skip jobs outside the affected range
    if (dbJob.order < min || dbJob.order > max) {
      return dbJob;
    }
    
    // This is the job being dragged
    if (dbJob.id === id) {
      return { ...dbJob, order: toOrder };
    }
    
    // Moving a job down in order
    if (fromOrder < toOrder) {
      if (dbJob.order > fromOrder && dbJob.order <= toOrder) {
        return { ...dbJob, order: dbJob.order - 1 };
      }
    }
    // Moving a job up in order
    else if (fromOrder > toOrder) {
      if (dbJob.order >= toOrder && dbJob.order < fromOrder) {
        return { ...dbJob, order: dbJob.order + 1 };
      }
    }
    
    return dbJob;
  });

  try {
    // Update all jobs in IndexedDB in a single transaction
    await db.transaction('rw', db.jobs, async () => {
      // Clear existing jobs
      await db.jobs.clear();
      // Add all updated jobs
      await db.jobs.bulkAdd(updatedJobs);
    });

    const verifyUpdate = async (retryCount = 0) => {
      // Verify the dragged job
      const verifyDb = await db.jobs.get(id);
      if (!verifyDb) {
        throw new Error("Failed to retrieve updated job from IndexedDB");
      }
      
      if (verifyDb.order !== toOrder) {
        if (retryCount < 3) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return verifyUpdate(retryCount + 1);
        }
        throw new Error("Failed to persist order update after retries");
      }

      // Verify all jobs are in correct order
      const allJobs = await db.jobs.toArray();
      const sortedJobs = [...allJobs].sort((a, b) => a.order - b.order);
      
      // Check if orders are sequential and unique
      for (let i = 0; i < sortedJobs.length; i++) {
        if (i > 0 && sortedJobs[i].order <= sortedJobs[i-1].order) {
          throw new Error("Jobs are not properly ordered after reordering");
        }
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
