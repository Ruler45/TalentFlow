import { db } from "../db/db";

// Utility: generate random question types
const questionTypes = ["single", "multi", "short", "long", "numeric", "file"];

function randomQuestion(i) {
  const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
  return {
    id: `q${i}`,
    type,
    text: `Question ${i + 1} (${type})`,
    required: Math.random() < 0.7,
    options: type === "single" || type === "multi"
      ? ["Option A", "Option B", "Option C"]
      : undefined,
    min: type === "numeric" ? 1 : undefined,
    max: type === "numeric" ? 10 : undefined,
    maxLength: type === "short" ? 100 : type === "long" ? 500 : undefined
  };
}

export async function seedAssessments() {
  const jobs = await db.jobs.toArray();
  if (jobs.length === 0) {
    console.warn("No jobs found, cannot seed assessments");
    return;
  }

  // Pick 3 random jobs
  const randomJobs = jobs.sort(() => 0.5 - Math.random()).slice(0, 3);

  for (const job of randomJobs) {
    const structure = [];
    for (let i = 0; i < 10; i++) {
      structure.push(randomQuestion(i));
    }

    await db.assessments.add({
      jobId: job.id,
      structure,
      responses: {}
    });
  }

  console.log("Seeded assessments for jobs:", randomJobs.map(j => j.title));
}
