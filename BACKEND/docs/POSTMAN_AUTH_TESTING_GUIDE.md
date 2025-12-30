# 📋 Postman Authentication Testing Guide

Complete guide for testing all authentication endpoints in the E-Commerce API using Postman.

**Base URL**: `http://localhost:5000`

---

## 📑 Table of Contents

1. [Environment Setup](#environment-setup)
2. [User Authentication](#user-authentication)
3. [Seller Authentication](#seller-authentication)
4. [Admin Authentication](#admin-authentication)
5. [Common Scenarios & Test Cases](#common-scenarios--test-cases)

---

## 🔧 Environment Setup

### Create Postman Environment

1. **Create New Environment**: Click on "Environments" → "+" (Create Environment)
2. **Name**: `E-Commerce Local`
3. **Add Variables**:

| Variable | Initial Value | Current Value |
|----------|--------------|---------------|
| `base_url` | `http://localhost:5000` | `http://localhost:5000` |
| `user_token` | *(leave empty)* | *(auto-set)* |
| `seller_token` | *(leave empty)* | *(auto-set)* |
| `admin_token` | *(leave empty)* | *(auto-set)* |
| `user_id` | *(leave empty)* | *(auto-set)* |
| `otp_ref` | *(leave empty)* | *(auto-set)* |
| `reset_token` | *(leave empty)* | *(auto-set)* |

4. **Save Environment** and select it from the dropdown

---

## 👤 USER AUTHENTICATION

### 1. User Registration Flow

#### 1.1 Send Registration OTP

**Endpoint**: `POST {{base_url}}/api/user/register/send-otp`

**Headers**:
```
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "email": "john.doe@example.com"
}
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "OTP sent to email",
  "data": {
    "email": "john.doe@example.com",
    "expiresInSec": 180,
    "resendAvailableInSec": 30
  }
}
```

**Test Cases**:
- ✅ Valid email → OTP sent
- ❌ Empty email → `400 Bad Request`
- ❌ Already registered email → `400 Email already registered`
- ❌ Resend within 30 seconds → `429 Please wait before requesting another OTP`

**Postman Tests** (Scripts Tab):
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("test_email", pm.request.body.raw ? JSON.parse(pm.request.body.raw).email : "");
    console.log("✅ OTP sent successfully. Check console for OTP code.");
}
```

---

#### 1.2 Complete Registration

**Endpoint**: `POST {{base_url}}/api/user/register`

**Headers**:
```
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "9876543210",
  "password": "SecurePass@123",
  "otpCode": "123456"
}
```

**Expected Response** (201):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "bearer",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "roles": [3],
    "roleNames": ["User"],
    "email": "john.doe@example.com",
    "phone": "9876543210",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Test Cases**:
- ✅ Valid OTP and data → Registration successful
- ❌ Invalid/expired OTP → `400 Invalid or expired OTP`
- ❌ Missing required fields → `400 Required fields: firstName, lastName, email, password, otpCode`
- ❌ Duplicate phone number → `400 Phone number already registered`

**Postman Tests**:
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("user_token", response.data.accessToken);
    pm.environment.set("user_id", response.data.userId);
    console.log("✅ User registered. Token saved.");
}
```

---

### 2. User Login

**Endpoint**: `POST {{base_url}}/api/user/login`

**Headers**:
```
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "identifier": "john.doe@example.com",
  "password": "SecurePass@123"
}
```

**Alternative Body** (Login with Phone):
```json
{
  "identifier": "9876543210",
  "password": "SecurePass@123"
}
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "bearer",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "roles": [3],
    "roleNames": ["User"],
    "email": "john.doe@example.com",
    "phone": "9876543210",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Test Cases**:
- ✅ Valid email + password → Login successful
- ✅ Valid phone + password → Login successful
- ❌ Invalid identifier format → `400 Invalid email or mobile format`
- ❌ User not found → `404 User not found`
- ❌ Incorrect password → `401 Incorrect password`
- ❌ Non-user role → `403 Unauthorized: User access only`
- ❌ Inactive account → `403 User account is inactive`

**Postman Tests**:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("user_token", response.data.accessToken);
    pm.environment.set("user_id", response.data.userId);
    console.log("✅ User logged in. Token saved.");
}
```

---

### 3. User Password Reset Flow

#### 3.1 Request Password Reset OTP

**Endpoint**: `POST {{base_url}}/api/user/forgot-password`

**Headers**:
```
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "email": "john.doe@example.com"
}
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "OTP sent to email if it exists",
  "data": {
    "otpRef": "6576a8b9c1d2e3f4g5h6i7j8",
    "expiresInSec": 180,
    "resendAvailableInSec": 30
  }
}
```

**Test Cases**:
- ✅ Valid registered email → OTP sent
- ✅ Non-existent email → Same response (security)
- ❌ Empty email → `400 Email is required`
- ❌ Resend within 30 seconds → `429 Please wait before requesting another OTP`

**Postman Tests**:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.data.otpRef) {
        pm.environment.set("otp_ref", response.data.otpRef);
        console.log("✅ Password reset OTP sent. Check console for OTP.");
    }
}
```

---

#### 3.2 Validate OTP

**Endpoint**: `POST {{base_url}}/api/user/validate-otp`

**Headers**:
```
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "otp": "123456",
  "otpRef": "{{otp_ref}}"
}
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "OTP validated",
  "data": {
    "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Test Cases**:
- ✅ Valid OTP and reference → Reset token generated
- ❌ Invalid OTP → `400 Invalid or expired OTP`
- ❌ Missing OTP or reference → `400 OTP and OTP reference are required`

**Postman Tests**:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("reset_token", response.data.resetToken);
    console.log("✅ OTP validated. Reset token saved.");
}
```

---

#### 3.3 Set New Password

**Endpoint**: `POST {{base_url}}/api/user/set-new-password`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer {{reset_token}}
```

