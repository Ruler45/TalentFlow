// src/api/controllers/assessmentsController.js
import { db } from "../../db/db";
import { Response } from "miragejs";

export async function getAllAssessments() {
  try {
    const assessments = await db.assessments.toArray();
    return { assessments };
  } catch {
    return new Response(500, {}, { error: "Failed to fetch assessments" });
  }
}

export async function getCandidateResponse(schema, request) {
  const { jobId, candidateName } = request.params;

  try {
    const assessment = await db.assessments.where("jobId").equals(jobId).first();

    if (!assessment || !assessment.responses || !assessment.structure) {
      return new Response(404, {}, { error: "Assessment not found or invalid" });
    }

    const candidateData = assessment.responses[candidateName];
    if (!candidateData) {
      return new Response(404, {}, { error: "No responses found for candidate" });
    }

    return {
      responses: { [candidateName]: candidateData },
      structure: assessment.structure,
    };
  } catch (error) {
    return new Response(500, {}, { error: `Failed to fetch candidate response: ${error.message}` });
  }
}

export async function getAssessmentByJobId(schema, request) {
  const { jobId } = request.params;
  const assessment = await db.assessments.where("jobId").equals(jobId).first();

  if (!assessment) {
    return new Response(404, {}, { error: "Assessment not found" });
  }

  return assessment;
}

export async function putAssessmentByJobId(schema, request) {
  const { jobId } = request.params;
  const attrs = JSON.parse(request.requestBody);

  if (!Array.isArray(attrs.structure)) {
    return new Response(
      400,
      {},
      { error: "Structure must be an array of questions" }
    );
  }

  let existing = await db.assessments
    .where("jobId")
    .equals(Number(jobId))
    .first();

  if (existing) {
    await db.assessments.update(existing.id, {
      ...existing,
      structure: attrs.structure,
    });
    return await db.assessments.get(existing.id);
  } else {
    const id = await db.assessments.add({
      jobId: jobId,
      structure: attrs.structure,
      responses: {},
    });
    return await db.assessments.get(id);
  }
}

export async function submitAssessmentResponse(schema, request) {
  const { jobId } = request.params;
  const attrs = JSON.parse(request.requestBody); // { candidateName, answers }

  if (!attrs.candidateName || !attrs.answers) {
    return new Response(
      400,
      {},
      { error: "candidateName and answers are required" }
    );
  }

  let assessment = await db.assessments
    .where("jobId")
    .equals(jobId)
    .first();

  if (!assessment) {
    return new Response(404, {}, { error: "Assessment not found" });
  }

  // Ensure responses object exists
  const updatedResponses = {
    ...assessment.responses,
    [attrs.candidateName]: attrs.answers,
  };

  await db.assessments.update(assessment.id, {
    responses: updatedResponses,
  });

  return { success: true, candidate: attrs.candidateName };
}

export async function getAssessmentResponses(schema, request) {
  const { jobId } = request.params;

  const assessment = await db.assessments.where("jobId").equals(jobId).first();

  if (!assessment) {
    return new Response(404, {}, { error: "Assessment not found" });
  }

  return {
    jobId: jobId,
    responses: assessment.responses || {},
    structure: assessment.structure || [],
  };
}
