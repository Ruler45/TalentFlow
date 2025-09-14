import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Job not found");
          }
          throw new Error("Failed to fetch job");
        }

        const data = await response.json();
        setJob(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
    
  }, [jobId]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!job) return <div className="p-4">Job not found</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{job.title}</h1>
        <button
          onClick={() => navigate("/jobs")}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          ← Back to Jobs
        </button>
      </div>

      <div className="space-y-6">
        {/* Status Badge */}
        <div>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            job.status === 'active' 
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            Job status: {job.status}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          Job Tags: {job.tags.map(tag => (
            <span
              key={tag}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {tag}, 
            </span>
          ))}
        </div>

        {/* Location */}
        {job.location && (
          <div className="text-gray-600">
            <strong className="text-gray-900">Location:</strong> {job.location}
          </div>
        )}

        {/* Description */}
        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <div className="whitespace-pre-wrap">{job.description}</div>
        </div>

        {/* Metadata */}
        <div className="pt-6 mt-6 border-t border-gray-200 text-sm text-gray-500">
          <p>Slug: {job.slug}</p>
          <p>Order: {job.order}</p>
        </div>
      </div>
    </div>
  );
}
