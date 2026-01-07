import RefundPolicy from "@/components/RefundPolicy";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy | OUTDID UNIFIED",
  description: "Refund Policy - Learn about our refund process and eligibility criteria",
};

const RefundPolicyPage = () => {
  return (
    <main>
      <RefundPolicy />
    </main>
  );
};

export default RefundPolicyPage;
