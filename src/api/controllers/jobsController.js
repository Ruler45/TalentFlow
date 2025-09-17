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

  // Ensure unique IDs and proper structure for each job
  const processedJobs = pageJobs
    .filter((job) => {
      // Filter out null/undefined jobs and jobs without required fields
      if (!job) return false;
      const jobData = job.attrs || job;
      return (
        jobData &&
        jobData.id &&
        jobData.title &&
        typeof jobData.title === "string" &&
        jobData.title.trim() !== ""
      );
    })
    .map((job) => {
      // If job has attrs property (from schema), use it, otherwise use the job directly
      const jobData = job.attrs || job;
      const processedJob = {
        id: (jobData.id || job.id).toString(), // Ensure ID is a string and exists
        title: jobData.title.trim(),
        slug: jobData.slug || "",
        description: jobData.description || "",
        location: jobData.location || "",
        tags: Array.isArray(jobData.tags)
          ? jobData.tags.filter((tag) => tag && typeof tag === "string")
          : [],
        status: ["active", "archived"].includes(jobData.status)
          ? jobData.status
          : "active",
        order: typeof jobData.order === "number" ? jobData.order : 0,
      };

      // Additional validation to ensure no empty objects slip through
      return processedJob.id && processedJob.title ? processedJob : null;
    })
    .filter((job) => job !== null); // Filter out any jobs that failed validation in the map

  // Verify no duplicate IDs
  const ids = new Set();
  processedJobs.forEach((job) => {
    if (ids.has(job.id)) {
      console.warn(`Duplicate job ID found: ${job.id}`, job);
    }
    ids.add(job.id);
  });

  return {
    jobs: processedJobs,
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
  try {
    // Parse and validate input
    const attrs = JSON.parse(request.requestBody);

    if (!attrs.title || !attrs.title.trim()) {
      return new Response(400, {}, { error: "Title is required" });
    }

    // Clean and prepare the job data
    const jobData = {
      title: attrs.title.trim(),
      slug:
        attrs.slug ||
        attrs.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      description: attrs.description || "",
      location: attrs.location || "",
      tags: Array.isArray(attrs.tags)
        ? attrs.tags.filter((tag) => tag && typeof tag === "string")
        : [],
      status: ["active", "archived"].includes(attrs.status)
        ? attrs.status
        : "active",
    };

    // Check for duplicate slug
    const existingJob = await db.jobs
      .where("slug")
      .equals(jobData.slug)
      .first();
    if (existingJob) {
      return new Response(
        400,
        {},
        { error: "A job with this slug already exists" }
      );
    }

    // Set the order
    const last = await db.jobs.orderBy("order").last();
    jobData.order = last ? last.order + 1 : 0;

    // Create in MirageJS schema first
    const schemaJob = schema.jobs.create(jobData);

    console.log("Created job in schema:", schemaJob);
    

    if (!schemaJob || !schemaJob.id) {
      throw new Error("Failed to create job in schema");
    }

    // Add to IndexedDB using the same ID
    const savedJob = await db.jobs.add({
      ...jobData,
      id: schemaJob.id,
    });

    if (!savedJob) {
      throw new Error("Failed to save job to database");
    }

    // Verify the job was saved
    const verifiedJob = await db.jobs.get(schemaJob.id);
    if (!verifiedJob) {
      throw new Error("Failed to verify job creation");
    }

    // Create the response object with the correct structure
    const processedJob = {
      id: verifiedJob.id.toString(),
      title: verifiedJob.title,
      slug: verifiedJob.slug,
      description: verifiedJob.description || "",
      location: verifiedJob.location || "",
      tags: Array.isArray(verifiedJob.tags) ? verifiedJob.tags : [],
      status: verifiedJob.status || "active",
      order: verifiedJob.order || 0,
    };

    // Important: Return a plain object, not a Response object
    // MirageJS will handle the response formatting
    return {
      job: processedJob,
    };
  } catch (error) {
    console.error("Error in addJobs:", error);
    return new Response(
      500,
      {},
      {
        error: error.message || "Failed to create job",
      }
    );
  }
};

