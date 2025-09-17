import { useContext } from 'react';
import { CandidateContext } from '../context/CandidateContext/candidateContextInstance';

export function useCandidates() {
  return useContext(CandidateContext);
}