# Cart API Documentation

## Overview
This document provides comprehensive documentation for the E-Commerce Cart APIs with Postman collection examples.

## Postman Collection
**File:** `Cart_APIs.postman_collection.json`

## Base Configuration

### Environment Variables
Set these variables in your Postman environment:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `base_url` | API base URL | `http://localhost:5000` |
| `customer_token` | JWT token from login | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `user_id` | User UUID | `a14f6aec-a6c5-4fe0-b2fd-34092ac1131d` |
| `product_id` | Product UUID | `97120ed1-4621-44c4-a594-355b21bcaf0e` |

### How to Get Token
1. Login via `/api/auth/login` endpoint
2. Copy the `accessToken` from the response
3. Set it as `customer_token` variable in Postman

**Example Login Response:**
```json
{
    "success": true,
    "message": "User logged in successfully",
    "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "tokenType": "bearer",
        "userId": "a14f6aec-a6c5-4fe0-b2fd-34092ac1131d",
        "roles": [3],
        "roleNames": ["Customer"],
        "email": "kesav2424@gmail.com",
        "phone": "9715756117",
        "firstName": "Kesav",
        "lastName": "D"
    }
}
```

---

## API Endpoints

### 1. Get Cart
**GET** `/api/cart/`

**Headers:**
```
Authorization: Bearer {{customer_token}}
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 10 | Items per page |

**Example:**
```
GET /api/cart/?page=1&limit=10
```

**Description:**
Retrieves the current user's active cart with pagination support. **Product details are fetched in real-time from the Product table** and merged with cart data.

**Features:**
- ✅ Pagination support (page, limit)
- ✅ Real-time product data (price, stock, images)
- ✅ Product availability check (compares qty vs stock)
- ✅ Product status validation
- ✅ Includes createdBy, updatedBy, createdAt, updatedAt for tracking
- ✅ Pagination metadata (total items, total pages)

**Response (Success - Empty Cart):**
```json
{
    "success": true,
    "message": "Cart is empty",
    "data": {
        "userId": "a14f6aec-a6c5-4fe0-b2fd-34092ac1131d",
        "items": [],
        "status": "active"
    },
    "pagination": {
        "total": 0,
        "page": 1,
        "limit": 10,
        "pages": 0
    }
}
```

**Response (Success - With Items):**
```json
{
    "success": true,
    "message": "Cart retrieved successfully",
    "data": {
        "_id": "cart_mongodb_id",
        "userId": "a14f6aec-a6c5-4fe0-b2fd-34092ac1131d",
        "items": [
            {
                "productId": "97120ed1-4621-44c4-a594-355b21bcaf0e",
                "productName": "Sample Product",
                "qty": 2,
                "price": 1999,
                "salePrice": 1499,
                "images": ["image1.jpg", "image2.jpg"],
                "stock": 50,
                "mainCategoryId": "category-uuid",
                "subCategoryId": "subcategory-uuid",
                "description": "Full product description",
                "shortDescription": "Short desc",
                "slug": "sample-product",
                "createdAt": "2024-01-02T10:00:00.000Z",
                "createdBy": "a14f6aec-a6c5-4fe0-b2fd-34092ac1131d",
                "updatedAt": "2024-01-02T10:30:00.000Z",
                "updatedBy": "a14f6aec-a6c5-4fe0-b2fd-34092ac1131d",
                "available": true,
                "productStatus": "active"
            }
        ],
        "status": "active",
        "createdAt": "2024-01-02T10:00:00.000Z",
        "createdBy": "a14f6aec-a6c5-4fe0-b2fd-34092ac1131d",
        "updatedAt": "2024-01-02T10:30:00.000Z",
        "updatedBy": "a14f6aec-a6c5-4fe0-b2fd-34092ac1131d"
    },
    "pagination": {
        "total": 3,
        "page": 1,
        "limit": 10,
        "pages": 1
    }
}
```

**Pagination Fields Explained:**
- `total`: Total number of items in cart
- `page`: Current page number
- `limit`: Items per page
- `pages`: Total number of pages

**Item Fields Explained:**
- `available`: `true` if stock >= qty, else `false`
- `productStatus`: `"active"` or `"inactive"` or `"not_found"`
- `createdBy`: User who added the item
- `updatedBy`: User who last updated the item

---

### 2. Add Item to Cart
**POST** `/api/cart/add`

**Headers:**
```
Authorization: Bearer {{customer_token}}
Content-Type: application/json
```

**Request Body:**
```json
{
    "productId": "97120ed1-4621-44c4-a594-355b21bcaf0e",
    "qty": 2
}
```

**Description:**
- Adds a product to the cart
- If product already exists, increments the quantity
- Validates product existence and stock availability
- **Automatically fetches and stores** full product details (productName, price, salePrice, images, stock)
- **Tracks creation**: Sets createdBy, createdAt, updatedBy, updatedAt
- Creates cart automatically if it doesn't exist (first item)

**Response (Success):**
```json
{
    "success": true,
    "message": "Item added to cart successfully",
    "data": {
        "_id": "cart_mongodb_id",
        "userId": "a14f6aec-a6c5-4fe0-b2fd-34092ac1131d",
        "items": [
            {
                "productId": "97120ed1-4621-44c4-a594-355b21bcaf0e",
                "productName": "Sample Product",
                "qty": 2,
                "price": 1999,
                "salePrice": 1499,
                "images": ["image1.jpg"],
                "stock": 50,
                "mainCategoryId": "category-uuid",
                "subCategoryId": "subcategory-uuid",
                "createdAt": "2024-01-02T10:00:00.000Z",
                "createdBy": "a14f6aec-a6c5-4fe0-b2fd-34092ac1131d",
                "updatedAt": "2024-01-02T10:00:00.000Z",
                "updatedBy": "a14f6aec-a6c5-4fe0-b2fd-34092ac1131d"
            }
        ],
        "status": "active",
        "createdAt": "2024-01-02T10:00:00.000Z",
        "createdBy": "a14f6aec-a6c5-4fe0-b2fd-34092ac1131d",
        "updatedAt": "2024-01-02T10:00:00.000Z",
        "updatedBy": "a14f6aec-a6c5-4fe0-b2fd-34092ac1131d"
    }
}
```

**Error Responses:**
```json
// Missing productId
{
    "success": false,
    "message": "productId is required"
}

