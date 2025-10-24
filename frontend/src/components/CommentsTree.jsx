import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createNewComment } from '../slices/commentsSlice';
import { uploadImage, validateImageFile } from '../services/uploadService';
import Comment from './Comment';

export default function CommentsTree({ threadId }) {
  const dispatch = useDispatch();
  const { comments, loading, error } = useSelector((state) => state.comments);
  const { user } = useSelector((state) => state.auth);

  const [newCommentContent, setNewCommentContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploadError, setUploadError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [commentError, setCommentError] = useState(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error);
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const result = await uploadImage(file);
      setAttachments([...attachments, { url: result.url, type: result.type }]);
    } catch (err) {
      setUploadError(err?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset file input
    }
  };

  const handleRemoveAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

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
          attachments,
        })
      ).unwrap();
      setNewCommentContent('');
      setAttachments([]);
      setCommentError(null);
    } catch (err) {
      setCommentError(err?.message || 'Failed to post comment');
    }
  };

  return (
    <div className="space-y-2">
      {/* Comments Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">
          Comments ({comments.length})
        </h3>
      </div>

      {/* New Comment Form */}
      {user && (
        <div className="bg-blue-50 p-3 rounded border border-blue-200 space-y-2">
          <textarea
            value={newCommentContent}
            onChange={(e) => setNewCommentContent(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            rows="2"
            disabled={loading || uploading}
          />

          {/* Upload Error */}
          {uploadError && (
            <p className="text-red-600 text-xs">{uploadError}</p>
          )}

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded p-2 text-center hover:border-blue-400 transition">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={loading || uploading}
              className="hidden"
              id="comment-file-input"
            />
            <label htmlFor="comment-file-input" className="cursor-pointer">
              <div className="flex items-center gap-1">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <p className="text-xs text-gray-600">
                  {uploading ? 'Uploading...' : 'Click to add image'}
                </p>
              </div>
            </label>
          </div>

          {/* Attachment Previews */}
          {attachments.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {attachments.map((attachment, index) => (
                <div key={index} className="relative group">
                  <img
                    src={attachment.url}
                    alt={`Attachment ${index + 1}`}
                    className="w-full h-20 object-cover rounded border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(index)}
                    disabled={loading || uploading}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
                    title="Remove attachment"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {commentError && (
            <p className="text-red-600 text-xs">{commentError}</p>
          )}

          <button
            onClick={handlePostComment}
            disabled={loading || uploading}
            className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
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

