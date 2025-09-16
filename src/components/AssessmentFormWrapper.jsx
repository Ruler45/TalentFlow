import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AssessmentForm from "./AssessmentForm";

export default function AssessmentFormWrapper() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) return;

    setLoading(true);
    fetch(`/api/assessments/${jobId}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch assessment for job ${jobId}`);
        }
        return res.json();
      })
      .then((data) => {
        setAssessment(data);
      })
      .catch((err) => {
        console.error(err);
        setAssessment(null);
      })
      .finally(() => setLoading(false));
  }, [jobId]);

  if (!jobId || isNaN(Number(jobId))) {
    return <p>Invalid job ID</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Assessment Preview</h2>
        <button
          onClick={() => navigate(`/jobs/${jobId}`)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          ← Back to Job
        </button>
      </div>

      {loading && <p>Loading assessment…</p>}

      {!loading && assessment ? (
        <AssessmentForm assessment={assessment} candidateId={123} />
      ) : (
        !loading && <p>No assessment yet.</p>
      )}
    </div>
  );
}
