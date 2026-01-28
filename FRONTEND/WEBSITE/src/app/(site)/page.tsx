import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopix",
  description: "Ecommerce",
  // other metadata
};

export default function HomePage() {
  return (
    <>
      <Home />
    </>
  );
}