// Invalid quantity
{
    "success": false,
    "message": "Valid quantity is required"
}

// Product not found
{
    "success": false,
    "message": "Product not found"
}

// Insufficient stock
{
    "success": false,
    "message": "Insufficient stock. Available: 10"
}
```

---

### 3. Update Cart Item Quantity
**PUT** `/api/cart/update/:productId`

**Headers:**
```
Authorization: Bearer {{customer_token}}
Content-Type: application/json
```

**URL Parameters:**
- `productId` - Product UUID (e.g., `97120ed1-4621-44c4-a594-355b21bcaf0e`)

**Request Body:**
```json
{
    "qty": 5
}
```

**Description:**
- Updates the quantity of a specific product in the cart
- Validates userId, productId, and stock availability
- **Automatically refreshes** product details from Product table (price, salePrice, images, stock)
- **Updates tracking**: Sets updatedBy and updatedAt

**Response (Success):**
```json
{
    "success": true,
    "message": "Cart updated successfully",
    "data": {
        "_id": "cart_mongodb_id",
        "userId": "a14f6aec-a6c5-4fe0-b2fd-34092ac1131d",
        "items": [
            {
                "productId": "97120ed1-4621-44c4-a594-355b21bcaf0e",
                "productName": "Sample Product",
                "qty": 5,
                "price": 1999,
                "salePrice": 1499,
                "images": ["image1.jpg"],
                "stock": 50,
                "mainCategoryId": "category-uuid",
                "subCategoryId": "subcategory-uuid",
                "createdAt": "2024-01-02T10:00:00.000Z",
                "createdBy": "a14f6aec-a6c5-4fe0-b2fd-34092ac1131d",
                "updatedAt": "2024-01-02T10:30:00.000Z",
                "updatedBy": "a14f6aec-a6c5-4fe0-b2fd-34092ac1131d"
            }
        ],
        "status": "active",
        "createdAt": "2024-01-02T10:00:00.000Z",
        "createdBy": "a14f6aec-a6c5-4fe0-b2fd-34092ac1131d",
        "updatedAt": "2024-01-02T10:30:00.000Z",
        "updatedBy": "a14f6aec-a6c5-4fe0-b2fd-34092ac1131d"
    }
}
```

**Error Responses:**
```json
// Cart not found
{
    "success": false,
    "message": "Cart not found"
}

