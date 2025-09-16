import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AssessmentForm from "../components/AssessmentForm";

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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Assessment</h2>
        <button
          onClick={() => navigate(`/jobs/${jobId}`)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2 rounded-lg hover:bg-gray-100 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Job
        </button>
      </div>

      {loading && (
        <div className="bg-white rounded-lg shadow-sm p-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded-md w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      )}

      {!loading && assessment ? (
        <div className="bg-white rounded-lg shadow-sm">
          <AssessmentForm assessment={assessment} candidateId={123} />
        </div>
      ) : (
        !loading && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-xl text-gray-600">No assessment available yet.</p>
          </div>
        )
      )}
    </div>
  );
}
