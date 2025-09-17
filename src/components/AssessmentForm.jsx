// src/components/AssessmentForm.jsx
import { useState, useMemo, useCallback } from "react";

export default function AssessmentForm({ assessment }) {
  const [candidateName, setCandidateName] = useState("");
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Evaluate conditional logic for a question
  const evaluateCondition = useCallback((question) => {
    if (!question.conditionalLogic?.enabled) return true;
    
    const { conditions = [], operator = 'AND' } = question.conditionalLogic;
    if (!conditions.length) return true;

    const results = conditions.map(condition => {
      const answer = answers[condition.dependsOn];
      if (answer === undefined) return false;

      switch (condition.type) {
        case 'equals':
          return answer === condition.value;
        case 'notEquals':
          return answer !== condition.value;
        case 'includes':
          return Array.isArray(answer) 
            ? answer.includes(condition.value)
            : String(answer).includes(condition.value);
        case 'notIncludes':
          return Array.isArray(answer)
            ? !answer.includes(condition.value)
            : !String(answer).includes(condition.value);
        case 'greaterThan':
          return Number(answer) > Number(condition.value);
        case 'lessThan':
          return Number(answer) < Number(condition.value);
        default:
          return false;
      }
    });

    return operator === 'AND'
      ? results.every(result => result)
      : results.some(result => result);
  }, [answers]);

  // Get visible questions based on current answers
  const visibleQuestions = useMemo(() => {
    return assessment.structure.filter(evaluateCondition);
  }, [assessment.structure, evaluateCondition]);

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
      <div className="p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Assessment Submitted!</h3>
        <p className="text-gray-600 text-lg">
          Thank you, {candidateName}! Your responses have been recorded successfully.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="p-6 space-y-8"
    >
      {/* Candidate Name */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <label className="block text-lg font-medium text-gray-700 mb-3">Your Name</label>
        <input
          type="text"
          value={candidateName}
          onChange={(e) => setCandidateName(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all"
          placeholder="Enter your full name"
          required
        />
      </div>

      {/* Questions */}
      {visibleQuestions.map((q) => (
        <div key={q.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium">
              {assessment.structure.indexOf(q) + 1}
            </span>
            <label className="block text-lg font-medium text-gray-700">{q.text}</label>
          </div>

          {q.type === "single" &&
            q.options.map((opt) => (
              <div key={opt} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <input
                  type="radio"
                  name={q.id}
                  value={opt}
                  checked={answers[q.id] === opt}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label className="text-gray-700 cursor-pointer select-none">{opt}</label>
              </div>
            ))}

          {q.type === "multi" &&
            q.options.map((opt) => (
              <div key={opt} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
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
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label className="text-gray-700 cursor-pointer select-none">{opt}</label>
              </div>
            ))}

          {q.type === "short" && (
            <input
              type="text"
              maxLength={q.maxLength}
              placeholder="Enter your answer..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all"
              onChange={(e) => handleChange(q.id, e.target.value)}
            />
          )}

          {q.type === "long" && (
            <textarea
              maxLength={q.maxLength}
              placeholder="Enter your detailed answer..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all resize-y"
              onChange={(e) => handleChange(q.id, e.target.value)}
            />
          )}

          {q.type === "numeric" && (
            <input
              type="number"
              min={q.min}
              max={q.max}
              placeholder={`Enter a number (${q.min}-${q.max})`}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all"
              onChange={(e) => handleChange(q.id, e.target.value)}
            />
          )}

          {q.type === "file" && (
            <div className="mt-2">
              <label className="block w-full px-4 py-3 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 cursor-pointer transition-all text-center">
                <svg className="w-6 h-6 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-gray-600">Click to upload or drag and drop</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleChange(q.id, e.target.files[0]?.name || "")}
                />
              </label>
            </div>
          )}
        </div>
      ))}

      <div className="pt-6">
        <button
          type="submit"
          className="w-full px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-lg shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697A9.001 9.001 0 1017.843 15" />
          </svg>
          Submit Assessment
        </button>
      </div>
    </form>
  );
}