// Product not in cart
{
    "success": false,
    "message": "Product not found in cart"
}

// Insufficient stock
{
    "success": false,
    "message": "Insufficient stock. Available: 3"
}
```

---

### 4. Remove Item from Cart
**DELETE** `/api/cart/remove/:productId`

**Headers:**
```
Authorization: Bearer {{customer_token}}
```

**URL Parameters:**
- `productId` - Product UUID (e.g., `97120ed1-4621-44c4-a594-355b21bcaf0e`)

**Description:**
- Removes a specific product from the cart
- Validates userId and productId before removal
- **Updates tracking**: Sets updatedBy and updatedAt

**Response (Success):**
```json
{
    "success": true,
    "message": "Item removed from cart successfully",
    "data": {
        "_id": "cart_mongodb_id",
        "userId": "a14f6aec-a6c5-4fe0-b2fd-34092ac1131d",
        "items": [],
        "status": "active",
        "createdAt": "2024-01-02T10:00:00.000Z",
        "createdBy": "a14f6aec-a6c5-4fe0-b2fd-34092ac1131d",
        "updatedAt": "2024-01-02T10:35:00.000Z",
        "updatedBy": "a14f6aec-a6c5-4fe0-b2fd-34092ac1131d"
    }
}
```

**Error Responses:**
```json
// Cart not found
{
    "success": false,
    "message": "Cart not found"
}

