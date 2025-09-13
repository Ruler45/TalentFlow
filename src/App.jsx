import { useEffect, useState } from "react";

export default function App() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetch("/api/jobs")
      .then(res => res.json())
      .then(json => setJobs(json.jobs));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">TalentFlow</h1>
      <ul>
        {jobs.map(j => (
          <li key={j.id}>{j.title} ({j.status})</li>
        ))}
      </ul>
    </div>
  );
}
