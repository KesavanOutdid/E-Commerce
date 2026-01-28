"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useState } from "react";
import { API_ENDPOINTS } from "@/lib/api";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const Signup = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    otpCode: "",
  });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string) => {
    let errorMsg = "";
    switch (name) {
      case "firstName":
        if (!value.trim()) errorMsg = "First name is required";
        else if (value.length < 2) errorMsg = "Please enter a valid first name";
        break;
      case "lastName":
        if (!value.trim()) errorMsg = "Last name is required";
        else if (value.length < 2) errorMsg = "Please enter a valid last name";
        break;
      case "email":
        if (!value.trim()) errorMsg = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errorMsg = "Please enter a valid email address";
        break;
      case "phone":
        if (!value.trim()) errorMsg = "Phone is required";
        else if (!/^[0-9]{10}$/.test(value.replace(/\s/g, ""))) errorMsg = "Please enter a valid 10-digit phone number";
        break;
      case "password":
        if (!value) errorMsg = "Password is required";
        else if (value.length < 8) errorMsg = "Password must be at least 8 characters";
        break;
      case "confirmPassword":
        if (!value) errorMsg = "Please confirm your password";
        else if (value !== formData.password) errorMsg = "Passwords do not match";
        break;
      case "otpCode":
        if (!value) errorMsg = "OTP is required";
        else if (!/^[0-9]{6}$/.test(value)) errorMsg = "Please enter a valid 6-digit OTP";
        break;
    }
    setValidationErrors(prev => ({ ...prev, [name]: errorMsg }));
    return errorMsg;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
    if (error) setError("");
  };

  const sendOtp = async () => {
    if (!formData.email) {
      setError("Please enter your email first");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(API_ENDPOINTS.SEND_OTP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message || "OTP sent to email");
        setOtpSent(true);
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      const e1 = validateField("firstName", formData.firstName);
      const e2 = validateField("lastName", formData.lastName);
      const e3 = validateField("email", formData.email);
      const e4 = validateField("otpCode", formData.otpCode);

      if (e1 || e2 || e3 || e4) {
        setError("Please fix errors before proceeding");
        return;
      }
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      nextStep();
      return;
    }

    const e1 = validateField("phone", formData.phone);
    const e2 = validateField("password", formData.password);
    const e3 = validateField("confirmPassword", formData.confirmPassword);

    if (e1 || e2 || e3) {
      setError("Please fix errors before submitting");
      return;
    }

    if (!otpSent) {
      setError("Please send and enter OTP first");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          otpCode: formData.otpCode,
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Account created successfully! Redirecting to sign in...");
        setTimeout(() => {
          router.push("/signin");
        }, 2000);
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb title={"Signup"} pages={["Signup"]} />
      <section className="overflow-hidden pt-15 pb-10 bg-gray-2">
        <div className="max-w-[1300px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[480px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-6 xl:p-7.5">
            <div className="text-center mb-7">
              <h2 className="font-medium text-xl text-dark mb-1.5">
                Create an Account
              </h2>
              <p>Enter your detail below</p>
            </div>

            <div className="flex items-center justify-between mb-8 relative max-w-[320px] mx-auto">
              <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-3"></div>
              <div 
                className="absolute top-5 left-0 h-0.5 bg-blue transition-all duration-500"
                style={{ width: step === 1 ? '0%' : '100%' }}
              ></div>
              
              <div className="relative flex flex-col items-center gap-2 bg-white px-3 z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-300 ${step >= 1 ? 'bg-blue border-blue text-white' : 'bg-white border-gray-3 text-dark'}`}>
                  {step > 1 ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  ) : "1"}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= 1 ? 'text-blue' : 'text-dark-5'}`}>Account</span>
              </div>

              <div className="relative flex flex-col items-center gap-2 bg-white px-3 z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-300 ${step >= 2 ? 'bg-blue border-blue text-white' : 'bg-white border-gray-3 text-dark'}`}>
                  2
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= 2 ? 'text-blue' : 'text-dark-5'}`}>Credentials</span>
              </div>
            </div>

            {/* <div className="flex flex-col gap-4">
              <button className="flex justify-center items-center gap-3.5 rounded-lg border border-gray-3 bg-gray-1 p-3 ease-out duration-200 hover:bg-gray-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_98_7461)">
                    <mask
                      id="mask0_98_7461"
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="20"
                      height="20"
                    >
                      <path d="M20 0H0V20H20V0Z" fill="white" />
                    </mask>
                    <g mask="url(#mask0_98_7461)">
                      <path
                        d="M19.999 10.2218C20.0111 9.53429 19.9387 8.84791 19.7834 8.17737H10.2031V11.8884H15.8267C15.7201 12.5391 15.4804 13.162 15.1219 13.7195C14.7634 14.2771 14.2935 14.7578 13.7405 15.1328L13.7209 15.2571L16.7502 17.5568L16.96 17.5774C18.8873 15.8329 19.999 13.2661 19.999 10.2218Z"
                        fill="#4285F4"
                      />
                      <path
                        d="M10.2036 20C12.9586 20 15.2715 19.1111 16.9609 17.5777L13.7409 15.1332C12.8793 15.7223 11.7229 16.1333 10.2036 16.1333C8.91317 16.126 7.65795 15.7206 6.61596 14.9746C5.57397 14.2287 4.79811 13.1802 4.39848 11.9777L4.2789 11.9877L1.12906 14.3766L1.08789 14.4888C1.93622 16.1457 3.23812 17.5386 4.84801 18.512C6.45791 19.4852 8.31194 20.0005 10.2036 20Z"
                        fill="#34A853"
                      />
                      <path
                        d="M4.39899 11.9776C4.1758 11.3411 4.06063 10.673 4.05807 9.9999C4.06218 9.3279 4.1731 8.66067 4.38684 8.02221L4.38115 7.88959L1.1927 5.46234L1.0884 5.51095C0.372762 6.90337 0 8.44075 0 9.99983C0 11.5589 0.372762 13.0962 1.0884 14.4887L4.39899 11.9776Z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M10.2039 3.86663C11.6661 3.84438 13.0802 4.37803 14.1495 5.35558L17.0294 2.59997C15.1823 0.90185 12.7364 -0.0298855 10.2039 -3.67839e-05C8.31239 -0.000477835 6.45795 0.514733 4.84805 1.48799C3.23816 2.46123 1.93624 3.85417 1.08789 5.51101L4.38751 8.02225C4.79107 6.82005 5.5695 5.77231 6.61303 5.02675C7.65655 4.28119 8.91254 3.87541 10.2039 3.86663Z"
                        fill="#EB4335"
                      />
                    </g>
                  </g>
                  <defs>
                    <clipPath id="clip0_98_7461">
                      <rect width="20" height="20" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                Sign Up with Google
              </button>

              
            </div> */}

            <span className="relative z-1 block font-medium text-center mt-4">
              <span className="block absolute -z-1 left-0 top-1/2 h-px w-full bg-gray-3"></span>
              <span className="inline-block px-3 bg-white">Or</span>
            </span>

            <div className="mt-5">
              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <>
                    <div className="flex flex-col sm:flex-row gap-5 mb-4">
                      <div className="w-full sm:w-1/2">
                        <label htmlFor="firstName" className="block mb-2.5">
                          First Name <span className="text-red">*</span>
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          id="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="First name"
                          className={`rounded-lg border bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${
                            validationErrors.firstName ? "border-red" : "border-gray-3"
                          }`}
                        />
                        {validationErrors.firstName && (
                          <p className="text-red text-xs mt-1">{validationErrors.firstName}</p>
                        )}
                      </div>
                      <div className="w-full sm:w-1/2">
                        <label htmlFor="lastName" className="block mb-2.5">
                          Last Name <span className="text-red">*</span>
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          id="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Last name"
                          className={`rounded-lg border bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${
                            validationErrors.lastName ? "border-red" : "border-gray-3"
                          }`}
                        />
                        {validationErrors.lastName && (
                          <p className="text-red text-xs mt-1">{validationErrors.lastName}</p>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="email" className="block mb-2.5">
                        Email Address <span className="text-red">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter your email address"
                          className={`rounded-lg border bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${
                            validationErrors.email ? "border-red" : "border-gray-3"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={sendOtp}
                          disabled={loading || otpSent}
                          className="whitespace-nowrap rounded-lg bg-blue px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-blue/90 disabled:bg-gray-4 mt-auto mb-1 h-fit"
                        >
                          {otpSent ? "Sent" : "Send OTP"}
                        </button>
                      </div>
                      {validationErrors.email && (
                        <p className="text-red text-xs mt-1">{validationErrors.email}</p>
                      )}
                    </div>

                    {otpSent && (
                      <>
                        <div className="mb-4">
                          <label htmlFor="otpCode" className="block mb-2.5">
                            OTP Code <span className="text-red">*</span>
                          </label>
                          <input
                            type="text"
                            name="otpCode"
                            id="otpCode"
                            value={formData.otpCode}
                            onChange={handleChange}
                            placeholder="Enter 6-digit OTP"
                            className={`rounded-lg border bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${
                              validationErrors.otpCode ? "border-red" : "border-gray-3"
                            }`}
                          />
                          {validationErrors.otpCode && (
                            <p className="text-red text-xs mt-1">{validationErrors.otpCode}</p>
                          )}
                        </div>

                        <div className="flex justify-center mt-6">
                          <button
                            type="button"
                            onClick={nextStep}
                            className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue/90"
                          >
                            Next
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="mb-4">
                      <label htmlFor="phone" className="block mb-2.5">
                        Phone Number <span className="text-red">*</span>
                      </label>
                      <input
                        type="text"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        className={`rounded-lg border bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${
                          validationErrors.phone ? "border-red" : "border-gray-3"
                        }`}
                      />
                      {validationErrors.phone && (
                        <p className="text-red text-xs mt-1">{validationErrors.phone}</p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-5 mb-4">
                      <div className="w-full sm:w-1/2">
                        <label htmlFor="password" className="block mb-2.5">
                          Password <span className="text-red">*</span>
                        </label>
                        <input
                          type="password"
                          name="password"
                          id="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Enter your password"
                          autoComplete="new-password"
                          className={`rounded-lg border bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${
                            validationErrors.password ? "border-red" : "border-gray-3"
                          }`}
                        />
                        {validationErrors.password && (
                          <p className="text-red text-xs mt-1">{validationErrors.password}</p>
                        )}
                      </div>
                      <div className="w-full sm:w-1/2">
                        <label htmlFor="confirmPassword" className="block mb-2.5">
                          Re-type Password <span className="text-red">*</span>
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          id="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Re-type your password"
                          autoComplete="new-password"
                          className={`rounded-lg border bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${
                            validationErrors.confirmPassword ? "border-red" : "border-gray-3"
                          }`}
                        />
                        {validationErrors.confirmPassword && (
                          <p className="text-red text-xs mt-1">{validationErrors.confirmPassword}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-4 mt-6">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="w-1/2 flex justify-center font-medium text-blue border border-blue bg-white py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue hover:text-white"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-1/2 flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue/90 disabled:bg-gray-4"
                      >
                        {loading ? "Creating Account..." : "Create Account"}
                      </button>
                    </div>
                  </>
                )}

                <div className="mt-4">
                  {error && !error.toLowerCase().includes("email") && (
                    <p className="text-red text-sm mt-2 font-medium">{error}</p>
                  )}
                </div>

                <p className="text-center mt-5">
                  Already have an account?
                  <Link
                    href="/signin"
                    className="text-dark ease-out duration-200 hover:text-blue pl-2"
                  >
                    Sign in Now
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signup;
