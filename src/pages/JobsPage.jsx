import { useEffect, useState } from "react";
import { Link, Routes, Route } from "react-router-dom";
import JobDetail from "./JobDetail";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetch("/api/jobs")
      .then(res => res.json())
      .then(json => setJobs(json.jobs));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold">Jobs</h2>
      <ul>
        {jobs.map(job => (
          <li key={job.id}>
            <Link to={`${job.id}`} className="text-blue-600">{job.title}</Link>
          </li>
        ))}
      </ul>

      <Routes>
        <Route path=":jobId" element={<JobDetail />} />
      </Routes>
    </div>
  );
}