// Product not in cart
{
    "success": false,
    "message": "Product not found in cart"
}
```

---

### 5. Clear Cart
**DELETE** `/api/cart/clear`

**Headers:**
```
Authorization: Bearer {{customer_token}}
```

**Description:**
- Removes all items from the user's cart
- Keeps the cart document but empties the items array
- **Updates tracking**: Sets updatedBy and updatedAt

**Response (Success):**
```json
{
    "success": true,
    "message": "Cart cleared successfully",
    "data": {
        "_id": "cart_mongodb_id",
        "userId": "a14f6aec-a6c5-4fe0-b2fd-34092ac1131d",
        "items": [],
        "status": "active",
        "createdAt": "2024-01-02T10:00:00.000Z",
        "createdBy": "a14f6aec-a6c5-4fe0-b2fd-34092ac1131d",
        "updatedAt": "2024-01-02T10:40:00.000Z",
        "updatedBy": "a14f6aec-a6c5-4fe0-b2fd-34092ac1131d"
    }
}
```

---

## Authentication

All cart endpoints require authentication via JWT token.

**Header Format:**
```
Authorization: Bearer <your_token_here>
```

The token is automatically decoded to extract:
- `userId` - Used to identify the user's cart
- `roles` - User roles
- `email` - User email

**Token Validation:**
- Invalid/missing token: `401 Unauthorized`
- Expired token: `401 Unauthorized`

---

## Cart Data Structure

### Cart Document (Stored in Database)
```json
{
    "_id": "ObjectId",
    "userId": "UUID string",
    "items": [
        {
            "productId": "UUID string",
            "productName": "string",
            "qty": "number",
            "price": "number",
            "salePrice": "number",
            "images": ["array of strings"],
            "stock": "number",
            "mainCategoryId": "UUID string",
            "subCategoryId": "UUID string",
            "createdAt": "ISO Date",
            "createdBy": "UUID string",
            "updatedAt": "ISO Date",
            "updatedBy": "UUID string"
        }
    ],
    "status": "active",
    "createdAt": "ISO Date",
    "createdBy": "UUID string",
    "updatedAt": "ISO Date",
    "updatedBy": "UUID string"
}
```

### Cart Response (GET /api/cart/)
When you fetch the cart, product details are enriched with real-time data:
```json
{
    "_id": "ObjectId",
    "userId": "UUID string",
    "items": [
        {
            "productId": "UUID string",
            "productName": "string (from Product table)",
            "qty": "number",
            "price": "number (from Product table)",
            "salePrice": "number (from Product table)",
            "images": ["array (from Product table)"],
            "stock": "number (from Product table)",
            "mainCategoryId": "UUID string (from Product table)",
            "subCategoryId": "UUID string (from Product table)",
            "description": "string (from Product table)",
            "shortDescription": "string (from Product table)",
            "slug": "string (from Product table)",
            "createdAt": "ISO Date",
            "createdBy": "UUID string",
            "updatedAt": "ISO Date",
            "updatedBy": "UUID string",
            "available": "boolean (stock >= qty)",
            "productStatus": "string (active/inactive/not_found)"
        }
    ],
    "status": "active",
    "createdAt": "ISO Date",
    "createdBy": "UUID string",
    "updatedAt": "ISO Date",
    "updatedBy": "UUID string"
}
```

---

## Key Features

✅ **User Isolation** - Each user has their own cart identified by userId  
✅ **Token Authentication** - All endpoints require valid JWT token  
✅ **Pagination Support** - GET cart supports page and limit query parameters  
✅ **Product Validation** - Validates product existence before adding  
✅ **Stock Checking** - Ensures requested quantity doesn't exceed available stock  
✅ **Duplicate Handling** - Increments quantity if product already exists  
✅ **Full Product Details** - Stores complete product information in cart  
✅ **Real-time Product Data** - GET cart fetches latest product details from Product table  
✅ **Auto-refresh** - Updates product details when updating quantity  
✅ **Creation Tracking** - Tracks createdBy and createdAt for each item and cart  
✅ **Update Tracking** - Tracks updatedBy and updatedAt for all modifications  
✅ **Product Availability** - Returns `available` flag based on stock vs qty  
✅ **Product Status** - Returns product status (active/inactive/not_found)  
✅ **Pagination Metadata** - Returns total items, current page, limit, and total pages  
✅ **Proper Error Messages** - Clear error messages for validation failures  

---

## Pagination Examples

### Example 1: Get first 10 items (default)
```
GET /api/cart/
GET /api/cart/?page=1&limit=10
```

### Example 2: Get 5 items per page
```
GET /api/cart/?page=1&limit=5
```

### Example 3: Get second page with 5 items per page
```
GET /api/cart/?page=2&limit=5
```

**Pagination Logic:**
- If cart has 15 items and limit=5:
  - Page 1: Items 1-5 (total: 15, pages: 3)
  - Page 2: Items 6-10 (total: 15, pages: 3)
  - Page 3: Items 11-15 (total: 15, pages: 3)
  - Page 4: Empty array (total: 15, pages: 3)

---

## Testing Workflow

1. **Login** → Get token
2. **Set Variables** → Update `customer_token` and `product_id`
3. **Get Cart** → Check current cart state (with pagination)
4. **Add Item** → Add products with quantity
5. **Update Item** → Change quantity
6. **Remove Item** → Delete specific product
7. **Clear Cart** → Empty entire cart
8. **Test Pagination** → Try different page and limit values

---

## Import to Postman

1. Open Postman
2. Click **Import** button
3. Select `Cart_APIs.postman_collection.json`
4. Collection will be imported with all endpoints
5. Set environment variables
6. Start testing!

---

## Notes

- All timestamps are in UTC
- Product prices are stored as numbers (in cents or smallest currency unit)
- Images array can be empty or contain multiple image URLs
- Stock is updated in real-time when adding/updating items
- Cart is automatically created on first item addition (upsert)
