import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createNewComment, updateOneComment, deleteOneComment } from '../slices/commentsSlice';
import { uploadImage, validateImageFile } from '../services/uploadService';

export default function Comment({ comment, threadId, depth = 0 }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.comments);

  const fileInputRef = useRef(null);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replyAttachments, setReplyAttachments] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [uploadError, setUploadError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const canEdit = user && (user.role === 'admin' || user.id === comment.userId);

  const handleFileSelect = async (e) => {
    // If called from button click, trigger file picker
    if (!e?.target?.files) {
      fileInputRef.current?.click();
      return;
    }

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
      setReplyAttachments([...replyAttachments, { url: result.url, type: result.type }]);
    } catch (err) {
      setUploadError(err?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ''; // Reset file input
    }
  };

  const handleRemoveReplyAttachment = (index) => {
    setReplyAttachments(replyAttachments.filter((_, i) => i !== index));
  };

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
          attachments: replyAttachments,
        })
      ).unwrap();
      setReplyContent('');
      setReplyAttachments([]);
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
          <>
            <p className="text-gray-700 text-sm mb-3">{comment.content}</p>

            {/* Comment Attachments */}
            {comment.attachments && comment.attachments.length > 0 && (
              <div className="mb-3 grid grid-cols-2 gap-2">
                {comment.attachments.map((attachment, index) => (
                  <a
                    key={index}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative overflow-hidden rounded border border-gray-200 hover:border-blue-400 transition"
                  >
                    <img
                      src={attachment.url}
                      alt={`Attachment ${index + 1}`}
                      className="w-full h-24 object-cover group-hover:scale-105 transition"
                    />
                  </a>
                ))}
              </div>
            )}
          </>
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
            {/* Textarea and Image Button Row */}
            <div className="flex gap-2 items-start">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
                disabled={loading || uploading}
              />
              <button
                type="button"
                onClick={handleFileSelect}
                disabled={loading || uploading}
                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded transition disabled:opacity-50 flex-shrink-0 mt-0.5"
                title="Add image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>

            {/* Upload Error */}
            {uploadError && (
              <p className="text-red-600 text-xs">{uploadError}</p>
            )}

            {/* Upload Status */}
            {uploading && (
              <p className="text-blue-600 text-xs">Uploading image...</p>
            )}

            {/* Attachment Previews */}
            {replyAttachments.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {replyAttachments.map((attachment, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={attachment.url}
                      alt={`Attachment ${index + 1}`}
                      className="w-full h-16 object-cover rounded border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveReplyAttachment(index)}
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

            <div className="flex gap-2">
              <button
                onClick={handleReply}
                disabled={loading || uploading}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Posting...' : 'Post Reply'}
              </button>
              <button
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyContent('');
                  setReplyAttachments([]);
                }}
                disabled={loading || uploading}
                className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

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