**Body** (JSON):
```json
{
  "newPassword": "NewSecurePass@456",
  "confirmPassword": "NewSecurePass@456"
}
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Password updated successfully",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": [3],
    "roleNames": ["User"]
  }
}
```

**Test Cases**:
- ✅ Valid reset token + matching passwords → Password updated
- ❌ Missing reset token → `401 Reset token required`
- ❌ Invalid/expired token → `401 Token expired or invalid`
- ❌ Passwords don't match → `400 Passwords do not match`
- ❌ Missing fields → `400 New password and confirm password are required`

---

### 4. User Google Authentication

#### 4.1 Get Google Config

**Endpoint**: `GET {{base_url}}/api/user/google/config`

**Headers**: *(None required)*

**Expected Response** (200):
```json
{
  "clientId": "1234567890-abcdefghijklmnop.apps.googleusercontent.com"
}
```

---

#### 4.2 Google Login/Register

**Endpoint**: `POST {{base_url}}/api/user/google/login`

**Headers**:
```
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjU5N...",
  "phone": "9876543210"
}
```

**Expected Response - Existing User** (200):
```json
{
  "success": true,
  "message": "User logged in successfully with Google",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "bearer",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "roles": [3],
    "roleNames": ["User"],
    "email": "john.doe@example.com",
    "phone": "9876543210",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Expected Response - New User** (201):
```json
{
  "success": true,
  "message": "User registered and logged in successfully with Google",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "bearer",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "roles": [3],
    "roleNames": ["User"],
    "email": "john.doe@example.com",
    "phone": "9876543210",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Test Cases**:
- ✅ Valid Google token (existing user) → Login successful (200)
- ✅ Valid Google token (new user) → Registration + Login (201)
- ❌ Invalid Google token → `401 Invalid Google token`
- ❌ Missing token → `400 Google ID token is required`
- ❌ Unverified Google email → `400 Google email not verified`
- ❌ Inactive account → `403 User account is inactive`

**Postman Tests**:
```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("user_token", response.data.accessToken);
    pm.environment.set("user_id", response.data.userId);
    console.log("✅ Google authentication successful. Token saved.");
}
```

---

### 5. User Profile Management

#### 5.1 Get User Profile

**Endpoint**: `GET {{base_url}}/api/user/profile`

**Headers**:
```
Authorization: Bearer {{user_token}}
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "9876543210",
    "profileImage": null,
    "roles": [3],
    "roleNames": ["User"],
    "status": true,
    "lastLogin": "2025-12-29T17:30:00.000Z",
    "createdAt": "2025-12-20T10:00:00.000Z",
    "createdBy": "john.doe@example.com"
  }
}
```

**Test Cases**:
- ✅ Valid token → Profile retrieved
- ❌ Missing token → `401 Authorization token required`
- ❌ Invalid token → `401 Invalid or expired token`
- ❌ User not found → `404 User not found`
- ❌ Non-user role → `403 Unauthorized: User access only`

---

#### 5.2 Update User Profile

**Endpoint**: `PUT {{base_url}}/api/user/profile`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer {{user_token}}
```

**Body** (JSON):
```json
{
  "firstName": "John Updated",
  "lastName": "Doe Updated",
  "phone": "9999888877",
  "profileImage": "https://example.com/profile.jpg"
}
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "User profile updated successfully",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John Updated",
    "lastName": "Doe Updated",
    "email": "john.doe@example.com",
    "phone": "9999888877",
    "profileImage": "https://example.com/profile.jpg",
    "roles": [3],
    "roleNames": ["User"],
    "updatedAt": "2025-12-29T17:35:00.000Z",
    "updatedBy": "john.doe@example.com"
  }
}
```

**Test Cases**:
- ✅ Valid token + data → Profile updated
- ✅ Partial update (only some fields) → Successful
- ❌ Missing token → `401 Authorization token required`
- ❌ User not found → `404 User not found`

---

#### 5.3 Add Role to User

**Endpoint**: `POST {{base_url}}/api/user/add-role`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer {{user_token}}
```

