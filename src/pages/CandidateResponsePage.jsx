import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function CandidateResponsePage() {
  const { jobId, candidateName } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  // Decode the candidate name from URL
  const decodedCandidateName = decodeURIComponent(candidateName);

  useEffect(() => {
    async function fetchResponse() {
      const data = await fetch(`/api/assessments/${jobId}/responses`).then(
        (res) => res.json()
      );
      setData(data);
    }
    fetchResponse();
  }, [jobId]);

  if (!data) return <p>Loading candidate response...</p>;

  const { responses, structure } = data;
  const answers = responses[decodedCandidateName];

  if (!answers) return <p>Candidate not found.</p>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{decodedCandidateName}'s Response</h2>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          ← Back 
        </button>
      </div>

      <ul className="space-y-4">
        {structure.map((q) => (
          <li key={q.id} className="border p-4 rounded">
            <p className="font-semibold">{q.text}</p>
            <p className="ml-2 text-gray-700">
              {Array.isArray(answers[q.id])
                ? answers[q.id].join(", ")
                : answers[q.id] || "—"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
