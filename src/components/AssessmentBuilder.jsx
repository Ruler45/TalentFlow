import { useState } from "react";
import { db } from "../db/db";

const questionTypes = ["single", "multi", "short", "long", "numeric", "file"];

export default function AssessmentBuilder({ jobId }) {
  const [questions, setQuestions] = useState([]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: crypto.randomUUID(),
        type: "", // start empty, choose later
        text: "New Question",
        required: false,
        options: [],
      },
    ]);
  };

  const updateQuestion = (id, updates) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const deleteQuestion = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const saveAssessment = async () => {
    const assessment = await db.assessments
      .where("jobId")
      .equals(jobId)
      .first();
    if (assessment) {
      // Update existing
      if (
        prompt(
          "Assessment already exists for this job. Do you want to update it? (y/n)"
        ) === "y"
      ) {
        await db.assessments.update(assessment.id, { structure: questions });
        alert("Assessment updated!");
      }

      return;
    }

    await db.assessments.put({
      jobId,
      structure: questions,
      responses: {},
    });
    alert("Assessment saved!");
  };

  return (
    <div className="p-4 border rounded flex flex-col">
      <h3 className="font-bold mb-2">Assessment Builder</h3>

      {/* Questions List */}
      <ul className="mb-4">
        {questions.map((q) => (
          <li key={q.id} className="mb-2 border p-2 rounded">
            {/* Question Text */}
            <input
              type="text"
              value={q.text}
              onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
              className="w-full border px-2 py-1 mb-2"
            />

            {/* Question Type Dropdown */}
            <select
              value={q.type}
              onChange={(e) => {
                const type = e.target.value;
                updateQuestion(q.id, {
                  type,
                  options:
                    type === "single" || type === "multi"
                      ? ["Option A", "Option B"]
                      : [],
                  min: type === "numeric" ? 1 : undefined,
                  max: type === "numeric" ? 10 : undefined,
                  maxLength:
                    type === "short" ? 100 : type === "long" ? 500 : undefined,
                });
              }}
              className="border px-2 py-1 mb-2"
            >
              <option value="">Select type…</option>
              {questionTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {/* Options editor for single/multi choice */}
            {(q.type === "single" || q.type === "multi") && (
              <div className="mb-2">
                {q.options.map((opt, i) => (
                  <input
                    key={i}
                    type="text"
                    value={opt}
                    className="border px-2 py-1 mr-2"
                    onChange={(e) => {
                      const newOpts = [...q.options];
                      newOpts[i] = e.target.value;
                      updateQuestion(q.id, { options: newOpts });
                    }}
                  />
                ))}
                <button
                  onClick={() =>
                    updateQuestion(q.id, {
                      options: [...q.options, `Option ${q.options.length + 1}`],
                    })
                  }
                  className="ml-2 px-2 py-1 border rounded bg-gray-50"
                >
                  + Add option
                </button>
              </div>
            )}

            {/* Delete */}
            <button
              onClick={() => deleteQuestion(q.id)}
              className="px-2 py-1 text-red-600 border rounded"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {/* Add Question */}
      <button
        onClick={addQuestion}
        className="px-4 py-2 mb-4 bg-gray-100 border rounded"
      >
        + Add Question
      </button>

      {/* Save */}
      <button
        onClick={saveAssessment}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Save Assessment
      </button>
    </div>
  );
}
