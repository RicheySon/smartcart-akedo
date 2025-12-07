# 🚀 Quick Vercel Deployment Guide

## Fastest Way to Deploy (5 Minutes)

### Step 1: Go to Vercel
👉 https://vercel.com/new

### Step 2: Import Repository
1. Click **"Import Git Repository"**
2. Select `smartcart-akedo` from your GitHub
3. Click **"Import"**

### Step 3: Configure (Auto-Detected)
Vercel should auto-detect:
- ✅ Framework: **Next.js**
- ✅ Root Directory: **blank** (or `client` if needed)
- ✅ Build Command: **`cd client && npm run build`**
- ✅ Output Directory: **`client/.next`**

### Step 4: Add Environment Variables
Click **"Environment Variables"** and add:

```env
NODE_ENV=production
PORT=3001
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
LOG_LEVEL=INFO
ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
```

**To generate encryption key:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 5: Deploy
Click **"Deploy"** button and wait 2-5 minutes.

### Step 6: Test
Your app will be at: `https://smartcart-akedo.vercel.app`

Test these URLs:
- ✅ `/` - Landing page
- ✅ `/dashboard` - Dashboard
- ✅ `/api/health` - Health check

---

## Alternative: Vercel CLI

```bash
# Install CLI
npm i -g vercel

# Deploy
vercel --prod
```

---

## Environment Variables (Quick Copy)

Paste these in Vercel Dashboard → Settings → Environment Variables:

```
NODE_ENV=production
PORT=3001
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
LOG_LEVEL=INFO
ENCRYPTION_KEY=<generate-64-char-hex-key>
```

**Generate Encryption Key:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## ✅ Success Checklist

After deployment, verify:
- [ ] Build completed without errors
- [ ] Frontend loads at deployment URL
- [ ] `/api/health` returns 200 OK
- [ ] Dashboard pages render
- [ ] Can add items to inventory
- [ ] Can search products
- [ ] Can add to cart
- [ ] Order approval modal works

---

## 🆘 Quick Troubleshooting

**Build fails?**
- Check build logs in Vercel dashboard
- Verify Node.js version is 18.x

**API 404?**
- Check serverless function exists: `api/[...path].js`
- View function logs in Vercel dashboard

**CORS errors?**
- Verify `CORS_ORIGIN=*` in environment variables
- Redeploy after adding variables

---

**That's it! Your app should be live in ~5 minutes! 🎉**

