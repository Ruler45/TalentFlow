import { useState, useCallback } from "react";
import { Snackbar, Alert } from "@mui/material";
import { JobsContext, PAGE_SIZE } from "./jobsContextConfig";

export { JobsContext };
export function JobsProvider({ children }) {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    location: '',
    tags: [],
    tagInput: '',
    errors: {}
  });

  const fetchJobs = useCallback(
    async (page = 1, pageSize = PAGE_SIZE, search = "", status = "") => {
      setLoading(true);
      setError(null);

      try {
        const url = new URL("/api/jobs", window.location.origin);
        url.searchParams.set("page", page);
        url.searchParams.set("pageSize", pageSize);
        if (search) url.searchParams.set("search", search);
        if (status) url.searchParams.set("status", status);

        const response = await fetch(url);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        // Ensure unique IDs and proper structure
        const processedJobs = (data.jobs || [])
          .filter(job => job) // Filter out null/undefined jobs
          .map(job => ({
            id: job.id.toString(),
            title: job.title || '',
            slug: job.slug || '',
            description: job.description || '',
            location: job.location || '',
            tags: Array.isArray(job.tags) ? job.tags : [],
            status: job.status || 'active',
            order: typeof job.order === 'number' ? job.order : 0
          }));
        
        // Verify no duplicate IDs
        const ids = new Set();
        processedJobs.forEach(job => {
          if (ids.has(job.id)) {
            console.warn(`Duplicate job ID found: ${job.id}`, job);
          }
          ids.add(job.id);
        });

        setJobs(processedJobs);
        setTotal(data.total);
        setError(null);
        return { ...data, jobs: processedJobs };
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const addJob = async (jobData) => {
    setLoading(true);
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData),
      });

      const savedJob = await response.json();

      if (!response.ok) {
        throw new Error(savedJob.error || `HTTP error! status: ${response.status}`);
      }

      if (!savedJob?.job?.id || !savedJob?.job?.title) {
        console.error('Invalid server response:', savedJob);
        throw new Error('Invalid response from server: Missing job data or required fields');
      }

      // Verify the job ID doesn't exist in our current state
      const existingJob = jobs.find(j => j.id === savedJob.job.id.toString());
      if (existingJob) {
        throw new Error(`Job with ID ${savedJob.job.id} already exists`);
      }
      
      const newJob = {
        id: savedJob.job.id.toString(),
        title: savedJob.job.title || '',
        slug: savedJob.job.slug || '',
        description: savedJob.job.description || '',
        location: savedJob.job.location || '',
        tags: Array.isArray(savedJob.job.tags) ? savedJob.job.tags : [],
        status: savedJob.job.status || 'active',
        order: typeof savedJob.job.order === 'number' ? savedJob.job.order : 0
      };
      
      // Verify the ID doesn't already exist
      setJobs((prev) => {
        const existingIds = new Set(prev.map(j => j.id));
        if (existingIds.has(newJob.id)) {
          console.warn(`Attempt to add job with existing ID: ${newJob.id}`);
          return prev;
        }
        return [...prev, newJob];
      });
      
      setTotal((prev) => prev + 1);
      setError(null);
      return { ...savedJob, job: newJob };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateJob = async (id, jobData) => {
    if (!id) {
      throw new Error('Job ID is required for update');
    }

    setLoading(true);
    let originalJobs = null;

    try {
      // Store current state for potential rollback
      originalJobs = [...jobs];

      const response = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedJob = await response.json();
      
      if (!updatedJob?.job?.id) {
        throw new Error('Invalid response: Missing job data');
      }

      const processedJob = {
        id: updatedJob.job.id.toString(),
        title: updatedJob.job.title || '',
        slug: updatedJob.job.slug || '',
        description: updatedJob.job.description || '',
        location: updatedJob.job.location || '',
        tags: Array.isArray(updatedJob.job.tags) ? updatedJob.job.tags : [],
        status: updatedJob.job.status || 'active',
        order: typeof updatedJob.job.order === 'number' ? updatedJob.job.order : 0
      };
      
      setJobs(prev => {
        const jobIndex = prev.findIndex(j => j.id === id.toString());
        if (jobIndex === -1) {
          console.warn(`Job with ID ${id} not found in current state`);
          return prev;
        }
        const newJobs = [...prev];
        newJobs[jobIndex] = processedJob;
        return newJobs;
      });

      setError(null);
      return updatedJob;
    } catch (err) {
      // Rollback on error if we have the original state
      if (originalJobs) {
        setJobs(originalJobs);
      }
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

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

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

    // Store the original jobs array for potential rollback
    const originalJobs = [...jobs];

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
      setToast({
        open: true,
        message: 'Job position updated successfully',
        severity: 'success'
      });
    } catch (error) {
      // Rollback on failure
      setJobs(originalJobs);
      setToast({
        open: true,
        message: error.message || 'Failed to update job position. Changes have been reverted.',
        severity: 'error'
      });
      setError(error.message);
    }
  };

  const archiveJob = async (jobId, currentStatus) => {
    try {
      if (!jobId) {
        throw new Error('Job ID is required');
      }

      const existingJob = jobs.find(j => j.id === jobId);
      if (!existingJob) {
        throw new Error('Job not found');
      }

      const newStatus = currentStatus === "active" ? "archived" : "active";
      const result = await updateJob(jobId, { status: newStatus });
      
      setToast({
        open: true,
        message: `Job ${newStatus === 'active' ? 'unarchived' : 'archived'} successfully`,
        severity: 'success'
      });

      return result;
    } catch (err) {
      setToast({
        open: true,
        message: `Failed to ${currentStatus === 'active' ? 'archive' : 'unarchive'} job: ${err.message}`,
        severity: 'error'
      });
      throw err;
    }
  };


  const fetchJobById = useCallback(async (jobId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/jobs/${jobId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Job not found");
        }
        throw new Error("Failed to fetch job");
      }

      const data = await response.json();
      setSelectedJob(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err.message);
      setSelectedJob(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSelectedJob = useCallback(() => {
    setSelectedJob(null);
  }, []);

  const handleModalOpen = (job = null) => {
    if (job) {
      setFormData({
        ...job,
        tagInput: '',
        errors: {}
      });
      setSelectedJob(job);
    } else {
      setFormData({
        title: '',
        slug: '',
        description: '',
        location: '',
        tags: [],
        tagInput: '',
        errors: {}
      });
      setSelectedJob(null);
    }
    setShowJobModal(true);
  };

  const handleModalClose = () => {
    setShowJobModal(false);
    setFormData({
      title: '',
      slug: '',
      description: '',
      location: '',
      tags: [],
      tagInput: '',
      errors: {}
    });
    setSelectedJob(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      errors: {
        ...prev.errors,
        [name]: ''
      }
    }));
  };

  const handleTagInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      tagInput: e.target.value
    }));
  };

  const handleTagAdd = () => {
    if (formData.tagInput.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...new Set([...prev.tags, prev.tagInput.trim()])],
        tagInput: ''
      }));
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const value = {
    jobs,
    selectedJob,
    total,
    loading,
    error,
    showJobModal,
    formData,
    fetchJobs,
    fetchJobById,
    clearSelectedJob,
    addJob,
    updateJob,
    archiveJob,
    handleReorder,
    handleModalOpen,
    handleModalClose,
    handleInputChange,
    handleTagInputChange,
    handleTagAdd,
    handleTagRemove
  };

  return (
    <JobsContext.Provider value={value}>
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setToast(prev => ({ ...prev, open: false }))}
          severity={toast.severity}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
      {children}
    </JobsContext.Provider>
  );
}
