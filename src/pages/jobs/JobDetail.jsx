import { useEffect } from "react";
import { useParams, useNavigate, Outlet, Link } from "react-router-dom";
import { useJobs } from "../../hooks/useJobs";

export default function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { loading, error, selectedJob: job, fetchJobById, clearSelectedJob } = useJobs();

  useEffect(() => {
    fetchJobById(jobId);
    return () => clearSelectedJob();
  }, [jobId, fetchJobById, clearSelectedJob]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!job) return <div className="p-4">Job not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/jobs")}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Jobs
              </button>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  job.status === "active"
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-gray-100 text-gray-800 border border-gray-200"
                }`}
              >
                {job.status === "active" ? (
                  <svg className="mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                ) : (
                  <svg className="mr-1.5 h-2 w-2 text-gray-400" fill="currentColor" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                )}
                {job.status}
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-bold text-gray-900 truncate">{job.title}</h1>
            {job.location && (
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {job.location}
              </div>
            )}
          </div>
        </div>

        {/* Assessment Navigation */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <Link
              to="assessment"
              className="border-b-2 border-transparent px-1 pb-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
            >
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                  <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                </svg>
                Assessment Builder
              </div>
            </Link>
            <Link
              to="assessment/preview"
              className="border-b-2 border-transparent px-1 pb-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
            >
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                Preview
              </div>
            </Link>
          </nav>
        </div>
      </div>

      <div className="mt-4">
        <Outlet />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Description */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Job Description</h2>
            </div>
            <div className="px-4 py-5 sm:px-6 prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700">{job.description}</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Tags */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium text-gray-900">Skills & Requirements</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Job Details</h3>
              <dl className="grid grid-cols-1 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">URL Slug</dt>
                  <dd className="mt-1 text-sm text-gray-900">{job.slug}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Display Order</dt>
                  <dd className="mt-1 text-sm text-gray-900">{job.order}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}