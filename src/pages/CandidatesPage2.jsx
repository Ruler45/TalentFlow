import { useEffect, useState } from "react";
// import { List } from "react-window";
import { Link, Routes, Route } from "react-router-dom";
import CandidateDetail from "./CandidateDetail";
import CandidateForm from "../components/CandidateForm";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const PAGE_SIZE = 20;

const STAGES = ["applied", "interview", "offer", "hired", "rejected"];

export default function CandidatesPage2() {
  const [candidates, setCandidates] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedStage, setSelectedStage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [lists, setLists] = useState({});

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
        // Organize candidates by stage
        const grouped = STAGES.reduce((acc, stage) => {
          acc[stage] = (json.candidates || []).filter((c) => c.stage === stage);
          return acc;
        }, {});
        setLists(grouped);
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

  const handleDragEnd = (result) => {
    const { source, destination } = result;

    // dropped outside
    if (!destination) return;

    // If dropped in the same place
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceList = candidates.filter((c) => c.stage === source.droppableId);
    const [movedItem] = sourceList.splice(source.index, 1);

    const destList = candidates.filter(
      (c) => c.stage === destination.droppableId
    );
    movedItem.stage = destination.droppableId;
    destList.splice(destination.index, 0, movedItem);

    const updateStage = async (newStage) => {
      try {
        const res = await fetch(`/api/candidates/${movedItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage: newStage }),
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const json = await res.json();

        // Check for error response
        if (json.error) {
          throw new Error(json.error);
        }

        // Validate response data shape
        if (
          !json ||
          !json.id ||
          !json.stage ||
          typeof json.stage !== "string"
        ) {
          console.error("Invalid response format:", json);
          throw new Error("Invalid response data format");
        }

        // Ensure timeline is an array
        if (!Array.isArray(json.timeline)) {
          json.timeline = [];
        }

        console.log("Setting candidate state with:", json);
      } catch (error) {
        console.error("Error updating candidate stage:", error);
        // Could add error state handling here if needed
      }
    };

    updateStage(destination.droppableId);

    setLists((prev) => ({
      ...prev,
      [source.droppableId]: sourceList,
      [destination.droppableId]: destList,
    }));
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
          {Math.min(page * PAGE_SIZE, total)} of {total} candidates
        </div>
        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Page 1
          </button>
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
          <button
            disabled={page * PAGE_SIZE >= total}
            onClick={() => setPage(total / PAGE_SIZE)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Last Page
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
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="w-full px-4 flex gap-4 flex-wrap justify-evenly pb-4 mb-8 min-h-[calc(100vh-300px)]">
          {Object.entries(lists).map(([droppableId, items]) => (
            <div className="flex-shrink-0 w-80 flex flex-col h-96 bg-gray-50 rounded-lg shadow-sm" key={droppableId}>
              <div className="p-3 flex items-center justify-between border-b bg-white rounded-t-lg">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    droppableId === "hired"
                      ? "bg-green-400"
                      : droppableId === "rejected"
                      ? "bg-red-400"
                      : droppableId === "offer"
                      ? "bg-yellow-400"
                      : droppableId === "interview"
                      ? "bg-blue-400"
                      : "bg-gray-400"
                  }`} />
                  <h3 className="font-semibold capitalize text-gray-900">
                    {droppableId}
                  </h3>
                </div>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                  {items.length}
                </span>
              </div>
              
              <Droppable droppableId={droppableId}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-2 flex-1 overflow-y-auto transition-colors min-h-[200px]
                      ${snapshot.isDraggingOver ? "bg-gray-100" : ""}
                    `}
                  >
                    {items.map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`group mb-2 rounded-lg ${
                              snapshot.isDragging
                                ? "rotate-1 scale-105 shadow-lg bg-white ring-2 ring-blue-400"
                                : "bg-white hover:shadow-md"
                            } shadow-sm border border-gray-200 transition-all duration-200`}
                          >
                            <Link to={`${item.id}`} className="block p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {item.name}
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                                    #{index + 1}
                                  </span>
                                </div>
                              </div>
                              <div className="text-sm text-gray-600 mb-1">
                                {item.email}
                              </div>
                              {item.jobTitle && (
                                <div className="text-sm px-2 py-1 bg-gray-50 text-gray-600 rounded mt-2 inline-block">
                                  {item.jobTitle}
                                </div>
                              )}
                            </Link>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {items.length === 0 && !snapshot.isDraggingOver && (
                      <div className="h-24 flex items-center justify-center text-gray-400 text-sm border-2 border-dashed rounded-lg">
                        Drop candidate here
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <Routes>
        <Route path="/:id" element={<CandidateDetail />} />
      </Routes>
    </div>
  );
}
