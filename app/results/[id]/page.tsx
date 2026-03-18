'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiLoader } from 'react-icons/fi';

/**
 * This page handles /results/[id] links that are sent in emails.
 *
 * Since assessment data lives in sessionStorage (client-only, per-tab),
 * we can't actually restore a specific result by ID. Instead we:
 *   1. Check if there is existing assessment data in sessionStorage.
 *   2. If yes, redirect to /results (the main results page).
 *   3. If no, show a friendly message and offer to retake the assessment.
 *
 * A future improvement would be to persist results server-side (database)
 * and hydrate them here using the ID param.
 */
export default function ResultByIdPage() {
  const router = useRouter();

  useEffect(() => {
    const data = sessionStorage.getItem('assessment_data');
    if (data) {
      // They have a recent session, send them to the results page
      router.replace('/results');
    }
  }, [router]);

  // If we reach here, there's no session data
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiLoader className="text-3xl text-purple-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Results Not Available
          </h1>

          <p className="text-gray-600 mb-6">
            Your assessment results are tied to your browser session and may have
            expired. Take the assessment again to get fresh, personalized
            insights.
          </p>

          <div className="space-y-3">
            <a
              href="/assessment"
              className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              Retake Assessment
            </a>
            <a
              href="/"
              className="block w-full text-purple-600 py-3 rounded-xl font-semibold border-2 border-purple-200 hover:border-purple-400 transition-colors"
            >
              Back to Home
            </a>
          </div>
        </div>

        <p className="mt-6 text-sm text-gray-400">
          Need help? Contact us at support@beamxsolutions.com
        </p>
      </div>
    </div>
  );
}