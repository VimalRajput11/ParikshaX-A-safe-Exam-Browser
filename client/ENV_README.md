# Environment Configuration

This project uses different environment files for local development and production deployment.

## Files:

- **`.env`** - Default production configuration (used by Vercel)
- **`.env.local`** - Local development configuration (ignored by git)
- **`.env.production`** - Production configuration (backup)

## Usage:

### For Local Development:
1. The `.env.local` file will automatically be used when running `npm run dev`
2. It points to `http://localhost:5000/api`
3. Make sure your local backend server is running on port 5000

### For Production Deployment:
1. The `.env` or `.env.production` file will be used
2. It points to `https://pariksha-x-a-safe-exam-browser.vercel.app/api`
3. Vercel will automatically use this when building

## Current Configuration:

- **Local API**: `http://localhost:5000/api`
- **Production API**: `https://pariksha-x-a-safe-exam-browser.vercel.app/api`

## Note:
Vite automatically loads environment files in this priority:
1. `.env.local` (highest priority, for local overrides)
2. `.env.production` (when building for production)
3. `.env` (default fallback)
