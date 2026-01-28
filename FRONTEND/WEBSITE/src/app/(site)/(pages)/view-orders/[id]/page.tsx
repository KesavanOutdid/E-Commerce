import React from "react";
import OrderDetail from "@/components/Orders/OrderDetail";
import { Metadata } from "next";
import Breadcrumb from "@/components/Common/Breadcrumb";

export const metadata: Metadata = {
  title: "Order Details - E-Commerce",
  description: "View order details",
};

const OrderDetailsPage = () => {
  return (
    <main className="pt-20">
      <Breadcrumb title={`Order Details`} pages={["My Orders", "Order Details"]} />
      <section className="bg-gray-2 py-10 min-h-screen">
        <div className="max-w-[1400px] mx-auto px-4">
          <OrderDetail />
        </div>
      </section>
    </main>
  );
};

export default OrderDetailsPage;
