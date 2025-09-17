import { useState } from "react";
import { MentionsInput, Mention } from "react-mentions";

const users = [
  { id: "1", display: "John Smith", position: "HR Manager" },
  { id: "2", display: "Sarah Johnson", position: "Technical Lead" },
  { id: "3", display: "Mike Wilson", position: "Recruiter" },
  { id: "4", display: "Emma Davis", position: "Department Head" },
  { id: "5", display: "Alex Brown", position: "Hiring Manager" },
  { id: "6", display: "Lisa Chen", position: "Team Lead" },
  { id: "7", display: "David Kim", position: "Project Manager" },
  { id: "8", display: "Rachel Green", position: "HR Specialist" }
];

export default function CandidateNotes({ onSave }) {
  const [note, setNote] = useState("");

  const handleSave = () => {
    if (!note.trim()) return;
    onSave(note);
    setNote("");
  };

  return (
    <div className="mt-4 space-y-4">
      <h4 className="font-semibold text-lg text-gray-800">Notes:</h4>
      <MentionsInput
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={{
          control: {
            backgroundColor: "#fff",
            fontSize: 14,
            padding: 8,
            borderRadius: 6,
            border: "1px solid #e2e8f0",
            minHeight: "100px"
          },
          highlighter: {
            padding: 8,
            overflow: "hidden"
          },
          input: {
            margin: 0,
            padding: 8,
            overflow: "auto",
            height: "100px"
          },
          suggestions: {
            list: {
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: 4,
              fontSize: 14
            },
            item: {
              padding: "8px 12px",
              borderBottom: "1px solid #e2e8f0",
              "&focused": {
                backgroundColor: "#EBF5FF"
              }
            }
          }
        }}
        className="w-full shadow-sm hover:border-blue-500 focus-within:border-blue-500 transition-colors duration-200"
        placeholder="Write a note... use @ to mention"
      >
        <Mention
          trigger="@"
          data={users}
          className="p-2 border "
          style={{
            backgroundColor: "#EBF5FF",
            borderRadius: "4px",
            padding: "2px 4px",
            color: "#2563EB"
          }}
          renderSuggestion={(suggestion, search, highlightedDisplay, index, focused) => (
            <div className={`p-2 ${focused ? 'bg-blue-50' : ''}`}>
              <div className="font-medium">{suggestion.display}</div>
              <div className="text-sm text-gray-500">{suggestion.position}</div>
            </div>
          )}
          markup="@__display__(__id__)"
          displayTransform={(id, display) => `@${display}`}
        />
      </MentionsInput>

      <button
        onClick={handleSave}
        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Save Note
      </button>
    </div>
  );
}
