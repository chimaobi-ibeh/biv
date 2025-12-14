import { AnalyticsEvent } from '@/types';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export function trackEvent(event: string, properties?: Record<string, any>) {
  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, properties);
  }

  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Analytics Event:', event, properties);
  }

  // Store locally for internal analytics
  storeEventLocally({ event, properties, timestamp: new Date() });
}

function storeEventLocally(analyticsEvent: AnalyticsEvent) {
  if (typeof window === 'undefined') return;

  try {
    const events = getStoredEvents();
    events.push(analyticsEvent);

    // Keep only last 100 events
    const recentEvents = events.slice(-100);
    localStorage.setItem('biv_analytics', JSON.stringify(recentEvents));
  } catch (error) {
    console.error('Failed to store analytics event:', error);
  }
}

function getStoredEvents(): AnalyticsEvent[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem('biv_analytics');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
}

// Track specific events
export const analytics = {
  pageView: (page: string) => trackEvent('page_view', { page }),

  assessmentStarted: () => trackEvent('assessment_started'),

  questionAnswered: (questionId: number, questionNumber: number) =>
    trackEvent('question_answered', { questionId, questionNumber }),

  assessmentCompleted: (score: number, level: string) =>
    trackEvent('assessment_completed', { score, level }),

  emailCaptured: (source: string) =>
    trackEvent('email_captured', { source }),

  reportDownloaded: (format: string) =>
    trackEvent('report_downloaded', { format }),

  shareClicked: (platform: string) =>
    trackEvent('share_clicked', { platform }),

  ctaClicked: (cta: string, location: string) =>
    trackEvent('cta_clicked', { cta, location }),

  dropOff: (questionNumber: number) =>
    trackEvent('assessment_drop_off', { questionNumber }),
};
