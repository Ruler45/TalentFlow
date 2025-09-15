// import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link,NavLink } from "react-router-dom";
import JobsPage from "./pages/JobsPage";
import CandidatesPage from "./pages/CandidatesPage";
import CandidateDetail from "./pages/CandidateDetail";
import JobsDetail from "./pages/JobDetail";

export default function App() {
  return (
    <div className="bg-white text-black min-h-screen">
      <Router>
        <nav className="p-4 flex gap-4 border-b border-gray-300 mb-4 justify-between">
          <span className="text-2xl">TalenFlow</span>
          <div className="flex gap-4">
            <NavLink to="/jobs">Jobs</NavLink>
            <NavLink to="/candidates">Candidates</NavLink>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<h3>Home page</h3>} />
          <Route path="/jobs/*" element={<JobsPage />} />
          <Route path="/jobs/:jobId" element={<JobsDetail />} />
          <Route path="/candidates/*" element={<CandidatesPage />} />
          <Route path="/candidates/:id" element={<CandidateDetail />} />
        </Routes>
      </Router>
    </div>
  );
}
