# Database Setup Guide

## Environment Variables Required

Make sure you have these environment variables in your `.env` file:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Supabase Database Connection
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
DIRECT_URL="postgresql://user:password@host:port/database?sslmode=require"
```

## For Supabase:

1. Go to your Supabase project dashboard
2. Navigate to Settings → Database
3. Copy the "Connection string" under "Connection pooling" (for `DATABASE_URL`)
4. Copy the "Connection string" under "Direct connection" (for `DIRECT_URL`)

The connection string format should look like:
```
postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

## Verify Database Connection

1. **Check Prisma Client**: Run `npx prisma generate` (when dev server is stopped)
2. **Test Connection**: After signing in, check:
   - Browser console for sync messages
   - Server terminal for database connection logs
   - Visit `/api/sync-user` (while signed in) to manually trigger sync
3. **Check Supabase**: Go to your Supabase dashboard → Table Editor → `users` table

## How to Check if Users are in Database

### Method 1: Test Page (Easiest)
1. Sign in to your application
2. Visit: `http://localhost:3000/test-users`
3. You'll see:
   - Your current Clerk user info
   - Whether you exist in the database
   - All users in the database in a table

### Method 2: Supabase Dashboard
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click on "Table Editor" in the left sidebar
4. Click on the `users` table
5. You should see all users with their data (id, clerkUserId, email, name, etc.)

### Method 3: Server Terminal Logs
After signing in, check your terminal for:
- `checkUser: ✅ Successfully created new DB user` - New user created
- `checkUser: User already exists in DB` - User already synced
- `checkUser: ❌ Error syncing user to database` - Error occurred

### Method 4: API Endpoint
1. Sign in to your application
2. Visit: `http://localhost:3000/api/sync-user`
3. You'll see JSON response with user data or error message

## Troubleshooting

- If users aren't being created, check:
  1. Environment variables are set correctly
  2. Database connection string is valid
  3. Prisma migrations are applied: `npx prisma migrate deploy`
  4. Check server console for error messages
  5. Verify Clerk user has an email address

