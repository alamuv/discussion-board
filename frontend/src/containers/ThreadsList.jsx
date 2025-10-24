import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { listAllThreads, selectThread, deleteOneThread, startCreatingThread } from '../slices/threadsSlice';

export default function ThreadsList() {
  const dispatch = useDispatch();
  const { threads, selectedThread, loading, error, pagination } = useSelector(
    (state) => state.threads
  );
  const { authenticated } = useSelector((state) => state.auth);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(listAllThreads({ page: currentPage, limit: 10 }));
  }, [dispatch, currentPage]);

  const handleSelectThread = (thread) => {
    dispatch(selectThread(thread));
  };

  const handleDeleteThread = (e, threadId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this thread?')) {
      dispatch(deleteOneThread(threadId));
    }
  };

  if (loading && threads.length === 0) {
    return (
      <div className="w-full md:w-1/3 bg-white border-r border-gray-200 flex items-center justify-center">
        <p className="text-gray-500">Loading threads...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full md:w-1/3 bg-white border-r border-gray-200 p-4">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="w-full md:w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="flex flex-col gap-y-4 p-2">
        {authenticated && (
          <button
            onClick={() => dispatch(startCreatingThread())}
            className="w-full bg-blue-600 text-white py-2 rounded mt-2 mb-2 hover:bg-blue-700 transition font-medium"
          >
            + New Thread
          </button>
        )}

        {/* Thread List */}
        <div className="space-y-2">
          {threads.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No threads available</p>
          ) : (
            threads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => handleSelectThread(thread)}
                className={`p-3 rounded cursor-pointer transition relative group overflow-hidden${
                  selectedThread?.id === thread.id
                    ? 'bg-blue-100 border-l-4 border-blue-600'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {thread.title}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {thread.content}
                    </p>
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                      <span>{thread.author}</span>
                      <span>{thread.replies || 0} replies</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteThread(e, thread.id)}
                    className="ml-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition"
                    title="Delete thread"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-4 px-2 py-3 border-t border-gray-200">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition"
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pagination.pages))}
              disabled={currentPage === pagination.pages}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

