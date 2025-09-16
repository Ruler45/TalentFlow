// src/components/AssessmentForm.jsx
import { useState } from "react";

export default function AssessmentForm({ assessment }) {
  const [candidateName, setCandidateName] = useState("");
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (id, value) => {
    setAnswers({ ...answers, [id]: value });
  };

  const submit = async () => {
    if (!candidateName.trim()) {
      alert("Please enter your name");
      return;
    }

    const res = await fetch(`/api/assessments/${assessment.jobId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateName, answers }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert("Error submitting: " + err.error);
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <p className="p-4 text-green-600 font-bold">
        ✅ Thank you, {candidateName}! Your assessment has been submitted.
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="p-4"
    >
      <h3 className="text-lg font-bold mb-4">Assessment</h3>

      {/* Candidate Name */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Your Name</label>
        <input
          type="text"
          value={candidateName}
          onChange={(e) => setCandidateName(e.target.value)}
          className="border p-2 w-full"
          required
        />
      </div>

      {/* Questions */}
      {assessment.structure.map((q) => (
        <div key={q.id} className="mb-4">
          <label className="block font-semibold mb-1">{q.text}</label>

          {q.type === "single" &&
            q.options.map((opt) => (
              <div key={opt}>
                <input
                  type="radio"
                  name={q.id}
                  value={opt}
                  checked={answers[q.id] === opt}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                />{" "}
                {opt}
              </div>
            ))}

          {q.type === "multi" &&
            q.options.map((opt) => (
              <div key={opt}>
                <input
                  type="checkbox"
                  value={opt}
                  checked={answers[q.id]?.includes(opt)}
                  onChange={(e) => {
                    const prev = answers[q.id] || [];
                    handleChange(
                      q.id,
                      e.target.checked
                        ? [...prev, opt]
                        : prev.filter((x) => x !== opt)
                    );
                  }}
                />{" "}
                {opt}
              </div>
            ))}

          {q.type === "short" && (
            <input
              type="text"
              maxLength={q.maxLength}
              className="border p-1 w-full"
              onChange={(e) => handleChange(q.id, e.target.value)}
            />
          )}

          {q.type === "long" && (
            <textarea
              maxLength={q.maxLength}
              className="border p-1 w-full"
              onChange={(e) => handleChange(q.id, e.target.value)}
            />
          )}

          {q.type === "numeric" && (
            <input
              type="number"
              min={q.min}
              max={q.max}
              className="border p-1"
              onChange={(e) => handleChange(q.id, e.target.value)}
            />
          )}

          {q.type === "file" && (
            <input
              type="file"
              onChange={(e) =>
                handleChange(q.id, e.target.files[0]?.name || "")
              }
            />
          )}
        </div>
      ))}

      <button
        type="submit"
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Submit
      </button>
    </form>
  );
}
