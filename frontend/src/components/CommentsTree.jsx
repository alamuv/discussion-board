import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createNewComment } from '../slices/commentsSlice';
import Comment from './Comment';

export default function CommentsTree({ threadId }) {
  const dispatch = useDispatch();
  const { comments, loading, error } = useSelector((state) => state.comments);
  const { user } = useSelector((state) => state.auth);
  
  const [newCommentContent, setNewCommentContent] = useState('');
  const [commentError, setCommentError] = useState(null);

  const handlePostComment = async () => {
    if (!newCommentContent.trim()) {
      setCommentError('Comment cannot be empty');
      return;
    }

    try {
      await dispatch(
        createNewComment({
          threadId,
          content: newCommentContent.trim(),
        })
      ).unwrap();
      setNewCommentContent('');
      setCommentError(null);
    } catch (err) {
      setCommentError(err?.message || 'Failed to post comment');
    }
  };

  return (
    <div className="space-y-4">
      {/* Comments Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">
          Comments ({comments.length})
        </h3>
      </div>

      {/* New Comment Form */}
      {user && (
        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <p className="text-sm text-gray-600 mb-2">Post a comment</p>
          <textarea
            value={newCommentContent}
            onChange={(e) => setNewCommentContent(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            rows="3"
            disabled={loading}
          />
          {commentError && (
            <p className="text-red-600 text-xs mt-2">{commentError}</p>
          )}
          <button
            onClick={handlePostComment}
            disabled={loading}
            className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Posting...
              </>
            ) : (
              'Post Comment'
            )}
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-2">
          {comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              threadId={threadId}
              depth={0}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm text-center py-8">
          No comments yet. Be the first to comment!
        </p>
      )}
    </div>
  );
}

