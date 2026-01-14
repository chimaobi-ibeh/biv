'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile, AssessmentResponse } from '@/types';
import { analytics } from '@/lib/analytics';
import { supabase } from '@/lib/supabase';
import { questions } from '@/lib/questions';
import { FiArrowRight, FiArrowLeft, FiCheck, FiUser, FiMail, FiBriefcase, FiMapPin } from 'react-icons/fi';

export default function AssessmentPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [currentFollowUp, setCurrentFollowUp] = useState('');
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(true);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    analytics.pageView('assessment');
  }, []);

  useEffect(() => {
    if (currentQuestion > 0) {
      analytics.questionAnswered(questions[currentQuestion - 1].id, currentQuestion);
    }
  }, [currentQuestion]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validate that ALL fields are provided (making form mandatory)
    if (!userProfile.name || !userProfile.email || !userProfile.industry || !userProfile.location) {
      setFormError('All fields are required to continue');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userProfile.email)) {
      setFormError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Save user profile to Supabase
      const { data, error } = await supabase
        .from('business_idea_assessments')
        .insert([
          {
            name: userProfile.name,
            email: userProfile.email,
            industry: userProfile.industry,
            location: userProfile.location,
            responses: [],
            created_at: new Date().toISOString(),
          }
        ])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        setFormError('Failed to save information. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Store assessment ID for later use
      if (data && data[0]) {
        sessionStorage.setItem('assessmentId', data[0].id);
      }

      // persist profile for questions page
      try {
        sessionStorage.setItem('assessment_profile', JSON.stringify(userProfile));
      } catch (e) {
        console.error('Session storage error:', e);
      }

      analytics.assessmentStarted();
      setShowProfileForm(false);
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error:', error);
      setFormError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
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

  const handleNext = async () => {
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

    setTimeout(async () => {
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

        // Save all responses to Supabase
        try {
          const assessmentId = sessionStorage.getItem('assessmentId');
          if (assessmentId) {
            await supabase
              .from('business_idea_assessments')
              .update({
                responses: updatedResponses,
                completed_at: new Date().toISOString(),
              })
              .eq('id', assessmentId);
          }
        } catch (error) {
          console.error('Error saving responses to Supabase:', error);
        }

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

  // Show pre-assessment profile as its own page — keeps form single-screen on mobile
  if (showProfileForm) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-6">
        <div className="max-w-md w-full">
          <div className="mb-4">
            <button onClick={() => router.push('/')} className="inline-flex items-center gap-2 text-sm font-medium text-primary bg-white border border-gray-200 px-3 py-2 rounded-lg shadow-sm transition transform duration-150 hover:-translate-y-1 hover:shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/30">
              <FiArrowLeft /> Back to Home
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100">
            <div className="text-center mb-4">
              <div className="inline-block p-2 bg-white rounded-2xl shadow mb-3">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <FiCheck className="text-2xl text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-1 text-heading">Let's Get Started</h1>
              <p className="text-sm text-gray-600 mb-1">Complete all fields to get personalized insights</p>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <input 
                    type="text" 
                    value={userProfile.name || ''} 
                    onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })} 
                    placeholder="Name *" 
                    className="w-full px-3 py-2 border rounded-xl border-gray-200 focus:ring-2 focus:ring-purple-500" 
                    required
                  />
                </div>
                <div>
                  <input 
                    type="email" 
                    value={userProfile.email || ''} 
                    onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })} 
                    placeholder="Email *" 
                    className="w-full px-3 py-2 border rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500" 
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="text" 
                    value={userProfile.industry || ''} 
                    onChange={(e) => setUserProfile({ ...userProfile, industry: e.target.value })} 
                    placeholder="Industry *" 
                    className="w-full px-3 py-2 border rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500" 
                    required
                  />
                  <input 
                    type="text" 
                    value={userProfile.location || ''} 
                    onChange={(e) => setUserProfile({ ...userProfile, location: e.target.value })} 
                    placeholder="Location *" 
                    className="w-full px-3 py-2 border rounded-xl border-gray-200 focus:ring-2 focus:ring-pink-500" 
                    required
                  />
                </div>
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {formError}
                </div>
              )}

              <div className="pt-3 flex flex-col gap-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full btn btn-primary py-3 rounded-xl font-bold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Starting Assessment...' : 'Start Assessment'}
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-2">
                <span className="text-red-500">*</span> Required fields
              </p>
            </form>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">🔒 Your information is secure and never shared</p>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push('/')}
            aria-label="Back to home"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary bg-white border border-gray-200 px-3 py-2 rounded-lg shadow-sm transition transform duration-150 hover:-translate-y-1 hover:shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <FiArrowLeft />
            Home
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
          <div className="bg-primary px-8 py-6 text-white">
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
                            ? 'border-primary bg-primary-10 shadow-lg scale-[1.02]'
                            : 'border-gray-200 bg-white hover:border-primary hover:shadow-md'
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
            className={`group btn btn-primary flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg ${
              !currentAnswer ? 'opacity-60 cursor-not-allowed' : ''
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