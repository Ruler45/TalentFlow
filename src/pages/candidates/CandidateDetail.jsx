import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import CandidateNotes from "../../components/Notes";
import { useCandidates } from "../../hooks/useCandidates";

const STAGES = ["applied", "screen", "interview", "offer", "hired", "rejected"];

// Dummy data for demonstration
const DUMMY_EDUCATION = [
  {
    degree: "Bachelor of Science in Computer Science",
    institution: "University of Technology",
    graduationYear: "2020",
    gpa: "3.8",
    major: "Computer Science",
    description: "Focused on software engineering, algorithms, and data structures with a minor in business administration.",
    honors: ["Dean's List", "Cum Laude", "Outstanding CS Student Award"]
  },
  {
    degree: "High School Diploma",
    institution: "Central High School",
    graduationYear: "2016",
    gpa: "3.9",
    honors: ["Valedictorian", "National Honor Society"]
  }
];

const DUMMY_EXPERIENCE = [
  {
    title: "Senior Software Engineer",
    company: "Tech Innovations Inc.",
    startDate: "Jan 2022",
    endDate: "Present",
    duration: "2 years 9 months",
    description: "Lead the development of scalable web applications and mentor junior developers. Responsible for architecture decisions and code reviews.",
    achievements: [
      "Improved application performance by 45% through optimization",
      "Led a team of 5 developers in successful product launch",
      "Implemented CI/CD pipeline reducing deployment time by 60%",
      "Mentored 3 junior developers who were promoted to mid-level"
    ]
  },
  {
    title: "Software Developer",
    company: "Digital Solutions LLC",
    startDate: "Jun 2020",
    endDate: "Dec 2021",
    duration: "1 year 7 months",
    description: "Developed and maintained full-stack web applications using React, Node.js, and PostgreSQL. Collaborated with cross-functional teams to deliver features.",
    achievements: [
      "Built 15+ responsive web components used across multiple projects",
      "Reduced bug reports by 30% through comprehensive testing",
      "Contributed to company's design system library"
    ]
  },
  {
    title: "Junior Developer Intern",
    company: "StartUp Ventures",
    startDate: "Jan 2020",
    endDate: "May 2020",
    duration: "5 months",
    description: "Assisted in developing web applications and learning industry best practices. Gained hands-on experience with modern development tools and methodologies.",
    achievements: [
      "Successfully completed 3 feature implementations",
      "Participated in agile development processes"
    ]
  }
];

const DUMMY_SKILLS_DETAILED = [
  { name: "JavaScript/React", level: 92 },
  { name: "Node.js", level: 88 },
  { name: "TypeScript", level: 85 },
  { name: "Python", level: 78 },
  { name: "SQL/Database Design", level: 82 },
  { name: "AWS/Cloud Services", level: 75 },
  { name: "Git/Version Control", level: 90 },
  { name: "Agile/Scrum", level: 86 }
];

