# Supabase Setup Guide

## Quick Start

Before you can run the application with Supabase, you need to:

1. **Create a Supabase project**
2. **Run the database migration**
3. **Create an admin user**
4. **Configure environment variables**

## Step-by-Step Instructions

### 1. Create Supabase Project (5 minutes)

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: `global-express-delivery`
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
5. Click "Create new project"
6. Wait 2-3 minutes for setup to complete

### 2. Run Database Migration (2 minutes)

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click "New Query"
3. Open the file `supabase/migrations/001_initial_schema.sql` in your code editor
4. Copy ALL the contents
5. Paste into the Supabase SQL Editor
6. Click "Run" (or press Ctrl+Enter)
7. You should see "Success. No rows returned"

### 3. Verify Tables Were Created

1. Click **Table Editor** in the left sidebar
2. You should see these tables:
   - ✅ livreurs
   - ✅ users
   - ✅ courses
   - ✅ expenses
   - ✅ daily_payments
   - ✅ manquants

### 4. Create Admin User (3 minutes)

#### 4a. Create Auth User

1. Go to **Authentication** → **Users**
2. Click "Add user" → "Create new user"
3. Fill in:
   - **Email**: `admin@globalexpress.local`
   - **Password**: Choose a strong password (THIS IS YOUR ADMIN LOGIN PASSWORD!)
   - **Auto Confirm User**: ✅ CHECK THIS BOX
4. Click "Create user"
5. **IMPORTANT**: Copy the **User UID** (it looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

#### 4b. Create User Profile

1. Go back to **SQL Editor**
2. Click "New Query"
3. Paste this SQL (replace `YOUR_USER_UID` with the UID you copied):

```sql
INSERT INTO users (id, role, name, livreur_id) 
VALUES ('YOUR_USER_UID', 'admin', 'Admin', NULL);
```

4. Click "Run"
5. You should see "Success. 1 rows affected"

### 5. Get Your Supabase Credentials

1. Go to **Settings** → **API** (gear icon in sidebar)
2. You'll need two values:
   - **Project URL**: Copy the URL (e.g., `https://xxxxx.supabase.co`)
   - **anon public key**: Copy the key under "Project API keys"

### 6. Configure Environment Variables

#### For Local Development:

1. Create a file called `.env` in your project root (same folder as `package.json`)
2. Add these lines (replace with your actual values):

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

3. Save the file

#### For Netlify Deployment:

1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Click "Add a variable"
5. Add:
   - **Key**: `VITE_SUPABASE_URL`
   - **Value**: Your Supabase URL
6. Click "Add a variable" again
7. Add:
   - **Key**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: Your Supabase anon key
8. Click "Save"

### 7. Test Locally

1. Start your development server:
```bash
npm run dev
```

2. Open http://localhost:8080
3. Click "Administrateur"
4. Enter the password you set in Step 4a
5. You should be logged in!

### 8. Create Your First Livreur

1. In the admin dashboard, go to "Livreurs"
2. Click "Ajouter un livreur"
3. Fill in:
   - **Name**: Test Livreur
   - **Phone**: +237 6XX XX XX XX
   - **Password**: Choose a password for this livreur
4. Click "Ajouter"

### 9. Test Livreur Login

1. Log out (click your name in the top right)
2. Click "Livreur"
3. Select "Test Livreur"
4. Enter the password you just set
5. You should be logged in as the livreur!

## Troubleshooting

### "Missing Supabase environment variables"

**Solution**: Make sure you created the `.env` file with the correct variable names (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`)

### "Mot de passe incorrect" when logging in as admin

**Solution**: 
1. Make sure you created the user with email `admin@globalexpress.local`
2. Make sure you inserted the user profile in the `users` table
3. Try the password you set in Step 4a

### Can't see any livreurs in the login screen

**Solution**: 
1. Make sure you're connected to the internet
2. Check the browser console for errors (F12)
3. Verify your Supabase credentials are correct

### Database migration fails

**Solution**:
1. Make sure you copied the ENTIRE SQL file
2. Try running it in smaller chunks if needed
3. Check for any error messages in the SQL Editor

## Next Steps

Once everything is working:

1. ✅ Deploy to Netlify (see `DEPLOYMENT.md`)
2. ✅ Add more livreurs
3. ✅ Start assigning courses
4. ✅ Test on multiple devices!

## Need Help?

- Check the browser console (F12) for errors
- Check Supabase logs: **Logs & Analytics** in dashboard
- Verify your environment variables are set correctly
