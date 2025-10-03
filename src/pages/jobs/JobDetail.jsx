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

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-lg font-medium text-gray-700">Loading job details...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg border-2 border-red-200 p-8 max-w-md text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-red-800 mb-2">Error</h2>
        <p className="text-red-600">{error}</p>
      </div>
    </div>
  );
  
  if (!job) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-8 max-w-md text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Job Not Found</h2>
        <p className="text-gray-600 mb-6">The job position you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate("/jobs")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
        >
          Back to Jobs
        </button>
      </div>
    </div>
  );

  // Add dummy data for missing fields
  const jobWithDefaults = {
    ...job,
    location: job.location || "Remote",
    department: job.department || "Engineering",
    salary: job.salary || "$80,000 - $120,000",
    type: job.type || "Full-time",
    experience: job.experience || "3-5 years",
    applicants: job.applicants || 42,
    postedDate: job.postedDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    benefits: job.benefits || ["Health Insurance", "401(k) Matching", "Remote Work", "Professional Development", "Flexible Hours"]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/jobs")}
          className="inline-flex items-center gap-2 px-4 py-2 mb-6 border-2 border-gray-200 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
        >
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Jobs
        </button>

        {/* Job Header Card */}
        <div className="bg-white shadow-xl rounded-2xl border-2 border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-2xl shadow-lg">
                    💼
                  </div>
                  <span
                    className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold shadow-md ${
                      job.status === "active"
                        ? "bg-green-500 text-white border-2 border-green-300"
                        : "bg-gray-400 text-white border-2 border-gray-300"
                    }`}
                  >
                    {job.status === "active" ? (
                      <svg className="mr-1.5 h-2 w-2 text-white animate-pulse" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                    ) : (
                      <svg className="mr-1.5 h-2 w-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                    )}
                    {job.status}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{job.title}</h1>
                <div className="flex flex-wrap gap-3 text-white text-sm">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {jobWithDefaults.location}
                  </div>
                  <span className="text-white/70">•</span>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {jobWithDefaults.department}
                  </div>
                  <span className="text-white/70">•</span>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Posted {jobWithDefaults.postedDate}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-200 bg-gray-50">
            <div className="px-6 py-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{jobWithDefaults.salary}</div>
              <div className="text-xs text-gray-600 font-medium mt-1">Salary Range</div>
            </div>
            <div className="px-6 py-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{jobWithDefaults.type}</div>
              <div className="text-xs text-gray-600 font-medium mt-1">Employment Type</div>
            </div>
            <div className="px-6 py-4 text-center">
              <div className="text-2xl font-bold text-pink-600">{jobWithDefaults.experience}</div>
              <div className="text-xs text-gray-600 font-medium mt-1">Experience Level</div>
            </div>
            <div className="px-6 py-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{jobWithDefaults.applicants}</div>
              <div className="text-xs text-gray-600 font-medium mt-1">Applicants</div>
            </div>
          </div>

          {/* Assessment Navigation */}
          <div className="border-t border-gray-200 bg-white">
            <nav className="flex">
              <Link
                to="assessment"
                className="flex-1 border-b-4 border-transparent px-6 py-4 text-sm font-medium text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-all"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                  </svg>
                  Assessment Builder
                </div>
              </Link>
              <Link
                to="assessment/preview"
                className="flex-1 border-b-4 border-transparent px-6 py-4 text-sm font-medium text-gray-600 hover:border-purple-500 hover:text-purple-600 transition-all"
              >
                <div className="flex items-center justify-center gap-2">
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
      </div>

      <div className="mt-4">
        <Outlet />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white shadow-lg rounded-xl border-2 border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Job Description</h2>
              </div>
            </div>
            <div className="px-6 py-6">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">{job.description}</div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-white shadow-lg rounded-xl border-2 border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Benefits & Perks</h2>
              </div>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {jobWithDefaults.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-800">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Tags */}
          <div className="bg-white shadow-lg rounded-xl border-2 border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Skills & Requirements</h3>
              </div>
            </div>
            <div className="px-6 py-6">
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200 hover:shadow-md transition-shadow"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white shadow-lg rounded-xl border-2 border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Job Details</h3>
              </div>
            </div>
            <div className="px-6 py-6">
              <dl className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider">URL Slug</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">{job.slug}</dd>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Display Order</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">#{job.order}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Apply CTA Card */}
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 shadow-lg rounded-xl border-2 border-blue-300 overflow-hidden">
            <div className="px-6 py-8 text-center">
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="text-xl font-bold text-white mb-2">Ready to Apply?</h3>
              <p className="text-blue-100 text-sm mb-6">Join our amazing team and make an impact!</p>
              <button className="w-full px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transform hover:scale-105 transition-all shadow-lg">
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}