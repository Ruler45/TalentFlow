import { useState } from "react";
import { MentionsInput, Mention } from "react-mentions";

const users = [
  { id: "1", display: "Alice" },
  { id: "2", display: "Bob" },
  { id: "3", display: "Charlie" },
];

export default function CandidateNotes({ onSave }) {
  const [note, setNote] = useState("");

  const handleSave = () => {
    if (!note.trim()) return;
    onSave(note);
    setNote("");
  };

  return (
    <div className="mt-4">
      <h4 className="font-semibold">Notes:</h4>
      <MentionsInput
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={{
          control: { backgroundColor: "#fff", fontSize: 14, padding: 5 },
          highlighter: { overflow: "hidden" },
          input: { margin: 0,padding:5 },
          padding: "5px",
        }}
        className="w-full border rounded p-4"
        placeholder="Write a note... use @ to mention"
      >
        <Mention
          trigger="@"
          data={users}
          className="p-2 border "
          style={{
            border: "1px solid #ccc",
          }}
          markup="@__display__(__id__)"
          displayTransform={(id, display) => `@${display}`}
        />
      </MentionsInput>

      <button
        onClick={handleSave}
        className="mt-2 px-3 py-1 border rounded bg-blue-600 text-white"
      >
        Save Note
      </button>
    </div>
  );
}
