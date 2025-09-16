import { AuthProvider } from './AuthContext';
import { JobsProvider } from './JobsContext';
import { AssessmentProvider } from './AssessmentContext';
import { CandidateProvider } from './CandidateContext';

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