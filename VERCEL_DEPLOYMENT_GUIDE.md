# Complete Vercel Deployment Guide for SmartCart
**Latest Updated: December 2024**

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Method 1: Vercel Dashboard (Recommended)](#method-1-vercel-dashboard-recommended)
4. [Method 2: Vercel CLI](#method-2-vercel-cli)
5. [Environment Variables Setup](#environment-variables-setup)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Troubleshooting](#troubleshooting)
8. [Production Recommendations](#production-recommendations)

---

## Prerequisites

### Required Accounts
- ✅ GitHub account with repository access
- ✅ Vercel account (sign up at [vercel.com](https://vercel.com) - free tier works)

### Required Tools (for CLI method)
- Node.js 18.x or higher
- npm or yarn package manager
- Git installed

---

## Pre-Deployment Checklist

Before deploying, ensure:

- [x] Code pushed to GitHub repository
- [x] `vercel.json` exists in root directory
- [x] `api/[...path].js` serverless function exists
- [x] Build passes locally (`cd client && npm run build`)
- [x] All dependencies in `package.json` files
- [x] Environment variables documented

---

## Method 1: Vercel Dashboard (Recommended)

### Step 1: Connect GitHub Repository

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub (easiest method)

2. **Import Project**
   - Click **"Add New..."** → **"Project"**
   - Or click **"Import Project"** from dashboard
   - Select **"Import Git Repository"**

3. **Select Repository**
   - Find `smartcart-akedo` in your GitHub repositories
   - Click **"Import"**

### Step 2: Configure Project Settings

Vercel should auto-detect Next.js, but verify these settings:

#### Framework Preset
- **Framework**: `Next.js` (auto-detected)
- If not detected, select manually from dropdown

#### Root Directory
- **Root Directory**: Leave **blank** (project root contains everything)
- *Only change if your Next.js app is in a subdirectory*

#### Build and Output Settings
- **Build Command**: `cd client && npm run build`
- **Output Directory**: `client/.next`
- **Install Command**: `npm install && cd client && npm install`

#### Node.js Version
- **Node.js Version**: `18.x` (default, recommended)

### Step 3: Environment Variables

**Critical Step**: Add these environment variables in Vercel Dashboard:

1. Click **"Environment Variables"** section
2. Add each variable one by one:

```bash
# Application
NODE_ENV=production

# Server Configuration  
PORT=3001
CORS_ORIGIN=*

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=INFO

# Database (optional - for serverless, uses /tmp)
DB_PATH=/tmp/smartcart.db.json

# Encryption (required for data security)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=your_64_character_hex_encryption_key_here

# Amazon API (optional - for live integration)
AMAZON_ACCESS_KEY=your_access_key_here
AMAZON_SECRET_KEY=your_secret_key_here
AMAZON_TAG=your_partner_tag_here

# Walmart API (optional - for live integration)
WALMART_API_KEY=your_walmart_api_key_here
WALMART_CONSUMER_ID=your_consumer_id_here
```

**Environment Scope**: Select all three:
- ✅ Production
- ✅ Preview  
- ✅ Development

### Step 4: Deploy

1. Review all settings
2. Click **"Deploy"** button
3. Wait for build to complete (2-5 minutes)
4. Monitor build logs for any errors

### Step 5: Get Deployment URL

After deployment:
- Your app will be live at: `https://smartcart-akedo.vercel.app`
- Or custom domain if configured
- Production URL shown in dashboard

---

## Method 2: Vercel CLI

### Step 1: Install Vercel CLI

```bash
# Global installation
npm install -g vercel

# Or use npx (no installation needed)
npx vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

This will:
- Open browser for GitHub authentication
- Link your Vercel account

### Step 3: Navigate to Project

```bash
cd C:\Users\RICHEY_SON\Desktop\smartcart-akedo
```

### Step 4: Deploy (Preview)

```bash
vercel
```

**First-time prompts:**
```
? Set up and deploy "~/smartcart-akedo"? [Y/n] y
? Which scope do you want to deploy to? [Your Account]
? Link to existing project? [y/N] n
? What's your project's name? smartcart-akedo
? In which directory is your code located? ./
```

### Step 5: Configure Environment Variables (CLI)

```bash
# Add environment variables
vercel env add NODE_ENV production
vercel env add PORT 3001
vercel env add CORS_ORIGIN "*"
vercel env add RATE_LIMIT_WINDOW_MS 900000
vercel env add RATE_LIMIT_MAX 100
vercel env add LOG_LEVEL INFO
```

For each variable, select scope:
- Production ✅
- Preview ✅
- Development ✅

### Step 6: Deploy to Production

```bash
vercel --prod
```

This creates a production deployment at:
`https://smartcart-akedo.vercel.app`

---

## Environment Variables Setup

### Required Variables (Minimum)

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Application environment |
| `PORT` | `3001` | Server port (used by Express) |
| `CORS_ORIGIN` | `*` | CORS allowed origins |

### Recommended Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |
| `LOG_LEVEL` | `INFO` | Logging level |
| `DB_PATH` | `/tmp/smartcart.db.json` | Database path (serverless) |
| `ENCRYPTION_KEY` | `[64-char hex]` | AES-256 encryption key (generate random) |

### Optional Variables (For Live APIs)

| Variable | Value | Description |
|----------|-------|-------------|
| `AMAZON_ACCESS_KEY` | `your_key` | Amazon PA-API access key |
| `AMAZON_SECRET_KEY` | `your_secret` | Amazon PA-API secret |
| `AMAZON_TAG` | `your_tag` | Amazon affiliate tag |
| `WALMART_API_KEY` | `your_key` | Walmart API key |
| `WALMART_CONSUMER_ID` | `your_id` | Walmart consumer ID |

### How to Add in Dashboard

1. Go to Project → Settings → Environment Variables
2. Click **"Add New"**
3. Enter variable name
4. Enter variable value
5. Select environments (Production, Preview, Development)
6. Click **"Save"**
7. **Redeploy** for changes to take effect

---

## Post-Deployment Verification

### 1. Test Frontend Pages

```bash
# Landing Page
https://your-app.vercel.app/

# Dashboard
https://your-app.vercel.app/dashboard

# Inventory
https://your-app.vercel.app/dashboard/inventory

# Shopping Cart
https://your-app.vercel.app/dashboard/cart
```

### 2. Test API Endpoints

```bash
# Health Check
curl https://your-app.vercel.app/api/health

# Expected Response:
{
  "status": "ok",
  "timestamp": "2024-12-07T...",
  "uptime": "123s",
  "memory": {...}
}

# Inventory (should return empty array initially)
curl https://your-app.vercel.app/api/inventory

# Shopping List
curl https://your-app.vercel.app/api/forecast/shopping-list
```

### 3. Test Full Workflow

1. **Add Inventory Item**
   - Go to `/dashboard/inventory`
   - Click "Add Item"
   - Fill form and submit
   - Verify item appears

2. **Search Products**
   - Go to `/dashboard/cart`
   - Search for "milk" or "cooking oil"
   - Verify results appear

3. **Add to Cart**
   - Click "Add" on a product
   - Verify cart updates

4. **Checkout Flow**
   - Click "Proceed to Checkout"
   - Verify Order Approval Modal opens
   - Check budget validation works
   - Approve order

---

## Troubleshooting

### Issue: Build Fails

**Symptoms:**
- Build logs show errors
- Deployment doesn't complete

**Solutions:**

1. **Check Node.js Version**
   ```bash
   # In vercel.json, ensure:
   "functions": {
     "api/[...path].js": {
       "runtime": "nodejs18.x"
     }
   }
   ```

2. **Check Build Logs**
   - Go to Deployment → View Build Logs
   - Look for specific error messages
   - Common issues:
     - Missing dependencies
     - TypeScript errors
     - Build command wrong

3. **Verify Build Locally**
   ```bash
   cd client
   npm run build
   ```
   Fix any local errors first

### Issue: API Routes Return 404

**Symptoms:**
- Frontend loads but API calls fail
- Network tab shows 404 errors

**Solutions:**

1. **Check Serverless Function**
   - Go to Deployment → Functions tab
   - Verify `api/[...path].js` is deployed
   - Check function logs for errors

2. **Verify vercel.json**
   ```json
   {
     "functions": {
       "api/[...path].js": {
         "runtime": "nodejs18.x"
       }
     }
   }
   ```

3. **Check Function Logs**
   - Vercel Dashboard → Deployment → Functions
   - Click on function → View Logs
   - Look for runtime errors

### Issue: Database Not Persisting

**Symptoms:**
- Data disappears after some time
- Items added then lost

**Cause:**
- Serverless functions use `/tmp` directory
- Data is ephemeral (lost on cold start)

**Solutions:**

1. **Immediate Fix**: This is expected behavior for serverless
   - Data persists only during function execution
   - For demo: Acceptable
   - For production: Use external database

2. **Production Fix**: Migrate to external database
   - Use Vercel Postgres (recommended)
   - Or MongoDB Atlas
   - Or Supabase

### Issue: CORS Errors

**Symptoms:**
- Browser console shows CORS errors
- API calls blocked

**Solution:**
1. Verify `CORS_ORIGIN` environment variable
2. Set to `*` for all origins (development)
3. Or set to your Vercel domain (production)

### Issue: Function Timeout

**Symptoms:**
- API calls timeout after 30 seconds
- Long-running operations fail

**Solution:**
1. Check function timeout in `vercel.json`:
   ```json
   "functions": {
     "api/[...path].js": {
       "maxDuration": 30
     }
   }
   ```
2. Maximum is 60 seconds on Pro plan
3. Optimize slow operations

---

## Production Recommendations

### 1. Database Migration

**Current**: File-based JSON in `/tmp` (ephemeral)

**Recommended**: Use Vercel Postgres

```bash
# In Vercel Dashboard
1. Go to Storage → Create Database → Postgres
2. Get connection string
3. Install pg package: npm install pg
4. Update src/db/index.js to use Postgres
```

### 2. Environment Variables Security

- ✅ Never commit `.env` files
- ✅ Use Vercel's environment variable UI
- ✅ Use different values for production/preview
- ✅ Rotate API keys regularly

### 3. Custom Domain Setup

1. Go to Project → Settings → Domains
2. Click "Add Domain"
3. Enter your domain name
4. Follow DNS configuration instructions
5. Vercel handles SSL automatically

### 4. Monitoring & Analytics

**Enable Vercel Analytics:**
1. Go to Project → Analytics
2. Enable Web Analytics (free tier)
3. Monitor:
   - Page views
   - Performance metrics
   - Function execution times

**Enable Logs:**
1. Go to Deployment → Functions
2. View real-time logs
3. Set up alerts for errors

### 5. Performance Optimization

**Optimize Bundle Size:**
- Already using Next.js optimizations
- Code splitting automatic
- Image optimization enabled

**CDN Configuration:**
- Vercel provides global CDN automatically
- No additional configuration needed

### 6. CI/CD Pipeline

**Auto-Deployments:**
- ✅ Enabled by default
- Production: Deploys on `main` branch pushes
- Preview: Deploys on pull requests

**Branch Protection:**
1. Configure in GitHub
2. Require PR reviews before merge
3. Run tests before deployment

---

## Deployment URLs Structure

After deployment, you'll have:

```
Production:    https://smartcart-akedo.vercel.app
Preview:       https://smartcart-akedo-git-[branch]-[username].vercel.app
Functions:     https://smartcart-akedo.vercel.app/api/*
```

---

## Quick Reference Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployments
vercel ls

# View logs
vercel logs [deployment-url]

# Remove deployment
vercel remove [deployment-name]

# Link to existing project
vercel link

# Pull environment variables
vercel env pull .env.local
```

---

## Success Criteria

✅ Deployment successful when:

1. **Build completes** without errors
2. **Frontend loads** at deployment URL
3. **API health check** returns 200 OK
4. **Dashboard pages** render correctly
5. **API endpoints** respond correctly
6. **No CORS errors** in browser console
7. **Functions execute** without timeouts

---

## Next Steps After Deployment

1. ✅ Test all features end-to-end
2. ✅ Share deployment URL for demo
3. ✅ Monitor function logs for errors
4. ✅ Set up custom domain (optional)
5. ✅ Configure database for production (recommended)
6. ✅ Set up monitoring and alerts
7. ✅ Document deployment process

---

## Support & Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Vercel Status**: [vercel-status.com](https://vercel-status.com)
- **Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

---

**Your SmartCart project is now ready for production deployment! 🚀**

