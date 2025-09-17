import { useEffect, useState } from "react";
import { Link, Routes, Route } from "react-router-dom";
import JobDetail from "../jobs/JobDetail";
import JobModal from "../../components/JobModal";
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
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  // Modal state moved to context

  useEffect(() => {
    fetchJobs(page, pageSize, search, status);
  }, [fetchJobs, page, pageSize, search, status]);

  // Handle drag and drop reordering
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    if (sourceIndex === destIndex) return;

    handleReorder(sourceIndex, destIndex, result.draggableId).catch((error) => {
      setError(
        `Failed to reorder job. Please try again. Error: ${error.message}`
      );
    });
  };

  const handleArchiveToggle = (job) => {
    archiveJob(job.id, job.status).catch((error) => {
      setError("Failed to update job status. Please try again. Error:" + error);
    });
  };

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Positions</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage and organize your company's open positions
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => {
              handleModalOpen(null);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="-ml-1 mr-2 h-5 w-5"
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
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-4">
          <div className="sm:flex sm:items-center gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search positions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div className="mt-4 sm:mt-0 sm:w-40">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          {(search || status) && (
            <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-2">
                Active filters:
                {search && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Search: {search}
                    <button
                      onClick={() => setSearch("")}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {status && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Status: {status}
                    <button
                      onClick={() => setStatus("")}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setSearch("");
                  setStatus("");
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-sm">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            disabled={page * pageSize >= total}
            onClick={() => setPage((p) => p + 1)}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">{(page - 1) * pageSize + 1}</span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(page * pageSize, total)}
              </span>{" "}
              of <span className="font-medium">{total}</span> positions
            </p>
          </div>
          <div>
            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button
                disabled={page * pageSize >= total}
                onClick={() => setPage((p) => p + 1)}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
      {/* Jobs List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="p-4 border rounded-lg shadow-sm">
                <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No jobs found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new job position
          </p>
          <div className="mt-6">
            <button
              onClick={() => handleModalOpen(null)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
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
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`p-4 bg-white border hover:cursor-grab rounded-lg shadow-sm flex items-center justify-between gap-4 group ${
                          job.status === "archived"
                            ? "bg-gray-50 border-red-200"
                            : "hover:border-blue-200 hover:shadow-md"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/jobs/${job.id}`}
                            className="block text-lg font-medium text-gray-900 hover:text-blue-600 truncate"
                          >
                            {job.title}
                          </Link>
                          <div className="mt-1 flex items-center gap-4">
                            <div className="flex flex-wrap gap-2">
                              {(job.tags || []).map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                job.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {job.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleModalOpen(job)}
                            className="inline-flex items-center p-1.5 border border-gray-200 rounded-md text-gray-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50"
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
                            className={`inline-flex items-center p-1.5 border rounded-md ${
                              job.status === "active"
                                ? "text-gray-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50"
                                : "text-gray-400 hover:text-green-600 hover:border-green-300 hover:bg-green-50"
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
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Job Modal */}
      {showJobModal && <JobModal />}

      <Routes>
        <Route path=":jobId" element={<JobDetail />} />
      </Routes>
    </div>
  );
}
