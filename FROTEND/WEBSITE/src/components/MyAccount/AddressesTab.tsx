"use client";
import React, { useState, useEffect } from "react";
import { API_ENDPOINTS } from "@/lib/api";
import { toast } from "react-hot-toast";

interface Address {
  name: string;
  phone: string;
  email: string;
  doorNo: string;
  street: string;
  landmark: string;
  city: string;
  district: string;
  state: string;
  country: string;
  pincode: string;
  createdAt?: string;
}

interface AddressesTabProps {
  accessToken: string;
}

const AddressesTab: React.FC<AddressesTabProps> = ({ accessToken }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<Address>({
    name: "",
    phone: "",
    email: "",
    doorNo: "",
    street: "",
    landmark: "",
    city: "",
    district: "",
    state: "",
    country: "IN",
    pincode: "",
  });

  const isFormValid = 
    formData.name.trim() !== "" &&
    formData.phone.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.doorNo.trim() !== "" &&
    formData.street.trim() !== "" &&
    formData.city.trim() !== "" &&
    formData.district.trim() !== "" &&
    formData.state.trim() !== "" &&
    formData.country.trim() !== "" &&
    formData.pincode.trim() !== "";

  const hasAddressChanged = editingIndex !== null ? (
    formData.name !== addresses[editingIndex].name ||
    formData.phone !== addresses[editingIndex].phone ||
    formData.email !== addresses[editingIndex].email ||
    formData.doorNo !== addresses[editingIndex].doorNo ||
    formData.street !== addresses[editingIndex].street ||
    formData.landmark !== addresses[editingIndex].landmark ||
    formData.city !== addresses[editingIndex].city ||
    formData.district !== addresses[editingIndex].district ||
    formData.state !== addresses[editingIndex].state ||
    formData.country !== addresses[editingIndex].country ||
    formData.pincode !== addresses[editingIndex].pincode
  ) : true;

  const canSubmit = isFormValid && hasAddressChanged;

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.ADDRESSES, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setAddresses(data.data || []);
      }
    } catch (error) {
      console.error("Fetch addresses error:", error);
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchAddresses();
    }
  }, [accessToken]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      doorNo: "",
      street: "",
      landmark: "",
      city: "",
      district: "",
      state: "",
      country: "IN",
      pincode: "",
    });
    setEditingIndex(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingIndex !== null 
        ? API_ENDPOINTS.ADDRESS_DETAIL(editingIndex)
        : API_ENDPOINTS.ADDRESSES;
      
      const method = editingIndex !== null ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message || (editingIndex !== null ? "Address updated" : "Address added"));
        fetchAddresses();
        resetForm();
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (error) {
      console.error("Submit address error:", error);
      toast.error("An error occurred");
    }
  };

  const handleEdit = (index: number) => {
    const address = addresses[index];
    setFormData({ ...address });
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDelete = async (index: number) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    
    try {
      const response = await fetch(API_ENDPOINTS.ADDRESS_DETAIL(index), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Address deleted successfully");
        fetchAddresses();
      } else {
        toast.error(data.message || "Failed to delete address");
      }
    } catch (error) {
      console.error("Delete address error:", error);
      toast.error("An error occurred");
    }
  };

  if (loading && addresses.length === 0) {
    return <div className="py-10 text-center text-gray-500">Loading addresses...</div>;
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6 border-b border-gray-1 pb-4">
        <h2 className="text-xl font-medium text-dark">My Addresses</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm font-medium text-blue hover:text-blue/80 flex items-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            ADD NEW ADDRESS
          </button>
        )}
      </div>

      {showForm ? (
        <div className="bg-gray-1/30 p-6 rounded-xl border border-gray-1 mb-8">
          <h3 className="text-lg font-medium text-dark mb-6">
            {editingIndex !== null ? "Edit Address" : "Add New Address"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., John Doe"
                  className="w-full px-4 py-3 rounded-lg border border-gray-3 focus:ring-2 focus:ring-blue/20 focus:border-blue outline-none transition-all text-sm"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g., 9876543210"
                  className="w-full px-4 py-3 rounded-lg border border-gray-3 focus:ring-2 focus:ring-blue/20 focus:border-blue outline-none transition-all text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-600">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="e.g., example@gmail.com"
                className="w-full px-4 py-3 rounded-lg border border-gray-3 focus:ring-2 focus:ring-blue/20 focus:border-blue outline-none transition-all text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Door / Flat No.</label>
                <input
                  type="text"
                  name="doorNo"
                  value={formData.doorNo}
                  onChange={handleInputChange}
                  placeholder="e.g., 101"
                  className="w-full px-4 py-3 rounded-lg border border-gray-3 focus:ring-2 focus:ring-blue/20 focus:border-blue outline-none transition-all text-sm"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Street / Area</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  placeholder="e.g., Main Street"
                  className="w-full px-4 py-3 rounded-lg border border-gray-3 focus:ring-2 focus:ring-blue/20 focus:border-blue outline-none transition-all text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-600">Landmark</label>
              <input
                type="text"
                name="landmark"
                value={formData.landmark}
                onChange={handleInputChange}
                placeholder="e.g., Near City Mall"
                className="w-full px-4 py-3 rounded-lg border border-gray-3 focus:ring-2 focus:ring-blue/20 focus:border-blue outline-none transition-all text-sm"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-gray-600">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-3 focus:ring-2 focus:ring-blue/20 focus:border-blue outline-none transition-all text-sm"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-600">District</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-3 focus:ring-2 focus:ring-blue/20 focus:border-blue outline-none transition-all text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-gray-600">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-3 focus:ring-2 focus:ring-blue/20 focus:border-blue outline-none transition-all text-sm"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-3 focus:ring-2 focus:ring-blue/20 focus:border-blue outline-none transition-all text-sm"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-3 focus:ring-2 focus:ring-blue/20 focus:border-blue outline-none transition-all text-sm"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={!canSubmit}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg active:scale-[0.98] ${
                  canSubmit 
                    ? "bg-blue text-white hover:bg-blue/90" 
                    : "bg-blue/50 text-white/70 cursor-not-allowed shadow-none"
                }`}
              >
                {editingIndex !== null ? "Update Address" : "Save Address"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {addresses.length === 0 ? (
            <div className="col-span-full py-10 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              No addresses found. Add one to get started!
            </div>
          ) : (
            addresses.map((address, index) => (
              <div key={index} className="flex border border-gray-3 rounded-xl bg-white shadow-sm hover:shadow-md transition-all overflow-hidden items-center p-4">
                {/* Address Body */}
                <div className="flex-grow flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-blue/5 flex items-center justify-center text-blue flex-shrink-0 mt-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    <p className="font-bold text-dark truncate">
                      {address.name}
                    </p>
                    <p className="text-[13px] text-gray-500 font-medium">
                      {address.phone} | {address.email}
                    </p>
                    <p className="text-[13px] text-gray-500 leading-normal">
                      {address.doorNo}, {address.street}
                      {address.landmark && `, ${address.landmark}`}
                    </p>
                    <p className="text-[13px] text-gray-500 leading-normal">
                      {address.city}, {address.district}, {address.state}, {address.country}
                    </p>
                    <p className="text-[13px] font-medium text-dark">
                      PIN: {address.pincode}
                    </p>
                  </div>
                </div>

                {/* Address Actions (Right End) */}
                <div className="flex gap-2 ml-4 flex-shrink-0">
                  <button 
                    onClick={() => handleEdit(index)}
                    className="p-2 text-blue hover:bg-blue/10 rounded-lg transition-colors border border-gray-3"
                    title="Edit"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleDelete(index)}
                    className="p-2 text-red hover:bg-red/10 rounded-lg transition-colors border border-gray-3"
                    title="Delete"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AddressesTab;
