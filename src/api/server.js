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
import {
  getAssessmentByJobId,
  putAssessmentByJobId,
  submitAssessmentResponse,
  getAssessmentResponses,
} from "./controllers/assessmentsController";

// Create a promise that resolves when the server is ready
let serverReady = null;
let serverReadyResolve = null;

export async function makeServer({ environment = "development" } = {}) {
  console.log('Making server with environment:', environment);
  
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

    seeds(server) {
      console.log('Seeding initial data...');
      
      // Create exactly 25 jobs
      const jobs = server.createList("job", 25);
      
      // Create exactly 1000 candidates
      server.createList("candidate", 1000);
      
      // Create 2 random assessments
      const randomJobs = faker.helpers.arrayElements(jobs, 2);
      randomJobs.forEach(job => {
        server.schema.assessments.create({
          jobId: job.id,
          questions: [
            {
              id: '1',
              text: 'What is your experience with React?',
              type: 'text',
              validation: { required: true }
            },
            {
              id: '2',
              text: 'Years of experience',
              type: 'single',
              options: ['0-2', '3-5', '5+'],
              validation: { required: true }
            }
          ],
          responses: {}
        });
      });
      
      console.log('Data seeding complete:', {
        jobs: server.schema.jobs.all().length,
        candidates: server.schema.candidates.all().length,
        assessments: server.schema.assessments.all().length
      });
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
      this.get("/assessments/:jobId", getAssessmentByJobId);
      this.put("/assessments/:jobId", putAssessmentByJobId);
      this.post("/assessments/:jobId/submit", submitAssessmentResponse);
      this.get("/assessments/:jobId/responses", getAssessmentResponses);
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
