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

    seeds(server) {
      // Only seed if there's no existing data
      const existingJobs = server.schema.jobs.all().models;
      const existingCandidates = server.schema.candidates.all().models;

      if (existingJobs.length === 0) {
        // Create 25 jobs first
        server.createList('job', 25);
      }
      
      if (existingCandidates.length === 0) {
        // Create 100 candidates
        server.createList('candidate', 100);
      }
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
            { date: new Date().toISOString(), status: stage }
          ];
        },
      }),
    },

    

    routes() {
      this.namespace = "api";
      
      // Remove random timing for debugging
      this.timing = 0;

      // Setup request handling
      this.pretender.handledRequest = function() {};
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
        // Wait for server to be ready
        await serverReady;
        
        const page = Number(request.queryParams.page) || 1;
        const pageSize = Number(request.queryParams.pageSize) || 20;
        const stage = request.queryParams.stage || null;

        // Get candidates using schema's collection
        const collection = schema.candidates;
        const all = collection.all();

        let allCandidates = all.models || [];
        
        // Apply stage filter if provided
        if (stage) {
          allCandidates = allCandidates.filter(model => model.attrs.stage === stage);
        }
        
        const total = allCandidates.length;

        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const slice = allCandidates
          .slice(start, end)
          .map(model => model.attrs);

        return {
          candidates: slice,
          total
        };
      });

      this.get("/candidates/:id", async function(schema, request) {
        // Wait for server to be ready
        await serverReady;
        
        let candidate = schema.candidates.find(request.params.id);
        
        if (!candidate) {
          return new Response(404, {}, { error: "Not found" });
        }

        // Ensure we return the attributes with proper structure
        return {
          id: candidate.id,
          name: candidate.attrs.name,
          email: candidate.attrs.email,
          stage: candidate.attrs.stage,
          timeline: candidate.attrs.timeline || []
        };
      });

      this.post("/candidates", async function(schema, request) {
        await serverReady;
        
        let attrs = JSON.parse(request.requestBody);
        
        // Add initial timeline entry
        attrs.timeline = [{
          date: new Date().toISOString(),
          status: attrs.stage || 'applied'
        }];

        try {
          // Create in Mirage first
          const candidate = schema.candidates.create(attrs);
          
          // Then store in IndexedDB
          try {
            await db.candidates.add({
              ...candidate.attrs,
              id: Number(candidate.id)
            });

            // Function to verify the creation with retries
            const verifyCreation = async (retryCount = 0) => {
              const verifyDb = await db.candidates.get(Number(candidate.id));
              
              if (!verifyDb) {
                if (retryCount < 3) {
                  await new Promise(resolve => setTimeout(resolve, 100));
                  return verifyCreation(retryCount + 1);
                }
                throw new Error("Failed to verify candidate creation after retries");
              }
              
              return verifyDb;
            };
            
            // Wait for verification with retries
            await verifyCreation();
            
          } catch (dbError) {
            console.error("IndexedDB creation failed:", dbError);
            // Continue with Mirage response even if IndexedDB fails
          }

          // Return consistent response format
          return {
            id: candidate.id,
            name: candidate.attrs.name,
            email: candidate.attrs.email,
            stage: candidate.attrs.stage,
            timeline: candidate.attrs.timeline || []
          };
        } catch (error) {
          return new Response(500, {}, { 
            error: "Failed to create candidate", 
            details: error.message 
          });
        }
      });

      this.passthrough();

      this.patch("/candidates/:id", async function(schema, request) {
        // Wait for server to be ready
        await serverReady;
        
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

        try {
          // Update Mirage first
          candidate.update(updatedAttrs);

          try {
            // Then update IndexedDB and wait for it to complete
            await db.candidates.delete(Number(id));
            await db.candidates.add({ ...updatedAttrs, id: Number(id) });
            
            // Function to verify the update with retries
            const verifyUpdate = async (retryCount = 0) => {
              const verifyDb = await db.candidates.get(Number(id));
              
              if (!verifyDb) {
                throw new Error("Failed to retrieve updated candidate from IndexedDB");
              }
              
              if (verifyDb.stage !== updatedAttrs.stage) {
                if (retryCount < 3) {
                  await new Promise(resolve => setTimeout(resolve, 100));
                  return verifyUpdate(retryCount + 1);
                }
                throw new Error("Failed to persist stage update after retries");
              }
              
              return verifyDb;
            };
            
            // Wait for verification with retries
            await verifyUpdate();
            
          } catch (dbError) {
            console.error("IndexedDB update failed:", dbError);
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
          
          return response;
        } catch (error) {
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
    // Mark server as ready
    serverReadyResolve(true);
    return server;
  }).catch(error => {
    serverReadyResolve(false);
    throw error;
  });
}
