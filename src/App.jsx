import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  NavLink,
} from "react-router-dom";
import "./styles/scrollbar.css";
import { AppProvider } from "./context/AppProvider";
import JobsPage from "./pages/JobsPage";
import CandidateDetail from "./pages/CandidateDetail";
import JobDetail from "./pages/JobDetail";
import CandidatesPage from "./pages/CandidatesPage";
import AssessmentBuilderWrapper from "./pages/AssessmentBuilderWrapper";
import AssessmentFormWrapper from "./pages/AssessmentFormWrapper";
import AssessmentsPage from "./pages/AssessmentsPage";
import AssessmentResponsesPage from "./components/AssessmentResponsesPage";
import CandidateResponsePage from "./pages/CandidateResponsePage";
import HomePage from "./pages/HomePage";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Router>
        <AppProvider>
          <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <Link
                    to="/"
                    className="text-2xl font-bold text-blue-600 flex items-center"
                  >
                    <svg
                      className="w-8 h-8 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    TalentFlow
                  </Link>
                </div>
                <div className="flex items-center space-x-8">
                  <NavLink
                    to="/jobs"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                        isActive
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                      }`
                    }
                  >
                    Jobs
                  </NavLink>
                  <NavLink
                    to="/candidates"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                        isActive
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                      }`
                    }
                  >
                    Candidates
                  </NavLink>
                  <NavLink
                    to="/assessments"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                        isActive
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                      }`
                    }
                  >
                    Assessments
                  </NavLink>
                </div>
              </div>
            </div>
          </nav>
          <div className="pt-16">
            {" "}
            {/* Add padding to account for fixed navbar */}
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/jobs/*" element={<JobsPage />}></Route>
              <Route path="/jobs/:jobId" element={<JobDetail />}></Route>
              <Route
                path="/jobs/:jobId/assessment"
                element={<AssessmentBuilderWrapper />}
              />
              <Route
                path="/jobs/:jobId/assessment/preview/"
                element={<AssessmentFormWrapper />}
              />

              {/* <Route path="/candidates/*" element={<CandidatesPage />} /> */}
              <Route path="/candidates/*" element={<CandidatesPage />} />
              <Route path="/candidates/:id" element={<CandidateDetail />} />
              <Route path="/assessments" element={<AssessmentsPage />} />
              <Route
                path="/assessments/:jobId/responses"
                element={<AssessmentResponsesPage />}
              />
              <Route
                path="/assessments/:jobId/responses/:candidateName"
                element={<CandidateResponsePage />}
              />
            </Routes>
          </div>
          <Footer />
        </AppProvider>
      </Router>
    </div>
  );
}