**Body** (JSON):
```json
{
  "roleId": 2
}
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Role added successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "bearer",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "roles": [3, 2],
    "roleNames": ["User", "Seller"],
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Test Cases**:
- ✅ Valid roleId → Role added, new token issued
- ❌ Missing roleId → `400 roleId is required`
- ❌ Already has role → `400 User already has this role`
- ❌ Invalid roleId → `400 Invalid roleId`
- ❌ User not found → `404 User not found`

**Postman Tests**:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("user_token", response.data.accessToken);
    console.log("✅ Role added. New token saved.");
}
```

---

## 🏪 SELLER AUTHENTICATION

### 1. Seller Registration Flow

#### 1.1 Send Registration OTP

**Endpoint**: `POST {{base_url}}/api/seller/register/send-otp`

**Headers**:
```
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "email": "seller@shop.com"
}
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "OTP sent to email",
  "data": {
    "email": "seller@shop.com",
    "expiresInSec": 180,
    "resendAvailableInSec": 30
  }
}
```

**Test Cases**: Same as User Registration OTP

---

#### 1.2 Complete Registration

**Endpoint**: `POST {{base_url}}/api/seller/register`

**Headers**:
```
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "seller@shop.com",
  "phone": "9123456789",
  "password": "SellerPass@123",
  "otpCode": "123456"
}
```

**Expected Response** (201):
```json
{
  "success": true,
  "message": "Seller registered successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "bearer",
    "userId": "660f9511-f30c-52e5-b827-557766551111",
    "roles": [2],
    "roleNames": ["Seller"],
    "email": "seller@shop.com",
    "phone": "9123456789",
    "firstName": "Jane",
    "lastName": "Smith"
  }
}
```

**Postman Tests**:
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("seller_token", response.data.accessToken);
    pm.environment.set("seller_id", response.data.userId);
    console.log("✅ Seller registered. Token saved.");
}
```

---

### 2. Seller Login

**Endpoint**: `POST {{base_url}}/api/seller/login`

**Headers**:
```
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "identifier": "seller@shop.com",
  "password": "SellerPass@123"
}
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Seller logged in successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "bearer",
    "userId": "660f9511-f30c-52e5-b827-557766551111",
    "roles": [2],
    "roleNames": ["Seller"],
    "email": "seller@shop.com",
    "phone": "9123456789",
    "firstName": "Jane",
    "lastName": "Smith"
  }
}
```

**Test Cases**: Same as User Login (with seller-specific error: `403 Unauthorized: Seller access only`)

**Postman Tests**:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("seller_token", response.data.accessToken);
    pm.environment.set("seller_id", response.data.userId);
    console.log("✅ Seller logged in. Token saved.");
}
```

