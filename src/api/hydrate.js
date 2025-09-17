// src/api/hydrate.js
import { db } from "../db/db";
import { seedAssessments } from "../hooks/seedAssessments";

export async function hydrateServer(server) {
  try {
    console.log("Starting server hydration...");

    await db.open();

    // Check if we already have data in IndexedDB
    const jobCount = await db.jobs.count();
    const candidateCount = await db.candidates.count();
    const assessmentCount = await db.assessments.count();

    console.log("Existing data in IndexedDB:", {
      jobs: jobCount,
      candidates: candidateCount,
      assessments: assessmentCount,
    });

    if (jobCount === 0 || candidateCount === 0) {
      // No existing data, create initial data and store in IndexedDB
      console.log("No data in IndexedDB, creating initial data...");

      try {
        // Create initial data
        server.createList("job", 25);
        server.createList("candidate", 1000);

        // Get the created data
        const jobs = server.schema.jobs.all().models.map((m) => m.attrs);
        const candidates = server.schema.candidates
          .all()
          .models.map((m) => m.attrs);

        console.log("Created initial data in Mirage.", jobs);

        // Store in IndexedDB
        await db.jobs.bulkPut(jobs);
        await db.candidates.bulkPut(candidates);

        await seedAssessments();

        console.log("Data synced to IndexedDB:", {
          jobs: jobs.length,
          candidates: candidates.length,
        });

        return {
          jobs: jobs.length,
          candidates: candidates.length,
          assessments: await db.assessments.count(),
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
        const assessments = await db.assessments.toArray();

        console.log("Data structure samples:", {
          job: jobs.length > 0 ? jobs[0] : null,
          candidate: candidates.length > 0 ? candidates[0] : null,
          assessment: assessments.length > 0 ? assessments[0] : null
        });

        // Clear existing data and recreate collections
        await server.db.emptyData();

        // Sanitize and create jobs
        for (const job of jobs) {
          // Create a clean object with only the necessary properties
          const cleanJob = {
            title: job.title || '',
            description: job.description || '',
            location: job.location || '',
            status: job.status || 'active',
            slug: job.slug || '',
            order: typeof job.order === 'number' ? job.order : 0,
            tags: Array.isArray(job.tags) ? [...job.tags] : [], // Create a new array to avoid reference issues
          };
          server.create("job", cleanJob);
        }

        // Sanitize and create candidates
        for (const candidate of candidates) {
          const cleanCandidate = {
            name: candidate.name || '',
            email: candidate.email || '',
            phone: candidate.phone || '',
            status: candidate.status || 'pending',
            skills: Array.isArray(candidate.skills) ? [...candidate.skills] : [],
            experience: candidate.experience || '',
            education: candidate.education || '',
            jobId: candidate.jobId || null
          };
          server.create("candidate", cleanCandidate);
        }

        // Sanitize and create assessments
        for (const assessment of assessments) {
          const cleanAssessment = {
            jobId: assessment.jobId || null,
            questions: Array.isArray(assessment.questions) ? assessment.questions.map(q => ({
              text: q.text || '',
              type: q.type || 'text',
              options: Array.isArray(q.options) ? [...q.options] : [],
              required: Boolean(q.required)
            })) : []
          };
          server.create("assessment", cleanAssessment);
        }

        // Verify the data was loaded correctly
        const loadedJobs = server.schema.jobs.all().models;
        const loadedCandidates = server.schema.candidates.all().models;
        const loadedAssessments = server.schema.assessments.all().models;

        console.log("Data loaded into Mirage:", {
          jobs: loadedJobs.length,
          candidates: loadedCandidates.length,
          assessments: loadedAssessments.length,
        });

        // Verify data integrity
        if (loadedJobs.length !== jobs.length ||
            loadedCandidates.length !== candidates.length ||
            loadedAssessments.length !== assessments.length) {
          throw new Error("Data integrity check failed: Mismatch in loaded records count");
        }

        console.log("Hydration complete with data verification.");

        return {
          jobs: loadedJobs.length,
          candidates: loadedCandidates.length,
          assessments: loadedAssessments.length,
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
