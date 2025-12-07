# SmartCart Integration Guide

## Architecture Overview

```
USER (Browser)
    ↓
Next.js Frontend (Port 3000)
    ↓ /api/* requests proxied via next.config.js
Express Backend (Port 3001)
    ↓
Database (JSON with encryption)
```

## How Integration Works

### 1. **API Proxy Configuration**
The Next.js frontend uses rewrites in `next.config.js`:
```javascript
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'http://localhost:3001/api/:path*',
    },
  ]
}
```

This means:
- Frontend makes request to: `http://localhost:3000/api/inventory`
- Next.js automatically forwards to: `http://localhost:3001/api/inventory`
- User's browser never directly calls the backend

### 2. **API Client (`lib/api.ts`)**
- Uses TanStack Query for data fetching
- Makes fetch requests to `/api/*` endpoints
- Automatic caching and revalidation
- Type-safe with TypeScript

### 3. **Backend API Routes**
All routes are prefixed with `/api`:
- `/api/inventory` - CRUD operations
- `/api/forecast/shopping-list` - AI predictions
- `/api/cart` - Cart management
- `/api/orders/preview` - Order preview
- `/api/orders/checkout` - Place order
- `/api/shopping/compare/:item` - Product comparison

## Testing Integration

### ✅ Step 1: Verify Both Servers Running
```bash
# Terminal 1 - Backend (should show port 3001)
cd c:\Users\RICHEY_SON\Desktop\smartcart-akedo
npm run dev

# Terminal 2 - Frontend (should show port 3000)
cd c:\Users\RICHEY_SON\Desktop\smartcart-akedo\client
npm run dev
```

### ✅ Step 2: Test Backend API Directly
Open browser or use curl:
```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Test inventory
curl http://localhost:3001/api/inventory
```

### ✅ Step 3: Test Frontend Pages
1. **Landing Page**: http://localhost:3000
2. **Dashboard**: http://localhost:3000/dashboard
3. **Inventory**: http://localhost:3000/dashboard/inventory
4. **Cart**: http://localhost:3000/dashboard/cart

### ✅ Step 4: Test Full Workflow
1. Add Item to Inventory
   - Click "Add Item" button
   - Fill form and submit
   - Should see success message
   - Item appears in grid

2. Search for Product (Cart)
   - Go to Shopping Cart
   - Search for "milk" or "bread"
   - Should see Amazon/Walmart products
   - Click "Add" to add to cart

3. View Cart
   - Items should appear
   - Remove button works
   - Total price updates

4. Checkout (when implemented)
   - Click "Proceed to Checkout"
   - Should show order preview with budget validation

## Common Issues & Solutions

### Issue: Items not showing in inventory after adding
**Solution**: Check browser console (F12) for errors. The backend might be returning data in unexpected format. Error handling will show alerts.

### Issue: Cart search not working
**Solution**: 
1. Verify backend is running on port 3001
2. Check console for CORS errors
3. Backend has CORS enabled with `origin: '*'` so should work

### Issue: 404 on API calls
**Solution**:
1. Make sure both servers are running
2. Clear browser cache
3. Restart Next.js dev server

### Issue: Data not persisting
**Solution**: Backend uses JSON file storage in `data/smartcart.json`. Check if file exists and has proper permissions.

## CORS Configuration

Backend is configured to accept requests from any origin:
```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
```

The Next.js proxy means browser never sees CORS issues since requests appear same-origin.

## Environment Variables

### Backend (.env)
```
PORT=3001
CORS_ORIGIN=*
```

### Frontend
No environment variables needed - proxy configured in `next.config.js`

## Production Deployment Notes

For production, update:
1. Backend CORS origin to your actual frontend domain
2. Next.js rewrites to point to production backend URL
3. Use environment variables for API URLs
4. Enable HTTPS
