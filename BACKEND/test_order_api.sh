#!/bin/bash

echo "==================================="
echo "Testing Order API Endpoints"
echo "==================================="

# Set your token here (get from login)
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhMTRmNmFlYy1hNmM1LTRmZTAtYjJmZC0zNDA5MmFjMTEzMWQiLCJlbWFpbCI6Imtlc2F2MjQyNEBnbWFpbC5jb20iLCJyb2xlcyI6WzNdLCJyb2xlTmFtZXMiOlsiQ3VzdG9tZXIiXSwiaWF0IjoxNzY3MzQ2MzEzLCJleHAiOjE3Njc0MzI3MTN9.LyiFf19-YBz-1GZ2OQ-oGq-Gpm_vQlJ-dssAebbyHmM"

echo ""
echo "1. Testing Health Endpoint..."
curl -s http://localhost:5656/health
echo ""
echo ""

echo "2. Testing Order Routes Registration..."
curl -s -X POST http://localhost:5656/api/orders/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "deliveryAddress": {
      "name": "Test User",
      "phone": "9876543210",
      "email": "test@example.com",
      "doorNo": "123",
      "street": "Test Street",
      "landmark": "Test Landmark",
      "city": "Test City",
      "district": "Test District",
      "state": "Test State",
      "pincode": "600001",
      "country": "IN"
    },
    "paymentType": "cod",
    "totalPrice": 100,
    "gst": 10,
    "subTotal": 90,
    "grandTotal": 110,
    "shippingFees": 0,
    "codFees": 0
  }'

echo ""
echo ""
echo "==================================="
echo "Test Complete"
echo "==================================="
