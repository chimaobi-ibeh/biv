'use client';

import { useEffect } from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiAlertTriangle className="text-3xl text-red-500" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Something Went Wrong
          </h1>

          <p className="text-gray-600 mb-6">
            An unexpected error occurred. This has been logged and we will look
            into it. You can try again or go back to the home page.
          </p>

          <div className="space-y-3">
            <button
              onClick={reset}
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              <FiRefreshCw />
              Try Again
            </button>
            <a
              href="/"
              className="block w-full text-purple-600 py-3 rounded-xl font-semibold border-2 border-purple-200 hover:border-purple-400 transition-colors"
            >
              Back to Home
            </a>
          </div>

          {error.digest && (
            <p className="mt-4 text-xs text-gray-400">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}