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
        <div className="w-full flex justify-evenly flex-wrap mb-8">
          {Object.entries(lists).map(([droppableId, items]) => (
            <div
              className="flex flex-col  items-center gap-2"
              key={droppableId}
            >
              <div>{droppableId}</div>
              <Droppable droppableId={droppableId}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`overflow-auto  p-2 rounded 
                      ${
                        droppableId == "hired"
                          ? "bg-green-400"
                          : droppableId == "rejected"
                          ? "bg-red-600"
                          : droppableId == "offer"
                          ? "bg-yellow-500"
                          : "bg-blue-200"
                      }  
                      lg:h-96 w-52 md:h-56 h-44`}
                  >
                    {items.map((item, index) => (
                      <Draggable
                        key={item.name}
                        draggableId={item.name}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Link to={`${item.id}`}>
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                userSelect: "none",
                                padding: 12,
                                margin: "0 0 8px 0",
                                borderRadius: 4,
                                background: snapshot.isDragging
                                  ? "#263B4A"
                                  : "#456C86",
                                color: "white",
                                ...provided.draggableProps.style,
                              }}
                            >
                              {item.name}
                            </div>
                          </Link>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
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
