'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { questions } from '@/lib/questions';
import { AssessmentResponse, UserProfile } from '@/types';
import { analytics } from '@/lib/analytics';
import { FiArrowRight, FiArrowLeft, FiCheck } from 'react-icons/fi';

export default function QuestionsPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [currentFollowUp, setCurrentFollowUp] = useState('');
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    analytics.pageView('assessment_questions');

    // Load profile if available
    try {
      const stored = sessionStorage.getItem('assessment_profile');
      if (stored) setUserProfile(JSON.parse(stored));
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (currentQuestion > 0) {
      analytics.questionAnswered(questions[currentQuestion - 1].id, currentQuestion);
    }
  }, [currentQuestion]);

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

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background py-2 px-2 relative">
      <div className="max-w-4xl mx-auto flex flex-col min-h-screen justify-between">
        <div className="mb-6 md:mb-4 md:pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-shrink-0">
              <button
                onClick={() => router.push('/')}
                aria-label="Back to home"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary bg-white border border-gray-200 px-3 py-2 rounded-lg shadow-sm transition transform duration-150 hover:-translate-y-1 hover:shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/30 hover-lift md:fixed md:left-4 md:top-6 md:z-40"
              >
                <FiArrowLeft />
                Back to Home
              </button>
            </div>

            <div className="flex-1">
              <div className="flex items-center mb-2 md:mb-3 overflow-x-auto pb-2">
                {questions.map((_, index) => (
                  <div key={index} className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full font-bold text-sm transition-all duration-300 ${
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
              <div className="bg-white rounded-2xl shadow-lg p-2 sm:p-3">
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
          </div>
        </div>

        {/* Question Card */}
        <div
          className={`bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 ${
            isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
          }`} style={{ marginTop: 0 }}
        >
          <div className="bg-primary px-3 py-3 sm:px-6 sm:py-4 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-lg">
                {currentQuestion + 1}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex-1">{question.title}</h2>
            </div>
            {question.subtitle && (
              <p className="text-sm sm:text-base text-white/90 ml-15 pl-2">{question.subtitle}</p>
            )}
          </div>

          <div className="p-3 sm:p-6">
            {/* Answer Options */}
            <div className="space-y-4">
              {question.type === 'radio' && question.options && (
                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <label
                      key={option.value}
                      className={`group block relative cursor-pointer transition-all duration-200 ${
                        isTransitioning ? 'opacity-0' : 'opacity-100'
                      }`}
                      style={{ transitionDelay: `${index * 30}ms` }}
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
                        className={`p-2 sm:p-3 border-2 rounded-2xl transition-all duration-200 ${
                          currentAnswer === option.value
                            ? 'border-primary bg-primary-10 shadow-lg scale-[1.02]'
                            : 'border-gray-200 bg-white hover:border-primary hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 mt-0.5 flex items-center justify-center transition-all duration-200 ${
                              currentAnswer === option.value
                                ? 'border-purple-600 bg-purple-600'
                                : 'border-gray-300 bg-white group-hover:border-purple-400'
                            }`}
                          >
                            {currentAnswer === option.value && (
                              <div className="w-2.5 h-2.5 bg-white rounded-full" />
                            )}
                          </div>
                          <span
                            className={`text-sm font-medium transition-colors ${
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
        <div className="flex justify-between items-center mt-1 sm:mt-3">
          <button
            onClick={handleBack}
            disabled={currentQuestion === 0}
            className={`group flex items-center gap-2 px-3 py-2 rounded-md font-semibold text-sm transition-all duration-200 hover-lift ${
              currentQuestion === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-500 hover:text-purple-600'
            }`}
          >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!currentAnswer}
            className={`group btn btn-primary flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm ${
              !currentAnswer ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {currentQuestion === questions.length - 1 ? 'See Results' : 'Next Question'}
            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-1 text-center hidden md:block">
          <p className="text-sm text-gray-500">💡 Tip: Be honest for the most accurate recommendations</p>
        </div>
      </div>
    </div>
  );
}