---

### 3. Seller Password Reset Flow

Same endpoints as User, but with `/api/seller` prefix:

- `POST {{base_url}}/api/seller/forgot-password`
- `POST {{base_url}}/api/seller/validate-otp`
- `POST {{base_url}}/api/seller/set-new-password`

All request/response formats are identical to User Password Reset.

---

### 4. Seller Google Authentication

#### 4.1 Get Google Config

**Endpoint**: `GET {{base_url}}/api/seller/google/config`

#### 4.2 Google Login/Register

**Endpoint**: `POST {{base_url}}/api/seller/google/login`

**Body** (JSON):
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjU5N...",
  "phone": "9123456789"
}
```

All formats identical to User Google Auth, but assigns **Seller role (2)** instead of User role (3).

---

### 5. Seller Profile Management

#### 5.1 Get Seller Profile

**Endpoint**: `GET {{base_url}}/api/seller/profile`

**Headers**:
```
Authorization: Bearer {{seller_token}}
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Seller profile retrieved successfully",
  "data": {
    "userId": "660f9511-f30c-52e5-b827-557766551111",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "seller@shop.com",
    "phone": "9123456789",
    "roles": [2],
    "roleNames": ["Seller"],
    "status": true,
    "lastLogin": "2025-12-29T17:40:00.000Z"
  }
}
```

---

#### 5.2 Update Seller Profile

**Endpoint**: `PUT {{base_url}}/api/seller/profile`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer {{seller_token}}
```

**Body** (JSON):
```json
{
  "firstName": "Jane Updated",
  "lastName": "Smith Updated",
  "phone": "9111222333",
  "profileImage": "https://example.com/seller-profile.jpg"
}
```

**Expected Response** (200): Same format as User Profile Update

---

### 6. Seller KYC Management

#### 6.1 Submit KYC Request

**Endpoint**: `POST {{base_url}}/api/seller/kyc/request`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer {{seller_token}}
```

**Body** (JSON):
```json
{
  "shopName": "Jane's Fashion Store",
  "gstin": "29ABCDE1234F1Z5",
  "panNumber": "ABCDE1234F",
  "bankDetails": {
    "accountNumber": "1234567890",
    "ifscCode": "HDFC0001234",
    "accountHolderName": "Jane Smith",
    "bankName": "HDFC Bank"
  }
}
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "KYC request submitted successfully. Awaiting admin approval.",
  "data": {
    "userId": "660f9511-f30c-52e5-b827-557766551111",
    "shopName": "Jane's Fashion Store",
    "gstin": "29ABCDE1234F1Z5",
    "panNumber": "ABCDE1234F",
    "bankDetails": {
      "accountNumber": "1234567890",
      "ifscCode": "HDFC0001234",
      "accountHolderName": "Jane Smith",
      "bankName": "HDFC Bank"
    },
    "kycApproved": false,
    "onboardingCompleted": true,
    "isLive": false
  }
}
```

**Test Cases**:
- ✅ Valid KYC data → Request submitted
- ❌ Missing required fields → `400 Required fields: shopName, gstin, panNumber`
- ❌ Duplicate GSTIN → `400 GSTIN already registered`
- ❌ Missing token → `401 Authorization token required`
- ❌ Non-seller role → `403 Unauthorized: Seller access only`

---

#### 6.2 Get KYC Status

**Endpoint**: `GET {{base_url}}/api/seller/kyc/status`

**Headers**:
```
Authorization: Bearer {{seller_token}}
```

**Expected Response - KYC Pending** (200):
```json
{
  "success": true,
  "message": "KYC status retrieved successfully",
  "data": {
    "userId": "660f9511-f30c-52e5-b827-557766551111",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "seller@shop.com",
    "phone": "9123456789",
    "shopName": "Jane's Fashion Store",
    "gstin": "29ABCDE1234F1Z5",
    "panNumber": "ABCDE1234F",
    "bankDetails": {
      "accountNumber": "1234567890",
      "ifscCode": "HDFC0001234",
      "accountHolderName": "Jane Smith",
      "bankName": "HDFC Bank"
    },
    "kycApproved": false,
    "kycApprovedBy": null,
    "kycApprovedAt": null,
    "onboardingCompleted": true,
    "isLive": false,
    "commissionPercentage": 0,
    "goLiveApprovedBy": null,
    "goLiveApprovedAt": null
  }
}
```

**Expected Response - No KYC Request** (200):
```json
{
  "success": true,
  "message": "No KYC request found",
  "data": {
    "userId": "660f9511-f30c-52e5-b827-557766551111",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "seller@shop.com",
    "phone": "9123456789",
    "kycApproved": false,
    "onboardingCompleted": false,
    "isLive": false
  }
}
```

---

## 👨‍💼 ADMIN AUTHENTICATION

### 1. Admin Login

**Endpoint**: `POST {{base_url}}/api/admin/login`

**Headers**:
```
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "identifier": "admin@ecommerce.com",
  "password": "AdminPass@123"
}
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Admin logged in successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "bearer",
    "userId": "770g0622-g41d-63f6-c938-668877662222",
    "roles": [1],
    "roleNames": ["Admin"],
    "email": "admin@ecommerce.com",
    "phone": "9000000001",
    "firstName": "System",
    "lastName": "Admin"
  }
}
```

**Test Cases**: Same as User Login (with admin-specific error: `403 Unauthorized: Admin access only`)

**Postman Tests**:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("admin_token", response.data.accessToken);
    pm.environment.set("admin_id", response.data.userId);
    console.log("✅ Admin logged in. Token saved.");
}
```

