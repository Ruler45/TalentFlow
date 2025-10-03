// src/components/AssessmentsPage.jsx
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/db";
import { Link } from "react-router-dom";

export default function AssessmentsPage() {
  const assessments = useLiveQuery(() => db.assessments.toArray(), []);

  if (!assessments) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
            <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/3 mb-4"></div>
            <div className="h-5 bg-gradient-to-r from-gray-100 to-gray-200 rounded w-1/2"></div>
          </div>
          <div className="bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden">
            <div className="h-14 bg-gradient-to-r from-blue-100 to-purple-100"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border-t border-gray-200">
                <div className="h-20 bg-white px-6 py-4 flex items-center space-x-4">
                  <div className="h-5 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg w-20"></div>
                  <div className="h-5 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg w-1/3"></div>
                  <div className="h-5 bg-gradient-to-r from-pink-100 to-pink-200 rounded-lg w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">📝</div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Assessments</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage and review all job assessments and responses
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Assessments Grid */}
        <div className="space-y-4">
          {assessments.map((a) => {
            const questionCount = a.structure?.length || 0;
            const responsesCount = Math.floor(Math.random() * 50) + 5; // Dummy data
            const avgScore = questionCount > 0 ? (Math.random() * 40 + 60).toFixed(1) : 0; // Dummy data
            
            return (
              <div key={a.id} className="bg-white shadow-lg rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Left Section - Main Info */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start gap-4">
                      {/* Icon Badge */}
                      <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-md">
                        #{a.id}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          <JobTitle jobId={a.jobId} />
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">{questionCount}</span>
                            <span className="text-gray-500">questions</span>
                          </div>
                          <span className="text-gray-300">•</span>
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="font-medium">{responsesCount}</span>
                            <span className="text-gray-500">responses</span>
                          </div>
                          <span className="text-gray-300">•</span>
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span className="font-bold text-green-600">{avgScore}%</span>
                            <span className="text-gray-500">avg score</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Section - Actions */}
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 px-6 py-6 border-t md:border-t-0 md:border-l border-gray-200 flex flex-col justify-center gap-3 min-w-[200px]">
                    <Link
                      to={`/jobs/${a.jobId}/assessment/preview`}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-blue-300 text-blue-700 font-medium rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-all shadow-sm"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Preview
                    </Link>
                    <Link
                      to={`/assessments/${a.jobId}/responses`}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      View Responses
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {assessments.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 text-center py-16 px-6">
            <div className="text-7xl mb-6">📝</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Assessments Yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Get started by creating an assessment for a job position. Assessments help you evaluate candidates effectively.
            </p>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Go to Jobs
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper: show job title by jobId
function JobTitle({ jobId }) {
  const job = useLiveQuery(() => db.jobs.get(jobId), [jobId]);
  return job ? job.title : "—";
}
