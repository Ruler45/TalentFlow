import Dexie from "dexie";

// Function to generate slug from title
export function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

class TalentFlowDB extends Dexie {
  constructor() {
    super("talentflow");

    // Define all schema versions before any database operations
    this.version(1).stores({
      jobs: "++id, title, company, location, description, tags, status, order",
      candidates: "++id, name, email, stage, timeline, notes",
      assessments: "++id, jobId, structure, responses"
    });

    this.version(2).stores({
      jobs: "++id, title, slug, company, location, description, tags, status, order",
      candidates: "++id, name, email, stage, timeline, notes",
      assessments: "++id, jobId, structure, responses"
    }).upgrade(tx => {
      // Migrate existing jobs to include slug
      return tx.jobs.toCollection().modify(job => {
        if (!job.slug) {
          job.slug = generateSlug(job.title);
        }
      });
    });

    // Add hooks for logging
    this.candidates.hook('creating', function (primKey, obj) {
      //   console.log('Creating candidate:', obj);
      return obj;
    });

    this.candidates.hook('reading', function (obj) {
      //   console.log('Reading candidate:', obj);
      return obj;
    });
  }
}

// Create database instance
const db = new TalentFlowDB();

// Add event listeners after database is created
db.open()
  .then(() => {
    console.log('Database is ready');
  })
  .catch(err => {
    console.error('Failed to open database:', err.stack || err);
  });

// Export the database instance
export { db };
