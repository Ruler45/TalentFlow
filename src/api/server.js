import { createServer, Model, Factory } from "miragejs";
import { faker } from "@faker-js/faker";
import { db } from "../db/db";
import { hydrateServer } from "./hydrate";
import { getCandidate, addCandidate,getCandidateById,updateCandidate } from "./controllers/candidateController";

// Create a promise that resolves when the server is ready
let serverReady = null;
let serverReadyResolve = null;

export async function makeServer({ environment = "development" } = {}) {
  serverReady = new Promise((resolve) => {
    serverReadyResolve = resolve;
  });

  let server = createServer({
    environment,

    models: {
      job: Model,
      candidate: Model,
      assessment: Model,
    },

    // eslint-disable-next-line no-unused-vars
    seeds(server) {
      // We'll handle seeding in the hydrate function instead
      // This prevents double-seeding when we have IndexedDB data
    },

    factories: {
      job: Factory.extend({
        title() {
          return faker.person.jobTitle();
        },
        slug(i) {
          return `job-${i}`;
        },
        status() {
          return faker.helpers.arrayElement(["active", "archived"]);
        },
        tags() {
          return [faker.word.noun(), faker.word.adjective()];
        },
        order(i) {
          return i;
        },
        location() {
          return faker.location.city();
        },
        description() {
          return faker.lorem.paragraph();
        },
      }),
      candidate: Factory.extend({
        name() {
          return faker.person.fullName();
        },
        email() {
          return faker.internet.email();
        },
        jobId() {
          // Get a random job ID between 1 and 25 (our seeded job count)
          return faker.number.int({ min: 1, max: 25 }).toString();
        },
        stage() {
          return faker.helpers.arrayElement([
            "applied",
            "screen",
            "tech",
            "offer",
            "hired",
            "rejected",
          ]);
        },
        timeline() {
          const stage = this.stage;
          return [
            { date: faker.date.past().toISOString(), status: "applied" },
            { date: new Date().toISOString(), status: stage },
          ];
        },
      }),
    },

    routes() {
      this.namespace = "api";

      // Remove random timing for debugging
      this.timing = 0;

      // Setup request handling
      this.pretender.handledRequest = function () {};
      // Jobs
      this.get("/jobs", async (schema, request) => {
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
              job.attrs.tags.some((tag) =>
                tag.toLowerCase().includes(searchLower)
              )
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
      });

      this.post("/jobs", async (schema, request) => {
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

        const existingJob = await db.jobs
          .where("slug")
          .equals(attrs.slug)
          .first();
        if (existingJob) {
          return new Response(400, {}, { error: "Slug must be unique" });
        }

        attrs.status = attrs.status || "active";
        attrs.tags = attrs.tags || [];

        const last = await db.jobs.orderBy("order").last();
        attrs.order =
          typeof attrs.order === "number"
            ? attrs.order
            : last
            ? last.order + 1
            : 0;

        const id = await db.jobs.add(attrs);
        return { ...attrs, id };
      });

      this.get("/jobs/:id", async (schema, request) => {
        const id = request.params.id;
        const job = await db.jobs.get(id);

        // console.log(job);
        

        if (!job) {
          return new Response(404, {}, { error: "Job not found" });
        }
        return job;
      });

      this.patch("/jobs/:id", async (schema, request) => {
        // await serverReady;
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
          // console.log("Patching job in IndexedDB:", { id, ...job.attrs });
          // const updatedAttrs = { ...job.attrs, id: id };

          // const jobAtDB = await db.jobs.get(id);
          // console.log("Job at DB before update:", jobAtDB);
          // console.log("Updated attributes to store:", updatedAttrs);

          await db.jobs.put(job.attrs);
          // console.log("Updated jobs:", await db.jobs.get(id));

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
      });

      this.patch("/jobs/:id/reorder", (schema, request) => {
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

        return job;
      });

      // Candidates
      this.get("/candidates", getCandidate);

      this.get("/candidates/:id", getCandidateById);

      this.post("/candidates", addCandidate);

      this.passthrough();

      this.patch("/candidates/:id", updateCandidate);

      // Assessments
      this.get("/assessments/:jobId", () => {
        return { sections: [] }; // stub for now
      });
    },
  });

  // Wait for hydration to complete before returning server
  return hydrateServer(server)
    .then(() => {
      // Mark server as ready
      serverReadyResolve(true);
      return server;
    })
    .catch((error) => {
      serverReadyResolve(false);
      throw error;
    });
}
