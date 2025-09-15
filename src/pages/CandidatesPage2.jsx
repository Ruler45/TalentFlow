import { useEffect, useState } from "react";
// import { List } from "react-window";
import { Link, Routes, Route } from "react-router-dom";
import CandidateDetail from "./CandidateDetail";
import CandidateForm from "../components/CandidateForm";

const PAGE_SIZE = 20;

const STAGES = ["applied", "screen", "tech", "offer", "hired", "rejected"];

export default function CandidatesPage2() {
  const [candidates, setCandidates] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedStage, setSelectedStage] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [selectedStage]);

  useEffect(() => {
    const fetchCandidates = async (retryCount = 0) => {
      try {
        const url = new URL("/api/candidates", window.location.origin);
        url.searchParams.set("page", page);
        url.searchParams.set("pageSize", PAGE_SIZE);
        if (selectedStage) {
          url.searchParams.set("stage", selectedStage);
        }

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const json = await res.json();

        // If we got an empty response and server might not be ready, retry
        if (json.total === 0 && retryCount < 2) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return fetchCandidates(retryCount + 1);
        }

        setCandidates(json.candidates || []);
        setTotal(json.total || 0);
      } catch (_) {
        if (retryCount < 2) {
          console.log("Retrying after error...", _);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return fetchCandidates(retryCount + 1);
        }
      }
    };

    fetchCandidates();
  }, [page, selectedStage]);

  const Row = ({ index, style }) => {
    const c = candidates[index];
    return (
      <div style={style} className=" px-2 py-1 flex gap-2 w-fit min-h-fit">
        <Link to={`${c.id}`} className="text-blue-200 w-3xs h-fit">
          {c.name}
        </Link>
        <span className="text-yellow-600 w-3xs min-h-20 ">{c.jobTitle}</span>
        <span>{c.stage}</span>
      </div>
    );
  };

  // const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      {/* Filter */}
      <div className="p-4 flex flex-wrap items-center justify-between">
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
      {/* Pagination */}
      <div className="p-4 flex flex-wrap items-center justify-between">
        <div>
          Showing {(page - 1) * PAGE_SIZE + 1} to{" "}
          {Math.min(page * PAGE_SIZE, total)} of {total} jobs
        </div>
        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            disabled={page * PAGE_SIZE >= total}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
      {/* Add Candidate */}
      {showForm && (
        <div className="fixed inset-0 backdrop-blur-lg bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className=" rounded-lg w-full max-w-md">
            <CandidateForm
              onSubmit={(candidate) => {
                setCandidates((prev) => [candidate, ...prev]);
                setTotal((prev) => prev + 1);
                setShowForm(false);
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
      {/* List of Candidates */}
      <div className="flex gap-4 p-8 w-full flex-wrap justify-evenly ">
        {candidates.map((c) => (
          
          <Link to={`${c.id}`} className="flex flex-col  border p-4 rounded-xl w-xs  md:max-w-sm sm:w-xs hover:scale-105 hover:bg-gray-50 transition cursor-pointer" key={c.id}>
            <span> <b>Name:</b> {c.name} </span>
            <span> <b>Role:</b> {c.jobTitle} </span>
            <span> <b>Stage:</b> {c.stage}  </span>
          </Link>
        ))}
      </div>

      <Routes>
        <Route path="/:id" element={<CandidateDetail />} />
      </Routes>
    </div>
  );
}
