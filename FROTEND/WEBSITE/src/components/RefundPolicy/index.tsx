import React from "react";

const RefundPolicy = () => {
  return (
    <section className="pt-20 pb-20 lg:pt-25 lg:pb-25 xl:pt-30 xl:pb-30">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-8 xl:px-0">
        <div className="max-w-3xl">
          <h1 className="mb-8 mt-10 text-xl font-semibold text-dark">Refund Policy</h1>

          <div className="space-y-6 text-dark leading-relaxed">
            <div>
              <h2 className="mb-4 text-lg font-medium">Overview</h2>
              <p>
                At OUTDID UNIFIED PVT LTD, we want you to be completely satisfied with your purchase.
                If you're not happy with your order, we offer a hassle-free refund policy to ensure
                your complete satisfaction.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-lg font-medium">Refund Eligibility</h2>
              <p>To be eligible for a refund, the following conditions must be met:</p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>The refund request must be made within 30 days of purchase</li>
                <li>The product must be unused and in original condition</li>
                <li>Original packaging and all accessories must be intact</li>
                <li>Proof of purchase (order confirmation) is required</li>
                <li>The product should not show any signs of wear or damage</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-4 text-lg font-medium">Non-Refundable Items</h2>
              <p>The following items are not eligible for refund:</p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>Items purchased during special sales or clearance events</li>
                <li>Personalized or custom-made products</li>
                <li>Digital products or downloads</li>
                <li>Items damaged due to misuse or negligence</li>
                <li>Products without original tags or packaging</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-4 text-lg font-medium">Refund Process</h2>
              <ol className="list-decimal list-inside space-y-2 mt-4">
                <li>Contact our customer support team with your order number</li>
                <li>Provide details about the reason for the refund request</li>
                <li>Receive return shipping instructions</li>
                <li>Ship the product back to us in original condition</li>
                <li>We'll inspect the returned item</li>
                <li>Once approved, your refund will be processed within 7-10 business days</li>
              </ol>
            </div>

            <div>
              <h2 className="mb-4 text-lg font-medium">Refund Timeline</h2>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li><strong>Return Shipping:</strong> 5-7 business days</li>
                <li><strong>Processing Time:</strong> 2-3 business days after receipt</li>
                <li><strong>Refund Issuance:</strong> 7-10 business days to original payment method</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-4 text-lg font-medium">Return Shipping</h2>
              <p>
                Customers are responsible for return shipping costs unless the return is due to our error
                or a defective product. For defective items, we'll provide a prepaid return label.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-lg font-medium">Exceptions</h2>
              <p>
                Products with defects or damage upon arrival are eligible for replacement or full refund
                regardless of the timeline. Please contact us within 48 hours of delivery for defective items.
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-lg font-medium">Contact Us</h2>
              <p>
                For any refund-related inquiries, please contact our support team:
              </p>
              <div className="mt-4 space-y-2">
                <p><strong>Email:</strong> <a href="mailto:info@outdidunified.com" className="text-blue hover:underline">info@outdidunified.com</a></p>
                <p><strong>Phone:</strong> <a href="tel:+918095945298" className="text-blue hover:underline">+91 80959 45298</a></p>
                <p><strong>Address:</strong> 2nd Floor, Indian Water Works Association, 10(P), 7th Main Road, BTM Layout, 2nd Stage, MICO HBCS(1st Stage), Bangalore-560076</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RefundPolicy;
