import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteOneThread, updateOneThread, startEditingThread, cancelEditingThread } from '../slices/threadsSlice';

export default function ThreadDetails() {
  const dispatch = useDispatch();
  const { selectedThread, loading, isEditing } = useSelector((state) => state.threads);
  const { user } = useSelector((state) => state.auth);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editError, setEditError] = useState(null);

  // Check if current user is admin or thread creator
  const canEdit = user && (user.role === 'admin' || user.id === selectedThread?.userId);
  const canDelete = canEdit;

  const handleDelete = async () => {
    if (!selectedThread) return;

    try {
      await dispatch(deleteOneThread(selectedThread.id)).unwrap();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting thread:', error);
    }
  };

  const handleStartEdit = () => {
    setEditTitle(selectedThread.title);
    setEditContent(selectedThread.content);
    setEditError(null);
    dispatch(startEditingThread());
  };

  const handleCancelEdit = () => {
    setEditTitle('');
    setEditContent('');
    setEditError(null);
    dispatch(cancelEditingThread());
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      setEditError('Thread title is required');
      return;
    }

    if (!editContent.trim()) {
      setEditError('Thread content is required');
      return;
    }

    try {
      await dispatch(
        updateOneThread({
          threadId: selectedThread.id,
          threadData: {
            title: editTitle.trim(),
            content: editContent.trim(),
          },
        })
      ).unwrap();
      setEditError(null);
    } catch (error) {
      setEditError(error?.message || 'Failed to update thread');
      console.error('Error updating thread:', error);
    }
  };

  if (!selectedThread) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 text-lg">
          Select a thread to view details
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Thread?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this thread? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thread Header */}
      <div className="border-b border-gray-200 p-6">
        {isEditing ? (
          <div className="space-y-4">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Thread title"
              className="w-full text-2xl font-bold border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            {editError && (
              <p className="text-red-600 text-sm">{editError}</p>
            )}
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-2xl font-bold text-gray-800">
                {selectedThread.title}
              </h1>
              <div className="flex gap-2">
                {canEdit && (
                  <button
                    onClick={handleStartEdit}
                    disabled={loading}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded transition disabled:opacity-50"
                    title="Edit thread"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded transition disabled:opacity-50"
                    title="Delete thread"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>By {selectedThread.User?.name || 'Unknown'}</span>
              <span>{new Date(selectedThread.createdAt).toLocaleDateString()}</span>
            </div>
          </>
        )}
      </div>

      {/* Thread Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isEditing ? (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="Thread content"
            className="w-full h-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            disabled={loading}
          />
        ) : (
          <p className="text-gray-700 mb-6">{selectedThread.content}</p>
        )}

        {!isEditing && (
          <>
            {/* Comments Section */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Comments ({selectedThread.Comments?.length || 0})
              </h3>

              {/* Comments List */}
              <div className="space-y-4">
                {selectedThread.Comments && selectedThread.Comments.length > 0 ? (
                  selectedThread.Comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 p-4 rounded">
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold text-gray-800">
                          {comment.User?.name || 'Unknown'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer - Comment Input or Edit Actions */}
      <div className="border-t border-gray-200 p-6">
        {isEditing ? (
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleCancelEdit}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        ) : (
          <>
            <textarea
              placeholder="Write a comment..."
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
            <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              Post Comment
            </button>
          </>
        )}
      </div>
    </div>
  );
}

