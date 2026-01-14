# Deployment Guide

## Environment Variables Setup

Before deploying to production, you need to set up the following environment variables in your hosting platform (Vercel, Netlify, etc.).

### Required Environment Variables

#### Supabase (Database)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Where to find these:**
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the Project URL and anon/service_role keys

#### Anthropic (AI Analysis)
```
ANTHROPIC_API_KEY=sk-ant-api03-your_key_here
```

**Where to get this:**
1. Sign up at https://console.anthropic.com
2. Go to API Keys section
3. Create a new API key

#### Resend (Email Service)
```
RESEND_API_KEY=re_your_key_here
FROM_EMAIL=your-verified-email@domain.com
```

**Where to get this:**
1. Sign up at https://resend.com
2. Create an API key
3. Verify your sending domain

#### Application Settings
```
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

---

## Deployment Platforms

### Vercel (Recommended)

1. **Connect your repository:**
   ```bash
   vercel
   ```

2. **Set environment variables:**
   - Go to Project Settings → Environment Variables
   - Add all variables from .env.example
   - Make sure to set them for Production, Preview, and Development environments

3. **Deploy:**
   ```bash
   vercel --prod
   ```

### Netlify

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Set environment variables:**
   - Go to Site Settings → Environment Variables
   - Add all variables from .env.example

3. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

---

## Security Checklist

Before deploying:

- [ ] Verify `.env` is in `.gitignore` (it is by default)
- [ ] Never commit `.env` file to git
- [ ] Rotate all API keys if they were ever committed
- [ ] Set all environment variables in your hosting platform
- [ ] Use `NEXT_PUBLIC_` prefix only for variables that need to be exposed to the browser
- [ ] Keep service role keys and API keys server-side only (no `NEXT_PUBLIC_` prefix)
- [ ] Enable Row Level Security (RLS) in Supabase
- [ ] Set up proper CORS policies

---

## Database Setup

After deployment, run the Supabase migrations:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migration file: `supabase/migrations/create_business_idea_assessments.sql`

---

## Testing Production Build Locally

Before deploying, test the production build locally:

```bash
# Build for production
npm run build

# Start production server
npm start
```

Visit http://localhost:3000 and test all features.

---

## Monitoring

After deployment:

1. **Check Vercel/Netlify logs** for any runtime errors
2. **Monitor Supabase dashboard** for database queries
3. **Check Anthropic usage** to track API costs
4. **Monitor Resend dashboard** for email delivery

---

## Troubleshooting

**Issue: "Missing environment variables" error**
- Solution: Double-check all environment variables are set in your hosting platform

**Issue: Supabase connection fails**
- Solution: Verify RLS policies are set up correctly in Supabase

**Issue: AI recommendations not generating**
- Solution: Check Anthropic API key is valid and has credits

**Issue: Emails not sending**
- Solution: Verify domain is verified in Resend and FROM_EMAIL matches

---

## Support

For issues, check:
- Vercel logs: `vercel logs`
- Browser console for client-side errors
- Network tab for API failures
