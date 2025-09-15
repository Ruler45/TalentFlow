import { useEffect } from "react";
import { useState } from "react";

const STAGES = ["applied", "screen", "tech", "offer", "hired", "rejected"];

export default function CandidateForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    stage: "applied",
  });
  const [error, setError] = useState("");
  const [availableJobs, setAvailableJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoadingJobs(true);
        const res = await fetch("/api/jobs?status=active&page=1&pageSize=100");
        if (!res.ok) {
          throw new Error("Failed to fetch jobs");
        }
        const data = await res.json();
        setAvailableJobs(data.jobs || []);
        console.log(data.jobs);
      } catch (err) {
        console.error(err);
      }finally{
        setLoadingJobs(false);
        console.log(availableJobs.length);
      }
    };
    fetchJobs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Name and email are required");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      const response = await fetch("/api/candidates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create candidate");
      }

      const data = await response.json();
      onSubmit(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 rounded shadow bg-gray-200 "
    >
      <div>
        <label htmlFor="name" className="block text-sm font-medium ">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full border  rounded-md shadow-sm p-2"
          placeholder="Enter candidate name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium ">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="mt-1 block w-full border  rounded-md shadow-sm p-2"
          placeholder="Enter email address"
        />
      </div>

      <div>
        <label htmlFor="stage" className="block text-sm font-medium">
          Stage
        </label>
        <select
          id="stage"
          name="stage"
          value={formData.stage}
          onChange={handleChange}
          className="mt-1 block w-full border  rounded-md shadow-sm p-2"
        >
          {STAGES.map((stage) => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </select>
      </div>
      {loadingJobs ? (
        <p>Loading jobs...</p>
      ) : availableJobs.length === 0 ? (
        <div>
          <label htmlFor="stage" className="block text-sm font-medium">
            Job Role
          </label>
          <select
            id="stage"
            name="stage"
            value={formData.stage}
            onChange={handleChange}
            className="mt-1 block w-full border  rounded-md shadow-sm p-2"
          >
            {availableJobs.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </div>
      ) : (
        "No active jobs available. Please create a job first."
      )}

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-md "
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create Candidate
        </button>
      </div>
    </form>
  );
}
