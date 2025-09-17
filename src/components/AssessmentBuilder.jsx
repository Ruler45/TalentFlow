import { useEffect } from "react";
import { useAssessments } from "../hooks/useAssessments"

const questionTypes = ["single", "multi", "short", "long", "numeric", "file"];

const PreviewQuestion = ({ question, questions, answers = {} }) => {
  if (question.conditionalLogic?.enabled) {
    const dependentQuestion = questions.find(q => q.id === question.conditionalLogic.dependsOn);
    if (!dependentQuestion) return null;

    const answer = answers[dependentQuestion.id];
    const { type, value } = question.conditionalLogic.condition;

    // If the dependent question hasn't been answered, don't show this question
    if (!answer) return null;

    const shouldShow = (() => {
      switch (type) {
        case 'equals':
          return answer === value;
        case 'notEquals':
          return answer !== value;
        case 'includes':
          return Array.isArray(answer) ? answer.includes(value) : String(answer).includes(value);
        case 'notIncludes':
          return Array.isArray(answer) ? !answer.includes(value) : !String(answer).includes(value);
        default:
          return true;
      }
    })();

    if (!shouldShow) return null;
  }

  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium text-gray-900">{question.text}</h3>
        {question.validation?.required && (
          <span className="text-red-500 text-sm">*Required</span>
        )}
      </div>

      {question.type === "single" && (
        <div className="space-y-3">
          {question.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-3">
              <input
                type="radio"
                name={question.id}
                value={opt}
                disabled
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label className="text-gray-700">{opt}</label>
            </div>
          ))}
        </div>
      )}

      {question.type === "multi" && (
        <div className="space-y-3">
          {question.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-3">
              <input
                type="checkbox"
                value={opt}
                disabled
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label className="text-gray-700">{opt}</label>
            </div>
          ))}
        </div>
      )}

      {question.type === "short" && (
        <div>
          <input
            type="text"
            disabled
            placeholder="Short answer text"
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-gray-400"
          />
          {question.validation?.maxLength && (
            <div className="mt-1 text-sm text-gray-500">
              Maximum {question.validation.maxLength} characters
            </div>
          )}
        </div>
      )}

      {question.type === "long" && (
        <div>
          <textarea
            disabled
            placeholder="Long answer text"
            rows={4}
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-gray-400 resize-none"
          />
          {question.validation?.maxLength && (
            <div className="mt-1 text-sm text-gray-500">
              Maximum {question.validation.maxLength} characters
            </div>
          )}
        </div>
      )}

      {question.type === "numeric" && (
        <div>
          <input
            type="number"
            disabled
            placeholder="Enter a number"
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-gray-400"
          />
          {(question.validation?.min != null || question.validation?.max != null) && (
            <div className="mt-1 text-sm text-gray-500">
              {question.validation.min != null && question.validation.max != null
                ? `Value must be between ${question.validation.min} and ${question.validation.max}`
                : question.validation.min != null
                ? `Minimum value: ${question.validation.min}`
                : `Maximum value: ${question.validation.max}`}
            </div>
          )}
        </div>
      )}

      {question.type === "file" && (
        <div className="w-full px-4 py-3 bg-white border-2 border-gray-200 border-dashed rounded-lg text-gray-400 text-center">
          Upload file
        </div>
      )}

      {question.conditionalLogic?.enabled && (
        <div className="mt-2 text-sm text-gray-400">
          {`This question is shown conditionally based on the answer to "${
            questions.find(q => q.id === question.conditionalLogic.dependsOn)?.text || 'another question'
          }"`}
        </div>
      )}
    </div>
  );
};

