import { AuthProvider } from './AuthContext';
import { JobsProvider } from './JobContext/JobsContext';
import { AssessmentProvider } from './AssessmentContexts/AssessmentContext';
import { CandidateProvider } from './CandidateContext/CandidateContext';

export function AppProvider({ children }) {
  return (
    <AuthProvider>
      <JobsProvider>
        <CandidateProvider>
          <AssessmentProvider>
            {children}
          </AssessmentProvider>
        </CandidateProvider>
      </JobsProvider>
    </AuthProvider>
  );
}