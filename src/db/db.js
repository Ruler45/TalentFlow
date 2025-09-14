import Dexie from "dexie";

export const db = new Dexie("talentflow");

db.version(1).stores({
  jobs: "id",
  candidates: "id",
  assessments: "id, jobId"
});

// Add hooks for logging
db.candidates.hook('creating', function (primKey, obj) {
//   console.log('Creating candidate:', obj);
  return obj;
});

db.candidates.hook('reading', function (obj) {
//   console.log('Reading candidate:', obj);
  return obj;
});
