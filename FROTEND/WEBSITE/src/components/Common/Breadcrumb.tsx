import Link from "next/link";
import React from "react";

interface BreadcrumbProps {
  title: string;
  pages: string[];
}

const Breadcrumb = ({ title, pages }: BreadcrumbProps) => {
  return (
    <div className="bg-white py-3 mt-[65px]">
      {/* <div className="max-w-full w-full mx-auto px-4 sm:px-8 xl:px-15">
        {/* <nav aria-label="Breadcrumb">
          <ul className="flex items-center gap-2 text-sm text-dark-4">
            <li>
              <Link href="/" className="hover:text-blue transition-colors">
                Home
              </Link>
            </li>
            {pages.map((page, index) => (
              <li key={index} className="flex items-center gap-2">
                <span>/</span>
                <Link
                  href={`/${page.toLowerCase()}`}
                  className={`hover:text-blue transition-colors ${
                    index === pages.length - 1 && !title ? "text-dark font-medium" : ""
                  }`}
                >
                  {page.charAt(0).toUpperCase() + page.slice(1)}
                </Link>
              </li>
            ))}
            {title && (
              <li className="flex items-center gap-2">
                <span>/</span>
                <span className="text-dark font-medium truncate">{title}</span>
              </li>
            )}
          </ul>
        </nav> */}
      {/* </div>  */}
    </div>
  );
};

export default Breadcrumb;
