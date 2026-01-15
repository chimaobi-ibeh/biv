# Business Idea Validator

AI-powered business idea validation tool by BeamX Solutions.

## Features

- 10-question assessment framework
- AI-powered recommendations using Claude
- Dimension-based scoring (Foundation, Market, Execution, Financial, Personal)
- Professional PDF report generation
- Email delivery with Resend
- Supabase database integration

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `ANTHROPIC_API_KEY` - Claude API key
- `RESEND_API_KEY` - Resend email API key
- `FROM_EMAIL` - Verified email address

### 3. Database Setup

Run the migration in your Supabase SQL Editor:
```sql
-- See supabase/migrations/create_business_idea_assessments.sql
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add all environment variables from `.env.example`
4. Deploy

**Important:** Never commit `.env` file. All secrets must be set in Vercel dashboard.

## Tech Stack

- Next.js 16 (App Router with Turbopack)
- React 19
- TypeScript
- Tailwind CSS
- Supabase (Database)
- Anthropic Claude API (AI Analysis)
- Resend (Email)
- React PDF (Report Generation)

## Project Structure

```
├── app/              # Next.js app directory
├── lib/              # Utilities and helpers
├── types/            # TypeScript types
├── public/           # Static assets
└── supabase/         # Database migrations
```

## License

© 2025 BeamX Solutions. All rights reserved.
