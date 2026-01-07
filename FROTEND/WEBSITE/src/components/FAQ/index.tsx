"use client";

import React from "react";

const FAQ = () => {
  const faqs = [
    {
      question: "How do I track my order?",
      answer: "You can track your order by logging into your account and visiting the 'My Orders' section. You'll find real-time tracking information for all your orders.",
    },
    {
      question: "What is your return policy?",
      answer: "We offer easy returns within 30 days of purchase. Items must be unused and in original packaging. Please contact our support team to initiate a return.",
    },
    {
      question: "How long does delivery take?",
      answer: "Standard delivery takes 5-7 business days. We also offer express delivery (2-3 business days) for an additional fee.",
    },
    {
      question: "Do you ship internationally?",
      answer: "Currently, we ship within India. We are expanding our shipping services soon. Please check back for updates.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept Visa, Mastercard, PayPal, Apple Pay, and Google Pay. All payments are processed securely.",
    },
    {
      question: "How can I contact customer support?",
      answer: "You can reach our support team via email at info@outdidunified.com or call +91 80959 45298. We're available Monday to Friday, 9 AM to 6 PM.",
    },
    {
      question: "Can I cancel my order?",
      answer: "Orders can be cancelled within 24 hours of purchase if they haven't been shipped. Please contact our support team immediately to cancel.",
    },
    {
      question: "Is my personal information secure?",
      answer: "Yes, we use industry-standard encryption and security measures to protect your personal and payment information.",
    },
  ];

  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  return (
    <section className="pt-20 pb-20 lg:pt-25 lg:pb-25 xl:pt-30 xl:pb-30">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-8 xl:px-0">
        <div className="max-w-3xl">
          <h1 className="mb-8 mt-10 text-xl font-semibold text-dark">Frequently Asked Questions</h1>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-2 rounded-md">
                <button
                  className="w-full px-6 py-4 text-left font-semibold text-dark hover:bg-gray-1 transition-colors flex justify-between items-center"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span>{faq.question}</span>
                  <span className="text-blue">
                    {openIndex === index ? "−" : "+"}
                  </span>
                </button>
                {openIndex === index && (
                  <div className="px-6 py-4 bg-gray-1 border-t border-gray-2 text-dark leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-blue-light rounded-md">
            <h2 className="mb-4 text-lg font-medium text-dark">Still have questions?</h2>
            <p className="text-dark mb-4">
              Can't find the answer you're looking for? Please contact our customer support team.
            </p>
            <a
              href="/contact"
              className="inline-block px-6 py-2 bg-blue text-white rounded-md hover:bg-opacity-90 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
