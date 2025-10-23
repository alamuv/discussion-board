import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Login() {
  const navigate = useNavigate();
  const { authenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (authenticated) {
      navigate('/threads');
    }
  }, [authenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Sign In
        </h1>

        <p className="text-gray-600 text-center mb-6">
          Sign in with your Google account to get started
        </p>

        <a
          href="/auth/google"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold text-center block"
        >
          Login with Google
        </a>

        <p className="text-sm text-gray-500 text-center mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

