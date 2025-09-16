// import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  NavLink,
} from "react-router-dom";
import JobsPage from "./pages/JobsPage";
import CandidateDetail from "./pages/CandidateDetail";
import JobDetail from "./pages/JobDetail";
import CandidatesPage2 from "./pages/CandidatesPage2";
import AssessmentBuilderWrapper from "./components/AssessmentBuilderWrapper";
import AssessmentFormWrapper from "./components/AssessmentFormWrapper";
import AssessmentsPage from "./pages/AssessmentsPage";
import AssessmentResponsesPage from "./components/AssessmentResponsesPage";
import CandidateResponsePage from "./pages/CandidateResponsePage";

export default function App() {
  return (
    <div className="bg-white text-black min-h-screen">
      <Router>
        <nav className="p-4 flex gap-4 border-b border-gray-300 mb-4 justify-between">
          <span className="text-2xl">TalentFlow</span>
          <div className="flex gap-4">
            <NavLink to="/jobs">Jobs</NavLink>
            <NavLink to="/candidates">Candidates</NavLink>
            <NavLink to="/assessments">Assessments</NavLink>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<h3>Home page</h3>} />
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
          <Route path="/candidates/*" element={<CandidatesPage2 />} />
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
      </Router>
    </div>
  );
}