export const updateJob = async (schema, request, serverReady) => {
  try {
    await serverReady;
    const id = request.params.id;
    const attrs = JSON.parse(request.requestBody);

    // First check if job exists in database
    const existingJob = await db.jobs.get(id);
    if (!existingJob) {
      return new Response(404, {}, { error: "Job not found" });
    }

    // Validate title if being updated
    if (attrs.title !== undefined && !attrs.title.trim()) {
      return new Response(400, {}, { error: "Title is required" });
    }

    // Check slug uniqueness if being updated
    if (attrs.slug !== undefined) {
      const jobWithSlug = await db.jobs.where("slug").equals(attrs.slug).first();
      if (jobWithSlug && jobWithSlug.id !== id) {
        return new Response(400, {}, { error: "Slug must be unique" });
      }
    }

    // Prepare the update data
    const updateData = {
      ...existingJob,
      ...attrs,
      title: attrs.title ? attrs.title.trim() : existingJob.title,
      description: attrs.description || existingJob.description || "",
      location: attrs.location || existingJob.location || "",
      tags: Array.isArray(attrs.tags) ? attrs.tags.filter(tag => tag && typeof tag === 'string') : existingJob.tags || [],
      status: ['active', 'archived'].includes(attrs.status) ? attrs.status : existingJob.status || 'active',
      order: typeof attrs.order === 'number' ? attrs.order : existingJob.order
    };

    // Update in database
    await db.jobs.put(updateData);

    // Verify the update with retries
    const verifyUpdate = async (retryCount = 0) => {
      const verifiedJob = await db.jobs.get(id);
      if (!verifiedJob) {
        throw new Error("Failed to retrieve updated job from database");
      }

      // Verify critical fields
      if (attrs.title && verifiedJob.title !== attrs.title.trim()) {
        if (retryCount < 3) {
          await new Promise(resolve => setTimeout(resolve, 100));
          return verifyUpdate(retryCount + 1);
        }
        throw new Error("Failed to verify title update");
      }

      return verifiedJob;
    };

    const verifiedJob = await verifyUpdate();

    // Update the schema to keep it in sync
    if (schema && schema.jobs) {
      const schemaJob = schema.jobs.find(id);
      if (schemaJob) {
        await schemaJob.update(updateData);
      } else {
        schema.jobs.create({ ...updateData, id });
      }
    }

    // Return the processed job with consistent structure
    return {
      job: {
        id: verifiedJob.id.toString(),
        title: verifiedJob.title,
        slug: verifiedJob.slug || "",
        description: verifiedJob.description || "",
        location: verifiedJob.location || "",
        tags: Array.isArray(verifiedJob.tags) ? verifiedJob.tags : [],
        status: verifiedJob.status || "active",
        order: verifiedJob.order || 0
      }
    };

  } catch (error) {
    console.error("Error in updateJob:", error);
    return new Response(500, {}, { 
      error: error.message || "Failed to update job" 
    });
  }
};

