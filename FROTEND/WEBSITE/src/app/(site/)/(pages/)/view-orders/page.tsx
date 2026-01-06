import React from "react";
import OrderHistory from "@/components/Orders";
import { Metadata } from "next";
import Breadcrumb from "@/components/Common/Breadcrumb";

export const metadata: Metadata = {
  title: "My Orders - E-Commerce",
  description: "View your order history",
};

const MyOrdersPage = () => {
  return (
    <main className="pt-20">
      <Breadcrumb title={"My Orders"} pages={["My Orders"]} />
      <section className="bg-gray-2 py-10 min-h-screen">
        <div className="max-w-[1400px] mx-auto px-4">
          <OrderHistory />
        </div>
      </section>
    </main>
  );
};

export default MyOrdersPage;
