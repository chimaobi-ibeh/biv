'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AssessmentResponse, UserProfile, AIRecommendation, AssessmentResult } from '@/types';
import { FiCheckCircle, FiAlertCircle, FiTrendingUp, FiBook, FiArrowLeft, FiCalendar, FiAlertTriangle, FiDownload, FiMail, FiShare2 } from 'react-icons/fi';
import { analytics } from '@/lib/analytics';

export default function ResultsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [scoreLevel, setScoreLevel] = useState<string>('');
  const [totalPositive, setTotalPositive] = useState<number>(0);
  const [dimensionScores, setDimensionScores] = useState<any[]>([]);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    loadDataAndGenerateRecommendations();
  }, []);

  const loadDataAndGenerateRecommendations = async () => {
    try {
      // Load assessment data from session storage
      const assessmentData = sessionStorage.getItem('assessment_data');
      if (!assessmentData) {
        setError('No assessment data found. Please complete the assessment first.');
        setLoading(false);
        return;
      }

      const data = JSON.parse(assessmentData);
      setResponses(data.responses || []);
      setUserProfile(data.userProfile || {});

      // Set email from profile if available
      if (data.userProfile.email) {
        setEmail(data.userProfile.email);
      }

      // Calculate score and dimensions
      const { scoreLevel: level, totalPositive: total, dimensions, scorePercentage, timeframe, actionItems } = calculateScore(data.responses || []);
      setScoreLevel(level);
      setTotalPositive(total);
      setDimensionScores(dimensions);

      analytics.assessmentCompleted(total, level);
      analytics.pageView('results');

      setLoading(false);

      // Automatically fetch AI recommendations
      fetchAIRecommendations(data.responses, data.userProfile, level, total);
    } catch (err) {
      console.error('Error loading results:', err);
      setError('Failed to load assessment data. Please try again.');
      setLoading(false);
    }
  };

  const fetchAIRecommendations = async (responsesData: any[], profileData: any, level: string, total: number) => {
    setAiLoading(true);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responses: responsesData,
          userProfile: profileData,
          scoreLevel: level,
          totalPositive: total,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setRecommendation(result.recommendation);
      }
    } catch (err: any) {
      console.error('Error loading AI results:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const calculateScore = (responses: AssessmentResponse[]) => {
    let positiveCount = 0;
    const dimensionCounts = {
      'Foundation': { score: 0, max: 3, description: 'Core idea validation & value proposition' },
      'Market': { score: 0, max: 2, description: 'Customer validation & market demand' },
      'Execution': { score: 0, max: 2, description: 'Ability to build & iterate' },
      'Financial': { score: 0, max: 2, description: 'Monetization & runway' },
      'Personal': { score: 0, max: 1, description: 'Founder readiness & motivation' },
    };

    responses.forEach((response, index) => {
      const answer = response.answer?.toLowerCase() || '';
      let isPositive = false;

      if (
        answer.includes('yes') ||
        answer.includes('all-three') ||
        answer.includes('regularly') ||
        answer.includes('confirmed') ||
        answer.includes('under-') ||
        answer.includes('ready') ||
        answer.includes('both') ||
        answer.includes('passion') ||
        answer.includes('start-imperfect') ||
        answer.includes('freedom') ||
        answer.includes('money') ||
        answer.includes('balance') ||
        answer.includes('hire')
      ) {
        positiveCount++;
        isPositive = true;
      }

      if (response.answer && response.answer.length > 50) {
        positiveCount += 0.5;
        isPositive = true;
      }

      // Map to dimensions
      if (isPositive) {
        if (index < 3) dimensionCounts['Foundation'].score++;
        else if (index < 5) dimensionCounts['Market'].score++;
        else if (index < 7) dimensionCounts['Execution'].score++;
        else if (index < 9) dimensionCounts['Financial'].score++;
        else dimensionCounts['Personal'].score++;
      }
    });

    const total = Math.min(10, Math.round(positiveCount));
    const scorePercentage = (total / 10) * 100;
    let level = '';
    let timeframe = '';
    let actionItems: string[] = [];

    if (total >= 8) {
      level = 'Green Light';
      timeframe = 'Launch Ready - 2-4 weeks';
      actionItems = [
        'Finalize your MVP and launch to your first customers',
        'Set up analytics to track key metrics',
        'Prepare your go-to-market strategy',
      ];
    } else if (total >= 6) {
      level = 'Yellow Light';
      timeframe = 'Near Ready - 1-2 months';
      actionItems = [
        'Conduct deeper customer validation interviews',
        'Refine your value proposition based on feedback',
        'Build a simple prototype or MVP',
      ];
    } else if (total >= 4) {
      level = 'Orange Light';
      timeframe = 'Needs Work - 2-3 months';
      actionItems = [
        'Talk to at least 20 potential customers',
        'Validate your problem hypothesis',
        'Research your competitors thoroughly',
        'Consider pivoting or refining your idea',
      ];
    } else {
      level = 'Red Light';
      timeframe = 'High Risk - 3+ months';
      actionItems = [
        'Go back to problem discovery',
        'Find a real pain point people will pay for',
        'Consider alternative ideas or approaches',
        'Seek mentorship from experienced entrepreneurs',
      ];
    }

    const dimensions = Object.entries(dimensionCounts).map(([name, data]) => ({
      dimension: name,
      score: data.max > 0 ? data.score / data.max : 0,
      maxScore: data.max,
      actualScore: data.score,
      description: data.description,
    }));

    return { scoreLevel: level, totalPositive: total, dimensions, scorePercentage, timeframe, actionItems };
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;

    try {
      const resultData = {
        userProfile,
        responses,
        scoreResult: {
          score: Math.round((totalPositive / 10) * 100),
          level: scoreLevel,
          title: `${scoreLevel} - ${totalPositive}/10`,
          summary: `You scored ${totalPositive} out of 10 positive indicators.`,
          totalPositive: totalPositive,
          timeframe: '',
          actionItems: [],
        },
        dimensionScores,
        aiRecommendation: recommendation,
        timestamp: new Date(),
        id: Date.now().toString(),
      };

      const response = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: userProfile.name,
          type: 'capture',
          result: resultData,
        }),
      });

      if (response.ok) {
        setEmailSent(true);
        analytics.emailCaptured('results_page');
        setTimeout(() => {
          setShowEmailForm(false);
          setEmailSent(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to submit email:', error);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      // Map scoreLevel to proper ScoreLevel type
      const getScoreLevel = (): 'green' | 'yellow' | 'red' => {
        const level = scoreLevel.toLowerCase();
        if (level.includes('green')) return 'green';
        if (level.includes('yellow')) return 'yellow';
        return 'red';
      };

      const resultData: AssessmentResult = {
        userProfile,
        responses,
        scoreResult: {
          score: Math.round((totalPositive / 10) * 100),
          level: getScoreLevel(),
          title: `${scoreLevel} - ${totalPositive}/10`,
          summary: `You scored ${totalPositive} out of 10 positive indicators.`,
          totalPositive: totalPositive,
          timeframe: scoreLevel === 'Green Light' ? '2-4 weeks' : scoreLevel === 'Yellow Light' ? '1-2 months' : scoreLevel === 'Orange Light' ? '2-3 months' : '3+ months',
          actionItems: scoreLevel === 'Green Light' ? [
            'Finalize your MVP and launch',
            'Set up analytics',
            'Prepare go-to-market strategy',
          ] : scoreLevel === 'Yellow Light' ? [
            'Conduct deeper customer validation',
            'Refine your value proposition',
            'Build a simple prototype',
          ] : scoreLevel === 'Orange Light' ? [
            'Talk to 20+ potential customers',
            'Validate your problem hypothesis',
            'Research competitors thoroughly',
          ] : [
            'Go back to problem discovery',
            'Find a real pain point',
            'Seek mentorship',
          ],
        },
        dimensionScores: dimensionScores.map(d => ({
          name: d.dimension,
          score: d.actualScore,
          maxScore: d.maxScore,
        })),
        aiRecommendation: recommendation || undefined,
        timestamp: new Date(),
        id: Date.now().toString(),
      };

      // Use the new React PDF generator
      const { downloadPDFReport } = await import('@/lib/pdf-generator-v2');
      await downloadPDFReport(resultData);
      analytics.reportDownloaded('pdf');
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleShare = (platform: string) => {
    const shareText = `I just validated my business idea and got a ${scoreLevel} rating (${totalPositive}/10)! Check out this tool:`;
    const shareUrl = window.location.origin;

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
    }

    analytics.shareClicked(platform);
  };

  const getScoreColor = (level: string) => {
    switch (level) {
      case 'Green Light':
        return { bg: 'bg-green-500', text: 'text-green-600', lightBg: 'bg-green-50', border: 'border-green-500', barBg: 'bg-green-500' };
      case 'Yellow Light':
        return { bg: 'bg-yellow-500', text: 'text-yellow-600', lightBg: 'bg-yellow-50', border: 'border-yellow-500', barBg: 'bg-yellow-500' };
      case 'Orange Light':
        return { bg: 'bg-orange-500', text: 'text-orange-600', lightBg: 'bg-orange-50', border: 'border-orange-500', barBg: 'bg-orange-500' };
      case 'Red Light':
        return { bg: 'bg-red-500', text: 'text-red-600', lightBg: 'bg-red-50', border: 'border-red-500', barBg: 'bg-red-500' };
      default:
        return { bg: 'bg-gray-500', text: 'text-gray-600', lightBg: 'bg-gray-50', border: 'border-gray-500', barBg: 'bg-gray-500' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Calculating Your Results...</h2>
          <p className="text-gray-600">Please wait while we analyze your responses</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <FiAlertCircle className="text-5xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/assessment')}
            className="w-full btn btn-primary py-3 rounded-xl font-bold"
          >
            Start New Assessment
          </button>
        </div>
      </div>
    );
  }

  const scoreColors = getScoreColor(scoreLevel);
  const scorePercentage = (totalPositive / 10) * 100;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary bg-white border border-gray-200 px-3 py-2 rounded-lg shadow-sm transition transform duration-150 hover:-translate-y-1 hover:shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <FiArrowLeft />
            Back to Home
          </button>
        </div>

        {/* Score Card */}
        <div className={`${scoreColors.bg} rounded-3xl shadow-2xl p-8 text-white mb-8`}>
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">Your Business Idea Assessment</h1>
            {userProfile.name && (
              <p className="text-xl opacity-90 mb-4">{userProfile.name}</p>
            )}
            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="text-8xl font-bold">{totalPositive}</div>
              <div className="text-left">
                <p className="text-3xl font-semibold">/ 10</p>
                <p className="text-xl font-medium mt-2">{scoreLevel}</p>
              </div>
            </div>
            <div className="mt-6">
              <div className="bg-white bg-opacity-30 rounded-full h-4 w-64 mx-auto overflow-hidden">
                <div
                  className="bg-white h-full rounded-full transition-all duration-1000"
                  style={{ width: `${scorePercentage}%` }}
                />
              </div>
              <p className="mt-2 text-lg opacity-90">{Math.round(scorePercentage)}% Ready</p>
            </div>
          </div>
        </div>

        {/* Dimension Scores - Better Visualization */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">
            Your Readiness Breakdown
          </h3>
          <div className="space-y-6">
            {dimensionScores.map((item, index) => {
              const score = Math.round(item.score * 100);
              let barColor = 'bg-green-500';
              let textColor = 'text-green-600';
              if (score < 50) {
                barColor = 'bg-red-500';
                textColor = 'text-red-600';
              } else if (score < 75) {
                barColor = 'bg-yellow-500';
                textColor = 'text-yellow-600';
              }

              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-800">{item.dimension}</h4>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600">
                        {item.actualScore}/{item.maxScore}
                      </span>
                      <span className={`${barColor} text-white text-sm font-bold px-4 py-2 rounded-full min-w-[60px] text-center`}>
                        {score}%
                      </span>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Loading */}
        {aiLoading && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Generating your personalized AI recommendations...</p>
            <p className="text-sm text-gray-500 mt-2">This may take 10-20 seconds</p>
          </div>
        )}

        {/* AI Recommendations */}
        {recommendation && (
          <>
            {/* Strengths */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <FiCheckCircle className="text-3xl text-green-500" />
                <h2 className="text-2xl font-bold text-gray-800">Your Strengths</h2>
              </div>
              <ul className="space-y-3">
                {recommendation.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                      ✓
                    </span>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Gaps */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <FiAlertCircle className="text-3xl text-orange-500" />
                <h2 className="text-2xl font-bold text-gray-800">Areas to Address</h2>
              </div>
              <ul className="space-y-3">
                {recommendation.gaps.map((gap, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                      !
                    </span>
                    <span className="text-gray-700">{gap}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Personalized Plan */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <FiTrendingUp className="text-3xl text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-800">Your Personalized Action Plan</h2>
              </div>
              <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                {recommendation.personalizedPlan}
              </div>
            </div>

            {/* Weekly Roadmap */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <FiCalendar className="text-3xl text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">Week-by-Week Roadmap</h2>
              </div>
              <div className="space-y-4">
                {recommendation.weeklyRoadmap.map((week, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-lg text-gray-800 mb-2">Week {week.week}</h3>
                    <ul className="space-y-2">
                      {week.tasks.map((task, taskIndex) => (
                        <li key={taskIndex} className="flex items-start gap-2 text-gray-700">
                          <span className="text-blue-500 mt-1">→</span>
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <FiBook className="text-3xl text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-800">Recommended Resources</h2>
              </div>
              <div className="grid gap-4">
                {recommendation.resources.map((resource, index) => (
                  <div key={index} className="p-4 bg-indigo-50 rounded-xl">
                    <h3 className="font-bold text-gray-800 mb-1">{resource.title}</h3>
                    <p className="text-gray-700 text-sm">{resource.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Assessment */}
            <div className={`${scoreColors.lightBg} border-l-4 ${scoreColors.border} rounded-r-2xl shadow-lg p-6 mb-6`}>
              <div className="flex items-center gap-3 mb-4">
                <FiAlertTriangle className={`text-3xl ${scoreColors.text}`} />
                <h2 className="text-2xl font-bold text-gray-800">Risk Assessment</h2>
              </div>
              <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                {recommendation.riskAssessment}
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h3 className="text-2xl font-bold mb-6 text-center text-gray-900">Take Action</h3>
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <FiDownload />
              Download PDF Report
            </button>

            <button
              onClick={() => setShowEmailForm(!showEmailForm)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <FiMail />
              Email Me Results
            </button>

            <button
              onClick={() => handleShare('twitter')}
              className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
            >
              <FiShare2 />
              Share on Twitter
            </button>
          </div>

          {/* Email Form */}
          {showEmailForm && (
            <div className="mt-6 p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
              <h4 className="font-bold text-gray-800 mb-3">Get Your Results via Email</h4>
              <p className="text-sm text-gray-600 mb-4">
                We'll send you a comprehensive report with all your results and AI recommendations.
              </p>
              {emailSent ? (
                <div className="p-4 bg-green-50 border-2 border-green-500 rounded-lg text-center">
                  <FiCheckCircle className="text-3xl text-green-500 mx-auto mb-2" />
                  <p className="text-green-700 font-semibold">Email sent successfully!</p>
                  <p className="text-sm text-green-600 mt-1">Check your inbox for your report.</p>
                </div>
              ) : (
                <form onSubmit={handleEmailSubmit} className="flex gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Send Report
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="bg-primary rounded-2xl shadow-xl p-8 text-white text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Accelerate Your Journey?</h3>
          <p className="text-lg mb-6 opacity-90">
            Get 1-on-1 expert guidance to turn your idea into reality
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/beamxsolutions"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => analytics.ctaClicked('book_consultation', 'results')}
              className="px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
            >
              Book Free Consultation
            </a>
            <button
              onClick={() => router.push('/assessment')}
              className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-all duration-300"
            >
              Take Another Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
