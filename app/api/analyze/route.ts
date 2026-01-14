import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AssessmentResponse, UserProfile, AIRecommendation } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const { responses, userProfile, scoreLevel, totalPositive } = await request.json();

    console.log('=== API /analyze called ===');
    console.log('Responses count:', responses?.length);
    console.log('User profile:', userProfile);
    console.log('Score level:', scoreLevel);
    console.log('Total positive:', totalPositive);

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not set!');
      return NextResponse.json(
        { error: 'AI service not configured - missing API key' },
        { status: 500 }
      );
    }

    console.log('API Key exists:', process.env.ANTHROPIC_API_KEY ? 'Yes' : 'No');
    console.log('API Key starts with:', process.env.ANTHROPIC_API_KEY.substring(0, 15));

    const prompt = buildAnalysisPrompt(responses, userProfile, scoreLevel, totalPositive);
    console.log('Prompt built, length:', prompt.length);

    console.log('Calling Claude API...');
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    console.log('Claude API response received');
    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    console.log('Parsing AI response...');
    const recommendation = parseAIResponse(content.text);
    console.log('Recommendation parsed successfully');

    return NextResponse.json({ recommendation });
  } catch (error: any) {
    console.error('=== Analysis error ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error:', JSON.stringify(error, null, 2));

    return NextResponse.json(
      {
        error: 'Failed to generate personalized recommendations',
        details: error.message,
        type: error.constructor.name
      },
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
