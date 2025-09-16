import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import CandidateNotes from "../components/Notes";
import { useCandidates } from "../hooks/useCandidates";

const STAGES = ["applied", "screen", "tech", "offer", "hired", "rejected"];

export default function CandidateDetail() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { updateCandidateStage, fetchCandidateById } = useCandidates();

  useEffect(() => {
    const loadCandidate = async () => {
      try {
        setIsLoading(true);
        const candidateData = await fetchCandidateById(id);
        setCandidate(candidateData);
      } catch (error) {
        console.error('Error loading candidate:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCandidate();
  }, [id, fetchCandidateById]);

  const updateStage = async (newStage) => {
    try {
      const updatedCandidate = await updateCandidateStage(id, newStage);
      setCandidate(prev => ({ ...prev, ...updatedCandidate }));
    } catch (error) {
      console.error("Error updating candidate stage:", error);
    }
  };

  // handle notes update
  const handleSaveNote = (newNote) => {
    const updated = [
      ...notes,
      { text: newNote, date: new Date().toISOString() },
    ];
    setNotes(updated);

    // optionally also PATCH to Mirage/IndexedDB here:
    // await db.candidates.put({ ...candidate, notes: updated });
  };

  if (isLoading) return <p className="p-4">Loading candidate...</p>;
  if (!candidate) return <p className="p-4">Candidate not found</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{candidate.name}</h1>
            <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                {candidate.email}
              </span>
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                  <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                </svg>
                {candidate.jobTitle || "Unknown Position"}
              </span>
            </div>
          </div>
          
          {/* Stage selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Stage</label>
            <select
              value={candidate.stage}
              onChange={(e) => updateStage(e.target.value)}
              className="block w-40 pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
            >
              {STAGES.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Timeline</h3>
            </div>
            {candidate.timeline && candidate.timeline.length > 0 ? (
              <div className="px-4 py-5 sm:px-6">
                <div className="flow-root">
                  <ul className="-mb-8">
                    {candidate.timeline.map((t, i) => (
                      <li key={i}>
                        <div className="relative pb-8">
                          {i !== candidate.timeline.length - 1 && (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                          )}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center ring-8 ring-white">
                                <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-gray-900">{t.status}</div>
                              <div className="mt-1 text-sm text-gray-500">
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
              <div className="px-4 py-5 sm:px-6 text-gray-500">No timeline available</div>
            )}
          </div>

          {/* Notes Section */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Notes</h3>
            </div>
            <div className="px-4 py-5 sm:px-6">
              <CandidateNotes onSave={handleSaveNote} />
              <div className="mt-6 flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {notes.map((n, i) => (
                    <li key={i} className="py-5">
                      <div className="relative">
                        <div className="text-sm text-gray-800" dangerouslySetInnerHTML={{ __html: n.text }} />
                        <div className="mt-1 text-xs text-gray-500">
                          {new Date(n.date).toLocaleString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Candidate Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Candidate Information</h3>
              <dl className="mt-4 space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Full name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{candidate.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email address</dt>
                  <dd className="mt-1 text-sm text-gray-900">{candidate.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Applied for</dt>
                  <dd className="mt-1 text-sm text-gray-900">{candidate.jobTitle || "Unknown Position"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Current stage</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${candidate.stage === 'hired' ? 'bg-green-100 text-green-800' : 
                        candidate.stage === 'rejected' ? 'bg-red-100 text-red-800' :
                        candidate.stage === 'offer' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'}`}>
                      {candidate.stage}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
