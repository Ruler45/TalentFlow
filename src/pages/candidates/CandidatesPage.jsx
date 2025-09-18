import { useEffect, useState } from "react";
import { Link, Routes, Route } from "react-router-dom";
import CandidateDetail from "./CandidateDetail";
import CandidateForm from "../../components/CandidateForm";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { RECRUITMENT_STAGES } from "../../config/stages";
import { useCandidates } from '../../hooks/useCandidates';

const PAGE_SIZE = 20;

export default function CandidatesPage() {
  const { lists, total, fetchCandidates, updateCandidateStage, addCandidate } = useCandidates();
  const [page, setPage] = useState(1);
  const [selectedStage, setSelectedStage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [draggingId, setDraggingId] = useState(null);

  useEffect(() => {
    setPage(1);
  }, [selectedStage]);

  useEffect(() => {
    fetchCandidates(page, selectedStage);
  }, [fetchCandidates, page, selectedStage]);

  const handleDragStart = (start) => {
    setDraggingId(start.draggableId);
  };

  const handleDragEnd = (result) => {
    setDraggingId(null);
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

    const movedItem = lists[source.droppableId][source.index];
    updateCandidateStage(movedItem.id, destination.droppableId);
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
              {RECRUITMENT_STAGES.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.label}
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
              onSubmit={async (formData) => {
                try {
                  // Transform the data to match Dexie schema
                  const candidateData = {
                    ...formData,
                    stage: formData.stage || 'applied',
                    timeline: [{
                      date: new Date().toISOString(),
                      status: formData.stage || 'applied'
                    }],
                    notes: []
                  };
                  
                  await addCandidate(candidateData);
                  fetchCandidates(page, selectedStage);
                  setShowForm(false);
                } catch (error) {
                  console.error('Error adding candidate:', error);
                  // You might want to show an error message to the user here
                }
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="w-full px-4 flex gap-4 flex-wrap justify-evenly pb-4 mb-8 min-h-[calc(100vh-300px)]">
            {RECRUITMENT_STAGES.map((stage) => {
              const items = lists[stage.id] || [];
              return (
                <div 
                  className="flex-shrink-0 w-80 flex flex-col h-96 bg-gray-50 rounded-lg shadow-sm transition-all duration-200 ease-in-out hover:shadow-md" 
                  key={stage.id}
                >
                  <div className={`p-3 flex items-center justify-between border-b bg-white rounded-t-lg`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full bg-${stage.color}-400`} />
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{stage.label}</span>
                        <span className="text-xs text-gray-500">{stage.description}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl" role="img" aria-label={stage.label}>{stage.icon}</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                        {items.length}
                      </span>
                    </div>
                  </div>
                  
                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`p-2 flex-1 overflow-y-auto transition-all duration-200 ease-in-out
                          ${snapshot.isDraggingOver ? `bg-${stage.color}-50 ring-2 ring-${stage.color}-200` : ""}`}
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
                                className={`group mb-2 rounded-lg transition-all duration-200 ease-in-out
                                  ${snapshot.isDragging 
                                    ? "rotate-1 scale-105 shadow-lg bg-white ring-2 ring-blue-400" 
                                    : "bg-white hover:shadow-md"}
                                  ${draggingId === item.id ? "opacity-50" : "opacity-100"}
                                  shadow-sm border border-gray-200`}
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
                          <div className="h-24 flex flex-col items-center justify-center text-gray-400 text-sm border-2 border-dashed rounded-lg">
                            <span className="text-3xl mb-2" role="img" aria-label={stage.label}>
                              {stage.icon}
                            </span>
                            <p>Drop candidate here</p>
                            <p className="text-xs mt-1">No candidates in {stage.label.toLowerCase()}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>

        <Routes>
          <Route path="/:id" element={<CandidateDetail />} />
        </Routes>
      </div>
    );

}
