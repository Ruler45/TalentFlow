import { useEffect, useState } from "react";
import { List } from "react-window";
import { Link, Routes, Route } from "react-router-dom";
import CandidateDetail from "./CandidateDetail";

const PAGE_SIZE = 20;

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchCandidates = async (retryCount = 0) => {
      console.log("Starting candidates fetch for page:", page, "attempt:", retryCount + 1);
      
      try {
        const url = `/api/candidates?page=${page}&pageSize=${PAGE_SIZE}`;
        console.log("Fetching URL:", url);

        const res = await fetch(url);
        console.log("Fetch response:", {
          ok: res.ok,
          status: res.status,
          statusText: res.statusText,
          headers: Object.fromEntries([...res.headers.entries()])
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const text = await res.text();
        console.log("Raw response:", text);

        const json = JSON.parse(text);
        console.log("Parsed response:", json);
        
        // If we got an empty response and server might not be ready, retry
        if (json.total === 0 && retryCount < 2) {
          console.log("Empty response, retrying in 1 second...");
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchCandidates(retryCount + 1);
        }
        
        setCandidates(json.candidates || []);
        setTotal(json.total || 0);
      } catch (error) {
        console.error("Fetch error:", error);
        if (retryCount < 2) {
          console.log("Retrying after error...");
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchCandidates(retryCount + 1);
        }
      }
    };

    fetchCandidates();
  }, [page]);

  const Row = ({ index, style }) => {
    const c = candidates[index];
    return (
      <div style={style} className="border-b px-2">
        <Link to={`${c.id}`} className="text-blue-600">
          {c.name} ({c.stage})
        </Link>
      </div>
    );
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold">Candidates</h2>
      <List
        rowComponent={Row}
        rowCount={candidates.length}
        rowHeight={25}
        rowProps={{ candidates }}
      />
      <div className="flex gap-2 mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>


      <Routes>
        <Route path="/:id" element={<CandidateDetail />} />
      </Routes>
    </div>
  );
}
