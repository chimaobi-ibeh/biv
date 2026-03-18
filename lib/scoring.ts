import { AssessmentResponse, ScoreResult, ScoreLevel, DimensionScore } from '@/types';
import { questions } from './questions';

export function calculateScore(responses: AssessmentResponse[]): ScoreResult {
  let positiveCount = 0;

  responses.forEach((response) => {
    const question = questions.find((q) => q.id === response.questionId);
    if (question && question.options) {
      const selectedOption = question.options.find((opt) => opt.value === response.answer);
      if (selectedOption?.isPositive) positiveCount++;
    } else if (question?.type === 'text' && response.answer.length > 0) {
      if (question.validation && question.validation(response.answer)) positiveCount++;
    }
  });

  const level: ScoreLevel = positiveCount >= 8 ? 'green' : positiveCount >= 5 ? 'yellow' : 'red';

  return {
    level,
    score: Math.round((positiveCount / 10) * 100),
    totalPositive: positiveCount,
    ...getScoreLevelDetails(level, positiveCount, responses),
  };
}

function getAnswer(responses: AssessmentResponse[], questionId: number): string {
  return responses.find((r) => r.questionId === questionId)?.answer ?? '';
}

function buildActionItems(level: ScoreLevel, responses: AssessmentResponse[]): string[] {
  const q1  = getAnswer(responses, 1);
  const q3  = getAnswer(responses, 3);
  const q4  = getAnswer(responses, 4);
  const q5  = getAnswer(responses, 5);
  const q6  = getAnswer(responses, 6);
  const q7  = getAnswer(responses, 7);
  const q10 = getAnswer(responses, 10);

  const items: string[] = [];

  // Q1 - foundation gaps
  if (q1 === 'missing-product' || q1 === 'missing-multiple') {
    items.push('Week 1: Define your core product or service clearly before anything else');
  }
  if (q1 === 'missing-customers') {
    items.push('Week 1: Talk to at least 10 potential customers to confirm real demand');
  }
  if (q1 === 'missing-payment') {
    items.push('Week 1: Set up a payment method - PayPal, Stripe, Paystack, or bank transfer');
  }

  // Q3 - market validation
  if (q3 === 'no-validation') {
    items.push('Week 1: Interview 10+ potential customers - ask if they would pay, not just if they like it');
  } else if (q3 === 'talked-no-payment') {
    items.push('Week 1: Revisit conversations you have had and explicitly ask about willingness to pay');
  }

  // Q5 - skills
  if (q5 === 'no') {
    items.push('Week 1: Identify the core skill your business requires - develop it or find a partner who has it');
  }

  // Q6 - readiness (most important for timing)
  if (q6 === 'months') {
    items.push('Week 1: Define your MVP - the smallest version you could launch to test demand right now');
    items.push('Week 2: Set a specific target launch date and work backwards to plan what must happen first');
    items.push('Week 2: Separate "must have for launch" from "nice to have later" - cut everything that is not critical');
  } else if (q6 === 'almost') {
    const followUp = responses.find((r) => r.questionId === 6)?.followUpAnswer;
    if (followUp) {
      items.push(`Week 1: Resolve your specific blockers: "${followUp.slice(0, 80)}"`);
    } else {
      items.push('Week 1: List every remaining item stopping you from launching - resolve them one by one');
    }
    items.push('Week 2: Set a hard launch date no more than 2 weeks from today');
  } else if (q6 === 'yes-ready') {
    items.push('This week: Reach out to your warmest leads and make your first sale');
    items.push('This week: Set up your payment system if you have not already');
  }

  // Q7 - passion-market fit
  if (q7 === 'passion-only') {
    items.push('Week 1: Validate market demand before investing more time - passion alone does not pay the bills');
  }
  if (q7 === 'demand-only') {
    items.push('Consider whether you can sustain this long-term without passion - or find a co-founder who has it');
  }

  // Q4 - investment
  if (q4 === 'over-1000' || q4 === '500-1000') {
    items.push('Week 1: Audit your cost list - most early-stage businesses need far less than founders expect');
  }

  // Q10 - commitment
  if (q10 === 'maybe' || q10 === 'no') {
    items.push('Today: Write down the real reason you are hesitating - that is your first thing to fix');
  }

  // Level-specific detailed fallbacks to ensure enough items
  if (level === 'green') {
    if (items.length < 3) {
      items.push('This week: Launch your minimum viable offer and collect your first payment');
      items.push('This week: Set up your payment system and go-to-market process');
    }
    items.push('Week 2: Start collecting customer feedback and iterate based on what you learn');
    items.push('Week 3: Identify your top 3 acquisition channels and double down on what works');
  }

  if (level === 'yellow') {
    if (items.length < 3) {
      items.push('Week 1: Write your one-sentence value proposition and test it with 5 real people');
      items.push('Week 1: List every gap between where you are now and being ready to sell');
    }
    items.push('Week 2: Address each gap systematically - do not move to the next until it is resolved');
    items.push('Week 2: Set a hard launch date and make it public so you are accountable to it');
    items.push('Week 3: Make your first sale - even at a reduced "founding customer" rate if needed');
  }

  if (level === 'red') {
    if (items.length < 4) {
      items.push('Week 1: Interview 10 people about the problem you are solving - listen, do not pitch');
      items.push('Week 1: List 10 skills people regularly ask you for help with');
      items.push('Week 1: Research one person or business already doing what you want to do');
    }
    items.push('Week 2: Clarify your value proposition - who you help, with what result, and how');
    items.push('Week 2: Define the simplest version of your idea that someone could pay for today');
    items.push('Week 2: Set up a basic way to receive payment before you need it');
    items.push('Week 3: Make your first test offer to someone you know - even informally');
    items.push('Week 3: Validate that at least one person would actually pay for what you are offering');
    items.push('Week 4: Retake this assessment and measure your progress against these results');
  }

  return items;
}