---

### 2. Admin Password Reset Flow

Same endpoints as User, but with `/api/admin` prefix:

- `POST {{base_url}}/api/admin/forgot-password`
- `POST {{base_url}}/api/admin/validate-otp`
- `POST {{base_url}}/api/admin/set-new-password`

---

### 3. Admin Profile Management

#### 3.1 Get Admin Profile

**Endpoint**: `GET {{base_url}}/api/admin/profile`

**Headers**:
```
Authorization: Bearer {{admin_token}}
```

---

#### 3.2 Update Admin Profile

**Endpoint**: `PUT {{base_url}}/api/admin/profile`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer {{admin_token}}
```

**Body** (JSON):
```json
{
  "firstName": "System Updated",
  "lastName": "Admin Updated",
  "phone": "9000000099"
}
```

---

### 4. Admin User Management

#### 4.1 Get All Users

**Endpoint**: `GET {{base_url}}/api/admin/users`

**Headers**:
```
Authorization: Bearer {{admin_token}}
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `role` (optional): Filter by role ID (1=Admin, 2=Seller, 3=User)
- `status` (optional): Filter by status (true/false)

**Example**: `GET {{base_url}}/api/admin/users?page=1&limit=20&role=3&status=true`

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "9876543210",
      "roles": [3],
      "roleNames": ["User"],
      "status": true,
      "createdAt": "2025-12-20T10:00:00.000Z"
    },
    {
      "userId": "660f9511-f30c-52e5-b827-557766551111",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "seller@shop.com",
      "phone": "9123456789",
      "roles": [2],
      "roleNames": ["Seller"],
      "status": true,
      "createdAt": "2025-12-21T11:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 20,
    "totalItems": 45,
    "totalPages": 3
  }
}
```

**Test Cases**:
- ✅ Valid admin token → Users list retrieved
- ✅ With filters (role, status) → Filtered results
- ✅ With pagination → Paginated results
- ❌ Missing token → `401 Authorization token required`
- ❌ Non-admin role → `403 Unauthorized: Admin access only`

---

#### 4.2 Add New User

**Endpoint**: `POST {{base_url}}/api/admin/users`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer {{admin_token}}
```

