// src/api/hydrate.js
import { db } from "../db/db";

export async function hydrateServer(server) {
  try {
    console.log("Starting server hydration...");
    
    await db.open();
    
    // Check if we already have data in IndexedDB
    const jobCount = await db.jobs.count();
    const candidateCount = await db.candidates.count();
    
    console.log("Existing data in IndexedDB:", { jobs: jobCount, candidates: candidateCount });

    if (jobCount === 0 || candidateCount === 0) {
      // No existing data, create initial data and store in IndexedDB
      console.log("No data in IndexedDB, creating initial data...");
      
      try {
        // Create initial data
        server.createList('job', 25);
        server.createList('candidate', 1000);
        

        // Get the created data
        const jobs = server.schema.jobs.all().models.map(m => m.attrs);
        const candidates = server.schema.candidates.all().models.map(m => m.attrs);

        console.log("Created initial data in Mirage.",jobs);


        // Store in IndexedDB
        await db.jobs.bulkPut(jobs);
        await db.candidates.bulkPut(candidates);

        console.log("Data synced to IndexedDB:", {
          jobs: jobs.length,
          candidates: candidates.length
        });

        return {
          jobs: jobs.length,
          candidates: candidates.length
        };
      } catch (error) {
        console.error("Error syncing data to IndexedDB:", error);
        throw error;
      }
    } else {
      // Data exists in IndexedDB, load it into Mirage
      console.log("Loading existing data from IndexedDB into Mirage...");
      
      try {
        const jobs = await db.jobs.toArray();
        const candidates = await db.candidates.toArray();

        // console.log(jobs);
        

        // Clear existing data and recreate collections
        await server.db.emptyData();

        
        
        // Create collections one by one to maintain ID integrity
        for (const job of jobs) {
          const attrs = { ...job };
          delete attrs.id; // Let Mirage handle the ID
          server.create('job', attrs);
        }
        // console.log(server.db._collections[0]);

        
        for (const candidate of candidates) {
          const attrs = { ...candidate };
          delete attrs.id; // Let Mirage handle the ID
          server.create('candidate', attrs);
        }

        console.log("Data loaded into Mirage:", {
          jobs: jobs.length,
          candidates: candidates.length
        });

        console.log("Hydration complete.");
        

        return {
          jobs: jobs.length,
          candidates: candidates.length
        };
      } catch (error) {
        console.error("Error loading data from IndexedDB:", error);
        throw error;
      }
    }
  } catch (error) {
    console.error("Error during server hydration:", error);
    throw error;
  }
}
