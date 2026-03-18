'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { analytics } from '@/lib/analytics';

/**
 * /assessment/retake
 *
 * Clears any existing assessment data from sessionStorage
 * and redirects to a fresh assessment flow.
 */
export default function RetakePage() {
  const router = useRouter();

  useEffect(() => {
    // Preserve the user profile so they skip the form on retake
    try {
      const existing = sessionStorage.getItem('assessment_data');
      if (existing) {
        const data = JSON.parse(existing);
        if (data.userProfile) {
          sessionStorage.setItem('retake_profile', JSON.stringify(data.userProfile));
        }
      }
    } catch {
      // ignore parse errors
    }

    sessionStorage.removeItem('assessment_data');
    analytics.retakeStarted();

    const timer = setTimeout(() => {
      router.replace('/assessment');
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Preparing a fresh assessment...</p>
      </div>
    </div>
  );
}