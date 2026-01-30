# Vercel Deployment Guide for Lexicon Master

## Prerequisites

✅ Vercel account
✅ PostgreSQL database (Neon, Supabase, or similar)
✅ GitHub repository connected to Vercel

## Step 1: Database Setup

### Updated Schema
The `schema.prisma` file has been updated to use PostgreSQL instead of SQLite:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Create Migration for PostgreSQL

Since the existing migrations were SQLite-specific, you need to create a fresh migration for PostgreSQL:

```bash
# Reset migrations (backup if needed)
rm -rf prisma/migrations

# Create new PostgreSQL migration
npx prisma migrate dev --name init
```

Or push the schema directly to your production database:

```bash
# Push schema without migration files
npx prisma db push
```

## Step 2: Environment Variables on Vercel

You've already added these (✅):

1. **DATABASE_URL**: Your PostgreSQL connection string from Neon
   ```
   postgresql://[user]:[password]@[host]/[database]?sslmode=require
   ```

2. **JWT_SECRET**: Random secure string
   ```bash
   # Generate with:
   openssl rand -base64 32
   ```

3. **NEXTAUTH_SECRET**: Random secure string
   ```bash
   # Generate with:
   openssl rand -base64 32
   ```

4. **NEXTAUTH_URL**: Your production URL
   ```
   https://your-app.vercel.app
   ```

### Important: Apply to All Environments

Make sure these environment variables are applied to:
- ✅ Production
- ✅ Preview
- ✅ Development

## Step 3: Updated Build Configuration

The `vercel.json` and `package.json` have been updated:

### vercel.json
```json
{
  "buildCommand": "prisma generate && prisma migrate deploy && npm run build",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "outputDirectory": ".next"
}
```

### package.json (build script)
```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build",
    "postinstall": "prisma generate"
  }
}
```

## Step 4: Deploy

### Option A: Push to GitHub (Recommended)

```bash
# Commit the changes
git add .
git commit -m "feat: migrate to PostgreSQL for Vercel deployment"
git push origin main
```

Vercel will automatically trigger a new deployment.

### Option B: Manual Deploy via Vercel CLI

```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Deploy
vercel --prod
```

## Step 5: Initialize Database

After deployment, you need to run migrations on your production database:

### Option 1: Via Vercel Dashboard
1. Go to your project settings
2. Navigate to Environment Variables
3. Ensure DATABASE_URL is set correctly
4. Trigger a new deployment

### Option 2: Run Migrations Locally Against Production DB

```bash
# Set production DATABASE_URL temporarily
export DATABASE_URL="postgresql://[production-connection-string]"

# Run migrations
npx prisma migrate deploy

# Or push schema directly
npx prisma db push
```

## Troubleshooting

### Error: "Can't reach database server"
- ✅ Check DATABASE_URL is correctly formatted
- ✅ Ensure your database allows connections from Vercel IPs
- ✅ Verify SSL mode is included: `?sslmode=require`

### Error: "Prisma Client not initialized"
- ✅ Ensure `postinstall` script runs: `"postinstall": "prisma generate"`
- ✅ Check build logs for Prisma generation
- ✅ Redeploy after clearing build cache

### Error: "Table does not exist"
- ✅ Run `npx prisma db push` or `npx prisma migrate deploy`
- ✅ Check database connection and permissions
- ✅ Verify migrations were applied

### Build Fails
1. Check Vercel build logs
2. Ensure all dependencies are in `dependencies` (not `devDependencies`)
3. Clear build cache and redeploy

### Environment Variables Not Working
1. Verify they're set in Vercel dashboard
2. Check they're applied to the correct environment (Production/Preview)
3. Redeploy after adding new variables

## Testing the Deployment

### 1. Health Check
```bash
curl https://your-app.vercel.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "...",
  "version": "1.0.0"
}
```

### 2. Test User Registration
```bash
curl -X POST https://your-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 3. Test Login
```bash
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

## Security Checklist

- ✅ Strong JWT_SECRET and NEXTAUTH_SECRET (32+ characters)
- ✅ DATABASE_URL contains SSL mode
- ✅ NEXTAUTH_URL matches production domain
- ✅ All secrets are encrypted in Vercel
- ✅ Database has proper access controls
- ✅ CORS headers configured correctly

## Next Steps

1. **Monitor Deployment**: Check Vercel deployment logs
2. **Test API Endpoints**: Verify all routes work correctly
3. **Database Access**: Ensure Prisma can connect and query
4. **User Testing**: Create test users and projects
5. **Performance**: Monitor response times and optimize

## Quick Commands Reference

```bash
# View deployment logs
vercel logs

# Check environment variables
vercel env ls

# Pull environment variables locally
vercel env pull

# Redeploy
vercel --prod

# View project info
vercel project ls
```

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Deployment Guides](https://www.prisma.io/docs/guides/deployment)
- [Neon Postgres](https://neon.tech/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**Status**: Ready to deploy! The application has been configured for PostgreSQL and Vercel serverless deployment.
