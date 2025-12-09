# Global Express Delivery - Deployment Guide

This guide will walk you through deploying the Global Express Delivery application with Supabase backend to Netlify.

## Prerequisites

- A GitHub account (to connect with Netlify)
- A Supabase account (free tier is sufficient)
- Your code pushed to a GitHub repository

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in the details:
   - **Name**: `global-express-delivery`
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
4. Click "Create new project" and wait for setup (2-3 minutes)

## Step 2: Run Database Migration

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL editor
5. Click "Run" to execute the migration
6. Verify tables were created: Go to **Table Editor** and you should see:
   - livreurs
   - users
   - courses
   - expenses
   - daily_payments
   - manquants

## Step 3: Create Admin User

1. In Supabase dashboard, go to **Authentication** → **Users**
2. Click "Add user" → "Create new user"
3. Fill in:
   - **Email**: `admin@globalexpress.local`
   - **Password**: Choose a strong password (this will be your admin login password)
   - **Auto Confirm User**: ✅ Check this box
4. Click "Create user"
5. Copy the **User UID** (you'll need it next)

6. Go back to **SQL Editor** and run this query (replace `YOUR_USER_UID` with the UID you copied):

```sql
INSERT INTO users (id, role, name, livreur_id) 
VALUES ('YOUR_USER_UID', 'admin', 'Admin', NULL);
```

## Step 4: Get Supabase Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values (you'll need them for Netlify):
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

## Step 5: Deploy to Netlify

### Option A: Deploy via Netlify Dashboard (Recommended)

1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "Add new site" → "Import an existing project"
3. Choose "Deploy with GitHub"
4. Authorize Netlify to access your GitHub account
5. Select your `global-express-delivery` repository
6. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
7. Click "Show advanced" → "New variable" and add:
   - **Key**: `VITE_SUPABASE_URL`
   - **Value**: Your Supabase Project URL
8. Add another variable:
   - **Key**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: Your Supabase anon public key
9. Click "Deploy site"

### Option B: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize Netlify site
netlify init

# Set environment variables
netlify env:set VITE_SUPABASE_URL "your_supabase_url"
netlify env:set VITE_SUPABASE_ANON_KEY "your_supabase_anon_key"

# Deploy
netlify deploy --prod
```

## Step 6: Verify Deployment

1. Once deployed, Netlify will provide a URL (e.g., `https://your-site.netlify.app`)
2. Visit the URL
3. Try logging in as admin:
   - Click "Administrateur"
   - Enter the password you set in Step 3
4. You should be redirected to the admin dashboard

## Step 7: Create Your First Livreur

1. In the admin dashboard, go to "Livreurs"
2. Click "Ajouter un livreur"
3. Fill in:
   - Name
   - Phone number
   - Password (this will be the livreur's login password)
4. Click "Ajouter"
5. The livreur can now login from any device!

## Step 8: Test Multi-Device Sync

1. **On Device A** (e.g., your computer):
   - Login as admin
   - Create a new course and assign it to a livreur

2. **On Device B** (e.g., your phone):
   - Login as that livreur
   - You should immediately see the course appear!

3. **On Device B**:
   - Mark the course as delivered

4. **On Device A**:
   - The course status should update in real-time!

## Troubleshooting

### Build Fails on Netlify

**Error**: "Missing environment variables"
- **Solution**: Make sure you added both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Netlify's environment variables

### Can't Login as Admin

**Error**: "Mot de passe incorrect"
- **Solution**: Make sure you created the admin user with email `admin@globalexpress.local` and inserted the user record in the `users` table

### Livreur Can't See Courses

**Error**: No courses showing for livreur
- **Solution**: Check that:
  1. The course was assigned to the correct livreur_id
  2. The livreur's user profile has the correct livreur_id set
  3. Row Level Security policies are enabled (they should be from the migration)

### Real-time Updates Not Working

**Solution**: 
1. In Supabase dashboard, go to **Database** → **Replication**
2. Make sure replication is enabled for all tables
3. Check browser console for WebSocket connection errors

## Updating Environment Variables

If you need to change environment variables after deployment:

1. Go to Netlify dashboard
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Edit the variables
5. Go to **Deploys** → **Trigger deploy** → **Clear cache and deploy site**

## Custom Domain (Optional)

1. In Netlify dashboard, go to **Domain settings**
2. Click "Add custom domain"
3. Follow the instructions to configure your DNS
4. Netlify will automatically provision SSL certificate

## Backup and Recovery

Supabase automatically backs up your database daily. To download a backup:

1. Go to Supabase dashboard → **Database** → **Backups**
2. Click "Download" on any backup

## Monitoring

- **Netlify Analytics**: Monitor site traffic and performance
- **Supabase Logs**: View database queries and errors in **Logs & Analytics**

## Cost Estimate

- **Supabase Free Tier**: 
  - 500 MB database
  - 2 GB bandwidth
  - 50,000 monthly active users
  - Unlimited API requests

- **Netlify Free Tier**:
  - 100 GB bandwidth
  - 300 build minutes/month
  - Automatic HTTPS

Both free tiers should be more than sufficient for a delivery management system with moderate usage.

## Next Steps

- Set up email notifications (optional)
- Configure custom domain
- Set up monitoring and alerts
- Train your team on the new system

## Support

If you encounter issues:
1. Check Netlify deploy logs
2. Check Supabase logs
3. Check browser console for errors
4. Verify environment variables are set correctly
