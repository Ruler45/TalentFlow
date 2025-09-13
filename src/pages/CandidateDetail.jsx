import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const STAGES = ["applied", "screen", "tech", "offer", "hired", "rejected"];

export default function CandidateDetail() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  // fetch candidate (with timeline)
  useEffect(() => {
    setLoading(true);
    fetch(`/api/candidates/${id}`)
      .then((res) => res.json())
      .then((json) => {
        setCandidate(json.candidate);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // update stage
  const updateStage = async (newStage) => {
    const res = await fetch(`/api/candidates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: newStage }),
    });
    const json = await res.json();
    setCandidate(json); // json now includes updated candidate + timeline
  };

  if (loading) return <p className="p-4">Loading candidate...</p>;
  if (!candidate) return <p className="p-4">Candidate not found</p>;

  return (
    <div className="mt-4 p-4 border rounded">
      <h3 className="text-xl font-semibold">{candidate.name}</h3>
      <p>Email: {candidate.email}</p>

      {/* Stage selector */}
      <div className="mt-2">
        <label className="mr-2 font-medium">Stage:</label>
        <select
          value={candidate.stage}
          onChange={(e) => updateStage(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Timeline */}
      <h4 className="mt-4 font-semibold">Timeline</h4>
      {candidate.timeline && candidate.timeline.length > 0 ? (
        <ul className="list-disc ml-5">
          {candidate.timeline.map((t, i) => (
            <li key={i}>
              {new Date(t.date).toLocaleDateString()} – {t.status}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No timeline available</p>
      )}
    </div>
  );
}
