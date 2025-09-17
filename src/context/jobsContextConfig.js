import { createContext } from 'react';

export const JobsContext = createContext({
  jobs: [],
  selectedJob: null,
  total: 0,
  loading: false,
  error: null,
  fetchJobs: async () => {},
  fetchJobById: async () => {},
  clearSelectedJob: () => {},
  addJob: async () => {},
  updateJob: async () => {},
  archiveJob: async () => {},
  handleReorder: async () => {}
});

export const PAGE_SIZE = 20;