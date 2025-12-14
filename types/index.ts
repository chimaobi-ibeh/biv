export type QuestionType = 'radio' | 'text' | 'select';

export interface QuestionOption {
  value: string;
  label: string;
  isPositive: boolean;
  followUp?: string;
}

export interface Question {
  id: number;
  title: string;
  subtitle?: string;
  type: QuestionType;
  options?: QuestionOption[];
  placeholder?: string;
  validation?: (answer: string) => boolean;
  followUpCondition?: (answer: string) => boolean;
  followUpPrompt?: string;
}

export interface AssessmentResponse {
  questionId: number;
  answer: string;
  followUpAnswer?: string;
}

export interface UserProfile {
  name?: string;
  email?: string;
  industry?: string;
  location?: string;
  stage?: string;
}

export type ScoreLevel = 'green' | 'yellow' | 'red';

export interface ScoreResult {
  level: ScoreLevel;
  score: number;
  totalPositive: number;
  title: string;
  summary: string;
  actionItems: string[];
  timeframe: string;
}

export interface DimensionScore {
  name: string;
  score: number;
  maxScore: number;
}

export interface AIRecommendation {
  strengths: string[];
  gaps: string[];
  personalizedPlan: string;
  weeklyRoadmap: {
    week: number;
    tasks: string[];
  }[];
  resources: {
    title: string;
    description: string;
    link?: string;
  }[];
  riskAssessment: string;
}

export interface AssessmentResult {
  userProfile: UserProfile;
  responses: AssessmentResponse[];
  scoreResult: ScoreResult;
  dimensionScores: DimensionScore[];
  aiRecommendation?: AIRecommendation;
  timestamp: Date;
  id: string;
}

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: Date;
}
