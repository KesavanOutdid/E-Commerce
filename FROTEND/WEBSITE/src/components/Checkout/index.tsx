"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Login from "./Login";
import PaymentMethod from "./PaymentMethod";
import Billing from "./Billing";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { selectTotalPrice, clearCartServer } from "@/redux/features/cart-slice";
import { API_ENDPOINTS } from "@/lib/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Script from "next/script";

const Checkout = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const totalPrice = useAppSelector(selectTotalPrice);
  const { accessToken, isAuthenticated, user } = useAppSelector((state) => state.authReducer);

  const [payment, setPayment] = useState("cod");
  const [step, setStep] = useState(1);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    doorNo: "",
    street: "",
    landmark: "",
    town: "",
    district: "",
    pincode: "",
    state: "",
    country: "IN",
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      if (isAuthenticated && accessToken) {
        try {
          const response = await fetch(API_ENDPOINTS.ADDRESSES, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const data = await response.json();
          if (data.success) {
            setSavedAddresses(data.data || []);
            // Automatically select the first address if available
            if (data.data && data.data.length > 0) {
              const addr = data.data[0];
              setSelectedAddressIndex(0);
              setFormData((prev) => ({
                ...prev,
                name: addr.name || prev.name,
                email: addr.email || prev.email,
                phone: addr.phone || prev.phone,
                doorNo: addr.doorNo,
                street: addr.street,
                landmark: addr.landmark || "",
                town: addr.city,
                district: addr.district || addr.city,
                pincode: addr.pincode,
                state: addr.state,
                country: addr.country,
              }));
            }
          }
        } catch (error) {
          console.error("Failed to fetch addresses:", error);
        }
      }
    };
    fetchAddresses();
  }, [isAuthenticated, accessToken]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressSelect = (index: number | null) => {
    setSelectedAddressIndex(index);
    if (index !== null) {
      const addr = savedAddresses[index];
      setFormData((prev) => ({
        ...prev,
        name: addr.name || prev.name,
        email: addr.email || prev.email,
        phone: addr.phone || prev.phone,
        doorNo: addr.doorNo,
        street: addr.street,
        landmark: addr.landmark || "",
        town: addr.city,
        district: addr.district || addr.city,
        pincode: addr.pincode,
        state: addr.state,
        country: addr.country,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        doorNo: "",
        street: "",
        landmark: "",
        town: "",
        district: "",
        pincode: "",
        state: "",
        country: "IN",
      }));
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.phone || !formData.doorNo || !formData.street || !formData.town || !formData.district || !formData.pincode || !formData.state) {
        toast.error("Please fill in all required billing details");
        return;
      }
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  const handleOrderPlacement = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      nextStep();
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please login to place an order");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const orderData = {
      deliveryAddress: {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        doorNo: formData.doorNo,
        street: formData.street,
        landmark: formData.landmark,
        city: formData.town,
        district: formData.district || formData.town,
        state: formData.state,
        pincode: formData.pincode,
        country: formData.country,
      },
      paymentType: payment,
      productIds: cartItems.map((item) => item.id),
      totalPrice: totalPrice,
      gst: 0, // Calculate if needed
      subTotal: totalPrice,
      shippingFees: 150,
      codFees: payment === "cod" ? 50 : 0,
      grandTotal: totalPrice + 150 + (payment === "cod" ? 50 : 0),
    };

    try {
      const response = await fetch(API_ENDPOINTS.CREATE_ORDER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        if (payment === "online" && data.data.razorpayOrder) {
          handleRazorpayPayment(data.data);
        } else {
          toast.success("Order placed successfully!");
          dispatch(clearCartServer(accessToken!));
          router.push("/order-success?orderId=" + data.data.orderId);
        }
      } else {
        toast.error(data.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Order placement error:", error);
      toast.error("Something went wrong");
    }
  };

  const handleRazorpayPayment = (order: any) => {
    const options = {
      key: "rzp_test_oHoZ3Q1fF6pYEI", // Use your Razorpay key
      amount: order.razorpayOrder.amount,
      currency: "INR",
      name: "E-Commerce Store",
      description: "Order Payment",
      order_id: order.razorpayOrder.id,
      handler: async (response: any) => {
        try {
          const verifyRes = await fetch(API_ENDPOINTS.VERIFY_ORDER, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            toast.success("Payment successful!");
            dispatch(clearCartServer(accessToken!));
            router.push("/order-success?orderId=" + order.orderId);
          } else {
            toast.error("Payment verification failed");
          }
        } catch (error) {
          console.error("Verification error:", error);
          toast.error("Payment verification failed");
        }
      },
      prefill: {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        contact: formData.phone,
      },
      theme: {
        color: "#3C50E0",
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <Breadcrumb title={"Checkout"} pages={["checkout"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1300px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* <!-- Left Column: Form & Stepper --> */}
            <div className="flex-1 w-full lg:w-2/3">
              <div className="bg-white shadow-1 rounded-xl p-4 sm:p-7.5 xl:p-10">
                {/* <!-- Stepper --> */}
                <div className="flex items-center justify-between mb-12 relative max-w-[500px] mx-auto">
                  <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-3"></div>
                  <div 
                    className="absolute top-5 left-0 h-0.5 bg-blue transition-all duration-500"
                    style={{ width: step === 1 ? '0%' : '100%' }}
                  ></div>
                  
                  <div className="relative flex flex-col items-center gap-2 bg-white px-5 z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${step >= 1 ? 'bg-blue text-white shadow-md' : 'bg-blue/10 text-blue'}`}>
                      {step > 1 ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      ) : "1"}
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-widest ${step >= 1 ? 'text-blue' : 'text-blue/40'}`}>Shipping</span>
                  </div>

                  <div className="relative flex flex-col items-center gap-2 bg-white px-5 z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${step >= 2 ? 'bg-blue text-white shadow-md' : 'bg-blue/10 text-blue'}`}>
                      2
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-widest ${step >= 2 ? 'text-blue' : 'text-blue/40'}`}>Payment</span>
                  </div>
                </div>

                <form onSubmit={handleOrderPlacement}>
                  {step === 1 && (
                    <div className="transition-all duration-500 ease-in-out">
                      <Login />
                      <Billing 
                        formData={formData} 
                        handleInputChange={handleInputChange} 
                        savedAddresses={savedAddresses}
                        selectedAddressIndex={selectedAddressIndex}
                        handleAddressSelect={handleAddressSelect}
                      />
                      <div className="mt-10 flex justify-end">
                        <button
                          type="button"
                          onClick={nextStep}
                          className="flex justify-center font-medium text-white bg-blue py-3 px-10 rounded-md ease-out duration-200 hover:bg-blue-dark"
                        >
                          Continue to Payment
                        </button>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="transition-all duration-500 ease-in-out">
                      <div className="mb-8">
                        <h3 className="font-medium text-xl text-dark mb-5">Review Shipping Address</h3>
                        <div className="p-5 rounded-lg border border-gray-3 bg-gray-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-dark">{formData.name}</p>
                              <p className="text-dark-4">{formData.doorNo}, {formData.street}</p>
                              {formData.landmark && <p className="text-dark-4">{formData.landmark}</p>}
                              <p className="text-dark-4">{formData.town}, {formData.district}, {formData.state} - {formData.pincode}</p>
                              <p className="text-dark-4">{formData.country}</p>
                              <p className="text-dark-4 mt-2 font-medium">Phone: {formData.phone}</p>
                              <p className="text-dark-4">Email: {formData.email}</p>
                            </div>
                            <button 
                              type="button" 
                              onClick={prevStep}
                              className="text-blue font-medium hover:underline"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>

                      <PaymentMethod payment={payment} setPayment={setPayment} />
                      
                      <div className="mt-10 flex flex-col sm:flex-row gap-4">
                        <button
                          type="button"
                          onClick={prevStep}
                          className="flex-1 flex justify-center font-medium text-dark border border-gray-3 py-3 px-6 rounded-md ease-out duration-200 hover:bg-gray-1"
                        >
                          Back to Shipping
                        </button>
                        <button
                          type="submit"
                          disabled={cartItems.length === 0}
                          className={`flex-1 flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark ${cartItems.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          Place Order
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* <!-- Right Column: Order Summary --> */}
            <div className="w-full lg:w-1/3 lg:sticky lg:top-5">
              <div className="bg-white shadow-1 rounded-xl overflow-hidden">
                <div className="bg-gray-1 pt-0 pb-3 px-6 border-b border-gray-3">
                  <h3 className="font-medium text-lg text-dark">Order Summary</h3>
                </div>
                <div className="p-5">
                  <div className="max-h-[400px] overflow-y-auto mb-6 pr-2 custom-scrollbar">
                    {cartItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-4 border-b border-gray-3 last:border-0">
                        <div className="max-w-[70%]">
                          <p className="text-dark font-medium truncate">{item.title}</p>
                          <p className="text-sm text-dark-4">Quantity: {item.quantity}</p>
                        </div>
                        <p className="text-dark font-medium">₹{item.discountedPrice * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-blue font-medium">Subtotal</span>
                      <span className="text-dark font-medium">₹{totalPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue font-medium">Shipping Fee</span>
                      <span className="text-dark font-medium">₹150</span>
                    </div>
                    {payment === "cod" && (
                      <div className="flex justify-between">
                        <span className="text-blue font-medium">COD Fee</span>
                        <span className="text-dark font-medium">₹50</span>
                      </div>
                    )}
                    <div className="flex justify-between text-2xl font-bold text-dark pt-6 border-t border-gray-3 mt-6">
                      <span>Total</span>
                      <span>₹{totalPrice + 150 + (payment === "cod" ? 50 : 0)}</span>
                    </div>
                  </div>

                  {step === 1 && (
                     <p className="text-xs text-dark-4 mt-6 text-center">
                       Tax and shipping are calculated in the next step.
                     </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Checkout;
