"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useState } from "react";
import { API_ENDPOINTS } from "@/lib/api";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const ForgotPassword = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpRef, setOtpRef] = useState("");
  const [resetToken, setResetToken] = useState("");
  
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(API_ENDPOINTS.FORGOT_PASSWORD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await response.json();
      if (data.success) {
        setOtpRef(data.data?.otpRef || "");
        toast.success(data.message || "OTP sent to your email");
        setStep(2);
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleValidateOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(API_ENDPOINTS.VALIDATE_OTP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          otp: formData.otp,
          otpRef: otpRef 
        }),
      });
      const data = await response.json();
      if (data.success) {
        setResetToken(data.data?.resetToken || "");
        setStep(3);
        toast.success("OTP verified successfully");
      } else {
        setError(data.message || "Invalid OTP");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(API_ENDPOINTS.SET_NEW_PASSWORD, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${resetToken}`
        },
        body: JSON.stringify({
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Password reset successfully! Redirecting to sign in...");
        setTimeout(() => {
          router.push("/signin");
        }, 2000);
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb title={"Forgot Password"} pages={["Forgot Password"]} />
      <section className="overflow-hidden py-10 bg-gray-2">
        <div className="max-w-[1300px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-6 xl:p-9">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-blue/5 flex items-center justify-center text-blue mb-5">
                {step === 1 && (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                )}
                {step === 2 && (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                )}
                {step === 3 && (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                )}
              </div>
              <h2 className="font-medium text-xl text-dark mb-2">
                {step === 1 && "Forgot Password?"}
                {step === 2 && "Verify OTP"}
                {step === 3 && "Set New Password"}
              </h2>
              <p className="text-dark-5 max-w-[300px]">
                {step === 1 && "No worries! Enter your email below to receive an OTP."}
                {step === 2 && "We've sent a 6-digit verification code to your email."}
                {step === 3 && "Your identity is verified. Now create your new password."}
              </p>
            </div>

            <div className="mt-5.5">
              {step === 1 && (
                <form onSubmit={handleSendOtp}>
                  <div className="mb-5">
                    <label htmlFor="email" className="block mb-2.5 text-dark">
                      Email Address <span className="text-red">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                      required
                      className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue/90 disabled:bg-gray-4"
                  >
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleValidateOtp}>
                  <div className="mb-5">
                    <label htmlFor="otp" className="block mb-2.5 text-dark">
                      OTP Code <span className="text-red">*</span>
                    </label>
                    <input
                      type="text"
                      name="otp"
                      id="otp"
                      value={formData.otp}
                      onChange={handleChange}
                      placeholder="Enter 6-digit OTP"
                      required
                      className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue/90 disabled:bg-gray-4"
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={handleResetPassword}>
                  <div className="mb-5">
                    <label htmlFor="newPassword" className="block mb-2.5 text-dark">
                      New Password <span className="text-red">*</span>
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      id="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Enter new password"
                      required
                      className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>
                  <div className="mb-5">
                    <label htmlFor="confirmPassword" className="block mb-2.5 text-dark">
                      Confirm New Password <span className="text-red">*</span>
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                      required
                      className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue/90 disabled:bg-gray-4"
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                </form>
              )}

              <div className="mt-5">
                {error && <p className="text-red text-sm font-medium">{error}</p>}
              </div>

              <p className="text-center mt-6">
                Back to
                <Link
                  href="/signin"
                  className="text-dark ease-out duration-200 hover:text-blue pl-2 font-medium"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ForgotPassword;
