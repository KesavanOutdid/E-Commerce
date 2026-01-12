# E-Commerce Cart & Order API Changes Summary

## Overview
This document outlines the major changes made to the Cart and Order APIs to support product variants and wallet management.

## Key Changes

### 1. **Cart System** - Changed from `sellerProductId` to `variantId`

#### Cart Model Updates (`models/Cart.js`)
- Changed parameter from `sellerProductId` to `variantId` in all methods
- Auto-increment quantity when same product+variant is added again (instead of error)
- Updated methods:
  - `findItemInCart(userId, productId, variantId)`
  - `addItem()` - Now updates qty if item exists
  - `removeItem(userId, productId, variantId, userEmail)`
  - `updateItemQty(userId, productId, variantId, updateData, userEmail)`

#### Cart Controller Updates (`controllers/cart/cartController.js`)
- Uses `ProductVariant` model instead of `SellerProduct`
- Changed all references from `sellerProductId` to `variantId`
- When adding duplicate items, automatically updates quantity
- Validates variant approval status and stock availability

#### Cart API Request Format

**Add to Cart:**
```json
{
  "variantId": "7df8cf9c-71aa-410d-baee-3be19fac7972",
  "productId": "ca53ac88-9356-4cff-905c-9064218eba38",
  "sellerId": "71c5ee2c-eb16-4f70-b3cd-a92d56da4b71",
  "qty": 2,
  "totalPrice": 45230,
  "gst": 230,
  "subTotal": 45000,
  "salePrice": 43200
}
```

**Update Cart:**
```json
{
  "variantId": "7df8cf9c-71aa-410d-baee-3be19fac7972",
  "qty": 5,
  "totalPrice": 113075,
  "gst": 575,
  "subTotal": 112500
}
```

**Remove from Cart:**
```
DELETE /api/cart/remove/:productId?variantId=7df8cf9c-71aa-410d-baee-3be19fac7972
```

---

### 2. **Order System** - ProductVariant Integration

#### Order Controller Updates (`controllers/orders/orderController.js`)
- Uses `ProductVariant` model instead of `SellerProduct`
- Changed all references from `sellerProductId` to `variantId`
- Stock reduction uses `ProductVariant.reduceStock(variantId, qty)`
- Platform fee processing updated to use `variantId`

#### Order Creation Flow (COD):
1. Validate cart items and variant stock
2. Create order with variant information
3. **Reduce stock** from `product_variants` table
4. **Update wallets**:
   - Seller's `sellerWallet` += earnings
   - Admin's `adminWallet` += platform fees (5%)
5. Create payment history record
6. Clear cart

#### Order Creation Flow (Online Payment):
1. Validate cart items and variant stock
2. Create order and Razorpay order
3. Return payment details to frontend
4. **After payment verification**:
   - Reduce stock from `product_variants` table
   - Update seller wallet and admin wallet
   - Create payment history
   - Clear cart

---

### 3. **User Wallet System**

#### User Model Updates (`models/User.js`)
- Added new fields:
  - `sellerWallet`: Cumulative seller earnings
  - `adminWallet`: Cumulative platform fees collected
- Updated methods:
  - `addSellerEarnings(userId, amount)` - Increments both `sellerEarnings` and `sellerWallet`
  - `addPlatformFees(userId, amount)` - Increments both `platformFees` and `adminWallet`

#### Platform Fee Logic:
- **Platform Fee**: 5% of sale price
- **Seller Earnings**: Sale price - Platform fee
- Applied after successful COD order or online payment verification
- Stored in `price_history` collection for auditing

---

### 4. **Database Collections**

#### product_variants Collection
```json
{
  "variantId": "7df8cf9c-71aa-410d-baee-3be19fac7972",
  "productId": "ca53ac88-9356-4cff-905c-9064218eba38",
  "sellerId": "71c5ee2c-eb16-4f70-b3cd-a92d56da4b71",
  "attributes": [
    {"name": "Color", "value": "Titanium Gold"},
    {"name": "RAM", "value": "6 GB"},
    {"name": "Storage", "value": "128 GB"}
  ],
  "price": 14999,
  "salePrice": 12997,
  "stock": 12,
  "images": ["image1.jpg", "image2.jpg"],
  "deliveryDays": 3,
  "pickupAddress": "975176d0-660a-40f6-a937-2590cd0bebad",
  "approvalStatus": "approved",
  "status": true
}
```

#### carts Collection
```json
{
  "userId": "a14f6aec-a6c5-4fe0-b2fd-34092ac1131d",
  "items": [
    {
      "variantId": "7df8cf9c-71aa-410d-baee-3be19fac7972",
      "productId": "ca53ac88-9356-4cff-905c-9064218eba38",
      "sellerId": "71c5ee2c-eb16-4f70-b3cd-a92d56da4b71",
      "qty": 2,
      "price": 14999,
      "salePrice": 12997,
      "totalPrice": 25994,
      "gst": 468,
      "subTotal": 25526
    }
  ],
  "status": "active"
}
```

