import { useContext } from 'react';
import { CandidateContext } from '../context/candidateContextInstance';

export function useCandidates() {
  return useContext(CandidateContext);
}