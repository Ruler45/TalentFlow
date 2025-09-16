import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function AssessmentResponsesPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [job,setJob] = useState({
    title: 'Loading...'
  });

  useEffect(() => {
    async function fetchResponse() {
      const data = await fetch(`/api/assessments/${jobId}/responses`).then(
        (res) => res.json()
      );
      setData(data);
    }
    async function fetchJob() {
      const jobData = await fetch(`/api/jobs/${jobId}`).then((res) => res.json());
      setJob(jobData);
    }
    fetchResponse();
    fetchJob();
  }, [jobId]);

  if (!data) return <p>Loading responses...</p>;

  const { responses } = data;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Candidate Responses</h2>
          <p className="text-gray-600 text-lg">{job.title}</p>
        </div>
        <button
          onClick={() => navigate(`/assessments`)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2 rounded-lg hover:bg-gray-100 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Assessment
        </button>
      </div>

      {!data ? (
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ) : Object.keys(responses).length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-xl text-gray-600 mb-2">No responses yet</p>
          <p className="text-gray-500">Candidate responses will appear here once submitted.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
          {Object.keys(responses).map((candidateName) => (
            <div 
              key={candidateName}
              className="hover:bg-gray-50 transition-colors"
            >
              <button
                className="w-full px-6 py-4 flex items-center justify-between text-left group"
                onClick={() =>
                  navigate(
                    `/assessments/${jobId}/responses/${encodeURIComponent(
                      candidateName
                    )}`
                  )
                }
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium">
                    {candidateName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-900 font-medium group-hover:text-blue-600 transition-colors">
                    {candidateName}
                  </span>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
