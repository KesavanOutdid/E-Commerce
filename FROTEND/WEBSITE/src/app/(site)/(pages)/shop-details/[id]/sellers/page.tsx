import React from "react";
import SellersList from "@/components/SellersList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Other Sellers | NextCommerce",
  description: "View all available sellers for this product",
};

const SellersPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  
  return (
    <main>
      <SellersList productId={id} />
    </main>
  );
};

export default SellersPage;
