import FAQ from "@/components/FAQ";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | OUTDID UNIFIED",
  description: "Frequently Asked Questions - Get answers to common queries about our products and services",
};

const FAQPage = () => {
  return (
    <main>
      <FAQ />
    </main>
  );
};

export default FAQPage;
