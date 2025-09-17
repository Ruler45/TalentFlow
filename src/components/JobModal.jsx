import { useContext, useEffect } from 'react';
import { JobsContext } from '../context/JobContext/jobsContextConfig';

export default function JobModal() {
  const {
    selectedJob: job,
    formData: { title, slug, description, location, tags, tagInput, errors },
    handleModalClose,
    handleInputChange,
    handleTagInputChange,
    handleTagAdd,
    handleTagRemove,
    addJob,
    updateJob
  } = useContext(JobsContext);

  // Generate slug from title
  useEffect(() => {
    if (!job && title && !slug) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      handleInputChange({ target: { name: 'slug', value: generatedSlug } });
    }
  }, [job, title, slug, handleInputChange]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    const errors = {};
    if (!title?.trim()) {
      errors.title = 'Title is required';
    }
    if (!slug?.trim()) {
      errors.slug = 'Slug is required';
    }

    if (Object.keys(errors).length > 0) {
      handleInputChange({ target: { name: 'errors', value: errors } });
      return;
    }
    
    const jobData = {
      title: title.trim(),
      slug: slug.trim(),
      description: description?.trim() || '',
      location: location?.trim() || '',
      tags: tags?.filter(tag => tag && typeof tag === 'string') || [],
      status: job?.status || 'active',
    };

    try {
      if (job) {
        // console.log("Updating job with ID:", job.id, "Data:", job);
        
        await updateJob(job.id, jobData);
      } else {
        await addJob(jobData);
      }
      handleModalClose();
    } catch (error) {
      console.error('Error saving job:', error);
      // Show the error in the form
      handleInputChange({
        target: {
          name: 'errors',
          value: {
            submit: error.message || 'Failed to save job. Please try again.'
          }
        }
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {job ? 'Edit Job Position' : 'Create New Position'}
          </h2>
          <button
            onClick={handleModalClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={title}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 bg-white border ${
                errors.title ? 'border-red-500 ring-red-100' : 'border-gray-300'
              } rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="e.g., Senior Frontend Developer"
            />
            {errors.title && (
              <p className="mt-1.5 flex items-center text-sm text-red-600">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="slug"
              value={slug}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 bg-white border ${
                errors.slug ? 'border-red-500 ring-red-100' : 'border-gray-300'
              } rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="senior-frontend-developer"
            />
            {errors.slug && (
              <p className="mt-1.5 flex items-center text-sm text-red-600">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.slug}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="4"
              placeholder="Enter job description, requirements, and responsibilities..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={location}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Remote, New York, NY"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skills & Requirements
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleTagRemove(tag)}
                    className="ml-1.5 text-blue-600 hover:text-blue-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={handleTagInputChange}
                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., React, TypeScript, 5+ years"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleTagAdd();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleTagAdd}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-transparent rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Skill
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.submit}
                </p>
              </div>
            )}
            <div className="flex justify-end items-center gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={handleModalClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                {job ? 'Save Changes' : 'Create Position'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}