**Body** (JSON):
```json
{
  "firstName": "Test",
  "lastName": "User",
  "email": "testuser@example.com",
  "phone": "9555666777",
  "password": "TestPass@123",
  "roles": [3]
}
```

**Expected Response** (201):
```json
{
  "success": true,
  "message": "User added successfully",
  "data": {
    "userId": "880h1733-h52e-74g7-d049-779988773333",
    "firstName": "Test",
    "lastName": "User",
    "email": "testuser@example.com",
    "phone": "9555666777",
    "roles": [3],
    "roleNames": ["User"],
    "status": true,
    "createdAt": "2025-12-29T18:00:00.000Z",
    "createdBy": "admin@ecommerce.com"
  }
}
```

**Test Cases**:
- ✅ Valid data → User created
- ❌ Missing required fields → `400 Required fields: firstName, lastName, email, password, roles`
- ❌ Duplicate email → `400 Email already exists`
- ❌ Duplicate phone → `400 Phone already exists`
- ❌ Invalid roleId → `400 Invalid roleId: X`

---

#### 4.3 Update User

**Endpoint**: `PUT {{base_url}}/api/admin/users/:userId`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer {{admin_token}}
```

**Body** (JSON):
```json
{
  "firstName": "Test Updated",
  "lastName": "User Updated",
  "phone": "9444555666",
  "roles": [3, 2],
  "status": false
}
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "userId": "880h1733-h52e-74g7-d049-779988773333",
    "firstName": "Test Updated",
    "lastName": "User Updated",
    "email": "testuser@example.com",
    "phone": "9444555666",
    "roles": [3, 2],
    "roleNames": ["User", "Seller"],
    "status": false,
    "updatedAt": "2025-12-29T18:05:00.000Z",
    "updatedBy": "admin@ecommerce.com"
  }
}
```

**Test Cases**:
- ✅ Valid userId + data → User updated
- ✅ Partial update → Successful
- ❌ User not found → `404 User not found`
- ❌ Invalid roleId → `400 Invalid roleId: X`

---

### 5. Admin Role Management

#### 5.1 Get All Roles

**Endpoint**: `GET {{base_url}}/api/admin/roles`

**Headers**:
```
Authorization: Bearer {{admin_token}}
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Roles retrieved successfully",
  "data": [
    {
      "roleId": 1,
      "roleName": "Admin",
      "createdAt": "2025-12-01T00:00:00.000Z",
      "createdBy": "system"
    },
    {
      "roleId": 2,
      "roleName": "Seller",
      "createdAt": "2025-12-01T00:00:00.000Z",
      "createdBy": "system"
    },
    {
      "roleId": 3,
      "roleName": "User",
      "createdAt": "2025-12-01T00:00:00.000Z",
      "createdBy": "system"
    },
    {
      "roleId": 4,
      "roleName": "Manager",
      "createdAt": "2025-12-15T10:00:00.000Z",
      "createdBy": "admin@ecommerce.com"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 10,
    "totalItems": 4,
    "totalPages": 1
  }
}
```

---

#### 5.2 Create Role

**Endpoint**: `POST {{base_url}}/api/admin/roles`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer {{admin_token}}
```

**Body** (JSON):
```json
{
  "roleName": "Manager"
}
```

**Expected Response** (201):
```json
{
  "success": true,
  "message": "Role created successfully",
  "data": {
    "roleId": 4,
    "roleName": "Manager",
    "createdAt": "2025-12-29T18:10:00.000Z",
    "createdBy": "admin@ecommerce.com"
  }
}
```

**Test Cases**:
- ✅ Valid role name → Role created
- ❌ Missing role name → `400 Role name is required`
- ❌ Duplicate role name → `400 Role name already exists`

---

#### 5.3 Update Role

