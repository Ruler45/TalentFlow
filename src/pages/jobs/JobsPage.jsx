import { useEffect, useState } from "react";
import { Link, Routes, Route } from "react-router-dom";
import JobDetail from "../jobs/JobDetail";
import JobModal from "../../components/JobModal";
import JobFilterSidebar from "../../components/JobFilterSidebar";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useJobs } from "../../hooks/useJobs";
import { PAGE_SIZE } from "../../context/JobContext/jobsContextConfig";

// const PAGE_SIZE = 20;

export default function JobsPage() {
  const {
    jobs,
    total,
    loading: isLoading,
    showJobModal,
    fetchJobs,
    handleReorder,
    archiveJob,
    handleModalOpen
  } = useJobs();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(PAGE_SIZE);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  // Modal state moved to context

  useEffect(() => {
    fetchJobs(page, pageSize, null, status);
  }, [fetchJobs, page, pageSize, status]);

  // Handle drag and drop reordering
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    if (sourceIndex === destIndex) return;

    // Get references to the dragged element for visual feedback
    const draggedElement = document.querySelector(`[data-rbd-draggable-id="${result.draggableId}"]`);
    if (draggedElement) {
      draggedElement.style.transition = 'transform 0.5s ease-in-out';
    }

    handleReorder(sourceIndex, destIndex, result.draggableId).catch((error) => {
      // Add visual shake animation on failure
      if (draggedElement) {
        draggedElement.style.transform = 'translateX(10px)';
        setTimeout(() => {
          draggedElement.style.transform = 'translateX(-10px)';
          setTimeout(() => {
            draggedElement.style.transform = 'translateX(0)';
          }, 100);
        }, 100);
      }
      setError(
        `Failed to reorder job. Please try again. Error: ${error.message}`
      );
    });
  };

  const handleArchiveToggle = async (job) => {
    if (!job || !job.id) {
      setError("Invalid job data");
      return;
    }

    try {
      await archiveJob(job.id, job.status);
      // Clear any existing error when successful
      setError("");
    } catch (error) {
      setError(`Failed to update job status. Please try again. Error: ${error.message || 'Unknown error'}`);
    }
  };

  // Display error as a notification banner if present
  const ErrorBanner = error ? (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={() => setError("")}
              className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="text-3xl md:text-4xl">💼</span>
                Job Positions
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage and organize your company's open positions
              </p>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={() => {
                  handleModalOpen(null);
                }}
                className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="hidden sm:inline">Add New Position</span>
                <span className="sm:hidden">New Job</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {ErrorBanner}
        
        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowSidebar(true)}
          className="lg:hidden fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </button>

        {/* Mobile Sidebar Overlay */}
        {showSidebar && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setShowSidebar(false)}
            />
            
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 w-80 bg-gray-50 shadow-2xl overflow-y-auto">
              <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Filters & Navigation</h2>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <JobFilterSidebar
                  status={status}
                  setStatus={setStatus}
                  page={page}
                  setPage={setPage}
                  pageSize={pageSize}
                  total={total}
                />
              </div>
            </div>
          </div>
        )}

        {/* Sidebar and Jobs Layout */}
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <JobFilterSidebar
              status={status}
              setStatus={setStatus}
              page={page}
              setPage={setPage}
              pageSize={pageSize}
              total={total}
            />
          </div>

          {/* Jobs Content */}
          <div className="flex-1 min-w-0">
        {/* Jobs List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="p-6 bg-white border-2 border-gray-200 rounded-xl shadow-md">
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/3 mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-5 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full w-20"></div>
                    <div className="h-5 bg-gradient-to-r from-green-100 to-green-200 rounded-full w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 text-center py-16 px-6">
            <div className="text-6xl mb-4">💼</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No jobs found
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
              Get started by creating your first job position and begin building your team!
            </p>
            <button
              onClick={() => handleModalOpen(null)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add New Position
            </button>
          </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="jobs">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {(jobs || [])
                  .filter(job => job && 
                    job.id && 
                    job.title && 
                    typeof job.title === 'string' && 
                    job.title.trim() !== ''
                  )
                  .map((job, index) => (
                  <Draggable
                    key={job.id}
                    draggableId={job.id}
                    index={index}
                    // isDragDisabled={job.status === "archived"}
                  >
                    {(provided) => {
                      // Add dummy data if not available
                      const jobWithDefaults = {
                        ...job,
                        location: job.location || "Remote",
                        department: job.department || "Engineering",
                        salary: job.salary || "$80,000 - $120,000",
                        type: job.type || "Full-time",
                        experience: job.experience || "3-5 years",
                        applicants: job.applicants || Math.floor(Math.random() * 50) + 10,
                        postedDate: job.postedDate || new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
                      };

                      return (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`p-5 md:p-6 bg-white border-2 hover:cursor-grab rounded-xl shadow-md flex flex-col gap-4 group transition-all duration-300 ease-in-out transform ${
                          job.status === "archived"
                            ? "bg-gray-50 border-red-200 opacity-75"
                            : "hover:border-blue-300 hover:shadow-lg hover:scale-[1.01]"
                        }`}
                      >
                        {/* Header Section */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start gap-3">
                              {/* Icon */}
                              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-md">
                                💼
                              </div>
                              
                              {/* Title and Status */}
                              <div className="flex-1 min-w-0">
                                <Link
                                  to={`/jobs/${job.id}`}
                                  className="block text-lg md:text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                                >
                                  {job.title}
                                </Link>
                                <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    {jobWithDefaults.department}
                                  </span>
                                  <span className="text-gray-400">•</span>
                                  <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {jobWithDefaults.location}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleModalOpen(job)}
                              className="inline-flex items-center p-2 border-2 border-gray-200 rounded-lg text-gray-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow"
                              title="Edit job"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button
                              onClick={async () => await handleArchiveToggle(job)}
                              className={`inline-flex items-center p-2 border-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow ${
                                job.status === "active"
                                  ? "text-gray-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50 border-gray-200"
                                  : "text-gray-400 hover:text-green-600 hover:border-green-300 hover:bg-green-50 border-gray-200"
                              }`}
                              title={
                                job.status === "active"
                                  ? "Archive job"
                                  : "Unarchive job"
                              }
                            >
                              {job.status === "active" ? (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                                  <path
                                    fillRule="evenodd"
                                    d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 font-medium">Salary</p>
                              <p className="text-xs font-bold text-gray-900 truncate">{jobWithDefaults.salary}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 font-medium">Type</p>
                              <p className="text-xs font-bold text-gray-900 truncate">{jobWithDefaults.type}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 font-medium">Experience</p>
                              <p className="text-xs font-bold text-gray-900 truncate">{jobWithDefaults.experience}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 font-medium">Applicants</p>
                              <p className="text-xs font-bold text-gray-900 truncate">{jobWithDefaults.applicants}</p>
                            </div>
                          </div>
                        </div>

                        {/* Tags and Status Section */}
                        <div className="flex flex-wrap items-center gap-2">
                          {(job.tags || []).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 hover:shadow-sm transition-shadow"
                            >
                              {tag}
                            </span>
                          ))}
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold border-2 ${
                              job.status === "active"
                                ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200"
                                : "bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-red-200"
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${
                              job.status === "active" ? "bg-green-500" : "bg-red-500"
                            }`}></span>
                            {job.status}
                          </span>
                          <span className="ml-auto text-xs text-gray-500 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Posted {jobWithDefaults.postedDate}
                          </span>
                        </div>
                      </div>
                    );
                    }}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

          </div>
        </div>

        {/* Job Modal */}
        {showJobModal && <JobModal />}

        <Routes>
          <Route path=":jobId" element={<JobDetail />} />
        </Routes>
      </div>
    </div>
  );
}
