import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AssessmentResponse, UserProfile, AIRecommendation } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const { responses, userProfile, scoreLevel, totalPositive } = await request.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    const prompt = buildAnalysisPrompt(responses, userProfile, scoreLevel, totalPositive);

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    const recommendation = parseAIResponse(content.text);

    return NextResponse.json({ recommendation });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to generate personalized recommendations' },
      { status: 500 }
    );
  }
}

function buildAnalysisPrompt(
  responses: AssessmentResponse[],
  userProfile: UserProfile,
  scoreLevel: string,
  totalPositive: number
): string {
  const responseText = responses
    .map((r, idx) => `Q${idx + 1}: ${r.answer}${r.followUpAnswer ? ` (Follow-up: ${r.followUpAnswer})` : ''}`)
    .join('\n');

  return `You are a business validation expert analyzing a startup idea assessment. The entrepreneur scored ${totalPositive}/10 (${scoreLevel} light status).

USER PROFILE:
${userProfile.name ? `Name: ${userProfile.name}` : ''}
${userProfile.industry ? `Industry: ${userProfile.industry}` : ''}
${userProfile.location ? `Location: ${userProfile.location}` : ''}
${userProfile.stage ? `Stage: ${userProfile.stage}` : ''}

ASSESSMENT RESPONSES:
${responseText}

Provide a comprehensive analysis in JSON format with the following structure:
{
  "strengths": ["3-5 key strengths based on their responses"],
  "gaps": ["3-5 critical gaps they need to address"],
  "personalizedPlan": "A personalized 2-3 paragraph strategic plan tailored to their specific situation",
  "weeklyRoadmap": [
    {
      "week": 1,
      "tasks": ["Specific actionable task 1", "Specific actionable task 2", "..."]
    },
    // 2-4 weeks depending on score level
  ],
  "resources": [
    {
      "title": "Resource name",
      "description": "Why this resource will help them"
    },
    // 3-5 resources
  ],
  "riskAssessment": "A frank assessment of the biggest risks and how to mitigate them"
}

Be specific, actionable, and honest. If they're not ready, say so clearly. If they are ready, give them confidence and clear next steps. Use Nigerian context if location indicates Nigeria.`;
}

function parseAIResponse(text: string): AIRecommendation {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback: create structured response from text
    return {
      strengths: ['AI analysis completed - see detailed report'],
      gaps: ['Review your responses carefully'],
      personalizedPlan: text,
      weeklyRoadmap: [
        {
          week: 1,
          tasks: ['Review AI recommendations', 'Take action on identified gaps'],
        },
      ],
      resources: [
        {
          title: 'BeamX Consulting',
          description: 'Get personalized 1-on-1 guidance',
        },
      ],
      riskAssessment: 'Continue building on your strengths while addressing gaps',
    };
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    throw new Error('Invalid AI response format');
  }
}