**Endpoint**: `PUT {{base_url}}/api/admin/roles/:roleId`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer {{admin_token}}
```

**Body** (JSON):
```json
{
  "roleName": "Store Manager"
}
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Role updated successfully",
  "data": {
    "roleId": 4,
    "roleName": "Store Manager",
    "modifiedAt": "2025-12-29T18:15:00.000Z",
    "modifiedBy": "admin@ecommerce.com"
  }
}
```

**Test Cases**:
- ✅ Valid roleId + name → Role updated
- ❌ Role not found → `404 Role not found`
- ❌ Missing role name → `400 Role name is required`

---

#### 5.4 Delete Role

**Endpoint**: `DELETE {{base_url}}/api/admin/roles/:roleId`

**Headers**:
```
Authorization: Bearer {{admin_token}}
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Role deleted successfully"
}
```

**Test Cases**:
- ✅ Valid custom roleId → Role soft deleted
- ❌ Default role (1, 2, 3) → `403 Cannot delete default roles`
- ❌ Role not found → `404 Role not found`

---

### 6. Admin KYC Management

#### 6.1 Update Seller Commission

**Endpoint**: `PUT {{base_url}}/api/admin/seller/:userId/commission`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer {{admin_token}}
```

**Body** (JSON):
```json
{
  "commissionPercentage": 15,
  "kycApproved": true
}
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Seller commission and KYC status updated successfully",
  "data": {
    "userId": "660f9511-f30c-52e5-b827-557766551111",
    "shopName": "Jane's Fashion Store",
    "gstin": "29ABCDE1234F1Z5",
    "panNumber": "ABCDE1234F",
    "kycApproved": true,
    "kycApprovedBy": "admin@ecommerce.com",
    "kycApprovedAt": "2025-12-29T18:20:00.000Z",
    "commissionPercentage": 15,
    "isLive": true,
    "goLiveApprovedBy": "admin@ecommerce.com",
    "goLiveApprovedAt": "2025-12-29T18:20:00.000Z"
  }
}
```

**Test Cases**:
- ✅ Valid sellerId + commission → Updated
- ❌ Seller not found → `404 Seller not found`
- ❌ Missing commission → `400 Commission percentage is required`
- ❌ Non-seller user → `400 User is not a seller`

---

## 🧪 COMMON SCENARIOS & TEST CASES

### Complete Testing Sequence

#### Scenario 1: New User Journey (Email/Password)

1. **Send OTP**: `POST /api/user/register/send-otp`
2. **Check console for OTP code** (printed in backend logs)
3. **Register**: `POST /api/user/register` (with OTP)
4. **Verify token is saved** in environment
5. **Get Profile**: `GET /api/user/profile`
6. **Update Profile**: `PUT /api/user/profile`
7. **Logout** (clear token)
8. **Login**: `POST /api/user/login`
9. **Get Profile Again**: Verify data persists

---

#### Scenario 2: Password Reset Journey

1. **Login**: `POST /api/user/login`
2. **Request Reset OTP**: `POST /api/user/forgot-password`
3. **Check console for OTP**
4. **Validate OTP**: `POST /api/user/validate-otp`
5. **Set New Password**: `POST /api/user/set-new-password` (with reset token)
6. **Login with new password**: `POST /api/user/login`

---

#### Scenario 3: Seller Onboarding Journey

1. **Register Seller**: `POST /api/seller/register/send-otp` → `POST /api/seller/register`
2. **Login Seller**: `POST /api/seller/login`
3. **Submit KYC**: `POST /api/seller/kyc/request`
4. **Check KYC Status**: `GET /api/seller/kyc/status` (should be pending)
5. **Admin Login**: `POST /api/admin/login`
6. **Admin Approves KYC**: `PUT /api/admin/seller/:userId/commission` (kycApproved: true)
7. **Seller Checks Status Again**: `GET /api/seller/kyc/status` (should be approved)

---

#### Scenario 4: Role Addition Journey

1. **User Login**: `POST /api/user/login`
2. **Check roles**: Should be `[3]` (User only)
3. **Add Seller Role**: `POST /api/user/add-role` (roleId: 2)
4. **Verify new token** with both roles
5. **Now can access seller endpoints**: `POST /api/seller/kyc/request`

---

#### Scenario 5: Admin User Management Journey

