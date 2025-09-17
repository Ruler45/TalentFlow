import { useContext } from "react";
import { AssessmentContext } from "../context/AssessmentContextConfig";

export function useAssessments() {
  return useContext(AssessmentContext);
}