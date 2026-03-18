import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-8xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            404
          </h1>
          <p className="text-2xl font-bold text-gray-900 mt-4 mb-2">
            Page Not Found
          </p>
          <p className="text-gray-600">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
          >
            Go Home
          </Link>
          <Link
            href="/assessment"
            className="block w-full text-purple-600 py-3 rounded-xl font-semibold border-2 border-purple-200 hover:border-purple-400 transition-colors"
          >
            Start Assessment
          </Link>
        </div>
      </div>
    </div>
  );
}