1. **Admin Login**: `POST /api/admin/login`
2. **Get All Users**: `GET /api/admin/users?role=3`
3. **Create New User**: `POST /api/admin/users`
4. **Get User by ID**: `GET /api/admin/users?page=1`
5. **Update User**: `PUT /api/admin/users/:userId` (change status to inactive)
6. **Verify user cannot login**: `POST /api/user/login` → `403 User account is inactive`

---

### Error Testing Checklist

#### Authentication Errors

- [ ] **401 Unauthorized**: Missing/invalid/expired token
- [ ] **403 Forbidden**: Wrong role for endpoint (user trying admin route)
- [ ] **403 Forbidden**: Inactive account trying to login

#### Validation Errors

- [ ] **400 Bad Request**: Missing required fields
- [ ] **400 Bad Request**: Invalid email/phone format
- [ ] **400 Bad Request**: Passwords don't match
- [ ] **400 Bad Request**: Invalid OTP

#### Resource Errors

- [ ] **404 Not Found**: User/Seller/Role not found
- [ ] **409 Conflict**: Duplicate email/phone/GSTIN

#### Rate Limiting Errors

- [ ] **429 Too Many Requests**: OTP resend within 30 seconds

---

### Performance Testing Tips

1. **Response Time**: All auth endpoints should respond < 500ms
2. **Token Expiry**: Test with expired tokens (wait or manually modify JWT)
3. **Concurrent Requests**: Multiple logins with same credentials
4. **Load Testing**: 100+ registration requests within 1 minute

---

### Security Testing Checklist

- [ ] SQL Injection attempts in email/phone fields
- [ ] XSS attempts in firstName/lastName fields
- [ ] JWT token tampering (modify payload and test)
- [ ] Brute force protection (multiple failed login attempts)
- [ ] Session management (logout invalidates token)
- [ ] Password complexity requirements

---

## 📝 Notes

### OTP Codes

- OTP codes are **printed in backend console** during development
- Look for messages like: `📧 User Registration OTP for email@example.com: 123456`
- Default expiry: **180 seconds (3 minutes)**
- Resend delay: **30 seconds**

### JWT Tokens

- Tokens are **automatically saved** in Postman environment variables
- Token format: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Use `{{user_token}}`, `{{seller_token}}`, `{{admin_token}}` in requests
- Check expiry in JWT payload

### Role IDs

- **1** = Admin
- **2** = Seller
- **3** = User

### Phone Number Format

- Can be sent with or without `+91` prefix
- Backend automatically strips `+91` before saving
- Examples: `9876543210` or `+919876543210`

---

## 🔥 Quick Start Collection

### Import This Collection

Create a new Postman Collection with these quick-access requests:

1. **User - Register** → Send OTP → Register → Login
2. **User - Password Reset** → Forgot → Validate → Set New
3. **Seller - Register** → Send OTP → Register → Login → KYC Request
4. **Admin - Login** → Get Users → Update User → Approve KYC
5. **Profile** → Get → Update
6. **Roles** → Get → Create → Update → Delete

---

## ✅ Testing Completion Checklist

### User Authentication
- [ ] Registration with OTP
- [ ] Login with email
- [ ] Login with phone
- [ ] Google login (existing user)
- [ ] Google login (new user)
- [ ] Password reset flow
- [ ] Profile get/update
- [ ] Add role functionality

### Seller Authentication
- [ ] Registration with OTP
- [ ] Login with email/phone
- [ ] Google login
- [ ] Password reset flow
- [ ] Profile get/update
- [ ] KYC submission
- [ ] KYC status check

### Admin Authentication
- [ ] Admin login
- [ ] Password reset flow
- [ ] Profile get/update
- [ ] Get all users (with filters)
- [ ] Add new user
- [ ] Update user
- [ ] Get all roles
- [ ] Create role
- [ ] Update role
- [ ] Delete role
- [ ] Approve seller KYC

### Error Handling
- [ ] Missing fields validation
- [ ] Invalid credentials
- [ ] Expired OTP
- [ ] Duplicate email/phone
- [ ] Unauthorized access
- [ ] Invalid tokens
- [ ] Rate limiting

---

**Happy Testing! 🚀**

*Document Version: 1.0*  
*Last Updated: December 29, 2025*
