import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../db/db';

const AssessmentContext = createContext();

export function useAssessments() {
  return useContext(AssessmentContext);
}

export function AssessmentProvider({ children }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      const allAssessments = await db.assessments.toArray();
      setAssessments(allAssessments);
    } catch (error) {
      console.error('Error loading assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAssessment = async (assessmentData) => {
    try {
      const id = await db.assessments.add(assessmentData);
      const newAssessment = { ...assessmentData, id };
      setAssessments(prev => [...prev, newAssessment]);
      return id;
    } catch (error) {
      console.error('Error adding assessment:', error);
      throw error;
    }
  };

  const updateAssessment = async (id, assessmentData) => {
    try {
      await db.assessments.update(id, assessmentData);
      setAssessments(prev => prev.map(assessment => 
        assessment.id === id ? { ...assessment, ...assessmentData } : assessment
      ));
    } catch (error) {
      console.error('Error updating assessment:', error);
      throw error;
    }
  };

  const deleteAssessment = async (id) => {
    try {
      await db.assessments.delete(id);
      setAssessments(prev => prev.filter(assessment => assessment.id !== id));
    } catch (error) {
      console.error('Error deleting assessment:', error);
      throw error;
    }
  };

  const getAssessmentByJobId = (jobId) => {
    return assessments.find(assessment => assessment.jobId === jobId);
  };

  const value = {
    assessments,
    loading,
    addAssessment,
    updateAssessment,
    deleteAssessment,
    getAssessmentByJobId,
    refreshAssessments: loadAssessments
  };

  return (
    <AssessmentContext.Provider value={value}>
      {children}
    </AssessmentContext.Provider>
  );
}