import { createServer, Model, Factory } from "miragejs";
import { faker } from "@faker-js/faker";
import { db } from "../db/db";
import { hydrateServer } from "./hydrate";

// Create a promise that resolves when the server is ready
let serverReady = null;
let serverReadyResolve = null;

export function makeServer({ environment = "development" } = {}) {
  serverReady = new Promise(resolve => {
    serverReadyResolve = resolve;
  });

  let server = createServer({
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
        location() {
          return faker.location.city();
        },
        description() {
          return faker.lorem.paragraph();
        },
      }),
      candidate: Factory.extend({
        id(i) {
          return i + 1; // Ensure sequential IDs starting from 1
        },
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

    

    routes() {
      this.namespace = "api";
      
      // Remove random timing for debugging
      this.timing = 0;

      // Log all incoming requests
      this.pretender.handledRequest = function(verb, path, request) {
        console.log(`Mirage intercepted: ${verb} ${path}`, {
          params: request.queryParams,
          timestamp: new Date().toISOString()
        });
      };
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
      this.get("/candidates", async function(schema, request) {
        console.log("Candidates endpoint called");
        
        // Wait for server to be ready
        await serverReady;
        
        const page = Number(request.queryParams.page) || 1;
        const pageSize = Number(request.queryParams.pageSize) || 20;
        
        console.log("Query params:", { page, pageSize });

        // Debug schema state
        console.log("Schema debug:", {
          hasSchema: !!schema,
          hasCandidates: !!schema.candidates,
          schemaKeys: Object.keys(schema)
        });

        // Get candidates using schema's collection
        const collection = schema.candidates;
        console.log("Got collection:", !!collection);

        const all = collection.all();
        console.log("Called all() on collection:", !!all);

        const allCandidates = all.models || [];
        const total = allCandidates.length;

        console.log("Collection state:", {
          collectionExists: !!collection,
          hasAllMethod: !!collection.all,
          totalModels: total,
          firstModel: allCandidates[0]?.attrs
        });

        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const slice = allCandidates
          .slice(start, end)
          .map(model => model.attrs);

        console.log("Page calculation:", {
          start,
          end,
          sliceLength: slice.length,
          sampleRecord: slice[0]
        });

        const response = {
          candidates: slice,
          total
        };

        console.log("Sending response:", response);
        return response;
      });

      this.get("/candidates/:id", (schema, request) => {
        let candidate = schema.candidates.find(request.params.id);
        if (!candidate) return new Response(404, {}, { error: "Not found" });
        return candidate;
      });

      this.post("/candidates", (schema, request) => {
        let attrs = JSON.parse(request.requestBody);
        return schema.candidates.create(attrs);
      });

      this.passthrough();

      this.patch("/candidates/:id", async (schema, request) => {
        let id = request.params.id;
        let attrs = JSON.parse(request.requestBody);

        let candidate = schema.candidates.find(id);
        if (!candidate) return new Response(404, {}, { error: "Not found" });

        // Ensure timeline exists
        let timeline = [...(candidate.attrs.timeline || [])];
        
        // Only add new timeline entry if stage changed
        if (attrs.stage && attrs.stage !== candidate.attrs.stage) {
          timeline.push({
            date: new Date().toISOString(),
            status: attrs.stage
          });
        }

        // Update candidate with new data and timeline
        const updatedAttrs = {
          ...candidate.attrs,
          ...attrs,
          timeline
        };

        // Update both Mirage and IndexedDB
        candidate.update(updatedAttrs);
        await db.candidates.update(id, updatedAttrs);

        return candidate.attrs;
      });

      // Assessments
      this.get("/assessments/:jobId", () => {
        return { sections: [] }; // stub for now
      });
    },
  });

  // Wait for hydration to complete before returning server
  return hydrateServer(server).then(() => {
    console.log("Server hydration complete");
    
    // Verify routes are set up
    console.log("Available routes:", {
      routes: server.pretender.hosts.undefined.handlers.map(h => ({
        method: h.method,
        path: h.path
      }))
    });

    // Mark server as ready
    serverReadyResolve(true);
    return server;
  }).catch(error => {
    console.error("Server hydration failed:", error);
    serverReadyResolve(false);
    throw error;
  });
}
