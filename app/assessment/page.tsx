'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { questions } from '@/lib/questions';
import { AssessmentResponse, UserProfile } from '@/types';
import { analytics } from '@/lib/analytics';
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi';

export default function AssessmentPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [currentFollowUp, setCurrentFollowUp] = useState('');
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [showProfileForm, setShowProfileForm] = useState(true);

  useEffect(() => {
    analytics.pageView('assessment');
  }, []);

  useEffect(() => {
    if (currentQuestion > 0) {
      analytics.questionAnswered(questions[currentQuestion - 1].id, currentQuestion);
    }
  }, [currentQuestion]);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowProfileForm(false);
    analytics.assessmentStarted();
  };

  const handleAnswer = (value: string) => {
    setCurrentAnswer(value);
    const question = questions[currentQuestion];

    if (question.followUpCondition && question.followUpCondition(value)) {
      setShowFollowUp(true);
    } else {
      setShowFollowUp(false);
      setCurrentFollowUp('');
    }
  };

  const handleNext = () => {
    const question = questions[currentQuestion];

    if (!currentAnswer) {
      alert('Please provide an answer before continuing');
      return;
    }

    if (showFollowUp && !currentFollowUp) {
      alert('Please answer the follow-up question');
      return;
    }

    const newResponse: AssessmentResponse = {
      questionId: question.id,
      answer: currentAnswer,
      followUpAnswer: currentFollowUp || undefined,
    };

    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setCurrentAnswer('');
      setCurrentFollowUp('');
      setShowFollowUp(false);
    } else {
      // Assessment complete
      analytics.assessmentCompleted(updatedResponses.length, 'completed');

      // Save to session storage
      const assessmentData = {
        responses: updatedResponses,
        userProfile,
        timestamp: new Date().toISOString(),
      };
      sessionStorage.setItem('assessment_data', JSON.stringify(assessmentData));

      router.push('/results');
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      const previousResponse = responses[currentQuestion - 1];
      setCurrentAnswer(previousResponse.answer);
      setCurrentFollowUp(previousResponse.followUpAnswer || '');

      const question = questions[currentQuestion - 1];
      if (question.followUpCondition && question.followUpCondition(previousResponse.answer)) {
        setShowFollowUp(true);
      }

      setResponses(responses.slice(0, -1));
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (showProfileForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Before We Begin
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Optional: Add your info to save your progress and get personalized insights
          </p>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name (Optional)
              </label>
              <input
                type="text"
                value={userProfile.name || ''}
                onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email (Optional)
              </label>
              <input
                type="email"
                value={userProfile.email || ''}
                onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Industry (Optional)
              </label>
              <input
                type="text"
                value={userProfile.industry || ''}
                onChange={(e) => setUserProfile({ ...userProfile, industry: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="e.g., E-commerce, SaaS, Consulting"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location (Optional)
              </label>
              <input
                type="text"
                value={userProfile.location || ''}
                onChange={(e) => setUserProfile({ ...userProfile, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="e.g., Lagos, Nigeria"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
            >
              Start Assessment
            </button>

            <button
              type="button"
              onClick={() => setShowProfileForm(false)}
              className="w-full text-gray-600 py-2 text-sm hover:text-purple-600 transition-colors"
            >
              Skip and start now
            </button>
          </form>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium text-purple-600">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-3xl font-bold mb-2 text-gray-900">{question.title}</h2>
          {question.subtitle && (
            <p className="text-lg text-gray-600 mb-8">{question.subtitle}</p>
          )}

          {/* Answer Options */}
          <div className="space-y-4">
            {question.type === 'radio' && question.options && (
              <div className="space-y-3">
                {question.options.map((option) => (
                  <label
                    key={option.value}
                    className={`block p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      currentAnswer === option.value
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={option.value}
                      checked={currentAnswer === option.value}
                      onChange={(e) => handleAnswer(e.target.value)}
                      className="mr-3"
                    />
                    <span className="text-gray-900">{option.label}</span>
                  </label>
                ))}
              </div>
            )}

            {question.type === 'text' && (
              <textarea
                value={currentAnswer}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder={question.placeholder}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
              />
            )}

            {/* Follow-up Question */}
            {showFollowUp && question.followUpPrompt && (
              <div className="mt-6 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                <label className="block text-sm font-medium text-purple-900 mb-2">
                  {question.followUpPrompt}
                </label>
                <textarea
                  value={currentFollowUp}
                  onChange={(e) => setCurrentFollowUp(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                  placeholder="Please elaborate..."
                />
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={currentQuestion === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              currentQuestion === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-purple-600 hover:text-purple-600'
            }`}
          >
            <FiArrowLeft />
            Back
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
          >
            {currentQuestion === questions.length - 1 ? 'See Results' : 'Next'}
            <FiArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}
