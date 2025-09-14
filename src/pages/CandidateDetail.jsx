import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const STAGES = ["applied", "screen", "tech", "offer", "hired", "rejected"];

export default function CandidateDetail() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  // fetch candidate (with timeline)
  useEffect(() => {
    const fetchCandidate = async (retryCount = 0) => {
      try {
        setLoading(true);
        const res = await fetch(`/api/candidates/${id}`);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const json = await res.json();

        // If we got no data and haven't retried too many times, retry
        if ((!json || !json.id) && retryCount < 2) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchCandidate(retryCount + 1);
        }

        // Check if we need to handle a nested structure
        const candidateData = json.candidate || json;

        if (!candidateData.id) {
          throw new Error("Invalid candidate data received");
        }

        setCandidate(candidateData);
        setLoading(false);
      } catch (_) {
        if (retryCount < 2) {
          console.log("Retrying after error...",_);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchCandidate(retryCount + 1);
        }
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [id]);

  // update stage
  const updateStage = async (newStage) => {
    try {
      const res = await fetch(`/api/candidates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();
      
      // Check for error response
      if (json.error) {
        throw new Error(json.error);
      }
      
      // Validate response data shape
      if (!json || !json.id || !json.stage || typeof json.stage !== 'string') {
        console.error("Invalid response format:", json);
        throw new Error("Invalid response data format");
      }
      
      // Ensure timeline is an array
      if (!Array.isArray(json.timeline)) {
        json.timeline = [];
      }
      
      console.log("Setting candidate state with:", json);
      setCandidate(json); // json now includes updated candidate + timeline
    } catch (error) {
      console.error("Error updating candidate stage:", error);
      // Could add error state handling here if needed
    }
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
