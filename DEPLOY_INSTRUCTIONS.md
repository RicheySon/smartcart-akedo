# 🚀 SmartCart - Vercel Deployment Instructions
**Latest Method - December 2024**

---

## ⚡ Quick Start (Recommended Method)

### Option A: Vercel Dashboard (Easiest - 5 Minutes)

#### 1. Prepare Your Repository
✅ Ensure code is pushed to GitHub
```bash
git push origin main
```

#### 2. Go to Vercel Dashboard
👉 **https://vercel.com/new**

#### 3. Import Project
- Click **"Import Git Repository"**
- Authorize GitHub access (if first time)
- Select repository: **`smartcart-akedo`**
- Click **"Import"**

#### 4. Configure Project

**Auto-Detected Settings** (Vercel should detect these automatically):
- Framework: **Next.js**
- Root Directory: **Leave blank** (root directory)
- Build Command: **`cd client && npm run build`**
- Output Directory: **`client/.next`**
- Install Command: **`npm install && cd client && npm install`**

**Manual Override** (if auto-detection fails):
1. Click **"Override"** next to Framework Preset
2. Select **"Next.js"** from dropdown
3. Manually set the commands above

#### 5. Environment Variables (CRITICAL)

Click **"Environment Variables"** section and add each:

**Required Variables:**
```
NODE_ENV = production
PORT = 3001
CORS_ORIGIN = *
ENCRYPTION_KEY = [generate 64-char hex key]
```

**Recommended Variables:**
```
RATE_LIMIT_WINDOW_MS = 900000
RATE_LIMIT_MAX = 100
LOG_LEVEL = INFO
DB_PATH = /tmp/smartcart.db.json
```

**How to Generate Encryption Key:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the 64-character output and paste as `ENCRYPTION_KEY` value.

**For each variable:**
- ✅ Check **Production**
- ✅ Check **Preview**
- ✅ Check **Development**

#### 6. Deploy
1. Review all settings
2. Click **"Deploy"** button
3. Wait for build (2-5 minutes)
4. Monitor build logs

#### 7. Get Your URL
After successful deployment:
- Production URL: `https://smartcart-akedo.vercel.app`
- Or your custom domain if configured

---

### Option B: Vercel CLI (Alternative)

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Login
```bash
vercel login
```
- Opens browser for authentication
- Click **"Authorize"**

#### 3. Navigate to Project
```bash
cd C:\Users\RICHEY_SON\Desktop\smartcart-akedo
```

#### 4. Deploy Preview
```bash
vercel
```

