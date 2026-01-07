import React from "react";
import Image from "next/image";

const COMPANY_INFO = {
  name: "OUTDID UNIFIED PVT LTD",
  address:
    "2nd Floor, Indian Water Works Association, 10(P), 7th Main Road, BTM Layout, 2nd Stage, MICO HBCS(1st Stage), Bangalore-560076",
  phone: "+91 80959 45298",
  emails: {
    primary: "sam@outdidunified.com",
    support: "info@outdidunified.com",
  },
  website: "https://outdidunified.com/",
};

const ACCOUNT_LINKS = [
  { label: "My Account", href: "/my-account" },
  { label: "Login / Register", href: "/signin" },
  { label: "Cart", href: "/cart" },
  { label: "Wishlist", href: "/wishlist" },
];

const QUICK_LINKS = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "Terms of Use", href: "/terms-of-use" },
  { label: "FAQ's", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="overflow-hidden">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-8 xl:px-0">
        {/* FOOTER CONTENT */}
        <div className="flex flex-wrap xl:flex-nowrap gap-10 xl:gap-16 xl:justify-between pt-8 xl:pt-12 pb-6 xl:pb-8">
          
          {/* HELP & SUPPORT */}
          <div className="max-w-[330px] w-full">
            <h2 className="mb-4 text-custom-1 font-medium text-dark">
              Help & Support
            </h2>

            <ul className="flex flex-col gap-3 text-sm">
              <li>{COMPANY_INFO.address}</li>

              <li>
                <a href={`tel:${COMPANY_INFO.phone}`} className="hover:text-blue">
                  {COMPANY_INFO.phone}
                </a>
              </li>

              <li>
                <a
                  href={`mailto:${COMPANY_INFO.emails.support}`}
                  className="hover:text-blue"
                >
                  {COMPANY_INFO.emails.support}
                </a>
              </li>
            </ul>
          </div>

          {/* ACCOUNT */}
          <div>
            <h2 className="mb-4 text-custom-1 font-medium text-dark">
              Account
            </h2>
            <ul className="flex flex-col gap-3 text-sm">
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-blue">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h2 className="mb-4 text-custom-1 font-medium text-dark">
              Quick Link
            </h2>
            <ul className="flex flex-col gap-3 text-sm">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-blue">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* PAYMENTS */}
          <div>
            <p className="font-medium mb-3">We Accept:</p>
            <div className="flex flex-wrap gap-3">
              <Image src="/images/payment/payment-01.svg" alt="Visa" width={60} height={22} />
              <Image src="/images/payment/payment-02.svg" alt="Paypal" width={18} height={21} />
              <Image src="/images/payment/payment-03.svg" alt="MasterCard" width={33} height={24} />
              <Image src="/images/payment/payment-04.svg" alt="Apple Pay" width={52} height={22} />
              <Image src="/images/payment/payment-05.svg" alt="Google Pay" width={56} height={22} />
            </div>
          </div>

        </div>
      </div>

      {/* FOOTER BOTTOM */}
      <div className="py-4 bg-gray-1">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-8 xl:px-0">
          <p className="text-dark text-sm font-medium">
            &copy; {year} OUTDID UNIFIED PVT LTD | Powered by OUTDID UNIFIED PVT LTD
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
