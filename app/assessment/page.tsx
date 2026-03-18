'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { questions } from '@/lib/questions';
import { AssessmentResponse, UserProfile } from '@/types';
import { analytics } from '@/lib/analytics';
import {
  FiArrowRight,
  FiArrowLeft,
  FiCheck,
  FiUser,
  FiMail,
  FiBriefcase,
  FiMapPin,
  FiAlertCircle,
} from 'react-icons/fi';

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
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    analytics.pageView('assessment');

    // If coming from a retake, skip the profile form
    try {
      const saved = sessionStorage.getItem('retake_profile');
      if (saved) {
        const profile = JSON.parse(saved);
        setUserProfile(profile);
        setShowProfileForm(false);
        sessionStorage.removeItem('retake_profile');
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (currentQuestion > 0) {
      analytics.questionAnswered(
        questions[currentQuestion - 1].id,
        currentQuestion
      );
    }
  }, [currentQuestion]);

  // Track drop-off when user leaves mid-assessment
  useEffect(() => {
    if (showProfileForm) return; // Not yet in the questions

    const handleDropOff = () => {
      analytics.dropOff(currentQuestion + 1, questions.length);
    };

    // Fire on tab close / navigate away
    window.addEventListener('beforeunload', handleDropOff);
    // Fire on tab switch (mobile users often don't trigger beforeunload)
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        handleDropOff();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('beforeunload', handleDropOff);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [currentQuestion, showProfileForm]);

  // Clear validation error when user interacts
  useEffect(() => {
    setValidationError(null);
  }, [currentAnswer, currentFollowUp]);

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

  const validateCurrentAnswer = (): boolean => {
    const question = questions[currentQuestion];

    if (!currentAnswer.trim()) {
      setValidationError('Please provide an answer before continuing.');
      return false;
    }

    // For text questions, check the validation function if one exists
    if (question.type === 'text' && question.validation) {
      if (!question.validation(currentAnswer)) {
        setValidationError(
          'Please provide a more detailed answer (at least 20 characters).'
        );
        return false;
      }
    }

    if (showFollowUp && question.followUpPrompt && !currentFollowUp.trim()) {
      setValidationError('Please answer the follow-up question.');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateCurrentAnswer()) return;

    setIsTransitioning(true);
    setValidationError(null);

    const question = questions[currentQuestion];
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

        try {
          const assessmentData = {
            responses: updatedResponses,
            userProfile,
            timestamp: new Date().toISOString(),
          };
          sessionStorage.setItem(
            'assessment_data',
            JSON.stringify(assessmentData)
          );
          setIsSubmitting(true);
          router.push('/results');
        } catch (error) {
          console.error('Failed to save assessment data:', error);
          setValidationError(
            'Failed to save your responses. Please make sure your browser allows session storage and try again.'
          );
          setIsTransitioning(false);
        }
      }
    }, 300);
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setIsTransitioning(true);
      setValidationError(null);

      setTimeout(() => {
        const previousResponse = responses[currentQuestion - 1];
        setCurrentAnswer(previousResponse.answer);
        setCurrentFollowUp(previousResponse.followUpAnswer || '');

        const question = questions[currentQuestion - 1];
        if (
          question.followUpCondition &&
          question.followUpCondition(previousResponse.answer)
        ) {
          setShowFollowUp(true);
        }

        setResponses(responses.slice(0, -1));
        setCurrentQuestion(currentQuestion - 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Calculating your results...</p>
          <p className="text-sm text-gray-400 mt-1">This will only take a moment</p>
        </div>
      </div>
    );
  }

  if (showProfileForm) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center px-4 py-12">
        {/* Back to Home */}
        <div className="w-full max-w-lg mb-6">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-blue-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            <FiArrowLeft className="text-sm" />
            Back to Home
          </a>
        </div>

        {/* Form Card */}
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="p-2 bg-white rounded-xl shadow-md">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <FiCheck className="text-2xl text-white" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">
            Let&apos;s Get Started
          </h1>
          <p className="text-center text-gray-500 mb-6">
            Complete all fields to get personalized insights
          </p>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {/* Name */}
            <input
              type="text"
              value={userProfile.name || ''}
              onChange={(e) =>
                setUserProfile({ ...userProfile, name: e.target.value })
              }
              maxLength={100}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-700 placeholder-gray-400"
              placeholder="Name *"
            />

            {/* Email */}
            <input
              type="email"
              value={userProfile.email || ''}
              onChange={(e) =>
                setUserProfile({ ...userProfile, email: e.target.value })
              }
              maxLength={254}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-700 placeholder-gray-400"
              placeholder="Email *"
            />

            {/* Industry + Location side by side */}
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={userProfile.industry || ''}
                onChange={(e) =>
                  setUserProfile({ ...userProfile, industry: e.target.value })
                }
                maxLength={100}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-700 placeholder-gray-400"
                placeholder="Industry *"
              />
              <input
                type="text"
                value={userProfile.location || ''}
                onChange={(e) =>
                  setUserProfile({ ...userProfile, location: e.target.value })
                }
                maxLength={100}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-700 placeholder-gray-400"
                placeholder="Location *"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full btn btn-primary py-3.5 rounded-lg font-bold text-lg"
            >
              Start Assessment
            </button>

            {/* Required note */}
            <p className="text-center text-sm text-gray-400">
              <span className="text-red-400">*</span> Required fields
            </p>
          </form>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            &#128274; Your information is secure and never shared.{' '}
            <a href="#" className="underline hover:text-gray-700">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background py-4 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back to Home */}
        <div className="mb-3">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary bg-white border border-gray-200 px-3 py-2 rounded-lg shadow-sm transition transform duration-150 hover:-translate-y-1 hover:shadow-md hover:bg-gray-50"
          >
            <FiArrowLeft /> Back to Home
          </a>
        </div>

        {/* Header with Progress */}
        <div className="mb-4">
          {/* Step Indicators */}
          <div className="flex items-center justify-between mb-3 overflow-x-auto pb-1">
            {questions.map((_, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs transition-all duration-300 ${
                    index < currentQuestion
                      ? 'bg-green-500 text-white shadow-md'
                      : index === currentQuestion
                      ? 'bg-primary text-white shadow-md scale-110'
                      : 'bg-white text-gray-400 border-2 border-gray-200'
                  }`}
                >
                  {index < currentQuestion ? <FiCheck /> : index + 1}
                </div>
                {index < questions.length - 1 && (
                  <div
                    className={`h-0.5 w-6 lg:w-12 mx-0.5 transition-all duration-500 ${
                      index < currentQuestion ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-xl shadow-md p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-700">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-xs font-bold text-primary">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-700 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div
          className={`bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 ${
            isTransitioning
              ? 'opacity-0 transform scale-95'
              : 'opacity-100 transform scale-100'
          }`}
        >
          <div className="bg-primary px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0">
                {currentQuestion + 1}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{question.title}</h2>
                {question.subtitle && (
                  <p className="text-sm text-white/90 mt-0.5">{question.subtitle}</p>
                )}
              </div>
            </div>
          </div>

          <div className="p-4">
            {/* Answer Options */}
            <div className="space-y-2">
              {question.type === 'radio' && question.options && (
                <div className="space-y-2">
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
                        className={`p-3 border-2 rounded-xl transition-all duration-300 ${
                          currentAnswer === option.value
                            ? 'border-primary bg-primary-10 shadow-md'
                            : 'border-gray-200 bg-white hover:border-primary hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                              currentAnswer === option.value
                                ? 'border-primary bg-primary'
                                : 'border-gray-300 bg-white group-hover:border-primary'
                            }`}
                          >
                            {currentAnswer === option.value && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                          <span
                            className={`text-sm font-medium transition-colors ${
                              currentAnswer === option.value
                                ? 'text-gray-900'
                                : 'text-gray-700'
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
                    maxLength={2000}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary resize-none text-base transition-all duration-200 hover:border-primary/40"
                  />
                  <div className="absolute bottom-3 right-3 text-sm text-gray-400">
                    {currentAnswer.length} / 2000
                  </div>
                </div>
              )}

              {/* Follow-up Question */}
              {showFollowUp && question.followUpPrompt && (
                <div className="mt-6 p-6 bg-primary-10 rounded-2xl border-2 border-primary animate-fade-in">
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
                    maxLength={2000}
                    className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none bg-white"
                    placeholder="Please elaborate..."
                  />
                </div>
              )}
            </div>

            {/* Inline Validation Error */}
            {validationError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-700 animate-fade-in">
                <FiAlertCircle className="flex-shrink-0" />
                {validationError}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={handleBack}
            disabled={currentQuestion === 0}
            className={`group flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all duration-300 ${
              currentQuestion === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-primary hover:text-primary transform hover:scale-105'
            }`}
          >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!currentAnswer}
            className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
              currentAnswer
                ? 'btn btn-primary'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {currentQuestion === questions.length - 1
              ? 'See Results'
              : 'Next Question'}
            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-3 text-center">
          <p className="text-sm text-gray-500">
            &#128161; Tip: Be honest for the most accurate recommendations
          </p>
        </div>
      </div>
    </div>
  );
}