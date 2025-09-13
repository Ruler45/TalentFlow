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
    fetch(`/api/candidates?page=${page}&pageSize=${PAGE_SIZE}`)
      .then((res) => res.json())
      .then((json) => {
        setCandidates(json.candidates);
        setTotal(json.total);
      });
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
