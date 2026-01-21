# Website Offer Implementation Guide

This document outlines the steps for the Website team to implement the layered discount engine on the customer-facing frontend.

## 1. Product Page (PLP/PDP)
*   **Price Display**: Show the **Final Effective Price**.
*   **Offer Badges**: Display active offers (e.g., "10% Off via Seller Sale").
*   **Quantity Nudges**: If a product has a Tiered Offer, show a message like:
    *   *"Buy 3 items to get 10% off!"*

## 2. Cart Page (CRITICAL)
*   **Real-time Validation**: When items are added/removed or quantities changed, call the backend to get the updated totals.
*   **Coupon Input**: Provide a field for the user to enter a coupon code.
*   **Savings Breakdown**: Show the user exactly how they are saving:
    *   Item Total: ₹1,000
    *   Offer Savings: -₹100
    *   Coupon Savings: -₹50
    *   **Grand Total: ₹850**

## 3. Checkout Page
*   **Payment Method Offers**: Before the final payment, show available bank offers (e.g., "Get 10% instant discount on HDFC Cards").
*   **Final Verification**: Ensure the final amount passed to the Payment Gateway (Razorpay) matches the backend-calculated `grandTotal`.

## 4. API Usage
*   Pass the `couponCode` in the `POST /api/orders` body.
*   The backend will **re-calculate and verify** all prices before creating the order. Do not rely solely on frontend calculations.
