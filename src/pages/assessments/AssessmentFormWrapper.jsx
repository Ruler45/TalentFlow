import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAssessments } from "../../hooks/useAssessments"
import AssessmentForm from "../../components/AssessmentForm";

export default function AssessmentFormWrapper() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const { 
    currentAssessment: assessment,
    assessmentLoading: loading,
    loadAssessmentByJobId
  } = useAssessments();

  useEffect(() => {
    if (!jobId) return;
    loadAssessmentByJobId(jobId);
  }, [jobId, loadAssessmentByJobId]);

  if (!jobId || isNaN(Number(jobId))) {
    return <p>Invalid job ID</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                📋
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Assessment Form</h2>
                <p className="text-sm text-gray-600 mt-1">Complete your assessment questions below</p>
              </div>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8 animate-pulse">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-200 to-purple-200 rounded-xl"></div>
              <div className="flex-1 space-y-3">
                <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-2/3"></div>
                <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="h-6 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg w-3/4 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-5/6"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-4/5"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && assessment ? (
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden">
            {/* Assessment Info Banner */}
            <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-6 py-4">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-semibold text-lg">
                    {assessment.structure?.length || 0} Questions
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Est. 15-20 min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Auto-save enabled</span>
                  </div>
                </div>
              </div>
            </div>
            
            <AssessmentForm assessment={assessment} candidateId={123} />
          </div>
        ) : (
          !loading && (
            <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 text-center py-20 px-6">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Assessment Available</h3>
                <p className="text-gray-600 mb-8">
                  An assessment hasn't been created for this position yet. Please check back later or contact the hiring team for more information.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Go Back
                  </button>
                  <button
                    onClick={() => navigate('/jobs')}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Browse Jobs
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
