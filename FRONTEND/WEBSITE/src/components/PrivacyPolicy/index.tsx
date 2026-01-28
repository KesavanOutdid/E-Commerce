import React from "react";

const PrivacyPolicy = () => {
  return (
    <section className="pt-20 pb-20 lg:pt-25 lg:pb-25 xl:pt-30 xl:pb-30">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-8 xl:px-0">
        <div className="max-w-3xl">
          <h1 className="mb-8 mt-10 text-xl font-semibold text-dark">Privacy Policy</h1>

          <div className="space-y-6 text-dark leading-relaxed">
            <div>
              <h2 className="mb-4 text-lg font-medium">Introduction</h2>
              <p>
                OUTDID UNIFIED PVT LTD ("we", "us", or "our") operates the outdidunified.com website.
                This page informs you of our policies regarding the collection, use, and disclosure
                of personal data when you use our Service and the choices you have associated with that data.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-lg font-semibold">Information Collection and Use</h2>
              <p>
                We collect several different types of information for various purposes to provide and
                improve our Service to you.
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>Account information (name, email, address, phone number)</li>
                <li>Payment information (processed securely by payment providers)</li>
                <li>Order history and preferences</li>
                <li>Website usage data (cookies, IP address, browser information)</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-4 text-lg font-semibold">Use of Data</h2>
              <p>OUTDID UNIFIED PVT LTD uses the collected data for various purposes:</p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>To provide and maintain our Service</li>
                <li>To notify you about changes to our Service</li>
                <li>To provide customer support</li>
                <li>To gather analysis or valuable information to improve our Service</li>
                <li>To monitor the usage of our Service</li>
                <li>To send marketing communications</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-4 text-lg font-semibold">Security of Data</h2>
              <p>
                The security of your data is important to us but remember that no method of transmission
                over the Internet or method of electronic storage is 100% secure. While we strive to use
                commercially acceptable means to protect your personal data, we cannot guarantee its
                absolute security.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-lg font-semibold">Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="mt-4 space-y-2">
                <p><strong>Email:</strong> {" "} <a href="mailto:info@outdidunified.com" className="text-blue hover:underline">info@outdidunified.com</a></p>
                <p><strong>Phone:</strong> {" "} <a href="tel:+918095945298" className="text-blue hover:underline">+91 80959 45298</a></p>
                <p><strong>Address:</strong> 2nd Floor, Indian Water Works Association, 10(P), 7th Main Road, BTM Layout, 2nd Stage, MICO HBCS(1st Stage), Bangalore-560076</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicy;
