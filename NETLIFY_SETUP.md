# Netlify Deployment Setup

## Environment Variables

To deploy GlobeQuest to Netlify, you need to set the following environment variables in your Netlify dashboard:

### Steps:

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add the following variables:

   - **Key:** `REACT_APP_SUPABASE_URL`
     **Value:** Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)

   - **Key:** `REACT_APP_SUPABASE_ANON_KEY`
     **Value:** Your Supabase anon/public key

### How to find your Supabase credentials:

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Use as `REACT_APP_SUPABASE_URL`
   - **anon/public key** → Use as `REACT_APP_SUPABASE_ANON_KEY`

### Important Notes:

- Environment variables are case-sensitive
- Make sure to use the `REACT_APP_` prefix (required for Create React App)
- After adding variables, you may need to trigger a new deploy
- Variables are available at build time and will be baked into your production bundle

### Local Development:

For local development, create a `.env` file in the root directory:

```
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

**Note:** The `.env` file is already in `.gitignore` and won't be committed to Git.

## About the Supabase Anon Key

The Supabase anon key is **intentionally public** and safe to expose in client-side code. It's designed to be included in your JavaScript bundle. Security is handled by Supabase's Row Level Security (RLS) policies, not by hiding the key.

If Netlify's secrets scanner flags it, you can safely ignore it or configure Netlify to skip scanning for this key (already configured in `netlify.toml`).

