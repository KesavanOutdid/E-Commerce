"use client";
import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Breadcrumb from "@/components/Common/Breadcrumb";

const OrderSuccessContent = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="max-w-[600px] mx-auto pt-30 pb-20 px-4">
      <div className="bg-white shadow-1 rounded-xl p-8 sm:p-10 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue/10 text-blue rounded-full mb-6">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16.5 9.4 7.5 4.21" />
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.29 7 12 12 20.71 7" />
              <line x1="12" y1="22" x2="12" y2="12" />
            </svg>
          </div>
          <h1 className="text-xl font-medium text-dark mb-3">Order Placed Successfully!</h1>
          <p className="text-dark-4 text-base mb-2">
            Thank you for your purchase. <br />
            Your order has been received and is being processed.
          </p>
          {orderId && (
            <p className="text-blue font-medium text-base">
              Order ID: <span className="text-dark font-medium">{orderId}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex justify-center font-medium text-sm text-white bg-blue py-2.5 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark"
          >
            Continue Shopping
          </Link>
          <Link
            href="/view-orders"
            className="w-full sm:w-auto inline-flex justify-center font-medium text-sm text-white bg-blue py-2.5 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark"
          >
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

const OrderSuccessPage = () => {
  return (
    <>
      <Breadcrumb title={"Order Success"} pages={["order success"]} />
      <section className="bg-gray-2">
        <Suspense fallback={<div>Loading...</div>}>
          <OrderSuccessContent />
        </Suspense>
      </section>
    </>
  );
};

export default OrderSuccessPage;
