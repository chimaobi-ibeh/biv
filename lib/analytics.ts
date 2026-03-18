/**
 * Analytics module for BeamX Business Idea Validator.
 *
 * Events are sent to Google Analytics (if configured) and stored
 * locally for development inspection.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// ── Core event tracker ──

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, properties);
  }

  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `%c[Analytics] ${event}`,
      'color: #8b5cf6; font-weight: bold;',
      properties || ''
    );
  }

  // Local storage for dev inspection
  storeEventLocally({ event, properties, timestamp: new Date() });
}

// ── Local event store ──

interface StoredEvent {
  event: string;
  properties?: Record<string, unknown>;
  timestamp: Date;
}

function storeEventLocally(analyticsEvent: StoredEvent) {
  if (typeof window === 'undefined') return;

  try {
    const events = getStoredEvents();
    events.push(analyticsEvent);

    // Keep only the last 200 events
    const recentEvents = events.slice(-200);
    localStorage.setItem('biv_analytics', JSON.stringify(recentEvents));
  } catch {
    // localStorage might be full or blocked; fail silently
  }
}

function getStoredEvents(): StoredEvent[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem('biv_analytics');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// ── Public helpers for dev mode ──

/**
 * Retrieve all stored analytics events. Useful in the browser console:
 *   import { getAnalyticsLog } from '@/lib/analytics';
 *   getAnalyticsLog();
 */
export function getAnalyticsLog(): StoredEvent[] {
  return getStoredEvents();
}

/**
 * Clear stored analytics events.
 */
export function clearAnalyticsLog(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('biv_analytics');
}

/**
 * Print a summary table of stored events to the console.
 */
export function printAnalyticsSummary(): void {
  const events = getStoredEvents();
  if (events.length === 0) {
    console.log('[Analytics] No events stored.');
    return;
  }

  // Count by event name
  const counts: Record<string, number> = {};
  for (const e of events) {
    counts[e.event] = (counts[e.event] || 0) + 1;
  }

  console.table(counts);
  console.log(`[Analytics] ${events.length} total events stored.`);
}

// ── Named event helpers ──

export const analytics = {
  pageView: (page: string) => trackEvent('page_view', { page }),

  assessmentStarted: () => trackEvent('assessment_started'),

  questionAnswered: (questionId: number, questionNumber: number) =>
    trackEvent('question_answered', { questionId, questionNumber }),

  assessmentCompleted: (score: number, level: string) =>
    trackEvent('assessment_completed', { score, level }),

  /**
   * Fire when the user leaves mid-assessment. Call this from
   * a beforeunload or visibilitychange handler.
   */
  dropOff: (questionNumber: number, totalQuestions: number) =>
    trackEvent('assessment_drop_off', {
      questionNumber,
      totalQuestions,
      percentComplete: Math.round((questionNumber / totalQuestions) * 100),
    }),

  emailCaptured: (source: string) =>
    trackEvent('email_captured', { source }),

  reportDownloaded: (format: string) =>
    trackEvent('report_downloaded', { format }),

  shareClicked: (platform: string) =>
    trackEvent('share_clicked', { platform }),

  ctaClicked: (cta: string, location: string) =>
    trackEvent('cta_clicked', { cta, location }),

  aiRecommendationRequested: () =>
    trackEvent('ai_recommendation_requested'),

  aiRecommendationReceived: (durationMs: number) =>
    trackEvent('ai_recommendation_received', { durationMs }),

  aiRecommendationFailed: (error: string) =>
    trackEvent('ai_recommendation_failed', { error }),

  retakeStarted: () => trackEvent('retake_started'),
};