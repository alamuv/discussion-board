import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from './components/Navbar';
import ThreadsLayout from './containers/ThreadsLayout';
import { checkAuthStatus, getMe } from './slices/authSlice';

function App() {
  const dispatch = useDispatch();
  const { loading, authenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check auth status on app load
    dispatch(checkAuthStatus());
  }, [dispatch]);

  useEffect(() => {
    // Fetch user details if authenticated
    if (authenticated) {
      dispatch(getMe());
    }
  }, [authenticated, dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <main className="flex-1 overflow-auto">
        <ThreadsLayout />
      </main>
    </div>
  );
}

export default App;

