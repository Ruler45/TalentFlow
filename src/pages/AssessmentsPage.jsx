// src/components/AssessmentsPage.jsx
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { Link } from "react-router-dom";

export default function AssessmentsPage() {
  const assessments = useLiveQuery(() => db.assessments.toArray(), []);

  if (!assessments) return <p>Loading assessments...</p>;
  if (assessments.length === 0) return <p>No assessments found.</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">All Assessments</h2>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Job</th>
            <th className="border px-2 py-1">Questions</th>
            <th className="border px-2 py-1">Preview</th>
          </tr>
        </thead>
        <tbody>
          {assessments.map((a) => (
            <tr key={a.id}>
              <td className="border px-2 py-1">{a.id}</td>
              <td className="border px-2 py-1">
                <JobTitle jobId={a.jobId} />
              </td>
              <td className="border px-2 py-1">{a.structure?.length || 0}</td>
              <td className="border px-2 py-1">
                <Link
                  to={`/jobs/${a.jobId}/assessment/preview`}
                  className="text-blue-600 underline"
                >
                  Preview
                </Link>
              </td>
              <td className="border px-2 py-1">
                <Link
                  to={`/assessments/${a.jobId}/responses`}
                  className="text-blue-600 underline"
                >
                  View Responses
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Helper: show job title by jobId
function JobTitle({ jobId }) {
  const job = useLiveQuery(() => db.jobs.get(jobId), [jobId]);
  return job ? job.title : "—";
}
