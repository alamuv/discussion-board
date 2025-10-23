import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createNewComment, updateOneComment, deleteOneComment } from '../slices/commentsSlice';

export default function Comment({ comment, threadId, depth = 0 }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.comments);
  
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [error, setError] = useState(null);

  const canEdit = user && (user.role === 'admin' || user.id === comment.userId);

  const handleReply = async () => {
    if (!replyContent.trim()) {
      setError('Reply cannot be empty');
      return;
    }

    try {
      await dispatch(
        createNewComment({
          threadId,
          content: replyContent.trim(),
          parentId: comment.id,
        })
      ).unwrap();
      setReplyContent('');
      setShowReplyForm(false);
      setError(null);
    } catch (err) {
      setError(err?.message || 'Failed to post reply');
    }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    try {
      await dispatch(
        updateOneComment({
          commentId: comment.id,
          content: editContent.trim(),
        })
      ).unwrap();
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError(err?.message || 'Failed to update comment');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await dispatch(deleteOneComment(comment.id)).unwrap();
        setError(null);
      } catch (err) {
        setError(err?.message || 'Failed to delete comment');
      }
    }
  };

  const paddingLeft = depth * 24;

  return (
    <div style={{ paddingLeft: `${paddingLeft}px` }} className="mb-4">
      <div className="bg-gray-50 rounded p-4">
        {/* Comment Header */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-semibold text-gray-800">
              {comment.user?.name || 'Unknown'}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(comment.createdAt).toLocaleDateString()}
            </p>
          </div>
          {canEdit && (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                disabled={loading}
                className="text-blue-600 hover:text-blue-700 text-sm disabled:opacity-50"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="text-red-600 hover:text-red-700 text-sm disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Comment Content */}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              disabled={loading}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                disabled={loading}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(comment.content);
                }}
                disabled={loading}
                className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 text-sm mb-3">{comment.content}</p>
        )}

        {/* Error Message */}
        {error && <p className="text-red-600 text-xs mb-2">{error}</p>}

        {/* Reply Button */}
        {!isEditing && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            disabled={loading}
            className="text-blue-600 hover:text-blue-700 text-sm disabled:opacity-50"
          >
            {showReplyForm ? 'Cancel Reply' : 'Reply'}
          </button>
        )}

        {/* Reply Form */}
        {showReplyForm && !isEditing && (
          <div className="mt-3 space-y-2">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="2"
              disabled={loading}
            />
            <div className="flex gap-2">
              <button
                onClick={handleReply}
                disabled={loading}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Posting...' : 'Post Reply'}
              </button>
              <button
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyContent('');
                }}
                disabled={loading}
                className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              threadId={threadId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

