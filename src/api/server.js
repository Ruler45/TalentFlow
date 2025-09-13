import { createServer, Model, Factory } from "miragejs";
import { faker } from "@faker-js/faker";

export function makeServer({ environment = "development" } = {}) {
  return createServer({
    environment,

    models: {
      job: Model,
      candidate: Model,
      assessment: Model,
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
      }),
      candidate: Factory.extend({
        name() {
          return faker.person.fullName();
        },
        email() {
          return faker.internet.email();
        },
        stage() {
          return faker.helpers.arrayElement([
            "applied", "screen", "tech", "offer", "hired", "rejected"
          ]);
        }
      })
    },

    seeds(server) {
      server.createList("job", 25);
      server.createList("candidate", 1000);
      // Add a few dummy assessments manually later
    },

    routes() {
      this.namespace = "api";

      // Jobs
      this.get("/jobs", (schema) => schema.jobs.all());
      this.post("/jobs", (schema, request) => {
        let attrs = JSON.parse(request.requestBody);
        return schema.jobs.create(attrs);
      });
      this.patch("/jobs/:id", (schema, request) => {
        let attrs = JSON.parse(request.requestBody);
        return schema.jobs.find(request.params.id).update(attrs);
      });

      // Candidates
      this.get("/candidates", (schema) => schema.candidates.all());
      this.post("/candidates", (schema, request) => {
        let attrs = JSON.parse(request.requestBody);
        return schema.candidates.create(attrs);
      });

      // Assessments
      this.get("/assessments/:jobId", () => {
        return { sections: [] }; // stub for now
      });
    },
  });
}
