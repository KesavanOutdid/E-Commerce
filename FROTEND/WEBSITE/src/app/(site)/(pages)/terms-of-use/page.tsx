import TermsOfUse from "@/components/TermsOfUse";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use | OUTDID UNIFIED",
  description: "Terms of Use - Read our terms and conditions for using our website and services",
};

const TermsOfUsePage = () => {
  return (
    <main>
      <TermsOfUse />
    </main>
  );
};

export default TermsOfUsePage;
