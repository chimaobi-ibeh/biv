'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { questions } from '@/lib/questions';
import { AssessmentResponse, UserProfile } from '@/types';
import { analytics } from '@/lib/analytics';
import { FiArrowRight, FiArrowLeft, FiCheck, FiUser, FiMail, FiBriefcase, FiMapPin } from 'react-icons/fi';

export default function AssessmentPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [currentFollowUp, setCurrentFollowUp] = useState('');
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [showProfileForm, setShowProfileForm] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

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

    setIsTransitioning(true);

    const newResponse: AssessmentResponse = {
      questionId: question.id,
      answer: currentAnswer,
      followUpAnswer: currentFollowUp || undefined,
    };

    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setCurrentAnswer('');
        setCurrentFollowUp('');
        setShowFollowUp(false);
        setIsTransitioning(false);
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
    }, 300);
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        const previousResponse = responses[currentQuestion - 1];
        setCurrentAnswer(previousResponse.answer);
        setCurrentFollowUp(previousResponse.followUpAnswer || '');

        const question = questions[currentQuestion - 1];
        if (question.followUpCondition && question.followUpCondition(previousResponse.answer)) {
          setShowFollowUp(true);
        }

        setResponses(responses.slice(0, -1));
        setCurrentQuestion(currentQuestion - 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  if (showProfileForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full">
          <div className="mb-4">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 font-medium"
            >
              <FiArrowLeft />
              Back to Home
            </button>
          </div>
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-block p-3 bg-white rounded-2xl shadow-lg mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <FiCheck className="text-3xl text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Let's Get Started
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              Tell us a bit about yourself to get personalized insights (optional)
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FiUser className="text-purple-600" />
                  Name
                  <span className="text-xs font-normal text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={userProfile.name || ''}
                  onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                  className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 group-hover:border-purple-300"
                  placeholder="Your name"
                />
              </div>

              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FiMail className="text-blue-600" />
                  Email
                  <span className="text-xs font-normal text-gray-400">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={userProfile.email || ''}
                  onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                  className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 group-hover:border-blue-300"
                  placeholder="your@email.com"
                />
              </div>

              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FiBriefcase className="text-indigo-600" />
                  Industry
                  <span className="text-xs font-normal text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={userProfile.industry || ''}
                  onChange={(e) => setUserProfile({ ...userProfile, industry: e.target.value })}
                  className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 group-hover:border-indigo-300"
                  placeholder="e.g., E-commerce, SaaS, Consulting"
                />
              </div>

              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FiMapPin className="text-pink-600" />
                  Location
                  <span className="text-xs font-normal text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={userProfile.location || ''}
                  onChange={(e) => setUserProfile({ ...userProfile, location: e.target.value })}
                  className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 group-hover:border-pink-300"
                  placeholder="e.g., Lagos, Nigeria"
                />
              </div>

              <div className="pt-4 space-y-3">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Start Assessment
                  <FiArrowRight className="text-xl" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfileForm(false);
                    analytics.assessmentStarted();
                  }}
                  className="w-full text-gray-500 py-3 text-sm font-medium hover:text-purple-600 transition-colors"
                >
                  Skip and start now →
                </button>
              </div>
            </form>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              🔒 Your information is secure and never shared
            </p>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 font-medium"
          >
            <FiArrowLeft />
            Back to Home
          </button>
        </div>
        {/* Header with Progress */}
        <div className="mb-8">
          {/* Step Indicators */}
          <div className="flex items-center justify-between mb-6 overflow-x-auto pb-2">
            {questions.map((_, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-all duration-300 ${
                    index < currentQuestion
                      ? 'bg-green-500 text-white shadow-lg'
                      : index === currentQuestion
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-110'
                      : 'bg-white text-gray-400 border-2 border-gray-200'
                  }`}
                >
                  {index < currentQuestion ? <FiCheck /> : index + 1}
                </div>
                {index < questions.length - 1 && (
                  <div
                    className={`h-1 w-8 lg:w-16 mx-1 transition-all duration-500 ${
                      index < currentQuestion ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold text-gray-700">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 transition-all duration-700 ease-out rounded-full shadow-lg"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div
          className={`bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 ${
            isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
          }`}
        >
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white font-bold text-xl">
                {currentQuestion + 1}
              </div>
              <h2 className="text-3xl font-bold text-white flex-1">{question.title}</h2>
            </div>
            {question.subtitle && (
              <p className="text-lg text-white/90 ml-15 pl-2">{question.subtitle}</p>
            )}
          </div>

          <div className="p-8">
            {/* Answer Options */}
            <div className="space-y-4">
              {question.type === 'radio' && question.options && (
                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <label
                      key={option.value}
                      className={`group block relative cursor-pointer transition-all duration-300 ${
                        isTransitioning ? 'opacity-0' : 'opacity-100'
                      }`}
                      style={{ transitionDelay: `${index * 50}ms` }}
                    >
                      <input
                        type="radio"
                        name="answer"
                        value={option.value}
                        checked={currentAnswer === option.value}
                        onChange={(e) => handleAnswer(e.target.value)}
                        className="peer sr-only"
                      />
                      <div
                        className={`p-5 border-2 rounded-2xl transition-all duration-300 ${
                          currentAnswer === option.value
                            ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-blue-50 shadow-lg scale-[1.02]'
                            : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 mt-0.5 flex items-center justify-center transition-all duration-300 ${
                              currentAnswer === option.value
                                ? 'border-purple-600 bg-purple-600'
                                : 'border-gray-300 bg-white group-hover:border-purple-400'
                            }`}
                          >
                            {currentAnswer === option.value && (
                              <div className="w-3 h-3 bg-white rounded-full" />
                            )}
                          </div>
                          <span
                            className={`text-base font-medium transition-colors ${
                              currentAnswer === option.value ? 'text-gray-900' : 'text-gray-700'
                            }`}
                          >
                            {option.label}
                          </span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'text' && (
                <div className="relative">
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => handleAnswer(e.target.value)}
                    placeholder={question.placeholder}
                    rows={5}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none text-base transition-all duration-200 hover:border-purple-300"
                  />
                  <div className="absolute bottom-3 right-3 text-sm text-gray-400">
                    {currentAnswer.length} characters
                  </div>
                </div>
              )}

              {/* Follow-up Question */}
              {showFollowUp && question.followUpPrompt && (
                <div className="mt-6 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 animate-fade-in">
                  <label className="block text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs">
                      ?
                    </span>
                    {question.followUpPrompt}
                  </label>
                  <textarea
                    value={currentFollowUp}
                    onChange={(e) => setCurrentFollowUp(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none bg-white"
                    placeholder="Please elaborate..."
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handleBack}
            disabled={currentQuestion === 0}
            className={`group flex items-center gap-2 px-6 py-4 rounded-xl font-bold transition-all duration-300 ${
              currentQuestion === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-purple-500 hover:text-purple-600 transform hover:scale-105'
            }`}
          >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!currentAnswer}
            className={`group flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
              currentAnswer
                ? 'bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl transform hover:scale-105'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {currentQuestion === questions.length - 1 ? 'See Results' : 'Next Question'}
            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            💡 Tip: Be honest for the most accurate recommendations
          </p>
        </div>
      </div>
    </div>
  );
}
