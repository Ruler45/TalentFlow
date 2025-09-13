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
            "applied",
            "screen",
            "tech",
            "offer",
            "hired",
            "rejected",
          ]);
        },
        afterCreate(candidate) {
          candidate.update({
            timeline: [
              { date: faker.date.past().toISOString(), status: "applied" },
              { date: new Date().toISOString(), status: candidate.stage },
            ],
          });
        },
      }),
    },

    seeds(server) {
      server.createList("job", 25);
      if (server.db.candidates.length === 0) {
        server.createList("candidate", 1000);
      }
      // Add a few dummy assessments manually later
    },

    routes() {
      this.namespace = "api";
      this.timing = 300 + Math.floor(Math.random() * 900);
      // Jobs
      this.get("/jobs", (schema) => schema.jobs.all());
      this.post("/jobs", (schema, request) => {
        let attrs = JSON.parse(request.requestBody);
        return schema.jobs.create(attrs);
      });
      this.get("/jobs/:id", (schema, request) => {
        let attrs = JSON.parse(request.requestBody);
        return schema.jobs.find(request.params.id).update(attrs);
      });

      // Candidates
      this.get("/candidates", (schema, request) => {
        const page = Number(request.queryParams.page) || 1;
        const pageSize = Number(request.queryParams.pageSize) || 20;

        const all = schema.all("candidate").models;
        const total = all.length;

        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const slice = all.slice(start, end);

        return { candidates: slice, total };
      });

      this.post("/candidates", (schema, request) => {
        let attrs = JSON.parse(request.requestBody);
        return schema.candidates.create(attrs);
      });

      this.passthrough();

      this.get("/candidates/:id", (schema, request) => {
        let candidate = schema.candidates.find(request.params.id);
        if (!candidate) return new Response(404, {}, { error: "Not found" });
        return candidate ; // includes timeline now
      });

      this.patch("/candidates/:id", (schema, request) => {
        let id = request.params.id;
        let attrs = JSON.parse(request.requestBody);

        let candidate = schema.candidates.find(id);
        if (!candidate) return new Response(404, {}, { error: "Not found" });

        // update stage
        candidate.update(attrs);

        // push to timeline (preserve existing!)
        let current = candidate.attrs.timeline || [];
        current.push({
          date: new Date().toISOString(),
          status: attrs.stage,
        });

        candidate.update({ timeline: current });

        return candidate.attrs;
      });

      // Assessments
      this.get("/assessments/:jobId", () => {
        return { sections: [] }; // stub for now
      });
    },
  });
}
