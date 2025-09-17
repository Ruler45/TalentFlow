import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAssessments } from "../../hooks/useAssessments"

export default function CandidateResponsePage() {
  const { jobId, candidateName } = useParams();
  const navigate = useNavigate();
  const { 
    candidateResponse: data,
    responseLoading,
    loadCandidateResponse
  } = useAssessments();

  // Decode the candidate name from URL
  const decodedCandidateName = decodeURIComponent(candidateName);

  useEffect(() => {
    loadCandidateResponse(jobId, decodedCandidateName);
  }, [jobId, decodedCandidateName, loadCandidateResponse]);

  if (responseLoading) return <p>Loading candidate response...</p>;

  if (!data) return <p>Failed to load assessment data.</p>;

  const { responses, structure } = data;
  if (!structure || structure.length === 0) return <p>Assessment structure not found.</p>;
  
  const answers = responses[decodedCandidateName];
  if (!answers) return <p>Candidate responses not found.</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium text-xl">
            {decodedCandidateName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{decodedCandidateName}</h2>
            <p className="text-gray-600">Assessment Response</p>
          </div>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2 rounded-lg hover:bg-gray-100 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      </div>

      {!data ? (
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="animate-pulse space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
          {structure.map((q, index) => (
            <div key={q.id} className="p-6">
              <div className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-3">{q.text}</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {answers[q.id] ? (
                      <p className="text-gray-700">
                        {Array.isArray(answers[q.id])
                          ? answers[q.id].map((ans, i) => (
                              <span key={i} className="inline-block bg-white px-3 py-1 rounded-full text-sm mr-2 mb-2 border border-gray-200">
                                {ans}
                              </span>
                            ))
                          : answers[q.id]}
                      </p>
                    ) : (
                      <p className="text-gray-500 italic">No answer provided</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
