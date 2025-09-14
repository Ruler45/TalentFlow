import { useEffect, useState } from "react";
import { List } from "react-window";
import { Link, Routes, Route } from "react-router-dom";
import CandidateDetail from "./CandidateDetail";
import CandidateForm from "../components/CandidateForm";

const PAGE_SIZE = 20;

const STAGES = ["applied", "screen", "tech", "offer", "hired", "rejected"];

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedStage, setSelectedStage] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    // Reset to first page when filter changes
    setPage(1);
  }, [selectedStage]);

  useEffect(() => {
    const fetchCandidates = async (retryCount = 0) => {
      try {
        const url = new URL('/api/candidates', window.location.origin);
        url.searchParams.set('page', page);
        url.searchParams.set('pageSize', PAGE_SIZE);
        if (selectedStage) {
          url.searchParams.set('stage', selectedStage);
        }

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const json = await res.json();
        
        // If we got an empty response and server might not be ready, retry
        if (json.total === 0 && retryCount < 2) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchCandidates(retryCount + 1);
        }
        
        setCandidates(json.candidates || []);
        setTotal(json.total || 0);
      } catch (_) {
        if (retryCount < 2) {
          console.log("Retrying after error...",_);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchCandidates(retryCount + 1);
        }
      }
    };

    fetchCandidates();
  }, [page, selectedStage]);

  const Row = ({ index, style }) => {
    const c = candidates[index];
    return (
      <div style={style} className="border-b px-2 py-1 flex justify-between">
        <Link to={`${c.id}`} className="text-blue-600">
          {c.name} ({c.stage})
        </Link>
        <span className="text-gray-600">{c.jobTitle}</span>
      </div>
    );
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-4 w-[100vw] ">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold">Candidates</h2>
          <div className="flex items-center gap-2">
            <label htmlFor="stage-filter" className="font-medium">
              Filter by Stage:
            </label>
            <select
              id="stage-filter"
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="border px-2 py-1 rounded"
            >
              <option value="">All Stages</option>
              {STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          New Candidate
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <CandidateForm
              onSubmit={(candidate) => {
                setCandidates(prev => [candidate, ...prev]);
                setTotal(prev => prev + 1);
                setShowForm(false);
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
      
      <List
        rowComponent={Row}
        rowCount={candidates.length}
        rowHeight={25}
        width="100%"
        height={400}
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
