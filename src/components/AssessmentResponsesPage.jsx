import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function AssessmentResponsesPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [job,setJob] = useState({
    title: 'Loading...'
  });

  useEffect(() => {
    async function fetchResponse() {
      const data = await fetch(`/api/assessments/${jobId}/responses`).then(
        (res) => res.json()
      );
      setData(data);
    }
    async function fetchJob() {
      const jobData = await fetch(`/api/jobs/${jobId}`).then((res) => res.json());
      setJob(jobData);
    }
    fetchResponse();
    fetchJob();
  }, [jobId]);

  if (!data) return <p>Loading responses...</p>;

  const { responses } = data;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Candidate response for {job.title}</h2>
        <button
          onClick={() => navigate(`/assessments`)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          ← Back to Assessment
        </button>
      </div>

      {Object.keys(responses).length === 0 ? (
        <p>No responses yet.</p>
      ) : (
        <ul className="space-y-2">
          {Object.keys(responses).map((candidateName) => (
            <li key={candidateName}>
              <button
                className="text-blue-600 hover:underline"
                onClick={() =>
                  navigate(
                    `/assessments/${jobId}/responses/${encodeURIComponent(
                      candidateName
                    )}`
                  )
                }
              >
                {candidateName}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
