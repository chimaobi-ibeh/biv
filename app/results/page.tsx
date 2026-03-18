'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import {
  FiDownload,
  FiMail,
  FiShare2,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
} from 'react-icons/fi';
import {
  AssessmentResponse,
  UserProfile,
  ScoreResult,
  DimensionScore,
  AIRecommendation,
} from '@/types';
import {
  calculateScore,
  calculateDimensionScores,
  generateShareText,
} from '@/lib/scoring';
import { generatePDFReport } from '@/lib/pdf-generator';
import { analytics } from '@/lib/analytics';
import { useToast } from '@/components/Toast';

export default function ResultsPage() {
  const router = useRouter();
  const { addToast, ToastContainer } = useToast();

  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [dimensionScores, setDimensionScores] = useState<DimensionScore[]>([]);
  const [aiRecommendation, setAIRecommendation] =
    useState<AIRecommendation | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [emailSending, setEmailSending] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  useEffect(() => {
    const assessmentData = sessionStorage.getItem('assessment_data');

    if (!assessmentData) {
      router.push('/assessment');
      return;
    }

    try {
      const data = JSON.parse(assessmentData);

      if (!data.responses || !Array.isArray(data.responses) || data.responses.length === 0) {
        throw new Error('Invalid assessment data');
      }

      setResponses(data.responses);
      setUserProfile(data.userProfile || {});

      const score = calculateScore(data.responses);
      const dimensions = calculateDimensionScores(data.responses);

      setScoreResult(score);
      setDimensionScores(dimensions);
      setLoading(false);

      analytics.assessmentCompleted(score.score, score.level);
      analytics.pageView('results');

      if (data.userProfile?.email) {
        setEmail(data.userProfile.email);
      }
    } catch (error) {
      console.error('Failed to load assessment data:', error);
      addToast('Could not load your assessment data. Redirecting to start over.', 'error');
      setTimeout(() => router.push('/assessment'), 2000);
    }
  }, [router, addToast]);

  const fetchAIRecommendations = useCallback(async () => {
    if (!scoreResult) return;

    setAiLoading(true);
    setAiError(null);
    analytics.aiRecommendationRequested();
    const startTime = Date.now();

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses,
          userProfile,
          scoreLevel: scoreResult.level,
          totalPositive: scoreResult.totalPositive,
        }),
      });

      if (response.status === 429) {
        const data = await response.json();
        const retrySeconds = data.retryAfterSeconds || 60;
        setAiError(
          `Too many requests. Please wait ${retrySeconds} seconds and try again.`
        );
        addToast(
          `Rate limit reached. Please wait ${retrySeconds} seconds.`,
          'error'
        );
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Server error (${response.status})`);
      }

      const data = await response.json();
      setAIRecommendation(data.recommendation);
      analytics.aiRecommendationReceived(Date.now() - startTime);
      addToast('AI recommendations generated successfully!', 'success');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Failed to fetch AI recommendations:', error);
      setAiError(message);
      analytics.aiRecommendationFailed(message);
      addToast(`Failed to generate recommendations: ${message}`, 'error');
    } finally {
      setAiLoading(false);
    }
  }, [scoreResult, responses, userProfile, addToast]);

  const handleDownloadPDF = () => {
    if (!scoreResult) return;

    setPdfGenerating(true);

    try {
      const result = {
        userProfile,
        responses,
        scoreResult,
        dimensionScores,
        aiRecommendation: aiRecommendation || undefined,
        timestamp: new Date(),
        id: Date.now().toString(),
      };

      const pdf = generatePDFReport(result);
      pdf.save(`business-idea-validation-report-${Date.now()}.pdf`);
      analytics.reportDownloaded('pdf');
      addToast('PDF report downloaded!', 'success');
    } catch (error) {
      console.error('PDF generation failed:', error);
      addToast(
        'Failed to generate PDF. Please try again.',
        'error'
      );
    } finally {
      setPdfGenerating(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !scoreResult) return;

    // Basic client-side email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      addToast('Please enter a valid email address.', 'error');
      return;
    }

    setEmailSending(true);

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: userProfile.name || '',
          type: 'capture',
          result: {
            userProfile,
            responses,
            scoreResult,
            dimensionScores,
            aiRecommendation,
            timestamp: new Date().toISOString(),
            id: Date.now().toString(),
          },
        }),
      });

      if (response.status === 429) {
        addToast('Too many requests. Please wait a moment and try again.', 'error');
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to send email');
      }

      setEmailSubmitted(true);
      analytics.emailCaptured('results_page');
      addToast('Email sent successfully! Check your inbox.', 'success');

      // Fetch AI recommendations after email capture
      if (!aiRecommendation) {
        fetchAIRecommendations();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Failed to submit email:', error);
      addToast(`Email failed: ${message}`, 'error');
    } finally {
      setEmailSending(false);
    }
  };

  const handleShare = (platform: string) => {
    if (!scoreResult) return;

    const shareText = generateShareText(scoreResult);
    const shareUrl = window.location.href;

    switch (platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            shareText
          )}&url=${encodeURIComponent(shareUrl)}`,
          '_blank'
        );
        break;
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            shareUrl
          )}`,
          '_blank'
        );
        break;
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            shareUrl
          )}`,
          '_blank'
        );
        break;
    }

    analytics.shareClicked(platform);
  };

  if (loading || !scoreResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Calculating your score...</p>
        </div>
      </div>
    );
  }

  const radarData = dimensionScores.map((dim) => ({
    dimension: dim.name,
    score: dim.score,
    maxScore: dim.maxScore,
  }));

  const getScoreColor = (level: string) => {
    switch (level) {
      case 'green':
        return 'bg-green-500';
      case 'yellow':
        return 'bg-yellow-500';
      case 'red':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getScoreIcon = (level: string) => {
    switch (level) {
      case 'green':
        return <FiCheckCircle className="text-4xl text-white" />;
      case 'yellow':
        return <FiAlertCircle className="text-4xl text-white" />;
      case 'red':
        return <FiAlertCircle className="text-4xl text-white" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <ToastContainer />

      <div className="max-w-5xl mx-auto">
        {/* Score Header */}
        <div
          className={`${getScoreColor(scoreResult.level)} rounded-2xl shadow-2xl px-8 py-5 mb-8 text-white`}
        >
          <div className="flex items-center justify-center gap-6">
            <div className="flex-shrink-0">{getScoreIcon(scoreResult.level)}</div>
            <div>
              <div className="flex items-baseline gap-3">
                <h1 className="text-4xl font-bold">{scoreResult.score}%</h1>
                <h2 className="text-xl font-semibold opacity-90">{scoreResult.title}</h2>
              </div>
              <p className="text-base opacity-90 mt-1">{scoreResult.summary}</p>
            </div>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-center mb-6 text-gray-900">
            Your Readiness Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 1]}
                tick={false}
                axisLine={false}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#245EA6"
                fill="#245EA6"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Action Items */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h3 className="text-2xl font-bold mb-4 text-gray-900">
            Your Next Steps
          </h3>
          <p className="text-primary font-semibold mb-4">
            Timeframe: {scoreResult.timeframe}
          </p>
          <ul className="space-y-3">
            {scoreResult.actionItems.map((item, index) => (
              <li key={index} className="flex gap-3">
                <FiCheckCircle className="text-green-500 flex-shrink-0 mt-1" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Email Capture for AI Recommendations */}
        {!emailSubmitted && !aiRecommendation && (
          <div className="bg-primary rounded-2xl shadow-xl p-8 mb-8 text-white">
            <h3 className="text-2xl font-bold mb-2 text-center">
              Get Your Personalized AI Roadmap
            </h3>
            <p className="text-center mb-6 opacity-90">
              Enter your email to receive detailed AI-powered recommendations
              and a comprehensive PDF report
            </p>
            <form
              onSubmit={handleEmailSubmit}
              className="max-w-md mx-auto flex gap-3"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={emailSending}
                className={`px-6 py-3 bg-white text-primary rounded-lg font-semibold transition-all duration-300 ${
                  emailSending
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:shadow-lg'
                }`}
              >
                {emailSending ? 'Sending...' : 'Get Report'}
              </button>
            </form>
          </div>
        )}

        {/* AI Recommendations Loading */}
        {aiLoading && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">
              Generating your personalized AI recommendations...
            </p>
            <p className="text-sm text-gray-400 mt-2">
              This may take 15-30 seconds
            </p>
          </div>
        )}

        {/* AI Error State */}
        {aiError && !aiLoading && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-red-200">
            <div className="text-center">
              <FiAlertCircle className="text-4xl text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Could not generate AI recommendations
              </h3>
              <p className="text-gray-600 mb-4">{aiError}</p>
              <button
                onClick={fetchAIRecommendations}
                className="btn btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold"
              >
                <FiRefreshCw />
                Try Again
              </button>
            </div>
          </div>
        )}

        {aiRecommendation && (
          <>
            {/* Strengths */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h3 className="text-2xl font-bold mb-4 text-green-600">
                Your Strengths
              </h3>
              <ul className="space-y-2">
                {aiRecommendation.strengths.map((strength, index) => (
                  <li key={index} className="flex gap-3">
                    <FiCheckCircle className="text-green-500 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Gaps */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h3 className="text-2xl font-bold mb-4 text-orange-600">
                Areas to Improve
              </h3>
              <ul className="space-y-2">
                {aiRecommendation.gaps.map((gap, index) => (
                  <li key={index} className="flex gap-3">
                    <FiAlertCircle className="text-orange-500 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">{gap}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Personalized Plan */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Your Personalized Action Plan
              </h3>
              <p className="text-gray-700 whitespace-pre-line">
                {aiRecommendation.personalizedPlan}
              </p>
            </div>

            {/* Weekly Roadmap */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">
                Week-by-Week Roadmap
              </h3>
              <div className="space-y-6">
                {aiRecommendation.weeklyRoadmap.map((week, index) => (
                  <div key={index} className="border-l-4 border-primary pl-6">
                    <h4 className="text-xl font-bold mb-3 text-primary">
                      Week {week.week}
                    </h4>
                    <ul className="space-y-2">
                      {week.tasks.map((task, taskIndex) => (
                        <li key={taskIndex} className="flex gap-3">
                          <span className="text-gray-400">&#9633;</span>
                          <span className="text-gray-700">{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">
                Recommended Resources
              </h3>
              <div className="space-y-4">
                {aiRecommendation.resources.map((resource, index) => (
                  <div key={index} className="p-4 bg-surface rounded-lg">
                    <h4 className="font-bold text-gray-900 mb-2">
                      {resource.title}
                    </h4>
                    <p className="text-gray-700">{resource.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Risk Assessment
              </h3>
              <p className="text-gray-700 whitespace-pre-line">
                {aiRecommendation.riskAssessment}
              </p>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h3 className="text-2xl font-bold mb-6 text-center text-gray-900">
            Take Action
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={handleDownloadPDF}
                disabled={pdfGenerating}
                className={`btn btn-primary flex items-center gap-2 px-6 py-3 rounded-lg font-semibold ${
                  pdfGenerating ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {pdfGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <FiDownload />
                    Download PDF Report
                  </>
                )}
              </button>
              <p className="text-xs text-gray-400">Includes cover page, dimension analysis, AI insights &amp; weekly roadmap</p>
            </div>

            <button
              onClick={() => setShowEmailForm(!showEmailForm)}
              className="btn btn-primary flex items-center gap-2 px-6 py-3 rounded-lg font-semibold"
            >
              <FiMail />
              Email Results
            </button>

            <div className="relative">
              <button
                onClick={() => handleShare('twitter')}
                className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                <FiShare2 />
                Share
              </button>
            </div>

            <a
              href="/assessment/retake"
              className="flex items-center gap-2 px-6 py-3 bg-white text-primary border-2 border-gray-200 rounded-lg font-semibold hover:border-primary hover:bg-primary-10 transition-colors"
            >
              <FiRefreshCw />
              Retake Assessment
            </a>
          </div>

          {/* Inline email form when "Email Results" is clicked */}
          {showEmailForm && !emailSubmitted && (
            <form
              onSubmit={handleEmailSubmit}
              className="mt-6 max-w-md mx-auto flex gap-3"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <button
                type="submit"
                disabled={emailSending}
                className={`btn btn-primary px-6 py-3 rounded-lg font-semibold ${
                  emailSending ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {emailSending ? 'Sending...' : 'Send'}
              </button>
            </form>
          )}

          {showEmailForm && emailSubmitted && (
            <p className="mt-6 text-center text-green-600 font-semibold">
              <FiCheckCircle className="inline mr-1" />
              Email sent! Check your inbox.
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="bg-primary rounded-2xl shadow-xl p-8 text-white text-center">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Accelerate Your Journey?
          </h3>
          <p className="text-lg mb-6 opacity-90">
            Get 1-on-1 expert guidance to turn your idea into reality
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/beamx-solutions"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                analytics.ctaClicked('book_consultation', 'results')
              }
              className="px-8 py-3 bg-white text-primary rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
            >
              Book Free Consultation
            </a>
            <a
              href="/"
              className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-primary transition-all duration-300"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}