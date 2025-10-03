import { useEffect, useState, useMemo } from "react";
import { Link, Routes, Route } from "react-router-dom";
import CandidateDetail from "./CandidateDetail";
import CandidateForm from "../../components/CandidateForm";
import CandidateFilterSidebar from "../../components/CandidateFilterSidebar";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { RECRUITMENT_STAGES } from "../../config/stages";
import { useCandidates } from '../../hooks/useCandidates';

const PAGE_SIZE = 20;

export default function CandidatesPage() {
  const { lists, total, fetchCandidates, updateCandidateStage, addCandidate, filterCandidates, candidates } = useCandidates();
  const [page, setPage] = useState(1);
  const [selectedStage, setSelectedStage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [draggingId, setDraggingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [selectedStage]);

  useEffect(() => {
    fetchCandidates(page, selectedStage);
  }, [fetchCandidates, page, selectedStage]);

  // Filter candidates based on search query
  const filteredCandidatesBySearch = useMemo(() => {
    if (!searchQuery) return candidates;
    return filterCandidates({ search: searchQuery });
  }, [candidates, filterCandidates, searchQuery]);

  // Organize filtered candidates by stage
  const filteredLists = useMemo(() => {
    const grouped = {};
    RECRUITMENT_STAGES.forEach(stage => {
      grouped[stage.id] = filteredCandidatesBySearch.filter(
        candidate => candidate.stage === stage.id
      );
    });
    return grouped;
  }, [filteredCandidatesBySearch]);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <span className="text-3xl md:text-4xl">👥</span>
                  Candidates
                </h1>
                <p className="mt-1 text-sm text-gray-600 hidden sm:block">Manage and track your recruitment pipeline</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="hidden sm:inline">Filters</span>
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">New Candidate</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 relative">
          {/* Mobile Filter Overlay */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowFilters(false)} />
          )}
          
          {/* Filter Sidebar */}
          <div className={`
            fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
            transform transition-transform duration-300 ease-in-out
            ${showFilters ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            bg-white lg:bg-transparent p-4 lg:p-0
            overflow-y-auto lg:overflow-visible
            shadow-xl lg:shadow-none
          `}>
            {/* Close button for mobile */}
            <button
              onClick={() => setShowFilters(false)}
              className="lg:hidden absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <CandidateFilterSidebar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedStage={selectedStage}
              setSelectedStage={setSelectedStage}
              totalCandidates={total}
              filteredCount={filteredCandidatesBySearch.length}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Pagination */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 md:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="font-medium text-gray-700 hidden sm:inline">Showing</span>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg font-semibold text-sm">
                { (page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, total)}
              </span>
              <span className="text-sm text-gray-500">of</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm">
                {total}
              </span>
              <span className="text-sm text-gray-500">candidates</span>
              {searchQuery && (
                <span className="text-xs text-gray-400">(filtered from {total})</span>
              )}
            </div>
            <div className="flex gap-1 sm:gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(1)}
                className="hidden sm:block px-3 md:px-4 py-2 border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                First
              </button>
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 md:px-4 py-2 border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Previous</span>
              </button>
              <button
                disabled={page * PAGE_SIZE >= total}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 md:px-4 py-2 border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              >
                <span className="hidden sm:inline">Next</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                disabled={page * PAGE_SIZE >= total}
                onClick={() => setPage(Math.ceil(total / PAGE_SIZE))}
                className="hidden sm:block px-3 md:px-4 py-2 border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                Last
              </button>
            </div>
          </div>
        </div>

            {/* Kanban Board Section */}
            <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
            {RECRUITMENT_STAGES.map((stage) => {
              const items = filteredLists[stage.id] || [];
              const totalInStage = lists[stage.id]?.length || 0;
              return (
                <div 
                  className="flex-shrink-0 w-72 sm:w-80 snap-center flex flex-col bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-200 md:border-2 transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.02]" 
                  key={stage.id}
                  style={{ minHeight: '500px', maxHeight: '600px' }}
                >
                  <div className="p-4 flex items-center justify-between border-b-2 border-gray-100 bg-gradient-to-br from-white to-gray-50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl" role="img" aria-label={stage.label}>{stage.icon}</span>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-base">{stage.label}</span>
                        <span className="text-xs text-gray-500 font-medium">{stage.description}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full bg-${stage.color}-400 shadow-sm`} />
                      <span className="px-3 py-1.5 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 text-sm font-bold rounded-full shadow-sm">
                        {searchQuery ? `${items.length}/${totalInStage}` : items.length}
                      </span>
                    </div>
                  </div>
                  
                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`p-3 flex-1 overflow-y-auto transition-all duration-300 ease-in-out custom-scrollbar
                          ${snapshot.isDraggingOver ? `bg-gradient-to-br from-${stage.color}-50 to-${stage.color}-100 ring-2 ring-${stage.color}-300` : "bg-gray-50"}`}
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
                                className={`group mb-3 rounded-xl transition-all duration-200 ease-in-out cursor-pointer
                                  ${snapshot.isDragging 
                                    ? "rotate-2 scale-105 shadow-2xl bg-white ring-2 ring-blue-500" 
                                    : "bg-white hover:shadow-lg hover:scale-[1.02]"}
                                  ${draggingId === item.id ? "opacity-50" : "opacity-100"}
                                  shadow-md border-2 border-gray-200 hover:border-blue-300`}
                              >
                                <Link to={`${item.id}`} className="block p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-base">
                                      {item.name}
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                      <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-semibold">
                                        #{index + 1}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span className="truncate">{item.email}</span>
                                  </div>
                                  {item.jobTitle && (
                                    <div className="inline-flex items-center gap-2 text-sm px-3 py-1.5 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 rounded-lg font-medium border border-gray-200">
                                      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                      </svg>
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
                          <div className="h-40 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded-xl bg-white">
                            <span className="text-5xl mb-3 opacity-50" role="img" aria-label={stage.label}>
                              {stage.icon}
                            </span>
                            <p className="font-semibold text-gray-500">Drop candidate here</p>
                            <p className="text-xs mt-2 text-gray-400">No candidates in {stage.label.toLowerCase()}</p>
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
          </div>
        </div>
      </div>

      {/* Add Candidate Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
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

      <Routes>
        <Route path="/:id" element={<CandidateDetail />} />
      </Routes>
    </div>
  );
}
