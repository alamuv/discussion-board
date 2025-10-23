import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { logout } from '../slices/authSlice';

export default function Navbar() {
  const dispatch = useDispatch();
  const { authenticated, user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logout());
  };

  return (
    <nav className="bg-gray-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold hover:text-blue-100">
            Discussion Board
          </Link>

          {/* Auth Section */}
          {authenticated ? (
            <div className="flex items-center gap-x-2">
              <span className="text-sm">
                Welcome, <strong>{user?.name || 'User'}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <a
              href="/auth/google"
              className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded transition"
            >
              Login with Google
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}