export default function AssessmentBuilder({ jobId }) {
  const {
    currentQuestions: questions,
    previewMode,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    togglePreviewMode,
    loadAssessmentQuestions,
    addAssessment,
    updateAssessment,
    getAssessmentByJobId
  } = useAssessments();

  useEffect(() => {
    if (jobId) {
      loadAssessmentQuestions(jobId);
    }
  }, [jobId, loadAssessmentQuestions]);

  const saveAssessment = async () => {
    try {
      const assessmentData = {
        jobId,
        questions,
        lastUpdated: new Date().toISOString()
      };

      const existingAssessment = getAssessmentByJobId(jobId);
      if (existingAssessment) {
        if (confirm("Assessment already exists for this job. Do you want to update it?")) {
          await updateAssessment(existingAssessment.id, assessmentData);
          alert("Assessment updated successfully!");
        }
      } else {
        await addAssessment(assessmentData);
        alert("Assessment saved successfully!");
      }
    } catch (error) {
      console.error("Error saving assessment:", error);
      alert("Failed to save assessment. Please try again.");
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Assessment Builder</h3>
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={togglePreviewMode}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              !previewMode
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Edit
          </button>
          <button
            onClick={togglePreviewMode}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              previewMode
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className={previewMode ? "hidden" : ""}>
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

                {/* Validation Section */}
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-semibold text-sm mb-2">Validation Rules</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={q.validation?.required || false}
                        onChange={(e) =>
                          updateQuestion(q.id, {
                            validation: {
                              ...q.validation,
                              required: e.target.checked,
                            },
                          })
                        }
                        className="rounded text-blue-600"
                      />
                      <span className="text-sm">Required</span>
                    </label>
                    
                    {q.type === "numeric" && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm">Min Value</label>
                          <input
                            type="number"
                            value={q.validation?.min || ""}
                            onChange={(e) =>
                              updateQuestion(q.id, {
                                validation: {
                                  ...q.validation,
                                  min: e.target.value ? Number(e.target.value) : null,
                                },
                              })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm">Max Value</label>
                          <input
                            type="number"
                            value={q.validation?.max || ""}
                            onChange={(e) =>
                              updateQuestion(q.id, {
                                validation: {
                                  ...q.validation,
                                  max: e.target.value ? Number(e.target.value) : null,
                                },
                              })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm"
                          />
                        </div>
                      </div>
                    )}
                    
                    {(q.type === "short" || q.type === "long") && (
                      <div>
                        <label className="block text-sm">Max Length</label>
                        <input
                          type="number"
                          value={q.validation?.maxLength || ""}
                          onChange={(e) =>
                            updateQuestion(q.id, {
                              validation: {
                                ...q.validation,
                                maxLength: e.target.value ? Number(e.target.value) : null,
                              },
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Conditional Logic Section */}
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-semibold text-sm mb-2">Conditional Logic</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={q.conditionalLogic?.enabled || false}
                        onChange={(e) =>
                          updateQuestion(q.id, {
                            conditionalLogic: {
                              ...q.conditionalLogic,
                              enabled: e.target.checked,
                            },
                          })
                        }
                        className="rounded text-blue-600"
                      />
                      <span className="text-sm">Enable Conditional Display</span>
                    </label>
                    
                    {q.conditionalLogic?.enabled && (
                      <>
                        <div>
                          <label className="block text-sm">Depends on Question</label>
                          <select
                            value={q.conditionalLogic?.dependsOn || ""}
                            onChange={(e) =>
                              updateQuestion(q.id, {
                                conditionalLogic: {
                                  ...q.conditionalLogic,
                                  dependsOn: e.target.value,
                                },
                              })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm"
                          >
                            <option value="">Select a question</option>
                            {questions
                              .filter((otherQ) => otherQ.id !== q.id)
                              .map((otherQ) => (
                                <option key={otherQ.id} value={otherQ.id}>
                                  {otherQ.text}
                                </option>
                              ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm">Condition Type</label>
                          <select
                            value={q.conditionalLogic?.condition?.type || "equals"}
                            onChange={(e) =>
                              updateQuestion(q.id, {
                                conditionalLogic: {
                                  ...q.conditionalLogic,
                                  condition: {
                                    ...q.conditionalLogic?.condition,
                                    type: e.target.value,
                                  },
                                },
                              })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm"
                          >
                            <option value="equals">Equals</option>
                            <option value="notEquals">Not Equals</option>
                            <option value="includes">Includes</option>
                            <option value="notIncludes">Not Includes</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm">Condition Value</label>
                          <input
                            type="text"
                            value={q.conditionalLogic?.condition?.value || ""}
                            onChange={(e) =>
                              updateQuestion(q.id, {
                                conditionalLogic: {
                                  ...q.conditionalLogic,
                                  condition: {
                                    ...q.conditionalLogic?.condition,
                                    value: e.target.value,
                                  },
                                },
                              })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
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

        {/* Preview Section */}
        <div className={!previewMode ? "hidden" : ""}>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-800 mb-1">Preview Mode</h4>
              <p className="text-gray-600">This is how candidates will see your assessment.</p>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-600 mb-2">No questions added yet</p>
                <p className="text-gray-500">Add some questions to see the preview</p>
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((question, index) => (
                  <div key={question.id}>
                    <div className="flex gap-3 mb-2">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium text-sm">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-500">Question {index + 1} of {questions.length}</span>
                    </div>
                    <PreviewQuestion question={question} questions={questions} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}