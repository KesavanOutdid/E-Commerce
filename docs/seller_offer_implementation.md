# Seller Offer Implementation Guide

This document outlines the steps for the Seller Frontend team to implement the new "Seller-Funded Offers" feature.

## 1. New Menu Item
Add a **"Promotions"** section to the Seller Dashboard with two sub-menus:
*   **My Offers**: Manage automatic discounts on your products.
*   **My Coupons**: Manage code-based discounts for your products.

## 2. API Endpoints for Sellers
You should use the following new endpoints (Backend implementation pending for Seller specific routes, but schema matches Admin):
*   `GET /api/seller/promotions/offers`: List all offers created by this seller.
*   `POST /api/seller/promotions/offers`: Create a new offer.
*   `PUT /api/seller/promotions/offers/:id`: Update an existing offer.

## 3. Offer Types to Support
*   **Direct**: Simple percentage/fixed discount.
*   **Quantity Tiered**: "Buy 3, Get 10% Off".
    *   *Payload structure*: `tiers: [{ minQty: 3, discountType: 'percentage', value: 10 }]`

## 4. Key Logic (Calculations)
*   **Seller-Funded**: All discounts created here are deducted from the seller's payout.
*   **Commission**: Admin takes commission on the **final sale price** (after your discount).

## 5. UI Requirements
*   **Product Selection**: Sellers must be able to select specific products or categories from their inventory for each offer.
*   **Date Range**: Every offer must have a `startDate` and `endDate`.
