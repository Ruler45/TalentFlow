import { useContext } from 'react';
import { JobsContext } from '../context/JobContext/JobsContext';

export function useJobs() {
  return useContext(JobsContext);
}