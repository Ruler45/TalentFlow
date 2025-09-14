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

      this.get("/candidates/:id", async function(schema, request) {
        console.log("Candidate detail endpoint called for id:", request.params.id);
        
        // Wait for server to be ready
        await serverReady;
        
        let candidate = schema.candidates.find(request.params.id);
        console.log("Raw candidate from schema:", candidate);
        
        if (!candidate) {
          console.log("Candidate not found");
          return new Response(404, {}, { error: "Not found" });
        }

        // Ensure we return the attributes with proper structure
        const response = {
          id: candidate.id,
          name: candidate.attrs.name,
          email: candidate.attrs.email,
          stage: candidate.attrs.stage,
          timeline: candidate.attrs.timeline || []
        };

        console.log("Sending candidate response:", response);
        return response;
      });

      this.post("/candidates", (schema, request) => {
        let attrs = JSON.parse(request.requestBody);
        return schema.candidates.create(attrs);
      });

      this.passthrough();

      this.patch("/candidates/:id", async function(schema, request) {
        console.log("Candidate update endpoint called");
        
        // Wait for server to be ready
        await serverReady;
        
        let id = request.params.id;
        let attrs = JSON.parse(request.requestBody);
        
        console.log("Updating candidate:", { id, attrs });

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

        try {
          // Update Mirage first
          candidate.update(updatedAttrs);
          console.log("Updated Mirage candidate:", candidate.attrs);

          try {
            // Then update IndexedDB and wait for it to complete
            console.log("Updating IndexedDB with:", updatedAttrs);
            // First delete to ensure clean update
            await db.candidates.delete(Number(id));
            // Then add the new data
            await db.candidates.add({ ...updatedAttrs, id: Number(id) });
            
            // Function to verify the update with retries
            const verifyUpdate = async (retryCount = 0) => {
              const verifyDb = await db.candidates.get(Number(id));
              console.log(`Verification attempt ${retryCount + 1} from IndexedDB:`, verifyDb);
              
              if (!verifyDb) {
                throw new Error("Failed to retrieve updated candidate from IndexedDB");
              }
              
              if (verifyDb.stage !== updatedAttrs.stage) {
                if (retryCount < 3) {
                  console.log(`Stage mismatch, retrying in 100ms... (attempt ${retryCount + 1})`);
                  await new Promise(resolve => setTimeout(resolve, 100));
                  return verifyUpdate(retryCount + 1);
                }
                console.error("IndexedDB verification failed after retries - stage mismatch", {
                  expected: updatedAttrs.stage,
                  actual: verifyDb.stage
                });
                throw new Error("Failed to persist stage update after retries");
              }
              
              return verifyDb;
            };
            
            // Wait for verification with retries
            await verifyUpdate();
            
          } catch (dbError) {
            console.error("IndexedDB operation failed:", dbError);
            // Continue with Mirage response even if IndexedDB fails
          }

          // Get the updated candidate from schema to ensure we have the latest state
          const updatedCandidate = schema.candidates.find(id);
          
          // Ensure consistent response format using schema data
          const response = {
            id: updatedCandidate.id,
            name: updatedCandidate.attrs.name,
            email: updatedCandidate.attrs.email,
            stage: updatedCandidate.attrs.stage,
            timeline: updatedCandidate.attrs.timeline || []
          };
          
          console.log("Stage update successful", {
            response,
            mirageState: updatedCandidate.attrs
          });
          
          // Return the response directly without using Response constructor
          return response;
        } catch (error) {
          console.error("Error updating candidate:", error);
          return new Response(500, {}, { 
            error: "Failed to update candidate", 
            details: error.message 
          });
        }
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
