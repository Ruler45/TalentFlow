import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/db';
import { PAGE_SIZE, STAGES } from './candidateContextConfig';
import { CandidateContext } from './candidateContextInstance';

export function CandidateProvider({ children }) {
  const [candidates, setCandidates] = useState([]);
  const [lists, setLists] = useState({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCandidates = useCallback(async (page = 1, selectedStage = "", retryCount = 0) => {
    setLoading(true);
    try {
      const url = new URL("/api/candidates", window.location.origin);
      url.searchParams.set("page", page);
      url.searchParams.set("pageSize", PAGE_SIZE);
      if (selectedStage) {
        url.searchParams.set("stage", selectedStage);
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();

      // If we got an empty response and server might not be ready, retry
      if (json.total === 0 && retryCount < 2) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return fetchCandidates(page, selectedStage, retryCount + 1);
      }

      setCandidates(json.candidates || []);
      setTotal(json.total || 0);
      
      // Organize candidates by stage
      const grouped = STAGES.reduce((acc, stage) => {
        acc[stage] = (json.candidates || []).filter((c) => c.stage === stage);
        return acc;
      }, {});
      setLists(grouped);
      setError(null);
    } catch (err) {
      if (retryCount < 2) {
        console.log("Retrying after error...", err);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return fetchCandidates(page, selectedStage, retryCount + 1);
      }
      setError('Failed to load candidates');
      console.error('Error loading candidates:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addCandidate = async (candidateData) => {
    setLoading(true);
    try {
      const id = await db.candidates.add({
        ...candidateData,
        createdAt: new Date().toISOString(),
        status: candidateData.status || 'new'
      });
      const newCandidate = { ...candidateData, id };
      setCandidates(prev => [...prev, newCandidate]);
      setError(null);
      return id;
    } catch (err) {
      console.error('Error adding candidate:', err);
      setError('Failed to add candidate');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCandidate = async (id, candidateData) => {
    setLoading(true);
    try {
      await db.candidates.update(id, {
        ...candidateData,
        updatedAt: new Date().toISOString()
      });
      setCandidates(prev => prev.map(candidate => 
        candidate.id === id ? { ...candidate, ...candidateData } : candidate
      ));
      setError(null);
    } catch (err) {
      console.error('Error updating candidate:', err);
      setError('Failed to update candidate');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCandidate = async (id) => {
    setLoading(true);
    try {
      await db.candidates.delete(id);
      setCandidates(prev => prev.filter(candidate => candidate.id !== id));
      setError(null);
    } catch (err) {
      console.error('Error deleting candidate:', err);
      setError('Failed to delete candidate');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCandidateById = (id) => {
    return candidates.find(candidate => candidate.id === id);
  };

  const filterCandidates = (filters) => {
    return candidates.filter(candidate => {
      if (filters.status && candidate.status !== filters.status) return false;
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return (
          candidate.name.toLowerCase().includes(searchTerm) ||
          candidate.email.toLowerCase().includes(searchTerm) ||
          candidate.skills?.some(skill => skill.toLowerCase().includes(searchTerm))
        );
      }
      return true;
    });
  };

  const updateCandidateStatus = async (id, status) => {
    return updateCandidate(id, { status });
  };

  const updateCandidateStage = async (id, newStage) => {
    try {
      const res = await fetch(`/api/candidates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();

      if (json.error) {
        throw new Error(json.error);
      }

      if (!json || !json.id || !json.stage || typeof json.stage !== "string") {
        console.error("Invalid response format:", json);
        throw new Error("Invalid response data format");
      }

      if (!Array.isArray(json.timeline)) {
        json.timeline = [];
      }

      // Update local state
      setCandidates(prev => prev.map(candidate => 
        candidate.id === id ? { ...candidate, stage: newStage } : candidate
      ));

      // Update lists
      setLists(prev => {
        const updatedLists = { ...prev };
        // Remove from old stage list
        Object.keys(updatedLists).forEach(stage => {
          updatedLists[stage] = updatedLists[stage].filter(c => c.id !== id);
        });
        // Add to new stage list
        const candidate = candidates.find(c => c.id === id);
        if (candidate) {
          updatedLists[newStage] = [...updatedLists[newStage], { ...candidate, stage: newStage }];
        }
        return updatedLists;
      });

      return json;
    } catch (err) {
      console.error("Error updating candidate stage:", err);
      setError("Failed to update candidate stage");
      throw err;
    }
  };

  const addCandidateNote = async (id, note) => {
    const candidate = getCandidateById(id);
    if (!candidate) throw new Error('Candidate not found');

    const notes = [...(candidate.notes || []), {
      id: crypto.randomUUID(),
      text: note,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }];

    return updateCandidate(id, { notes });
  };

  const fetchCandidateById = useCallback(async (id, retryCount = 0) => {
    try {
      const res = await fetch(`/api/candidates/${id}`);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();

      // If we got no data and haven't retried too many times, retry
      if ((!json || !json.id) && retryCount < 2) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return fetchCandidateById(id, retryCount + 1);
      }

      // Check if we need to handle a nested structure
      const candidateData = json.candidate || json;

      if (!candidateData.id) {
        throw new Error("Invalid candidate data received");
      }

      setError(null);
      return candidateData;
    } catch (err) {
      if (retryCount < 2) {
        console.log("Retrying after error...", err);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return fetchCandidateById(id, retryCount + 1);
      }
      setError('Failed to fetch candidate');
      console.error('Error fetching candidate:', err);
      throw err;
    }
  }, []); // empty dependency array since it doesn't use any external values

  // Load candidates when the component mounts
  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const value = {
    candidates,
    lists,
    total,
    loading,
    error,
    addCandidate,
    updateCandidate,
    deleteCandidate,
    getCandidateById,
    filterCandidates,
    updateCandidateStatus,
    updateCandidateStage,
    addCandidateNote,
    fetchCandidateById,
    fetchCandidates,
    refreshCandidates: fetchCandidates
  };

  return (
    <CandidateContext.Provider value={value}>
      {children}
    </CandidateContext.Provider>
  );
}