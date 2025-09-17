import { useParams, useNavigate } from "react-router-dom";
import AssessmentBuilder from "../../components/AssessmentBuilder";

export default function AssessmentBuilderWrapper() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  console.log("Job ID:", jobId);
  //   return <AssessmentBuilder jobId={Number(jobId)} />;

  return (
    <div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Assessment Preview</h2>
        <button
          onClick={() => navigate(`/jobs/${jobId}`)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          ← Back to Jobs
        </button>
      </div>
      <AssessmentBuilder jobId={jobId} />
    </div>
  );
}
