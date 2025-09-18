import React, {  useState, useEffect, useMemo, useCallback } from 'react';
import { AssessmentContext } from "./AssessmentContextConfig";
// useAssessments has been moved to a separate file for Fast Refresh compatibility.

export function AssessmentProvider({ children }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [candidateResponse, setCandidateResponse] = useState(null);
  const [responseLoading, setResponseLoading] = useState(false);

  // Reset all state function
  const resetState = useCallback(() => {
    setCurrentQuestions([]);
    setPreviewMode(false);
    setCurrentJobId(null);
    setCurrentAssessment(null);
    setCandidateResponse(null);
    setAssessmentLoading(false);
    setResponseLoading(false);
  }, []);

  // Load assessments only once when the provider mounts
  useEffect(() => {
    let mounted = true;
    let timeoutId;

    const loadAssessments = async () => {
      try {
        const response = await fetch('/api/assessments');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (mounted) {
          setAssessments(data.assessments || []);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading assessments:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Add a small delay to prevent rapid re-renders during Fast Refresh
    timeoutId = setTimeout(() => {
      if (mounted) {
        loadAssessments();
      }
    }, 100);

    // Cleanup function to prevent state updates after unmount
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      resetState();
    };
  }, [resetState]);

  const addAssessment = useCallback(async (assessmentData) => {
    try {
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newAssessment = await response.json();
      setAssessments(prev => [...prev, newAssessment]);
      return newAssessment.id;
    } catch (error) {
      console.error('Error adding assessment:', error);
      throw error;
    }
  }, []);

  const updateAssessment = useCallback(async (id, assessmentData) => {
    try {
      const response = await fetch(`/api/assessments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedAssessment = await response.json();
      setAssessments(prev => prev.map(assessment => 
        assessment.id === id ? updatedAssessment : assessment
      ));
    } catch (error) {
      console.error('Error updating assessment:', error);
      throw error;
    }
  }, []);

  const deleteAssessment = useCallback(async (id) => {
    try {
      const response = await fetch(`/api/assessments/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setAssessments(prev => prev.filter(assessment => assessment.id !== id));
    } catch (error) {
      console.error('Error deleting assessment:', error);
      throw error;
    }
  }, []);

  const getAssessmentByJobId = useCallback((jobId) => {
    return assessments.find(assessment => assessment.jobId === jobId);
  }, [assessments]);

  const addQuestion = useCallback(() => {
    const newQuestion = {
      id: Date.now().toString(),
      text: "",
      type: "single",
      options: [],
      validation: {
        required: false
      },
      conditionalLogic: {
        enabled: false,
        dependsOn: null,
        requiredAnswer: null
      }
    };
    setCurrentQuestions(prev => [...prev, newQuestion]);
    return newQuestion.id;
  }, []);

  const updateQuestion = useCallback((id, updates) => {
    setCurrentQuestions(prev =>
      prev.map(q => (q.id === id ? { ...q, ...updates } : q))
    );
  }, []);

  const deleteQuestion = useCallback((id) => {
    setCurrentQuestions(prev => prev.filter(q => q.id !== id));
  }, []);

  const togglePreviewMode = useCallback(() => {
    setPreviewMode(prev => !prev);
  }, []);

  const loadAssessmentQuestions = useCallback((jobId) => {
    if (!jobId) return;
    
    const assessment = assessments.find(a => a.jobId === jobId);
    if (assessment || currentJobId !== jobId) {
      setCurrentJobId(jobId);
      setPreviewMode(false);
      setCurrentQuestions(assessment?.questions || []);
    }
  }, [assessments, currentJobId]);

  const loadAssessmentByJobId = useCallback(async (jobId) => {
    if (!jobId) {
      setCurrentAssessment(null);
      setCurrentQuestions([]);
      return;
    }

    let mounted = true;
    setAssessmentLoading(true);

    try {
      const response = await fetch(`/api/assessments/${jobId}`);
      
      if (!mounted) return;

      if (response.ok) {
        const assessment = await response.json();
        setCurrentAssessment(assessment);
        setCurrentJobId(jobId);
        setCurrentQuestions(assessment.questions || []);
      } else {
        setCurrentAssessment(null);
        setCurrentQuestions([]);
      }
    } catch (error) {
      console.error('Error loading assessment:', error);
      if (mounted) {
        setCurrentAssessment(null);
        setCurrentQuestions([]);
      }
    } finally {
      if (mounted) {
        setAssessmentLoading(false);
      }
    }

    return () => {
      mounted = false;
    };
  }, []);

  const loadCandidateResponse = useCallback(async (jobId, candidateName) => {
    if (!jobId || !candidateName) {
      setCandidateResponse(null);
      return;
    }

    let mounted = true;
    setResponseLoading(true);

    try {
      const response = await fetch(`/api/assessments/${jobId}/responses/${candidateName}`);
      
      if (!mounted) return;

      if (response.ok) {
        const data = await response.json();
        if (!data || !data.responses || !data.structure) {
          console.error('Invalid assessment data');
          setCandidateResponse(null);
          return;
        }

        if (mounted) {
          setCandidateResponse(data);
        }
      } else {
        console.error('No responses found for candidate:', candidateName);
        setCandidateResponse(null);
      }
    } catch (error) {
      console.error('Error loading candidate response:', error);
      if (mounted) {
        setCandidateResponse(null);
      }
    } finally {
      if (mounted) {
        setResponseLoading(false);
      }
    }

    return () => {
      mounted = false;
    };
  }, []);

  const refreshAssessments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/assessments');
      if (response.ok) {
        const data = await response.json();
        setAssessments(data.assessments || []);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error refreshing assessments:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(() => ({
    assessments,
    loading,
    currentQuestions,
    previewMode,
    currentAssessment,
    assessmentLoading,
    candidateResponse,
    responseLoading,
    addAssessment,
    updateAssessment,
    deleteAssessment,
    getAssessmentByJobId,
    refreshAssessments,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    loadAssessmentQuestions,
    loadAssessmentByJobId,
    loadCandidateResponse,
    togglePreviewMode
  }), [
    assessments,
    loading,
    currentQuestions,
    previewMode,
    currentAssessment,
    assessmentLoading,
    candidateResponse,
    responseLoading,
    addAssessment,
    updateAssessment,
    deleteAssessment,
    getAssessmentByJobId,
    refreshAssessments,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    loadAssessmentQuestions,
    loadAssessmentByJobId,
    loadCandidateResponse,
    togglePreviewMode
  ]);

  return (
    <AssessmentContext.Provider value={value}>
      {children}
    </AssessmentContext.Provider>
  );
}