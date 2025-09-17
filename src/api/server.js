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
      
      // Create 3 comprehensive assessments
      const randomJobs = faker.helpers.arrayElements(jobs, 3);
      randomJobs.forEach(job => {
        server.schema.assessments.create({
          jobId: job.id,
          questions: [
            {
              id: '1',
              text: 'What motivates you to apply for this position?',
              type: 'long_text',
              validation: { required: true, maxLength: 500 }
            },
            {
              id: '2',
              text: 'Years of relevant experience',
              type: 'numeric',
              validation: { required: true, min: 0, max: 40 }
            },
            {
              id: '3',
              text: 'Select your primary programming languages',
              type: 'multi',
              options: ['JavaScript', 'Python', 'Java', 'C++', 'Ruby', 'Go'],
              validation: { required: true }
            },
            {
              id: '4',
              text: 'Have you worked with React?',
              type: 'single',
              options: ['Yes', 'No'],
              validation: { required: true }
            },
            {
              id: '5',
              text: 'If yes, describe your React experience',
              type: 'long_text',
              validation: { required: false },
              conditionalLogic: {
                dependsOn: '4',
                showIf: 'Yes'
              }
            },
            {
              id: '6',
              text: 'Rate your expertise in the following areas (1-5)',
              type: 'numeric',
              validation: { required: true, min: 1, max: 5 }
            },
            {
              id: '7',
              text: 'Describe a challenging project you worked on',
              type: 'long_text',
              validation: { required: true, minLength: 100 }
            },
            {
              id: '8',
              text: 'Select your preferred work environment',
              type: 'single',
              options: ['Remote', 'Hybrid', 'Office'],
              validation: { required: true }
            },
            {
              id: '9',
              text: 'Upload your portfolio (PDF)',
              type: 'file',
              validation: { required: false, allowedTypes: ['pdf'] }
            },
            {
              id: '10',
              text: 'Are you willing to travel?',
              type: 'single',
              options: ['Yes', 'No', 'Occasionally'],
              validation: { required: true }
            },
            {
              id: '11',
              text: 'If yes, what percentage of time?',
              type: 'numeric',
              validation: { required: false, min: 0, max: 100 },
              conditionalLogic: {
                dependsOn: '10',
                showIf: 'Yes'
              }
            },
            {
              id: '12',
              text: 'Additional comments or questions',
              type: 'long_text',
              validation: { required: false }
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

      // Add artificial latency (200-1200ms)
      this.timing = () => faker.number.int({ min: 200, max: 1200 });

      // Simulate 5-10% error rate on write operations
      const shouldError = () => faker.number.float({ min: 0, max: 1 }) <= 0.075; // 7.5% error rate

      this.pretender.handledRequest = function (verb, path) {
        console.log(`${verb} ${path}`, { 
          timing: this.timing,
          errored: shouldError() && (verb !== 'GET')
        });
      };

      // Error simulation middleware for write operations
      const simulateErrors = (schema, request) => {
        const isWrite = !['GET'].includes(request.method);
        if (isWrite && shouldError()) {
          return new Response(500, {}, { 
            error: 'Simulated server error',
            message: 'This is a simulated error for testing error handling (5-10% error rate)'
          });
        }
        return null;
      };
      // Jobs
      this.get("/jobs", async (schema, request) =>
        getJobs(schema, request, serverReady)
      );

      this.post("/jobs", async (schema, request) => {
        const error = simulateErrors(schema, request);
        return error || addJobs(schema, request);
      });

      this.get("/jobs/:id", async (schema, request) =>
        getJobsById(schema, request, serverReady)
      );

      this.patch("/jobs/:id", async (schema, request) => {
        const error = simulateErrors(schema, request);
        return error || updateJob(schema, request, serverReady);
      });

      this.patch("/jobs/:id/reorder", async (schema, request) => {
        const error = simulateErrors(schema, request);
        return error || reorderJobs(schema, request, serverReady);
      });

      // Candidates
      this.get("/candidates", getCandidate);

      this.get("/candidates/:id", getCandidateById);

      this.post("/candidates", async (schema, request) => {
        const error = simulateErrors(schema, request);
        return error || addCandidate(schema, request);
      });

      this.passthrough();

      this.patch("/candidates/:id", async (schema, request) => {
        const error = simulateErrors(schema, request);
        return error || updateCandidate(schema, request);
      });

      // Assessments
      this.get("/assessments/:jobId", getAssessmentByJobId);
      
      this.put("/assessments/:jobId", async (schema, request) => {
        const error = simulateErrors(schema, request);
        return error || putAssessmentByJobId(schema, request);
      });
      
      this.post("/assessments/:jobId/submit", async (schema, request) => {
        const error = simulateErrors(schema, request);
        return error || submitAssessmentResponse(schema, request);
      });
      
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
