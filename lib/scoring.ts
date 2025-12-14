import { AssessmentResponse, ScoreResult, ScoreLevel, DimensionScore } from '@/types';
import { questions } from './questions';

export function calculateScore(responses: AssessmentResponse[]): ScoreResult {
  let positiveCount = 0;

  // Count positive responses
  responses.forEach((response) => {
    const question = questions.find((q) => q.id === response.questionId);
    if (question && question.options) {
      const selectedOption = question.options.find((opt) => opt.value === response.answer);
      if (selectedOption?.isPositive) {
        positiveCount++;
      }
    } else if (question?.type === 'text' && response.answer.length > 0) {
      // For text questions, check if validation passes
      if (question.validation && question.validation(response.answer)) {
        positiveCount++;
      }
    }
  });

  const level: ScoreLevel = positiveCount >= 8 ? 'green' : positiveCount >= 5 ? 'yellow' : 'red';

  return {
    level,
    score: Math.round((positiveCount / 10) * 100),
    totalPositive: positiveCount,
    ...getScoreLevelDetails(level, positiveCount),
  };
}

function getScoreLevelDetails(level: ScoreLevel, positiveCount: number) {
  switch (level) {
    case 'green':
      return {
        title: 'GREEN LIGHT - Start This Week',
        summary: `Congratulations! You scored ${positiveCount}/10. You have the essential foundations in place to launch your business.`,
        actionItems: [
          'Launch your MVP this week',
          'Set up your payment system',
          'Make your first sale',
          'Start collecting customer feedback',
          'Iterate based on real data',
        ],
        timeframe: 'Launch within 7 days',
      };
    case 'yellow':
      return {
        title: 'YELLOW LIGHT - 1-2 Weeks Prep',
        summary: `You scored ${positiveCount}/10. You're close! Just need to address a few gaps before launching.`,
        actionItems: [
          'Talk to 10 potential customers',
          'Set up payment system (PayPal, Stripe, Paystack, etc)',
          'Identify what you actually need vs. nice-to-have',
          'Create one-sentence value proposition',
          'Schedule launch date within 14 days',
        ],
        timeframe: 'Fix gaps, then launch in 2 weeks MAX',
      };
    case 'red':
      return {
        title: 'RED LIGHT - Foundation Work Needed',
        summary: `You scored ${positiveCount}/10. STOP. You're not ready yet. Let's build your foundation first.`,
        actionItems: [
          'Week 1: Interview 10 people about the problem you solve',
          'Week 1: List 10 skills people ask you for help with',
          'Week 1: Research someone doing what you want to do',
          'Week 2: Clarify your value proposition',
          'Week 2: Identify the simplest version of your idea',
          'Week 2: Set up basic payment capability',
          'Week 3: Make your first test offer',
          'Week 3: Validate people will actually pay',
          'Week 3: Retake this assessment',
        ],
        timeframe: '3 weeks of foundation work',
      };
  }
}

export function calculateDimensionScores(responses: AssessmentResponse[]): DimensionScore[] {
  const dimensions: DimensionScore[] = [
    { name: 'Foundation', score: 0, maxScore: 1 },
    { name: 'Value Clarity', score: 0, maxScore: 1 },
    { name: 'Market Validation', score: 0, maxScore: 1 },
    { name: 'Investment', score: 0, maxScore: 1 },
    { name: 'Skills', score: 0, maxScore: 1 },
    { name: 'Speed', score: 0, maxScore: 1 },
    { name: 'Passion-Market Fit', score: 0, maxScore: 1 },
    { name: 'Motivation', score: 0, maxScore: 1 },
    { name: 'Learning', score: 0, maxScore: 1 },
    { name: 'Commitment', score: 0, maxScore: 1 },
  ];

  responses.forEach((response, index) => {
    const question = questions.find((q) => q.id === response.questionId);
    if (question && question.options) {
      const selectedOption = question.options.find((opt) => opt.value === response.answer);
      if (selectedOption?.isPositive && dimensions[index]) {
        dimensions[index].score = 1;
      }
    } else if (question?.type === 'text' && response.answer.length > 0) {
      if (question.validation && question.validation(response.answer) && dimensions[index]) {
        dimensions[index].score = 1;
      }
    }
  });

  return dimensions;
}

export function generateShareText(score: ScoreResult): string {
  return `I just validated my business idea with BeamX! Score: ${score.score}% - ${score.title}. Ready to launch! 🚀`;
}
