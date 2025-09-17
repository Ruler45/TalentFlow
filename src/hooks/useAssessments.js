import { useContext } from "react";
import { AssessmentContext } from "../context/AssessmentContexts/AssessmentContextConfig";

export function useAssessments() {
  return useContext(AssessmentContext);
}