function buildTimeframe(level: ScoreLevel, responses: AssessmentResponse[]): string {
  const q6 = getAnswer(responses, 6);

  if (q6 === 'months') {
    if (level === 'green')  return 'Build your product, then launch - set a specific target date now';
    if (level === 'yellow') return 'Address gaps while building - set a realistic target launch date';
    return 'Foundation work first, then build - plan for 2 to 3 months minimum';
  }

  if (q6 === 'almost') {
    if (level === 'green')  return 'Resolve remaining blockers and launch within 1 to 2 weeks';
    if (level === 'yellow') return 'Fix your gaps and launch within 2 to 3 weeks';
    return '3 to 4 weeks of foundation work before you are ready to launch';
  }

  switch (level) {
    case 'green':  return 'Launch within 7 days';
    case 'yellow': return 'Fix gaps and launch within 2 weeks';
    case 'red':    return '3 to 4 weeks of focused foundation work, then launch';
  }
}

function buildSummary(level: ScoreLevel, positiveCount: number, responses: AssessmentResponse[]): string {
  const q6 = getAnswer(responses, 6);
  const monthsAway = q6 === 'months';

  switch (level) {
    case 'green':
      return monthsAway
        ? `You scored ${positiveCount}/10. Strong foundations overall, but your product still needs time. Focus on defining a clear launch milestone and working towards it.`
        : `You scored ${positiveCount}/10. You have the essentials in place. Time to execute.`;
    case 'yellow':
      return monthsAway
        ? `You scored ${positiveCount}/10. Good progress, but your product is not ready yet. Work through the gaps below while you continue building.`
        : `You scored ${positiveCount}/10. You are close. A few gaps to address before you are ready to launch.`;
    case 'red':
      return `You scored ${positiveCount}/10. Several foundations need work before you are ready to launch. Work through the steps below before spending time or money on anything else.`;
  }
}

function getScoreLevelDetails(
  level: ScoreLevel,
  positiveCount: number,
  responses: AssessmentResponse[]
) {
  const titles: Record<ScoreLevel, string> = {
    green:  'GREEN LIGHT - Strong Foundations',
    yellow: 'YELLOW LIGHT - Almost Ready',
    red:    'RED LIGHT - Foundation Work Needed',
  };

  return {
    title:       titles[level],
    summary:     buildSummary(level, positiveCount, responses),
    actionItems: buildActionItems(level, responses),
    timeframe:   buildTimeframe(level, responses),
  };
}

export function calculateDimensionScores(responses: AssessmentResponse[]): DimensionScore[] {
  const dimensions: DimensionScore[] = [
    { name: 'Foundation',        score: 0, maxScore: 1 },
    { name: 'Value Clarity',     score: 0, maxScore: 1 },
    { name: 'Market Validation', score: 0, maxScore: 1 },
    { name: 'Investment',        score: 0, maxScore: 1 },
    { name: 'Skills',            score: 0, maxScore: 1 },
    { name: 'Speed',             score: 0, maxScore: 1 },
    { name: 'Passion-Market Fit',score: 0, maxScore: 1 },
    { name: 'Motivation',        score: 0, maxScore: 1 },
    { name: 'Learning',          score: 0, maxScore: 1 },
    { name: 'Commitment',        score: 0, maxScore: 1 },
  ];

  responses.forEach((response, index) => {
    const question = questions.find((q) => q.id === response.questionId);
    if (question && question.options) {
      const selectedOption = question.options.find((opt) => opt.value === response.answer);
      if (selectedOption?.isPositive && dimensions[index]) dimensions[index].score = 1;
    } else if (question?.type === 'text' && response.answer.length > 0) {
      if (question.validation && question.validation(response.answer) && dimensions[index]) {
        dimensions[index].score = 1;
      }
    }
  });

  return dimensions;
}

export function generateShareText(score: ScoreResult): string {
  return `I just validated my business idea with BeamX! Score: ${score.score}% - ${score.title}.`;
}