Follow prompts:
- Set up and deploy? **Y**
- Which scope? **[Your Account]**
- Link to existing project? **N** (first time) or **Y** (if exists)
- Project name: **smartcart-akedo**
- Directory: **./** (current directory)

#### 5. Add Environment Variables

```bash
# Add each variable
vercel env add NODE_ENV production
vercel env add PORT 3001
vercel env add CORS_ORIGIN "*"
vercel env add RATE_LIMIT_WINDOW_MS 900000
vercel env add RATE_LIMIT_MAX 100
vercel env add LOG_LEVEL INFO
vercel env add ENCRYPTION_KEY [paste-your-64-char-key]

# For each, select: Production, Preview, Development
```

#### 6. Deploy to Production
```bash
vercel --prod
```

---

## 🔍 Post-Deployment Verification

### Test Frontend
```
https://your-app.vercel.app/
https://your-app.vercel.app/dashboard
https://your-app.vercel.app/dashboard/inventory
https://your-app.vercel.app/dashboard/cart
```

### Test API Endpoints
```bash
# Health Check
curl https://your-app.vercel.app/api/health

# Should return:
{
  "status": "ok",
  "timestamp": "...",
  "uptime": "...",
  "memory": {...}
}
```

### Test Full Workflow
1. ✅ Add inventory item
2. ✅ Search for products
3. ✅ Add to cart
4. ✅ Checkout with order approval
5. ✅ Verify budget validation works

---

## ⚙️ Project Configuration

### File Structure for Vercel

```
smartcart-akedo/
├── api/
│   └── [...path].js          # Serverless function wrapper
├── client/                    # Next.js frontend
│   ├── app/                   # Pages
│   ├── components/            # React components
│   └── package.json
├── src/                       # Express backend
│   ├── controllers/
│   ├── services/
│   └── routes/
├── vercel.json               # Vercel configuration
└── package.json
```

### vercel.json Configuration

```json
{
  "version": 2,
  "buildCommand": "cd client && npm run build",
  "outputDirectory": "client/.next",
  "installCommand": "npm install && cd client && npm install",
  "framework": "nextjs",
  "functions": {
    "api/[...path].js": {
      "runtime": "nodejs18.x",
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

---

## 🐛 Common Issues & Solutions

### Issue: Build Fails

**Error**: "Module not found" or "Build failed"

**Solution**:
1. Check build logs in Vercel dashboard
2. Verify all dependencies in `package.json`
3. Test build locally: `cd client && npm run build`
4. Fix any TypeScript/linting errors

### Issue: API Routes Return 404

**Error**: API calls fail with 404

**Solution**:
1. Verify `api/[...path].js` exists
2. Check function logs in Vercel: Deployment → Functions → Logs
3. Ensure `vercel.json` has correct function configuration
4. Verify Express app exports correctly

### Issue: Environment Variables Not Working

**Error**: Variables not being read

**Solution**:
1. Check variables are added in Vercel dashboard
2. Ensure they're enabled for Production environment
3. **Redeploy** after adding variables (they don't auto-update)
4. Verify variable names match code exactly

### Issue: Database Not Persisting

**Behavior**: Data disappears after some time

**Explanation**: This is expected! Serverless functions use `/tmp` which is ephemeral.

**For Production**: 
- Use Vercel Postgres
- Or MongoDB Atlas
- Or Supabase

---

## 📊 Deployment Checklist

Before deploying, verify:

- [ ] Code pushed to GitHub
- [ ] `vercel.json` exists
- [ ] `api/[...path].js` exists
- [ ] Build passes locally: `cd client && npm run build`
- [ ] All environment variables documented
- [ ] Encryption key generated
- [ ] Tested locally with `npm run dev`

After deploying, verify:

- [ ] Build completed successfully
- [ ] Frontend loads at deployment URL
- [ ] API health endpoint works
- [ ] Can add inventory items
- [ ] Can search products
- [ ] Cart functionality works
- [ ] Order approval modal works
- [ ] No console errors in browser

---

## 🔐 Security Notes

### Encryption Key

**IMPORTANT**: Generate a secure encryption key:

```bash
# Generate 64-character hex key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Never commit** the encryption key to git!
- Store only in Vercel environment variables
- Use different keys for production/preview/dev

### Environment Variables Best Practices

✅ **Do**:
- Use Vercel's environment variable UI
- Set different values for production/preview/dev
- Rotate keys periodically
- Use strong, random encryption keys

❌ **Don't**:
- Commit `.env` files
- Share keys in code or documentation
- Use the same keys across environments
- Hardcode sensitive values

---

## 📈 Monitoring & Maintenance

### View Logs

**In Vercel Dashboard**:
1. Go to your project
2. Click on deployment
3. Click **"Functions"** tab
4. View real-time logs

**Via CLI**:
```bash
vercel logs [deployment-url]
```

### Monitor Performance

**Analytics**:
1. Go to Project → Analytics
2. Enable Web Analytics (free)
3. Monitor:
   - Page views
   - Performance
   - Function execution time

### Update Deployment

**Automatic**:
- Push to `main` branch → Auto-deploys to production
- Create PR → Auto-deploys preview

**Manual**:
```bash
vercel --prod
```

---

## 🎯 Next Steps

After successful deployment:

1. ✅ Share deployment URL
2. ✅ Test all features end-to-end
3. ✅ Set up custom domain (optional)
4. ✅ Configure database for production (recommended)
5. ✅ Enable analytics and monitoring
6. ✅ Set up alerts for errors

---

## 📚 Additional Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Vercel CLI Reference**: https://vercel.com/docs/cli
- **Serverless Functions**: https://vercel.com/docs/functions

---

## ✅ Deployment Status

Your project is **READY** for deployment!

**Configuration**: ✅ Complete
**Build**: ✅ Passing
**Serverless Function**: ✅ Configured
**Documentation**: ✅ Complete

**Deploy now and your SmartCart will be live! 🚀**


