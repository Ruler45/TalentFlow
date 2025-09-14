// src/api/hydrate.js
import { db } from "../db/db";

export async function hydrateServer(server) {
  try {
    console.log("Starting server hydration...");
    
    await db.open();
    
    // Check if we already have data
    const candidateCount = await db.candidates.count();
    const jobCount = await db.jobs.count();
    
    console.log("Current data count:", { candidates: candidateCount, jobs: jobCount });

    // Clear existing data in Mirage before adding data
    server.db.emptyData();

    if (candidateCount === 0 || jobCount === 0) {
      console.log("No existing data found, seeding database...");
      
      // First, clear Mirage's data
      server.db.emptyData();

      // Create jobs
      console.log("Creating jobs...");
      const jobs = [];
      for (let i = 0; i < 25; i++) {
        const job = server.create("job", { id: i + 1 });
        jobs.push(job.attrs);
      }
      await db.jobs.bulkPut(jobs);
      console.log("Jobs created:", jobs.length);

      // Create candidates
      console.log("Creating candidates...");
      const candidates = [];
      for (let i = 0; i < 100; i++) {
        const candidate = server.create("candidate", { 
          id: i + 1,
          timeline: [
            { date: new Date(Date.now() - 86400000).toISOString(), status: "applied" },
            { date: new Date().toISOString(), status: "screen" }
          ]
        });
        candidates.push(candidate.attrs);
      }
      await db.candidates.bulkPut(candidates);
      console.log("Candidates created:", candidates.length);

      // Verify Mirage state
      console.log("Verifying Mirage state:", {
        candidatesInMirage: server.schema.candidates.all().length,
        jobsInMirage: server.schema.jobs.all().length,
        sampleCandidate: server.schema.candidates.first()?.attrs
      });
    
    // Verify data was stored
    const storedCandidates = await db.candidates.toArray();
    const storedJobs = await db.jobs.toArray();
    
    console.log("Data verification:", {
      candidatesInDB: storedCandidates.length,
      jobsInDB: storedJobs.length,
      candidatesInMirage: server.db.candidates.length,
      jobsInMirage: server.db.jobs.length
    });

      return {
        candidates: storedCandidates.length,
        jobs: storedJobs.length
      };
    } else {
      console.log("Loading existing data from IndexedDB...");
      
      // Load existing data from IndexedDB
      const jobs = await db.jobs.toArray();
      const candidates = await db.candidates.toArray();

      console.log("Data from IndexedDB:", {
        firstCandidate: candidates[0],
        totalCandidates: candidates.length
      });

      // Clear Mirage data first
      server.db.emptyData();

      // Insert directly into Mirage's database
      server.db.loadData({
        jobs: jobs,
        candidates: candidates
      });

      // Verify the data was loaded
      console.log("Immediate verification:", {
        candidatesInDb: server.db.candidates.length,
        sampleCandidate: server.db.candidates[0]
      });

      // Verify Mirage state after restoration
      console.log("Mirage state after restore:", {
        mirageDb: server.db.dump(),
        firstMirageCandidate: server.schema.candidates.first()?.attrs
      });
      
      console.log("Restored data to Mirage:", {
        jobs: jobs.length,
        candidates: candidates.length
      });

      return {
        candidates: candidates.length,
        jobs: jobs.length
      };
    }
  } catch (error) {
    console.error("Error during server hydration:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}
