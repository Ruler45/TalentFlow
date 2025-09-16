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
    <div className="p-6 bg-white shadow-lg rounded-lg max-w-4xl mx-auto">
      <h3 className="text-2xl font-bold mb-6 text-gray-800">Assessment Builder</h3>

      {/* Questions List */}
      <ul className="space-y-6 mb-6">
        {questions.map((q) => (
          <li key={q.id} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 transition-all hover:shadow-md">
            {/* Question Text */}
            <input
              type="text"
              value={q.text}
              onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-md px-3 py-2 mb-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              placeholder="Enter question text..."
            />

            {/* Question Type Dropdown */}
            <div className="flex items-center gap-4 mb-4">
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
                className="border-2 border-gray-300 rounded-md px-3 py-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              >
                <option value="">Select question type...</option>
                {questionTypes.map((t) => (
                  <option key={t} value={t} className="capitalize">
                    {t}
                  </option>
                ))}
              </select>

              <button
                onClick={() => deleteQuestion(q.id)}
                className="px-3 py-2 text-red-600 hover:text-red-700 border-2 border-red-200 rounded-md hover:bg-red-50 transition-all"
              >
                Delete Question
              </button>
            </div>

            {/* Options editor for single/multi choice */}
            {(q.type === "single" || q.type === "multi") && (
              <div className="space-y-3 mb-4 p-4 bg-white rounded-md border border-gray-200">
                <div className="text-sm font-medium text-gray-700 mb-2">Answer Options:</div>
                {q.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-gray-500 w-6">{i + 1}.</span>
                    <input
                      type="text"
                      value={opt}
                      className="flex-1 border-2 border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      placeholder={`Option ${i + 1}`}
                      onChange={(e) => {
                        const newOpts = [...q.options];
                        newOpts[i] = e.target.value;
                        updateQuestion(q.id, { options: newOpts });
                      }}
                    />
                  </div>
                ))}
                <button
                  onClick={() =>
                    updateQuestion(q.id, {
                      options: [...q.options, `Option ${q.options.length + 1}`],
                    })
                  }
                  className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700 border-2 border-blue-200 rounded-md hover:bg-blue-50 transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Option
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4">
        {/* Add Question */}
        <button
          onClick={addQuestion}
          className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 rounded-lg text-gray-700 font-medium transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Question
        </button>

        {/* Save */}
        <button
          onClick={saveAssessment}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          Save Assessment
        </button>
      </div>
    </div>
  );
}
