import { useSelector } from 'react-redux';
import ThreadsList from './ThreadsList';
import NewThread from './NewThread';
import ThreadDetails from './ThreadDetails';
import ErrorBoundary from '../components/ErrorBoundary';

export default function ThreadsLayout() {
  const { isCreating } = useSelector((state) => state.threads);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar - Thread List */}
      <ThreadsList />

      {/* Right Panel - Thread Details or New Thread */}
      <div className="hidden md:flex md:w-2/3 bg-white flex-col">
        <ErrorBoundary>
          {isCreating ? (
            <NewThread />
          ) : (
            <ThreadDetails />
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
}

