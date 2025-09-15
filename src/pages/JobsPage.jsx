import { useEffect, useState } from "react";
import { Link, Routes, Route } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import JobDetail from "./JobDetail";
import JobModal from "../components/JobModal";

const PAGE_SIZE = 20;

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(PAGE_SIZE);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Fetch jobs with filters
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const url = new URL("/api/jobs", window.location.origin);
        url.searchParams.set("page", page);
        url.searchParams.set("pageSize", pageSize);
        if (search) url.searchParams.set("search", search);
        if (status) url.searchParams.set("status", status);

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch jobs");

        const data = await response.json();
        setJobs(data.jobs);
        setTotal(data.total);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [page, pageSize, search, status]);

  // Handle drag and drop reordering
  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    if (sourceIndex === destIndex) return;

    const jobId = result.draggableId;
    const job = jobs.find((j) => j.id === jobId);
    const fromOrder = job.order;
    const toOrder = jobs[destIndex].order;

    console.log("Reordering job:", jobId, "from", fromOrder, "to", toOrder);

    // Optimistic update
    const newJobs = Array.from(jobs);
    const [removed] = newJobs.splice(sourceIndex, 1);
    newJobs.splice(destIndex, 0, removed);
    setJobs(newJobs);

    try {
      const response = await fetch(`/api/jobs/${jobId}/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromOrder, toOrder }),
      });

      if (!response.ok) {
        throw new Error("Failed to reorder");
      }
    } catch (error) {
      // Rollback on failure
      setJobs(jobs);
      // Show error notification
      setError("Failed to reorder job. Please try again. Error:", error);
    }
  };

  const handleArchiveToggle = async (job) => {
    // setIsLoading(true);
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: job.status === "active" ? "archived" : "active",
        }),
      });

      if (!response.ok) throw new Error("Failed to update job status");

      const updatedJob = await response.json();

      setJobs(jobs.map((j) => (j.id === job.id ? updatedJob.job : j)));
    } catch (error) {
      setError("Failed to update job status. Please try again. Error:", error);
    }
  };

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Jobs</h1>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-4 justify-between">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border rounded"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <button
          onClick={() => {
            setSelectedJob(null);
            setShowJobModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Job
        </button>
      </div>
      {/* Pagination */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          Showing {(page - 1) * pageSize + 1} to{" "}
          {Math.min(page * pageSize, total)} of {total} jobs
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
            disabled={page * pageSize >= total}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
      {/* Jobs List */}
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="jobs">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {jobs.map((job, index) => (
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
                        className={`p-4 border hover:cursor-grab rounded flex items-center justify-between ${
                          job.status === "archived"
                            ? "opacity-90 border-red-400 "
                            : ""
                        }`}
                      >
                        <div>
                          <Link
                            to={`/jobs/${job.id}`}
                            className="text-lg font-medium text-blue-600 hover:text-blue-800"
                          >
                            {job.title}
                          </Link>
                          <div className="text-sm text-gray-600">
                            {job.tags.map((tag) => (
                              <span
                                key={tag}
                                className="mr-2 px-2 py-1 bg-gray-100 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedJob(job);
                              setShowJobModal(true);
                              console.log("Editing job:", selectedJob);
                            }}
                            className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={async () => await handleArchiveToggle(job)}
                            className={`px-3 py-1 text-sm border rounded ${
                              job.status === "active"
                                ? "hover:bg-red-100"
                                : "hover:bg-green-100"
                            }`}
                          >
                            {job.status.trim() === "active"
                              ? "Archive"
                              : "Unarchive"}
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
      {showJobModal && (
        <JobModal
          job={selectedJob}
          onClose={() => {
            setShowJobModal(false);
            setSelectedJob(null);
          }}
          onSave={async (jobData) => {
            try {
              const method = selectedJob ? "PATCH" : "POST";
              const url = selectedJob
                ? `/api/jobs/${selectedJob.id}`
                : "/api/jobs";

              const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(jobData),
              });

              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to save job");
              }

              const savedJob = await response.json();

              if (selectedJob) {
                setJobs(jobs.map((j) => (j.id === savedJob.id ? savedJob : j)));
              } else {
                setJobs([savedJob, ...jobs]);
              }

              setShowJobModal(false);
              setSelectedJob(null);
            } catch (error) {
              setError(error.message);
            }
          }}
        />
      )}

      <Routes>
        <Route path=":jobId" element={<JobDetail />} />
      </Routes>
    </div>
  );
}