#### users Collection (Wallet Fields)
```json
{
  "userId": "71c5ee2c-eb16-4f70-b3cd-a92d56da4b71",
  "sellerEarnings": 12350,
  "platformFees": 0,
  "sellerWallet": 12350,
  "adminWallet": 0
}
```

Admin user example:
```json
{
  "userId": "00000000-0000-0000-0000-000000000001",
  "sellerEarnings": 0,
  "platformFees": 650,
  "sellerWallet": 0,
  "adminWallet": 650
}
```

---

### 5. **Stock Management Flow**

#### Example: Order with qty=2, stock=12

**Before Order:**
```json
{
  "variantId": "7df8cf9c-71aa-410d-baee-3be19fac7972",
  "stock": 12
}
```

**After COD Order Creation:**
```json
{
  "variantId": "7df8cf9c-71aa-410d-baee-3be19fac7972",
  "stock": 10
}
```

**Wallet Updates (Sale price: ₹25,994):**
- Platform Fee (5%): ₹1,300
- Seller Earnings: ₹24,694

```json
// Seller User
{
  "sellerId": "71c5ee2c-eb16-4f70-b3cd-a92d56da4b71",
  "sellerWallet": 24694
}

// Admin User  
{
  "userId": "00000000-0000-0000-0000-000000000001",
  "adminWallet": 1300
}
```

---

### 6. **API Endpoints**

#### Cart APIs
- `GET /api/cart/` - Get cart with variants
- `POST /api/cart/add` - Add variant to cart (auto-updates qty if exists)
- `PUT /api/cart/update/:productId` - Update variant quantity
- `DELETE /api/cart/remove/:productId?variantId=xxx` - Remove variant
- `DELETE /api/cart/clear` - Clear entire cart

#### Order APIs
- `POST /api/orders/create` - Create order (COD/Online)
- `POST /api/orders/verify` - Verify online payment
- `GET /api/orders/history` - Get user orders
- `GET /api/orders/detail/:orderId` - Get order details

#### Admin Order APIs
- `GET /api/orders/admin` - Get all orders
- `GET /api/orders/admin/:orderId` - Get order detail
- `PUT /api/orders/admin/:id/status` - Update order status
- `PUT /api/orders/admin/:id/payment-status` - Update payment status

---

### 7. **Testing with Postman**

#### Test Flow 1: COD Order
1. Login as customer → Get token
2. Add variant to cart: `POST /api/cart/add`
3. Get cart: `GET /api/cart/`
4. Create COD order: `POST /api/orders/create`
5. Verify:
   - Stock reduced in `product_variants`
   - Seller wallet updated
   - Admin wallet updated
   - Cart cleared

#### Test Flow 2: Online Payment Order
1. Add variant to cart
2. Create online order → Get Razorpay details
3. Use test payment details from response
4. Verify payment: `POST /api/orders/verify`
5. Verify:
   - Stock reduced
   - Wallets updated
   - Cart cleared
   - Order status = 'confirmed'

---

## Migration Notes

### Breaking Changes:
1. **API Request Parameter Change**: `sellerProductId` → `variantId`
2. **Add to Cart Behavior**: Now updates quantity instead of returning error
3. **Stock Source**: Stock is now managed in `product_variants` collection

### Database Updates Required:
1. Ensure all users have `sellerWallet` and `adminWallet` fields (default: 0)
2. Ensure all cart items use `variantId` instead of `sellerProductId`
3. Update existing orders to use `variantId` if migrating data

### Frontend Changes Required:
1. Send `variantId` instead of `sellerProductId` in cart requests
2. Handle auto-increment behavior when adding duplicate items
3. Pass `variantId` in query params when removing cart items
4. Update wallet display to use `sellerWallet` and `adminWallet`

---

## Error Handling

### Common Error Scenarios:
1. **Variant not found**: 404 - "Product variant not found"
2. **Variant not approved**: 400 - "This variant is not yet approved"
3. **Insufficient stock**: 400 - "Only X items available for this variant"
4. **Stock reduction failed**: 400 - "Unable to process order. Insufficient stock"

---

## Platform Fee Configuration

```javascript
const PLATFORM_FEE_PERCENTAGE = 5; // 5% platform fee
const ADMIN_USER_ID = '00000000-0000-0000-0000-000000000001';
```

---

## Price History Tracking

All transactions are logged in `price_history` collection:

```json
{
  "userId": "71c5ee2c-eb16-4f70-b3cd-a92d56da4b71",
  "type": "seller_earning",
  "orderId": "ORD-123456-ABC",
  "productId": "ca53ac88-9356-4cff-905c-9064218eba38",
  "variantId": "7df8cf9c-71aa-410d-baee-3be19fac7972",
  "sellerId": "71c5ee2c-eb16-4f70-b3cd-a92d56da4b71",
  "amount": 24694,
  "salePrice": 25994,
  "platformFee": 1300,
  "paymentType": "cod"
}
```

---

## Support

For issues or questions, contact the development team.
