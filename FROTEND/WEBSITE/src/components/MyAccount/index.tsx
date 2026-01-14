"use client";
import React, { useState, useEffect, useRef } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import Orders from "../Orders";
import { Wishlist } from "../Wishlist";
import AddressesTab from "./AddressesTab";
import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { logout, setAuth } from "@/redux/features/auth-slice";
import { API_ENDPOINTS, API_BASE_URL } from "@/lib/api";
import { toast } from "react-hot-toast";
import { useSearchParams, useRouter } from "next/navigation";

const MyAccount = () => {
  const { user, accessToken } = useAppSelector((state) => state.authReducer);
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tab || "dashboard");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    profileImage: user?.profileImage || "",
    password: "",
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    password: "",
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      firstName: "",
      lastName: "",
      phone: "",
      password: "",
    };

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
      isValid = false;
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = "Please enter a valid first name";
      isValid = false;
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
      isValid = false;
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = "Please enter a valid last name";
      isValid = false;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
      isValid = false;
    }

    if (formData.password && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const isDirty = 
    formData.firstName !== (user?.firstName || "") ||
    formData.lastName !== (user?.lastName || "") ||
    formData.phone !== (user?.phone || "") ||
    formData.password !== "";

  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    }
  }, [tab]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        profileImage: user.profileImage || "",
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
    router.push(`/my-account?tab=${tabName}`);
  };

  const getInitials = () => {
    if (!user?.firstName) return "U";
    return `${user.firstName.charAt(0)}${user.lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: Preview before upload
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, profileImage: reader.result as string }));
    };
    reader.readAsDataURL(file);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("profileImage", file);

      const response = await fetch(API_ENDPOINTS.USER_PROFILE, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: uploadFormData,
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Profile image updated!");
        const updatedUser = data.user || { ...user, profileImage: data.profileImage };
        dispatch(setAuth({ user: updatedUser, accessToken: accessToken! }));
      } else {
        toast.error(data.message || "Failed to upload image");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("An error occurred during upload.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const updateData: any = { 
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      };
      
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch(API_ENDPOINTS.USER_PROFILE, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Profile updated successfully!");
        dispatch(setAuth({ user: { ...user, ...updateData }, accessToken: accessToken! }));
        setFormData((prev) => ({ ...prev, password: "" }));
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <>
      <Breadcrumb title={"My Account"} pages={["my account"]} />

      <section className="overflow-hidden py-14 bg-gray-2">
        <div className="max-w-[1300px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col md:flex-row items-stretch gap-8">
            {/* Sidebar Navigation */}
            <div className="md:w-[280px] lg:w-[300px] flex-shrink-0 flex flex-col gap-4">
              {/* Profile Card (Flipkart Style) */}
              <div className="bg-white rounded-xl shadow-sm p-3 flex items-center gap-4">
                <div className="relative w-12 h-12 flex-shrink-0 group cursor-pointer">
                  {formData.profileImage ? (
                    <Image
                      src={formData.profileImage}
                      alt="user"
                      fill
                      className="rounded-full object-cover transition-opacity group-hover:opacity-75"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-blue/10 text-blue flex items-center justify-center font-bold text-lg border border-blue/20 transition-opacity group-hover:opacity-75">
                      {getInitials()}
                    </div>
                  )}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                    </svg>
                  </div>
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                    accept="image/*"
                  />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[14px] text-dark">Hello,</p>
                  <h3 className="font-medium text-[15px] text-dark truncate">
                    {user?.firstName} {user?.lastName}
                  </h3>
                </div>
              </div>

              {/* Navigation Card */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden min-h-[500px]">
                <nav className="flex flex-col">
                  {/* Dashboard Section */}
                  <button
                    onClick={() => handleTabChange("dashboard")}
                    className={`flex items-center justify-between w-full text-left px-6 py-3.5 transition-all border-b border-gray-1 group ${
                      activeTab === "dashboard" ? "bg-white" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <svg className={`transition-colors ${activeTab === "dashboard" ? "text-blue" : "text-gray-400"}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                      </svg>
                      <span className={`text-[13px] font-medium ${activeTab === "dashboard" ? "text-blue" : "text-dark"}`}>DASHBOARD</span>
                    </div>
                    <svg className="text-gray-300 group-hover:text-gray-400 transition-all" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>

                  {/* My Orders Section */}
                  <button
                    onClick={() => handleTabChange("orders")}
                    className={`flex items-center justify-between w-full text-left px-6 py-3.5 transition-all border-b border-gray-1 group ${
                      activeTab === "orders" ? "bg-white" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <svg className={`transition-colors ${activeTab === "orders" ? "text-blue" : "text-gray-400"}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/>
                      </svg>
                      <span className={`text-[13px] font-medium ${activeTab === "orders" ? "text-blue" : "text-dark"}`}>MY ORDERS</span>
                    </div>
                    <svg className="text-gray-300 group-hover:text-gray-400 transition-all" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>

                  {/* Account Settings Section */}
                  <button
                    onClick={() => handleTabChange("account-details")}
                    className={`flex items-center justify-between w-full text-left px-6 py-3.5 transition-all border-b border-gray-1 group ${
                      activeTab === "account-details" || activeTab === "change-password" ? "bg-white" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <svg className={`transition-colors ${activeTab === "account-details" || activeTab === "change-password" ? "text-blue" : "text-gray-400"}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                      <span className={`text-[13px] font-medium ${activeTab === "account-details" || activeTab === "change-password" ? "text-blue" : "text-dark"}`}>ACCOUNT SETTINGS</span>
                    </div>
                    <svg className="text-gray-300 group-hover:text-gray-400 transition-all" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>

                  {/* My Wishlist */}
                  <button
                    onClick={() => handleTabChange("wishlist")}
                    className={`flex items-center justify-between w-full text-left px-6 py-3.5 transition-all border-b border-gray-1 group ${
                      activeTab === "wishlist" ? "bg-white" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <svg className={`transition-colors ${activeTab === "wishlist" ? "text-blue" : "text-gray-400"}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                      <span className={`text-[13px] font-medium ${activeTab === "wishlist" ? "text-blue" : "text-dark"}`}>MY WISHLIST</span>
                    </div>
                    <svg className="text-gray-300 group-hover:text-gray-400 transition-all" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>

                  {/* Addresses Section */}
                  <button
                    onClick={() => handleTabChange("addresses")}
                    className={`flex items-center justify-between w-full text-left px-6 py-3.5 transition-all border-b border-gray-1 group ${
                      activeTab === "addresses" ? "bg-white" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <svg className={`transition-colors ${activeTab === "addresses" ? "text-blue" : "text-gray-400"}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      <span className={`text-[13px] font-medium ${activeTab === "addresses" ? "text-blue" : "text-dark"}`}>ADDRESSES</span>
                    </div>
                    <svg className="text-gray-300 group-hover:text-gray-400 transition-all" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 w-full text-left px-6 py-3.5 transition-all hover:bg-gray-50 group"
                  >
                    <svg className="text-red/70 group-hover:text-red transition-colors" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
                    </svg>
                    <span className="text-[13px] font-medium text-red group-hover:text-red transition-colors">LOGOUT</span>
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow">
              <div className="bg-white rounded-xl shadow-sm p-6 min-h-[500px]">
                {/* Dashboard Tab */}
                {activeTab === "dashboard" && (
                  <div className="animate-fadeIn">
                    <h2 className="text-xl font-medium text-dark mb-6">Welcome back, {user?.firstName}!</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                      From your account dashboard you can view your recent orders, manage your shipping and billing addresses, and edit your password and account details.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                      <div onClick={() => handleTabChange("orders")} className="p-6 border border-gray-1 rounded-xl hover:border-blue hover:shadow-md transition-all cursor-pointer group bg-gray-1/30">
                        <div className="w-12 h-12 bg-blue/10 text-blue rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue group-hover:text-white transition-all">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/>
                          </svg>
                        </div>
                        <h4 className="font-bold text-dark mb-1">Orders</h4>
                        <p className="text-sm text-gray-500">Check your order status</p>
                      </div>
                      <div onClick={() => handleTabChange("wishlist")} className="p-6 border border-gray-1 rounded-xl hover:border-blue hover:shadow-md transition-all cursor-pointer group bg-gray-1/30">
                        <div className="w-12 h-12 bg-blue/10 text-blue rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue group-hover:text-white transition-all">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                          </svg>
                        </div>
                        <h4 className="font-bold text-dark mb-1">Wishlist</h4>
                        <p className="text-sm text-gray-500">View your saved items</p>
                      </div>
                      <div onClick={() => handleTabChange("account-details")} className="p-6 border border-gray-1 rounded-xl hover:border-blue hover:shadow-md transition-all cursor-pointer group bg-gray-1/30">
                        <div className="w-12 h-12 bg-blue/10 text-blue rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue group-hover:text-white transition-all">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                          </svg>
                        </div>
                        <h4 className="font-bold text-dark mb-1">Profile</h4>
                        <p className="text-sm text-gray-500">Update your information</p>
                      </div>
                      <div onClick={() => handleTabChange("addresses")} className="p-6 border border-gray-1 rounded-xl hover:border-blue hover:shadow-md transition-all cursor-pointer group bg-gray-1/30">
                        <div className="w-12 h-12 bg-blue/10 text-blue rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue group-hover:text-white transition-all">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                          </svg>
                        </div>
                        <h4 className="font-bold text-dark mb-1">Addresses</h4>
                        <p className="text-sm text-gray-500">Manage your shipping addresses</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Orders Tab */}
                {activeTab === "orders" && (
                  <div className="animate-fadeIn">
                    <h2 className="text-xl font-medium text-dark mb-6 border-b border-gray-1 pb-4">My Orders</h2>
                    <Orders />
                  </div>
                )}

                {/* Wishlist Tab */}
                {activeTab === "wishlist" && (
                  <div className="animate-fadeIn">
                    <h2 className="text-xl font-medium text-dark mb-6 border-b border-gray-1 pb-4">My Wishlist</h2>
                    <Wishlist hideHeader={true} />
                  </div>
                )}

                {/* Basic Info Tab */}
                {(activeTab === "account-details" || activeTab === "change-password") && (
                  <div className="animate-fadeIn">
                    <h2 className="text-xl font-medium text-dark mb-6 border-b border-gray-1 pb-4">Basic Information</h2>
                    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">First Name</label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue/20 focus:border-blue outline-none transition-all ${
                              errors.firstName ? "border-red" : "border-gray-3"
                            }`}
                          />
                          {errors.firstName && (
                            <p className="text-red text-xs mt-1">{errors.firstName}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Last Name</label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue/20 focus:border-blue outline-none transition-all ${
                              errors.lastName ? "border-red" : "border-gray-3"
                            }`}
                          />
                          {errors.lastName && (
                            <p className="text-red text-xs mt-1">{errors.lastName}</p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue/20 focus:border-blue outline-none transition-all ${
                            errors.phone ? "border-red" : "border-gray-3"
                          }`}
                        />
                        {errors.phone && (
                          <p className="text-red text-xs mt-1">{errors.phone}</p>
                        )}
                      </div>
                      <div className="space-y-2 pt-2 border-t border-gray-1 mt-6">
                        <label className="text-sm font-medium text-gray-700">New Password</label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue/20 focus:border-blue outline-none transition-all ${
                            errors.password ? "border-red" : "border-gray-3"
                          }`}
                          placeholder="Enter new password to change"
                        />
                        {errors.password && (
                          <p className="text-red text-xs mt-1">{errors.password}</p>
                        )}
                        <p className="text-xs text-gray-500">Leave blank if you don't want to change your password.</p>
                      </div>
                      <div className="pt-4 flex justify-right">
                        <button
                          type="submit"
                          disabled={!isDirty}
                          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg active:scale-[0.98] ${
                            isDirty 
                              ? "bg-blue text-white hover:bg-blue/90" 
                              : "bg-blue/50 text-white/70 cursor-not-allowed shadow-none"
                          }`}
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Addresses Tab */}
                {activeTab === "addresses" && (
                  <AddressesTab accessToken={accessToken!} />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default MyAccount;
