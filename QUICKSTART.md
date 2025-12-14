# Quick Start Guide - Business Idea Validator

Get your Business Idea Validator up and running in 5 minutes!

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] npm or yarn installed
- [ ] Code editor (VS Code recommended)
- [ ] Git installed (optional)

## Step-by-Step Setup

### 1. Navigate to Project
```bash
cd business-idea-validator
```

### 2. Install Dependencies
```bash
npm install
```
This will install all required packages including Next.js, React, Tailwind CSS, and all dependencies.

### 3. Create Environment File
```bash
cp .env.local.example .env.local
```

### 4. Test Without API Keys (Optional)
You can run the application without API keys to test the basic functionality:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page and test the assessment flow.

**Note**: Without API keys, the following features won't work:
- AI-powered recommendations
- Email sending
- Analytics tracking

### 5. Add API Keys (For Full Functionality)

#### Get Anthropic API Key (for AI features)
1. Visit [console.anthropic.com](https://console.anthropic.com/)
2. Sign up/login
3. Go to "API Keys"
4. Click "Create Key"
5. Copy the key

#### Get Resend API Key (for emails)
1. Visit [resend.com](https://resend.com/)
2. Sign up for free
3. Verify your email
4. Generate an API key
5. Copy the key

#### Update .env.local
Open `.env.local` and add your keys:

```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
RESEND_API_KEY=re_xxxxx
FROM_EMAIL=noreply@yourdomain.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Run the Application
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Testing the Full Flow

### 1. Landing Page Test
- [x] Purple gradient background loads
- [x] "Start Free Assessment" button works
- [x] "See How It Works" smooth scrolls

### 2. Assessment Flow Test
1. Click "Start Free Assessment"
2. Fill in optional profile info (or skip)
3. Answer all 10 questions
4. Watch progress bar update
5. Test "Back" button functionality
6. Complete assessment

### 3. Results Page Test
- [x] Score displays correctly
- [x] Radar chart renders
- [x] Action items show
- [x] Email form works (if API key added)
- [x] PDF download works
- [x] Share buttons work

## Common First-Time Issues

### Issue: "Module not found" errors
**Solution**: Run `npm install` again

### Issue: Port 3000 already in use
**Solution**: Use a different port
```bash
PORT=3001 npm run dev
```

### Issue: Styling looks wrong
**Solution**: Clear browser cache or try incognito mode

### Issue: TypeScript errors
**Solution**: Run type check
```bash
npm run build
```

## Next Steps

### 1. Customize Branding
- Update colors in `tailwind.config.ts`
- Add your logo to `public/` folder
- Change "BeamX Solutions" to your brand name

### 2. Customize Questions
- Edit `lib/questions.ts`
- Modify questions to match your needs
- Adjust scoring in `lib/scoring.ts`

### 3. Deploy to Production
- Push code to GitHub
- Deploy to Vercel (recommended)
- Add production environment variables
- Update `NEXT_PUBLIC_APP_URL`

## Production Deployment (Vercel)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_REPO_URL
git push -u origin main
```

### 2. Deploy
1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repo
4. Add environment variables:
   - `ANTHROPIC_API_KEY`
   - `RESEND_API_KEY`
   - `FROM_EMAIL`
   - `NEXT_PUBLIC_APP_URL` (your production URL)
5. Click "Deploy"

### 3. Done!
Your app will be live at `https://your-project.vercel.app`

## Support

- **Full Documentation**: See `README.md`
- **Issues**: Check console for error messages
- **Questions**: Review the troubleshooting section in README

## Feature Checklist

After setup, you should have:

- [x] Landing page with compelling value proposition
- [x] 10-question assessment flow
- [x] Progress tracking
- [x] Smart scoring (Green/Yellow/Red)
- [x] Results dashboard with radar chart
- [x] Action items and recommendations
- [x] Email capture form
- [x] PDF report generation
- [x] Social sharing buttons
- [x] Analytics tracking
- [x] AI-powered recommendations (if API key added)
- [x] Email automation (if API key added)
- [x] Mobile-responsive design
- [x] Smooth animations and transitions

## Quick Customization Tips

### Change Purple Brand Color
Find and replace in `app/page.tsx` and `app/assessment/page.tsx`:
- `purple-600` → `blue-600` (or any Tailwind color)

### Change Scoring Thresholds
In `lib/scoring.ts`, line ~12:
```typescript
const level: ScoreLevel =
  positiveCount >= 8 ? 'green' :  // Change 8 to your threshold
  positiveCount >= 5 ? 'yellow' :  // Change 5 to your threshold
  'red';
```

### Add Google Analytics
1. Get GA4 Measurement ID
2. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```
3. Add Google Analytics script to `app/layout.tsx`

## Performance Tips

- **Images**: Add images to `public/` folder and use Next.js `Image` component
- **Fonts**: Already optimized with Next.js font optimization
- **Build**: Run `npm run build` to check for production issues
- **Lighthouse**: Test with Chrome Lighthouse for performance scores

## What You Built

You now have a complete lead generation tool with:

1. **Frontend**: Modern React/Next.js app with Tailwind CSS
2. **Backend**: API routes for AI and email
3. **AI Integration**: Claude API for personalized recommendations
4. **Email System**: Resend for lead capture and automation
5. **Analytics**: Event tracking for optimization
6. **PDF Generation**: Downloadable reports
7. **Mobile-First**: Responsive design for all devices

---

**Ready to Launch!**

Start validating business ideas and generating leads for your business.

For detailed customization and advanced features, see the full [README.md](README.md)
