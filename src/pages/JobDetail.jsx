import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function JobDetail() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);

  useEffect(() => {
    fetch(`/api/jobs/${jobId}`)
      .then(res => res.json())
      .then(json => setJob(json.job));
  }, [jobId]);

  if (!job) return <p>Loading...</p>;

  return (
    <div className="mt-4 p-2 border">
      <h3 className="text-xl font-semibold">{job.title}</h3>
      <p>Status: {job.status}</p>
      <p>Slug: {job.slug}</p>
    </div>
  );
}
