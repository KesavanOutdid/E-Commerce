import React from "react";
import SearchResults from "@/components/SearchResults";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Search Results | E-Commerce",
  description: "Search results for products",
};

const SearchPage = () => {
  return (
    <main>
      <SearchResults />
    </main>
  );
};

export default SearchPage;
