# Business Idea Validator Tool

A comprehensive web-based assessment tool that validates business ideas through a structured 10-question framework, providing AI-powered personalized recommendations and actionable roadmaps for entrepreneurs.

![BeamX Business Validator](https://via.placeholder.com/1200x400?text=Business+Idea+Validator)

## Features

### Core Functionality
- **Interactive 10-Question Assessment** - Research-backed framework covering foundation, market validation, skills, and commitment
- **Smart Scoring System** - Green (8-10), Yellow (5-7), Red (<5) light status with personalized feedback
- **AI-Powered Analysis** - Claude AI integration for personalized insights and recommendations
- **Visual Results Dashboard** - Radar chart showing performance across all dimensions
- **Comprehensive PDF Reports** - 8-10 page downloadable reports with detailed analysis
- **Email Capture & Automation** - Lead generation with automated follow-up sequences
- **Social Sharing** - Share results on Twitter, LinkedIn, and Facebook
- **Analytics Tracking** - Comprehensive event tracking for optimization

### Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **AI**: Anthropic Claude API
- **Charts**: Recharts for data visualization
- **PDF Generation**: jsPDF with autoTable
- **Email**: Resend API
- **Analytics**: Google Analytics + Custom tracking
- **Icons**: React Icons (Feather Icons)

## Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Anthropic API key (for AI features)
- Resend API key (for email features)

### Installation

1. **Clone or navigate to the project**
   ```bash
   cd business-idea-validator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

4. **Configure your `.env.local` file**
   ```env
   # Required for AI-powered recommendations
   ANTHROPIC_API_KEY=your_anthropic_api_key_here

   # Required for email functionality
   RESEND_API_KEY=your_resend_api_key_here
   FROM_EMAIL=noreply@beamxsolutions.com

   # Optional: Google Analytics
   NEXT_PUBLIC_GA_ID=your_google_analytics_id

   # App URL (update for production)
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Getting API Keys

### Anthropic Claude API
1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy and paste into `.env.local`

### Resend Email API
1. Go to [resend.com](https://resend.com/)
2. Sign up for a free account
3. Verify your domain (or use their test domain for development)
4. Generate an API key
5. Copy and paste into `.env.local`

### Google Analytics (Optional)
1. Go to [analytics.google.com](https://analytics.google.com/)
2. Create a new property
3. Get your Measurement ID (GA4)
4. Add to `.env.local`

## Project Structure

```
business-idea-validator/
├── app/
│   ├── api/
│   │   ├── analyze/
│   │   │   └── route.ts       # Claude AI integration endpoint
│   │   └── email/
│   │       └── route.ts       # Email sending endpoint
│   ├── assessment/
│   │   └── page.tsx           # 10-question assessment flow
│   ├── results/
│   │   └── page.tsx           # Results dashboard with charts
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Landing page
├── lib/
│   ├── questions.ts           # Assessment questions configuration
│   ├── scoring.ts             # Scoring logic and algorithms
│   ├── analytics.ts           # Analytics tracking utilities
│   └── pdf-generator.ts       # PDF report generation
├── types/
│   └── index.ts               # TypeScript type definitions
├── .env.local.example         # Environment variables template
├── package.json
└── README.md
```

## Usage Guide

### For End Users

1. **Landing Page** - Users arrive and see value proposition
2. **Pre-Assessment** - Optional profile information (name, email, industry, location)
3. **Assessment Flow** - Answer 10 strategic questions with progress tracking
4. **Instant Results** - See score, radar chart, and immediate recommendations
5. **Email Capture** - Provide email for detailed AI-powered report
6. **Full Dashboard** - Access comprehensive analysis, roadmap, and resources
7. **Download PDF** - Get full report for offline reference
8. **Share Results** - Share achievements on social media

### For Administrators

#### Customizing Questions
Edit `lib/questions.ts` to modify assessment questions:

```typescript
{
  id: 1,
  title: 'Your Question Title',
  subtitle: 'Additional context',
  type: 'radio', // or 'text'
  options: [
    {
      value: 'option-1',
      label: 'Option label',
      isPositive: true, // Counts toward positive score
    },
  ],
}
```

#### Adjusting Scoring
Modify `lib/scoring.ts` to change score thresholds:

```typescript
const level: ScoreLevel =
  positiveCount >= 8 ? 'green' :    // Change thresholds here
  positiveCount >= 5 ? 'yellow' :
  'red';
```

#### Customizing AI Prompts
Edit the `buildAnalysisPrompt` function in `app/api/analyze/route.ts` to adjust AI behavior.

## Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy!

3. **Set production URL**
   Update `NEXT_PUBLIC_APP_URL` in Vercel environment variables

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render
- Your own server with Docker

**Build command**: `npm run build`
**Start command**: `npm start`

## Analytics & Tracking

The tool tracks the following events:
- Assessment started
- Questions answered (with question number)
- Assessment completed (with score and level)
- Email captured
- PDF downloaded
- Social shares
- CTA clicks
- Drop-off points

View analytics data in:
1. Google Analytics dashboard (if configured)
2. Browser localStorage (development)
3. Server logs

## Email Automation Setup

### Using Resend

1. **Create Email Templates**
   - Welcome email with results
   - Detailed report delivery
   - Follow-up sequences (7-day)

2. **Set up Automation**
   - Configure email templates in Resend dashboard
   - Set up audience lists
   - Create automated workflows

3. **Test Email Flow**
   ```bash
   # Send test email
   curl -X POST http://localhost:3000/api/email \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","name":"Test User","type":"capture"}'
   ```

## Customization

### Branding

1. **Colors** - Update Tailwind config in `tailwind.config.ts`
2. **Logo** - Add logo to `public/` directory
3. **Copy** - Edit text in page components
4. **Domain** - Update all references to beamxsolutions.com

### Adding New Features

**Add a new question:**
1. Update `lib/questions.ts`
2. Adjust `calculateDimensionScores` in `lib/scoring.ts`
3. Update radar chart dimension count if needed

**Add new AI analysis:**
1. Modify prompt in `app/api/analyze/route.ts`
2. Update `AIRecommendation` type in `types/index.ts`
3. Display new data in `app/results/page.tsx`

## Performance Optimization

- **Image Optimization**: Use Next.js Image component
- **Code Splitting**: Automatic with Next.js
- **Analytics**: Local storage prevents excessive API calls
- **API Caching**: Claude API responses cached for 15 minutes
- **PDF Generation**: Client-side to reduce server load

## Security Considerations

- API keys stored in environment variables (never committed)
- Email validation on both client and server
- Rate limiting recommended for API routes
- CORS configured for API endpoints
- No sensitive data stored in localStorage

## Troubleshooting

### Common Issues

**Issue**: API calls failing
- Check environment variables are set correctly
- Verify API keys are valid
- Check network requests in browser DevTools

**Issue**: PDF generation not working
- Check jsPDF dependencies installed
- Clear browser cache
- Check console for errors

**Issue**: Emails not sending
- Verify Resend API key
- Check FROM_EMAIL domain is verified
- Review Resend dashboard logs

**Issue**: Charts not displaying
- Ensure recharts package installed
- Check window size (charts are responsive)
- Verify data format matches chart requirements

## Development

### Running Tests
```bash
npm run test
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

### Build for Production
```bash
npm run build
npm start
```

## Success Metrics

Track these KPIs to measure success:
- **Completion Rate**: Target >70%
- **Email Capture Rate**: Target >40%
- **Viral Coefficient**: Target >0.3
- **Return User Rate**: Target >20%
- **Conversion to Paid**: Target >2%

## Roadmap

### Phase 1 (Current)
- ✅ Basic 10-question flow
- ✅ Simple scoring algorithm
- ✅ Email capture
- ✅ Basic results page
- ✅ Claude AI integration
- ✅ PDF generation
- ✅ Email automation

### Phase 2 (Future)
- A/B testing framework
- Advanced analytics dashboard
- Social sharing optimization
- Partner API integrations
- Multi-language support
- Industry-specific versions

### Phase 3 (Advanced)
- User accounts and history
- Collaborative assessments
- Comparison with industry benchmarks
- Integration with CRM systems
- White-label options

## Support

For questions or issues:
- Email: support@beamxsolutions.com
- Documentation: This README
- Issues: GitHub Issues (if applicable)

## License

© 2024 BeamX Solutions. All rights reserved.

## Credits

Built with:
- [Next.js](https://nextjs.org/)
- [Anthropic Claude](https://www.anthropic.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)
- [jsPDF](https://github.com/parallax/jsPDF)
- [Resend](https://resend.com/)

---

**Built by BeamX Solutions** - Data-driven startup validation
