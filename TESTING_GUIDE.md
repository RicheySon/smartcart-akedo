# SmartCart E2E Testing Guide

## ✅ Complete Workflow Test

Follow these steps to verify all hackathon requirements work correctly:

### Step 1: Add Inventory Items
1. Navigate to `http://localhost:5173` (frontend should be running)
2. Click **"Inventory"** in the left sidebar
3. Click the **"➕ Add Item"** button (top right)
4. Fill in the modal form:
   - **Item Name**: Organic Milk
   - **Quantity**: 2
   - **Unit**: gallon
   - **Category**: Dairy
   - **Price**: 5.99
5. Click **"Add Item"** button
6. ✅ **Verify**: Item appears in inventory grid with "Good" badge

### Step 2: Add More Items (Optional)
Repeat Step 1 with:
- Whole Wheat Bread (1, loaf, Bakery, $2.49)
- Fresh Bananas (3, lb, Produce, $1.50)

### Step 3: Build Shopping Cart
1. Click **"Shopping Cart"** in the sidebar
2. In the search box, type: **milk**
3. Click the **"Search"** button
4. ✅ **Verify**: Amazon and Walmart products appear
5. ✅ **Verify**: Price comparison and recommendation shown
6. Click **"Add"** button on either Amazon or Walmart product
7. ✅ **Verify**: Product appears in cart below

### Step 4: Order Approval (Critical Hackathon Requirement)
1. Click **"✓ Proceed to Checkout"** button
2. ✅ **Verify**: Order Approval modal opens with:
   - Order Summary (item count, total cost)
   - Budget Status (should show "Within budget")
   - List of items with vendor and prices
3. Review the order details
4. Click **"✓ Approve & Place Order"** button
5. ✅ **Verify**: Success message appears
6. ✅ **Verify**: Page refreshes and cart is empty
7. ✅ **Verify**: Inventory updated (if you search for the item)

### Step 5: Test Budget Validation
1. Go to **Shopping Cart**
2. Search and add multiple expensive items (total > $500)
3. Click **"Proceed to Checkout"**
4. ✅ **Verify**: Budget Status shows "Exceeds budget cap"
5. ✅ **Verify**: "Approve" button is **disabled**
6. ✅ **Verify**: Warning message displays

## 🎯 What This Demonstrates

✅ **Inventory Management** - Manual CRUD operations
✅ **AI Integration** - Product price comparison (Amazon vs Walmart)
✅ **Shopping Cart** - Multi-vendor cart building
✅ **Order Approval Flow** - User approval with budget validation (CRITICAL)
✅ **Budget Controls** - Spend caps enforced
✅ **Privacy** - All data encrypted (backend)
✅ **Modern UI** - Professional SaaS design

## 📸 For Hackathon Submission

Take screenshots of:
1. Dashboard with predictions
2. Inventory with multiple items
3. Cart with price comparison
4. **Order Approval modal (most important!)**
5. Success message after order placement

## 🎬 Recording Demo Video

Record your screen showing the complete workflow (Step 1-4) above. This is required for hackathon submission per the requirements.
