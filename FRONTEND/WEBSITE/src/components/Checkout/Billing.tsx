import React from "react";

interface BillingProps {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  savedAddresses: any[];
  selectedAddressIndex: number | null;
  handleAddressSelect: (index: number | null) => void;
  errors: Record<string, string>;
}

const Billing = ({ 
  formData, 
  handleInputChange, 
  savedAddresses, 
  selectedAddressIndex, 
  handleAddressSelect,
  errors
}: BillingProps) => {
  return (
    <div className="mt-9">
      <h2 className="font-medium text-dark text-xl sm:text-2xl mb-5.5">
        Billing details
      </h2>

      {savedAddresses.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-medium text-dark mb-4">Select a saved address</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {savedAddresses.map((addr, index) => (
              <div 
                key={index}
                onClick={() => handleAddressSelect(index)}
                className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                  selectedAddressIndex === index 
                    ? "border-blue bg-blue/5 shadow-md" 
                    : "border-gray-3 hover:border-blue/50 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-dark">Address {index + 1}</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selectedAddressIndex === index ? "border-blue bg-blue" : "border-gray-4"
                  }`}>
                    {selectedAddressIndex === index && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <p className="text-sm text-dark-4 leading-relaxed">
                  <span className="font-bold text-dark">{addr.name}</span><br />
                  <span className="text-xs">{addr.phone} | {addr.email}</span><br />
                  {addr.doorNo}, {addr.street}<br />
                  {addr.city}, {addr.state} - {addr.pincode}<br />
                  {addr.country}
                </p>
              </div>
            ))}
            
            <div 
              onClick={() => handleAddressSelect(null)}
              className={`cursor-pointer p-4 rounded-lg border-2 border-dashed transition-all flex flex-col items-center justify-center min-h-[120px] ${
                selectedAddressIndex === null 
                  ? "border-blue bg-blue/5 shadow-md" 
                  : "border-gray-3 hover:border-blue/50 bg-white"
              }`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-2">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-medium text-dark">Use a new address</span>
            </div>
          </div>
        </div>
      )}

      {selectedAddressIndex === null && (
        <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-6">
          <div className="mb-5">
            <label htmlFor="name" className="block mb-2.5 font-medium text-dark">
              Full Name <span className="text-red">*</span>
            </label>

            <input
              type="text"
              name="name"
              id="name"
              placeholder="John Doe"
              value={formData.name || ""}
              onChange={handleInputChange}
              required
              className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${
                errors.name ? "border-red" : "border-gray-3"
              }`}
            />
            {errors.name && <p className="text-red text-sm mt-1">{errors.name}</p>}
          </div>

          <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
            <div className="w-full">
              <label htmlFor="email" className="block mb-2.5 font-medium text-dark">
                Email Address <span className="text-red">*</span>
              </label>

              <input
                type="email"
                name="email"
                id="email"
                placeholder="example@gmail.com"
                value={formData.email || ""}
                onChange={handleInputChange}
                required
                className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${
                  errors.email ? "border-red" : "border-gray-3"
                }`}
              />
              {errors.email && <p className="text-red text-sm mt-1">{errors.email}</p>}
            </div>

            <div className="w-full">
              <label htmlFor="phone" className="block mb-2.5 font-medium text-dark">
                Phone <span className="text-red">*</span>
              </label>

              <input
                type="text"
                name="phone"
                id="phone"
                placeholder="9876543210"
                value={formData.phone || ""}
                onChange={handleInputChange}
                required
                className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${
                  errors.phone ? "border-red" : "border-gray-3"
                }`}
              />
              {errors.phone && <p className="text-red text-sm mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
            <div className="w-full">
              <label htmlFor="doorNo" className="block mb-2.5 font-medium text-dark">
                Door No <span className="text-red">*</span>
              </label>

              <input
                type="text"
                name="doorNo"
                id="doorNo"
                placeholder="101"
                value={formData.doorNo || ""}
                onChange={handleInputChange}
                required
                className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${
                  errors.doorNo ? "border-red" : "border-gray-3"
                }`}
              />
              {errors.doorNo && <p className="text-red text-sm mt-1">{errors.doorNo}</p>}
            </div>

            <div className="w-full">
              <label htmlFor="street" className="block mb-2.5 font-medium text-dark">
                Street <span className="text-red">*</span>
              </label>

              <input
                type="text"
                name="street"
                id="street"
                placeholder="Main Street"
                value={formData.street || ""}
                onChange={handleInputChange}
                required
                className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${
                  errors.street ? "border-red" : "border-gray-3"
                }`}
              />
              {errors.street && <p className="text-red text-sm mt-1">{errors.street}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            <div>
              <label htmlFor="landmark" className="block mb-2.5 font-medium text-dark">
                Landmark
              </label>

              <input
                type="text"
                name="landmark"
                id="landmark"
                placeholder="Near City Mall"
                value={formData.landmark || ""}
                onChange={handleInputChange}
                className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              />
            </div>
            <div>
              <label htmlFor="district" className="block mb-2.5 font-medium text-dark">
                District <span className="text-red">*</span>
              </label>

              <input
                type="text"
                name="district"
                id="district"
                placeholder="Chennai"
                value={formData.district || ""}
                onChange={handleInputChange}
                required
                className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${
                  errors.district ? "border-red" : "border-gray-3"
                }`}
              />
              {errors.district && <p className="text-red text-sm mt-1">{errors.district}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 mb-5">
            <div>
              <label htmlFor="town" className="block mb-2.5 font-medium text-dark">
                Town/ City <span className="text-red">*</span>
              </label>

              <input
                type="text"
                name="town"
                id="town"
                placeholder="Chennai"
                value={formData.town || ""}
                onChange={handleInputChange}
                required
                className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${
                  errors.town ? "border-red" : "border-gray-3"
                }`}
              />
              {errors.town && <p className="text-red text-sm mt-1">{errors.town}</p>}
            </div>

            <div>
              <label htmlFor="pincode" className="block mb-2.5 font-medium text-dark">
                Pincode <span className="text-red">*</span>
              </label>

              <input
                type="text"
                name="pincode"
                id="pincode"
                placeholder="600001"
                value={formData.pincode || ""}
                onChange={handleInputChange}
                required
                className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${
                  errors.pincode ? "border-red" : "border-gray-3"
                }`}
              />
              {errors.pincode && <p className="text-red text-sm mt-1">{errors.pincode}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label htmlFor="state" className="block mb-2.5 font-medium text-dark">
                State <span className="text-red">*</span>
              </label>

              <input
                type="text"
                name="state"
                id="state"
                placeholder="Tamil Nadu"
                value={formData.state || ""}
                onChange={handleInputChange}
                required
                className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${
                  errors.state ? "border-red" : "border-gray-3"
                }`}
              />
              {errors.state && <p className="text-red text-sm mt-1">{errors.state}</p>}
            </div>

            <div>
              <label htmlFor="country" className="block mb-2.5 font-medium text-dark">
                Country <span className="text-red">*</span>
              </label>

              <input
                type="text"
                name="country"
                id="country"
                placeholder="India"
                value={formData.country || "India"}
                onChange={handleInputChange}
                required
                className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${
                  errors.country ? "border-red" : "border-gray-3"
                }`}
              />
              {errors.country && <p className="text-red text-sm mt-1">{errors.country}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
