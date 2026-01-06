"use client";
import React, { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/store";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api";
import { Order } from "@/types/order";
import Image from "next/image";
import { useParams } from "next/navigation";

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAppSelector((state) => state.authReducer);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!id) return;
      try {
        const res = await fetch(API_ENDPOINTS.ORDER_DETAILS(id as string), {
          headers: {
            Authorization: `Bearer ${accessToken || localStorage.getItem("accessToken")}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setOrder(data.data);
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [id, accessToken]);

  const getStatusStep = (status: string) => {
    const steps = ["confirmed", "shipped", "out for delivery", "delivered"];
    const currentStatus = status.toLowerCase();
    const currentIdx = steps.indexOf(currentStatus);
    return currentIdx >= 0 ? currentIdx : 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 bg-white rounded-sm border border-[#f1f3f6]">
        <h2 className="text-xl font-medium text-dark">Order not found</h2>
      </div>
    );
  }

  const currentStep = getStatusStep(order.orderStatus);

  return (
    <div className="flex flex-col gap-4 pt-0">
      {/* Back Button */}
      <div className="mb-2">
        <button 
          onClick={() => window.history.back()} 
          className="flex items-center gap-2 text-sm font-medium text-blue hover:underline group"
        >
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="transition-transform group-hover:-translate-x-1"
          >
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Back to My Orders
        </button>
      </div>

      {/* Top Details Card */}
      <div className="bg-white rounded-sm border border-[#f1f3f6] shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Delivery Address */}
          <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-[#f1f3f6]">
            <h3 className="text-[17px] font-medium text-dark mb-4">Delivery Address</h3>
            <div className="flex flex-col gap-1">
              <p className="text-[15px] font-medium text-dark">{order.deliveryAddress.name}</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {order.deliveryAddress.doorNo && `${order.deliveryAddress.doorNo}, `}
                {order.deliveryAddress.street}, {order.deliveryAddress.landmark}<br />
                {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
              </p>
              <div className="mt-3 flex flex-col gap-1">
                <p className="text-sm font-medium text-dark">
                  Phone number: <span className="font-normal text-gray-600">{order.deliveryAddress.phone}</span>
                </p>
                {order.deliveryAddress.email && (
                  <p className="text-sm font-medium text-dark">
                    Email: <span className="font-normal text-gray-600">{order.deliveryAddress.email}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-[#f1f3f6] md:pr-16">
            <h3 className="text-[17px] font-medium text-dark mb-4">Order Summary</h3>
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Items Subtotal:</span>
                <span className="text-dark font-medium">₹{order.subTotal.toLocaleString()}</span>
              </div>
              {order.gst > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST:</span>
                  <span className="text-dark font-medium">₹{order.gst.toLocaleString()}</span>
                </div>
              )}
              {(order.codFees || order.codFee) && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">COD Fee:</span>
                  <span className="text-dark font-medium">₹{(order.codFees || order.codFee || 0).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping:</span>
                {order.shippingFees && order.shippingFees > 0 ? (
                  <span className="text-dark font-medium">₹{order.shippingFees.toLocaleString()}</span>
                ) : (
                  <span className="text-green-600 font-medium">FREE</span>
                )}
              </div>
              <div className="flex justify-between text-[16px] font-bold border-t border-dashed border-gray-300 pt-3 mt-1">
                <span className="text-dark">Grand Total:</span>
                <span className="text-dark">₹{order.grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="flex-1 p-6 md:pl-16">
            <h3 className="text-[17px] font-medium text-dark mb-4">Payment Info</h3>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-gray-500 uppercase tracking-wider text-[11px] font-bold">METHOD</p>
                <p className="text-[15px] text-blue capitalize font-normal mt-0.5">{order.paymentType}</p>
              </div>
              <div>
                <p className="text-gray-500 uppercase tracking-wider text-[11px] font-bold">PAYMENT STATUS</p>
                <p className="text-[15px] text-blue capitalize font-normal mt-0.5">{order.paymentStatus}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items and Tracker Card */}
      <div className="bg-white rounded-sm border border-[#f1f3f6] shadow-sm">
        {order.items.map((item, index) => (
          <div key={index} className="border-b last:border-0 border-[#f1f3f6]">
            <div className="p-6 flex flex-col lg:flex-row gap-8">
              {/* Product Info Left */}
              <div className="flex gap-6 lg:w-1/3">
                <div className="w-20 h-20 relative flex-shrink-0 bg-white border border-[#f1f3f6] p-1">
                  <Image
                    src={item.images[0]?.startsWith('http') ? item.images[0] : `${API_BASE_URL}${item.images[0]}`}
                    alt={item.productName}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-[15px] text-dark font-normal hover:text-blue transition-colors line-clamp-2 leading-snug">
                    {item.productName}
                  </h4>
                  <p className="text-[13px] text-gray-500">Qty: {item.qty}</p>
                  <p className="text-[15px] font-bold text-dark mt-1">₹{item.totalPrice.toLocaleString()}</p>
                </div>
              </div>

              {/* Status Tracker Middle */}
              <div className="flex-grow flex flex-col justify-center">
                <div className="relative flex justify-between w-full max-w-[500px] mx-auto lg:mx-0">
                  {["Confirmed", "Shipped", "Out for Delivery", "Delivered"].map((step, sIdx) => (
                    <div key={step} className="flex flex-col items-center relative z-10">
                      <span className={`text-[13px] font-semibold uppercase tracking-tight ${
                        sIdx <= currentStep ? 'text-green' : 'text-gray-5'
                      }`}>
                        {step}
                      </span>
                      {sIdx === 0 && (
                        <span className="text-[12px] text-gray-500 mt-1">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Right */}
              <div className="lg:w-1/5 flex flex-col items-start lg:items-end justify-center">
                 <button className="flex items-center gap-2 text-[14px] font-medium text-blue hover:underline">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download Invoice
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="bg-white p-4 rounded-sm border border-[#f1f3f6] flex justify-between items-center text-xs text-gray-500">
        <p>Order ID: {order.orderId}</p>
        <p>Customer Support: support@ecommerce.com</p>
      </div>
    </div>
  );
};

export default OrderDetail;
