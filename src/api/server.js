import { createServer, Model, Factory } from "miragejs";
import { faker } from "@faker-js/faker";
import { hydrateServer } from "./hydrate";
import {
  getCandidate,
  addCandidate,
  getCandidateById,
  updateCandidate,
} from "./controllers/candidateController";
import {
  getJobs,
  getJobsById,
  addJobs,
  updateJob,
  reorderJobs,
} from "./controllers/jobsController";

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
            "interview",
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
      this.get("/jobs", async (schema, request) =>
        getJobs(schema, request, serverReady)
      );

      this.post("/jobs", addJobs);

      this.get("/jobs/:id", async (schema, request) =>
        getJobsById(schema, request, serverReady)
      );

      this.patch("/jobs/:id", async (schema, request) =>
        updateJob(schema, request, serverReady)
      );

      this.patch("/jobs/:id/reorder", async (schema, request) =>
        reorderJobs(schema, request, serverReady)
      );

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
