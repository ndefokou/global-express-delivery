# Service Role Key Setup

## Why is this needed?

Creating livreurs requires using Supabase's Admin API (`supabase.auth.admin.createUser()`), which needs elevated permissions beyond the regular `anon` key.

## Security Warning

⚠️ **IMPORTANT**: The Service Role Key bypasses Row Level Security (RLS) and should **NEVER** be exposed in client-side code in production.

For this application, since it's an internal admin tool, we're using it client-side. In a production environment, you should move admin operations to a secure backend API.

## Setup Instructions

1. Go to your Supabase Dashboard → **Settings** → **API**
2. Find the **Service Role Key** (starts with `eyJ...`)
3. **Copy** this key
4. Open your `.env` file
5. Add a new line:
   ```
   VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
6. **Restart your dev server** (`npm run dev`)

## Alternative: Manual Livreur Creation

If you don't want to use the Service Role Key, you can create livreurs manually:

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click "Add user" → "Create new user"
3. Email: `livreur-{any-unique-id}@globalexpress.local`
4. Password: (choose a password)
5. Check "Auto Confirm User"
6. Click "Create user"
7. Copy the User UID
8. Go to **SQL Editor** and run:
   ```sql
   -- First, insert into livreurs table
   INSERT INTO livreurs (name, phone, active)
   VALUES ('Livreur Name', '+237 6XX XX XX XX', true)
   RETURNING id;
   
   -- Copy the returned UUID, then insert into users table
   INSERT INTO users (id, role, name, livreur_id)
   VALUES ('USER_UID_FROM_STEP_7', 'livreur', 'Livreur Name', 'LIVREUR_ID_FROM_ABOVE');
   ```
