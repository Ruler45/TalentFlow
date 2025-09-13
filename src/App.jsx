// import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import JobsPage from "./pages/JobsPage";
import CandidatesPage from "./pages/CandidatesPage";
import CandidateDetail from "./pages/CandidateDetail";
import JobsDetail from "./pages/JobDetail";

export default function App() {

  return (
    <Router>
      <div className="p-4"></div>
      <h1 className="text-xl font-bold mb-4">TalentFlow</h1>
      <nav className="p-4 flex gap-4 bg-gray-100">
        <Link to="/jobs">Jobs</Link>
        <Link to="/candidates">Candidates</Link>
      </nav>
      <Routes>
        <Route path="/jobs/*" element={<JobsPage />} />
        <Route path="/jobs/:jobId" element={<JobsDetail />} />
        <Route path="/candidates/*" element={<CandidatesPage />} />
        <Route path="/candidates/:id" element={<CandidateDetail />} />

      </Routes>
    </Router>
  );
}
