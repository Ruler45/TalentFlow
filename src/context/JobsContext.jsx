import { useState, useCallback } from 'react';
import { JobsContext, PAGE_SIZE } from './jobsContextConfig';

export { JobsContext } from './jobsContextConfig';
export function JobsProvider({ children }) {
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJobs = useCallback(async (page = 1, pageSize = PAGE_SIZE, search = "", status = "") => {
    setLoading(true);
    setError(null);

    try {
      const url = new URL("/api/jobs", window.location.origin);
      url.searchParams.set("page", page);
      url.searchParams.set("pageSize", pageSize);
      if (search) url.searchParams.set("search", search);
      if (status) url.searchParams.set("status", status);

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setJobs(data.jobs);
      setTotal(data.total);
      setError(null);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addJob = async (jobData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const savedJob = await response.json();
      setJobs(prev => [...prev, savedJob.job]);
      setTotal(prev => prev + 1);
      setError(null);
      return savedJob;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateJob = async (id, jobData) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const updatedJob = await response.json();
      setJobs(prev => prev.map(job => job.id === id ? updatedJob.job : job));
      setError(null);
      return updatedJob;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reorderJob = async (jobId, fromOrder, toOrder) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromOrder, toOrder }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const handleReorder = async (sourceIndex, destIndex, jobId) => {
    const job = jobs.find((j) => j.id === jobId);
    const fromOrder = job.order;
    const toOrder = jobs[destIndex].order;

    // Optimistic update
    const newJobs = Array.from(jobs);
    const [removed] = newJobs.splice(sourceIndex, 1);
    newJobs.splice(destIndex, 0, { ...removed, order: toOrder });
    
    // Update orders for jobs between source and destination
    const start = Math.min(sourceIndex, destIndex);
    const end = Math.max(sourceIndex, destIndex);
    for (let i = start; i <= end; i++) {
      if (i !== destIndex) {
        newJobs[i] = { ...newJobs[i], order: jobs[i].order };
      }
    }
    setJobs(newJobs);

    try {
      await reorderJob(jobId, fromOrder, toOrder);
    } catch (error) {
      // Rollback on failure
      setJobs(jobs);
      throw error;
    }
  };

  const archiveJob = async (jobId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "archived" : "active";
    return updateJob(jobId, { status: newStatus });
  };

  const value = {
    jobs,
    total,
    loading,
    error,
    fetchJobs,
    addJob,
    updateJob,
    archiveJob,
    handleReorder
  };

  return (
    <JobsContext.Provider value={value}>
      {children}
    </JobsContext.Provider>
  );
}