export default function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { updateCandidateStage, fetchCandidateById, deleteCandidate } = useCandidates();

  useEffect(() => {
    const loadCandidate = async () => {
      try {
        setIsLoading(true);
        const candidateData = await fetchCandidateById(id);
        
        // Add dummy data if not present
        const enrichedCandidate = {
          ...candidateData,
          education: candidateData.education && candidateData.education.length > 0 
            ? candidateData.education 
            : DUMMY_EDUCATION,
          experience: candidateData.experience && candidateData.experience.length > 0 
            ? candidateData.experience 
            : DUMMY_EXPERIENCE,
          skillsDetailed: candidateData.skillsDetailed && candidateData.skillsDetailed.length > 0 
            ? candidateData.skillsDetailed 
            : DUMMY_SKILLS_DETAILED,
          phone: candidateData.phone || "+1 (555) 123-4567",
          resumeUrl: candidateData.resumeUrl || "#"
        };
        
        setCandidate(enrichedCandidate);
      } catch (error) {
        console.error('Error loading candidate:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCandidate();
  }, [id, fetchCandidateById]);

  const updateStage = async (newStage) => {
    const previousState = { ...candidate };
    
    try {
      // Create new timeline entry
      const newTimelineEntry = {
        status: `Stage updated to ${newStage}`,
        date: new Date().toISOString()
      };

      // Create the update payload
      const updatePayload = {
        ...candidate,
        stage: newStage,
        timeline: [...(candidate.timeline || []), newTimelineEntry]
      };
      
      // Update local state optimistically
      setCandidate(updatePayload);
      
      // Send to backend
      const updatedCandidate = await updateCandidateStage(id, newStage);
      
      if (!updatedCandidate) {
        throw new Error('Failed to update candidate');
      }

      // Fetch fresh data to ensure consistency
      const freshData = await fetchCandidateById(id);
      
      if (!freshData) {
        throw new Error('Failed to fetch updated candidate data');
      }

      // Update with fresh data
      setCandidate(freshData);
    } catch (error) {
      console.error("Error updating candidate stage:", error);
      // Revert to previous state on error
      setCandidate(previousState);
    }
  };

  // handle notes update
  const handleSaveNote = (newNote) => {
    const updated = [
      ...notes,
      { text: newNote, date: new Date().toISOString() },
    ];
    setNotes(updated);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this candidate? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteCandidate(id);
      navigate('/candidates', { replace: true });
    } catch (error) {
      console.error('Error deleting candidate:', error);
      alert('Failed to delete candidate. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading candidate...</p>
      </div>
    </div>
  );
  if (!candidate) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🔍</div>
        <p className="text-xl text-gray-600 font-medium">Candidate not found</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {candidate.name.charAt(0).toUpperCase()}
                </div>
              </div>
              
              {/* Candidate Info */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                  {candidate.name}
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize
                    ${candidate.stage === 'hired' ? 'bg-green-100 text-green-800' : 
                      candidate.stage === 'rejected' ? 'bg-red-100 text-red-800' :
                      candidate.stage === 'offer' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'}`}>
                    {candidate.stage}
                  </span>
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <a href={`mailto:${candidate.email}`} className="hover:text-blue-600 transition-colors">{candidate.email}</a>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                      <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                    </svg>
                    {candidate.jobTitle || "Unknown Position"}
                  </span>
                  {candidate.phone && (
                    <span className="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      {candidate.phone}
                    </span>
                  )}
                  {candidate.timeline && candidate.timeline[0] && (
                    <span className="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      Applied {new Date(candidate.timeline[0].date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Stage selector */}
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                <label className="text-sm font-medium text-gray-700">Stage:</label>
                <select
                  value={candidate.stage}
                  onChange={(e) => updateStage(e.target.value)}
                  className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm font-medium text-gray-900 capitalize cursor-pointer"
                >
                  {STAGES.map((s) => (
                    <option key={s} value={s} className="capitalize">
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Delete button */}
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center px-4 py-2 border-2 border-red-300 text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className="hidden sm:inline">Delete Candidate</span>
                    <span className="sm:hidden">Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skills Section */}
            {candidate.skills && candidate.skills.length > 0 && (
              <div className="bg-white shadow-md rounded-xl border-2 border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    Skills & Expertise
                  </h3>
                </div>
                <div className="px-6 py-5">
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill, i) => (
                      <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 hover:shadow-md transition-shadow">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Professional Experience Section */}
            <div className="bg-white shadow-md rounded-xl border-2 border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Professional Experience
                </h3>
              </div>
              <div className="px-6 py-5">
                {candidate.experience && candidate.experience.length > 0 ? (
                  <div className="space-y-6">
                    {candidate.experience.map((exp, i) => (
                      <div key={i} className="relative pl-8 pb-6 border-l-2 border-emerald-200 last:pb-0">
                        <div className="absolute -left-2 top-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow"></div>
                        <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <h4 className="text-base font-bold text-gray-900">{exp.title || 'Position Title'}</h4>
                          <p className="text-sm font-semibold text-emerald-600 mt-1">{exp.company || 'Company Name'}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {exp.startDate || 'Start Date'} - {exp.endDate || 'Present'}
                            </span>
                            {exp.duration && (
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {exp.duration}
                              </span>
                            )}
                          </div>
                          {exp.description && (
                            <p className="mt-3 text-sm text-gray-700 leading-relaxed">{exp.description}</p>
                          )}
                          {exp.achievements && exp.achievements.length > 0 && (
                            <ul className="mt-3 space-y-1">
                              {exp.achievements.map((achievement, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                  <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  {achievement}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-3">💼</div>
                    <p className="text-gray-500 font-medium">No work experience added yet</p>
                    <p className="text-sm text-gray-400 mt-1">Professional experience will be displayed here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Educational Background Section */}
            <div className="bg-white shadow-md rounded-xl border-2 border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                  </svg>
                  Educational Background
                </h3>
              </div>
              <div className="px-6 py-5">
                {candidate.education && candidate.education.length > 0 ? (
                  <div className="space-y-5">
                    {candidate.education.map((edu, i) => (
                      <div key={i} className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-5 border-2 border-indigo-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="text-base font-bold text-gray-900">{edu.degree || 'Degree/Certification'}</h4>
                            <p className="text-sm font-semibold text-indigo-600 mt-1">{edu.institution || 'Institution Name'}</p>
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                              {edu.graduationYear && (
                                <span className="flex items-center gap-1 text-xs text-gray-600">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  Graduated: {edu.graduationYear}
                                </span>
                              )}
                              {edu.gpa && (
                                <span className="flex items-center gap-1 text-xs text-gray-600">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                  </svg>
                                  GPA: {edu.gpa}
                                </span>
                              )}
                              {edu.major && (
                                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                                  {edu.major}
                                </span>
                              )}
                            </div>
                            {edu.description && (
                              <p className="mt-3 text-sm text-gray-700">{edu.description}</p>
                            )}
                            {edu.honors && edu.honors.length > 0 && (
                              <div className="mt-3">
                                <p className="text-xs font-semibold text-gray-700 mb-1">Honors & Awards:</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {edu.honors.map((honor, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-xs font-medium border border-yellow-200">
                                      🏆 {honor}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                              🎓
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-3">🎓</div>
                    <p className="text-gray-500 font-medium">No education information added yet</p>
                    <p className="text-sm text-gray-400 mt-1">Educational background will be displayed here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline Section */}
            <div className="bg-white shadow-md rounded-xl border-2 border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Recruitment Timeline
                </h3>
              </div>
              {candidate.timeline && candidate.timeline.length > 0 ? (
                <div className="px-6 py-5">
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {candidate.timeline.map((t, i) => (
                        <li key={i}>
                          <div className="relative pb-8">
                            {i !== candidate.timeline.length - 1 && (
                              <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gradient-to-b from-blue-200 to-purple-200" aria-hidden="true" />
                            )}
                            <div className="relative flex space-x-3">
                              <div>
                                <span className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-8 ring-white shadow-md">
                                  <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 pt-1.5">
                                <div className="text-sm font-semibold text-gray-900">{t.status}</div>
                                <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {new Date(t.date).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="px-6 py-8 text-center">
                  <div className="text-4xl mb-2">📋</div>
                  <p className="text-gray-500">No timeline available</p>
                </div>
              )}
            </div>

            {/* Notes Section */}
            <div className="bg-white shadow-md rounded-xl border-2 border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Notes & Comments
                </h3>
              </div>
              <div className="px-6 py-5">
                <CandidateNotes onSave={handleSaveNote} />
                {notes.length > 0 ? (
                  <div className="mt-6 space-y-4">
                    {notes.map((n, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="text-sm text-gray-800" dangerouslySetInnerHTML={{ __html: n.text }} />
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {new Date(n.date).toLocaleString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 text-center py-8">
                    <div className="text-4xl mb-2">📝</div>
                    <p className="text-gray-500 text-sm">No notes yet. Add your first note above.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Candidate Info */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <div className="bg-white shadow-md rounded-xl border-2 border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Quick Info
                </h3>
              </div>
              <div className="px-6 py-5">
                <dl className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Full Name</dt>
                      <dd className="mt-1 text-sm font-semibold text-gray-900">{candidate.name}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</dt>
                      <dd className="mt-1 text-sm font-semibold text-gray-900 break-all">
                        <a href={`mailto:${candidate.email}`} className="text-blue-600 hover:text-blue-800">{candidate.email}</a>
                      </dd>
                    </div>
                  </div>
                  {candidate.phone && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</dt>
                        <dd className="mt-1 text-sm font-semibold text-gray-900">
                          <a href={`tel:${candidate.phone}`} className="text-blue-600 hover:text-blue-800">{candidate.phone}</a>
                        </dd>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Position</dt>
                      <dd className="mt-1 text-sm font-semibold text-gray-900">{candidate.jobTitle || "Not specified"}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</dt>
                      <dd className="mt-1">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold capitalize
                          ${candidate.stage === 'hired' ? 'bg-green-100 text-green-800' : 
                            candidate.stage === 'rejected' ? 'bg-red-100 text-red-800' :
                            candidate.stage === 'offer' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'}`}>
                          {candidate.stage}
                        </span>
                      </dd>
                    </div>
                  </div>
                </dl>
              </div>
            </div>

            {/* Documents Card */}
            <div className="bg-white shadow-md rounded-xl border-2 border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Documents
                </h3>
              </div>
              <div className="px-6 py-5">
                {candidate.resumeUrl ? (
                  <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-blue-300 transition-all group">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                      <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">Resume.pdf</p>
                      <p className="text-xs text-gray-500">Click to view</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📄</div>
                    <p className="text-sm text-gray-500">No documents uploaded</p>
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Skills Card */}
            {candidate.skillsDetailed && candidate.skillsDetailed.length > 0 && (
              <div className="bg-white shadow-md rounded-xl border-2 border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-cyan-50 to-blue-50">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Skills Proficiency
                  </h3>
                </div>
                <div className="px-6 py-5">
                  <div className="space-y-4">
                    {candidate.skillsDetailed.map((skill, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                          <span className="text-xs font-semibold text-gray-500">{skill.level}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className="h-2.5 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${skill.level}%`,
                              background: skill.level >= 80 ? 'linear-gradient(to right, #10b981, #059669)' : 
                                         skill.level >= 60 ? 'linear-gradient(to right, #3b82f6, #2563eb)' : 
                                         'linear-gradient(to right, #f59e0b, #d97706)'
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Stats Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 shadow-md rounded-xl border-2 border-blue-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-blue-200 bg-white bg-opacity-50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Statistics
                </h3>
              </div>
              <div className="px-6 py-5">
                <dl className="space-y-3">
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-700 font-medium">Timeline Events</dt>
                    <dd className="text-2xl font-bold text-blue-900">{candidate.timeline?.length || 0}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-700 font-medium">Notes</dt>
                    <dd className="text-2xl font-bold text-blue-900">{notes.length}</dd>
                  </div>
                  {candidate.skills && (
                    <div className="flex items-center justify-between">
                      <dt className="text-sm text-gray-700 font-medium">Skills</dt>
                      <dd className="text-2xl font-bold text-blue-900">{candidate.skills.length}</dd>
                    </div>
                  )}
                  {candidate.experience && (
                    <div className="flex items-center justify-between">
                      <dt className="text-sm text-gray-700 font-medium">Experience</dt>
                      <dd className="text-2xl font-bold text-blue-900">{candidate.experience.length}</dd>
                    </div>
                  )}
                  {candidate.education && (
                    <div className="flex items-center justify-between">
                      <dt className="text-sm text-gray-700 font-medium">Education</dt>
                      <dd className="text-2xl font-bold text-blue-900">{candidate.education.length}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