export const reorderJobs = async (schema, request, serverReady) => {
  await serverReady;
  const id = request.params.id;
  const { _fromOrder, toOrder } = JSON.parse(request.requestBody);

  // Occasionally return error to test rollback
  if (Math.random() < 0.1) {
    return new Response(500, {}, { error: "Random reorder failure" });
  }

  const job = schema.jobs.find(id);
  if (!job) {
    return new Response(404, {}, { error: "Job not found" });
  }

  // Get all jobs from IndexedDB and ensure they match schema
  let allJobs = await db.jobs.toArray();

  // Sync schema with IndexedDB if needed
  const schemaJobs = schema.jobs.all().models;
  if (schemaJobs.length !== allJobs.length) {
    console.log("Schema and IndexedDB mismatch, syncing...");
    for (const schemaJob of schemaJobs) {
      const dbJob = allJobs.find((j) => j.id === schemaJob.id);
      if (!dbJob || dbJob.order !== schemaJob.attrs.order) {
        await db.jobs.put({ ...schemaJob.attrs, id: schemaJob.id });
      }
    }
    allJobs = await db.jobs.toArray();
  }

  // Sort jobs by current order
  allJobs.sort((a, b) => a.order - b.order);

  // Find the job being moved
  const movingJob = allJobs.find((job) => job.id === id);
  if (!movingJob) {
    throw new Error("Job not found");
  }

  // Remove the job from its current position
  allJobs = allJobs.filter((job) => job.id !== id);

  // Calculate the new position index based on target order
  const insertIndex = toOrder - 1; // Convert 1-based order to 0-based index

  // Insert the job at its new position
  allJobs.splice(insertIndex, 0, { ...movingJob });

  // Update orders for all jobs based on their new positions
  const updatedJobs = allJobs.map((job, index) => ({
    ...job,
    order: index + 1 // Simple sequential ordering from 1
  }));

  try {
    // Update all jobs in IndexedDB in a single transaction
    await db.transaction("rw", db.jobs, async () => {
      // Update each job individually to ensure proper persistence
      for (const job of updatedJobs) {
        await db.jobs.put(job);
      }
    });

    const verifyUpdate = async (retryCount = 0) => {
      // Verify the dragged job
      const verifyDb = await db.jobs.get(id);
      if (!verifyDb) {
        throw new Error("Failed to retrieve updated job from IndexedDB");
      }

      // Get the expected order from our updated jobs array
      const expectedJob = updatedJobs.find((job) => job.id === id);
      if (!expectedJob) {
        throw new Error("Job not found in updated jobs array");
      }

      if (verifyDb.order !== expectedJob.order) {
        console.log("Order mismatch:", {
          actual: verifyDb.order,
          expected: expectedJob.order,
          job: verifyDb,
        });

        if (retryCount < 3) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return verifyUpdate(retryCount + 1);
        }
        throw new Error(
          `Failed to persist order update after retries. Expected order ${expectedJob.order}, got ${verifyDb.order}`
        );
      }

      // Verify all jobs are in correct order
      const allJobs = await db.jobs.toArray();

      // Sort by order to check sequence
      const sortedJobs = [...allJobs].sort((a, b) => a.order - b.order);

      // Check if orders are sequential and unique, starting from 1
      const orderIssues = [];
      for (let i = 0; i < sortedJobs.length; i++) {
        const expectedOrder = i + 1; // Expected order is index + 1
        if (sortedJobs[i].order !== expectedOrder) {
          orderIssues.push(
            `Job ${sortedJobs[i].id} has order ${sortedJobs[i].order}, expected ${expectedOrder}`
          );
        }
        if (i > 0 && sortedJobs[i].order <= sortedJobs[i - 1].order) {
          orderIssues.push(
            `Non-sequential order: ${sortedJobs[i - 1].id}(${
              sortedJobs[i - 1].order
            }) -> ${sortedJobs[i].id}(${sortedJobs[i].order})`
          );
        }
      }

      if (orderIssues.length > 0) {
        console.error("Order verification issues:", orderIssues);
        throw new Error(
          `Jobs are not properly ordered: ${orderIssues.join("; ")}`
        );
      }

      return verifyDb;
    };
    // Wait for verification with retries
    await verifyUpdate();

    // Log successful update
    console.log("Job reorder successful:", {
      jobId: id,
      newOrder: toOrder,
      totalJobs: updatedJobs.length,
      orders: updatedJobs.map((j) => ({ id: j.id, order: j.order })),
    });
  } catch (error) {
    console.error("IndexedDB job update verification failed:", error);

    // Log the current state for debugging
    const currentJobs = await db.jobs.toArray();
    console.log(
      "Current IndexedDB state:",
      currentJobs.map((j) => ({ id: j.id, order: j.order }))
    );

    // Attempt recovery
    try {
      await db.transaction("rw", db.jobs, async () => {
        // Re-sort and reassign orders, starting from 1
        const sortedJobs = currentJobs.sort((a, b) => a.order - b.order);
        for (let i = 0; i < sortedJobs.length; i++) {
          await db.jobs.update(sortedJobs[i].id, { order: i + 1 });
        }
      });
      console.log("Recovery complete - orders reassigned sequentially");
    } catch (recoveryError) {
      console.error("Recovery failed:", recoveryError);
    }

    throw error;
  }

  return job;
};
