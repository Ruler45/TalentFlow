import { useState, useEffect } from 'react';

export default function JobModal({ job, onClose, onSave }) {
  const [title, setTitle] = useState(job?.title || '');
  const [slug, setSlug] = useState(job?.slug || '');
  const [description, setDescription] = useState(job?.description || '');
  const [location, setLocation] = useState(job?.location || '');
  const [tags, setTags] = useState(job?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});

  // Generate slug from title
  useEffect(() => {
    if (!job && title && !slug) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
    }
  }, [title, slug, job]);

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      newErrors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      title,
      slug,
      description,
      location,
      tags,
      status: job?.status || 'active',
    });
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">
          {job ? 'Edit Job' : 'Create Job'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-3 py-2 border rounded ${
                errors.title ? 'border-red-500' : ''
              }`}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-1">Slug *</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={`w-full px-3 py-2 border rounded ${
                errors.slug ? 'border-red-500' : ''
              }`}
            />
            {errors.slug && (
              <p className="text-red-500 text-sm mt-1">{errors.slug}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              rows="4"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 rounded flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="flex-1 px-3 py-2 border rounded"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
              >
                Add
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}