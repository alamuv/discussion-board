import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { cancelCreatingThread, createNewThread } from '../slices/threadsSlice';

export default function NewThread() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.threads);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Thread title is required');
      return;
    }

    if (!content.trim()) {
      setError('Thread content is required');
      return;
    }

    setError(null);

    try {
      await dispatch(
        createNewThread({
          title: title.trim(),
          content: content.trim(),
        })
      ).unwrap();

      // Reset form - the thunk handlers will close creation mode and set selectedThread
      setTitle('');
      setContent('');
    } catch (err) {
      setError(err?.message || 'Failed to create thread');
      console.error('Error creating thread:', err);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setContent('');
    setError(null);
    dispatch(cancelCreatingThread());
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-800">Create New Thread</h1>
        <p className="text-sm text-gray-600 mt-1">Share your thoughts with the community</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Title Input */}
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
            Thread Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter thread title..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            {title.length}/100 characters
          </p>
        </div>

        {/* Content Input */}
        <div className="mb-6">
          <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
            Thread Content *
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your thread content here..."
            rows="10"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            {content.length}/5000 characters
          </p>
        </div>
      </form>

      {/* Footer - Action Buttons */}
      <div className="border-t border-gray-200 p-6 bg-gray-50 flex gap-3 justify-end">
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !title.trim() || !content.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating...
            </>
          ) : (
            'Create Thread'
          )}
        </button>
      </div>
    </div>
  );
}

