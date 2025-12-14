'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from 'recharts';
import { FiDownload, FiMail, FiShare2, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import {
  AssessmentResponse,
  UserProfile,
  ScoreResult,
  DimensionScore,
  AIRecommendation
} from '@/types';
import { calculateScore, calculateDimensionScores, generateShareText } from '@/lib/scoring';
import { generatePDFReport } from '@/lib/pdf-generator';
import { analytics } from '@/lib/analytics';

export default function ResultsPage() {
  const router = useRouter();
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [dimensionScores, setDimensionScores] = useState<DimensionScore[]>([]);
  const [aiRecommendation, setAIRecommendation] = useState<AIRecommendation | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const assessmentData = sessionStorage.getItem('assessment_data');

    if (!assessmentData) {
      router.push('/assessment');
      return;
    }

    const data = JSON.parse(assessmentData);
    setResponses(data.responses);
    setUserProfile(data.userProfile);

    const score = calculateScore(data.responses);
    const dimensions = calculateDimensionScores(data.responses);

    setScoreResult(score);
    setDimensionScores(dimensions);
    setLoading(false);

    analytics.assessmentCompleted(score.score, score.level);
    analytics.pageView('results');

    // Set email from profile if available
    if (data.userProfile.email) {
      setEmail(data.userProfile.email);
    }
  }, [router]);

  const fetchAIRecommendations = async () => {
    if (!scoreResult) return;

    setAiLoading(true);

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

      if (response.ok) {
        const data = await response.json();
        setAIRecommendation(data.recommendation);
      }
    } catch (error) {
      console.error('Failed to fetch AI recommendations:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!scoreResult) return;

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
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !scoreResult) return;

    try {
      await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: userProfile.name,
          type: 'capture',
          result: {
            userProfile,
            responses,
            scoreResult,
            dimensionScores,
            aiRecommendation,
            timestamp: new Date(),
            id: Date.now().toString(),
          },
        }),
      });

      setEmailSubmitted(true);
      analytics.emailCaptured('results_page');

      // Fetch AI recommendations after email capture
      if (!aiRecommendation) {
        fetchAIRecommendations();
      }
    } catch (error) {
      console.error('Failed to submit email:', error);
    }
  };

  const handleShare = (platform: string) => {
    if (!scoreResult) return;

    const shareText = generateShareText(scoreResult);
    const shareUrl = window.location.href;

    switch (platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
          '_blank'
        );
        break;
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
          '_blank'
        );
        break;
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          '_blank'
        );
        break;
    }

    analytics.shareClicked(platform);
  };

  if (loading || !scoreResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
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
        return 'from-green-500 to-emerald-600';
      case 'yellow':
        return 'from-yellow-500 to-orange-500';
      case 'red':
        return 'from-red-500 to-rose-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getScoreIcon = (level: string) => {
    switch (level) {
      case 'green':
        return <FiCheckCircle className="text-6xl text-green-500" />;
      case 'yellow':
        return <FiAlertCircle className="text-6xl text-yellow-500" />;
      case 'red':
        return <FiAlertCircle className="text-6xl text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Score Header */}
        <div className={`bg-gradient-to-r ${getScoreColor(scoreResult.level)} rounded-2xl shadow-2xl p-8 mb-8 text-white`}>
          <div className="text-center">
            <div className="flex justify-center mb-4">
              {getScoreIcon(scoreResult.level)}
            </div>
            <h1 className="text-5xl font-bold mb-2">{scoreResult.score}%</h1>
            <h2 className="text-2xl font-semibold mb-4">{scoreResult.title}</h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">{scoreResult.summary}</p>
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
              <PolarAngleAxis dataKey="dimension" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 1]} tick={{ fill: '#6b7280' }} />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Action Items */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h3 className="text-2xl font-bold mb-4 text-gray-900">Your Next Steps</h3>
          <p className="text-purple-600 font-semibold mb-4">Timeframe: {scoreResult.timeframe}</p>
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
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
            <h3 className="text-2xl font-bold mb-2 text-center">
              Get Your Personalized AI Roadmap
            </h3>
            <p className="text-center mb-6 opacity-90">
              Enter your email to receive detailed AI-powered recommendations and a comprehensive PDF report
            </p>
            <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-white focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
              >
                Get Report
              </button>
            </form>
          </div>
        )}

        {/* AI Recommendations */}
        {aiLoading && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating your personalized AI recommendations...</p>
          </div>
        )}

        {aiRecommendation && (
          <>
            {/* Strengths */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h3 className="text-2xl font-bold mb-4 text-green-600">Your Strengths</h3>
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
              <h3 className="text-2xl font-bold mb-4 text-orange-600">Areas to Improve</h3>
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
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Your Personalized Action Plan</h3>
              <p className="text-gray-700 whitespace-pre-line">{aiRecommendation.personalizedPlan}</p>
            </div>

            {/* Weekly Roadmap */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Week-by-Week Roadmap</h3>
              <div className="space-y-6">
                {aiRecommendation.weeklyRoadmap.map((week, index) => (
                  <div key={index} className="border-l-4 border-purple-600 pl-6">
                    <h4 className="text-xl font-bold mb-3 text-purple-600">Week {week.week}</h4>
                    <ul className="space-y-2">
                      {week.tasks.map((task, taskIndex) => (
                        <li key={taskIndex} className="flex gap-3">
                          <span className="text-gray-400">□</span>
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
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Recommended Resources</h3>
              <div className="space-y-4">
                {aiRecommendation.resources.map((resource, index) => (
                  <div key={index} className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-bold text-gray-900 mb-2">{resource.title}</h4>
                    <p className="text-gray-700">{resource.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Risk Assessment</h3>
              <p className="text-gray-700 whitespace-pre-line">{aiRecommendation.riskAssessment}</p>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h3 className="text-2xl font-bold mb-6 text-center text-gray-900">Take Action</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              <FiDownload />
              Download PDF Report
            </button>

            <button
              onClick={() => setShowEmailForm(!showEmailForm)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
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
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-8 text-white text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Accelerate Your Journey?</h3>
          <p className="text-lg mb-6 opacity-90">
            Get 1-on-1 expert guidance to turn your idea into reality
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/beamx-solutions"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => analytics.ctaClicked('book_consultation', 'results')}
              className="px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
            >
              Book Free Consultation
            </a>
            <a
              href="/"
              className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-all duration-300"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
