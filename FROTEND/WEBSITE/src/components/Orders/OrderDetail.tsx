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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2874f0]"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 bg-white rounded-sm border border-[#f1f3f6]">
        <h2 className="text-xl font-medium text-[#212121]">Order not found</h2>
      </div>
    );
  }

  const currentStep = getStatusStep(order.orderStatus);

  return (
    <div className="min-h-screen bg-[#f1f3f6] pb-6">
      <div className="max-w-[1248px] mx-auto pt-0 px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[12px] text-[#878787] mb-4">
          <span className="hover:text-[#2874f0] cursor-pointer" onClick={() => window.history.back()}>Home</span>
          <span>&gt;</span>
          <span className="hover:text-[#2874f0] cursor-pointer" onClick={() => window.history.back()}>My Orders</span>
          <span>&gt;</span>
          <span className="text-[#212121]">{order.orderId}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-start">
          {/* Left Column - Main Content */}
          <div className="flex-grow lg:w-[65%] space-y-4 w-full">
            {order.items.map((item, index) => {
              const itemImage = (item.images && item.images.length > 0) 
                ? (item.images[0]?.startsWith('http') ? item.images[0] : `${API_BASE_URL}${item.images[0]}`)
                : null;

              return (
                <div key={index} className="bg-white rounded-sm shadow-sm border border-[#e0e0e0] overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col gap-8">
                      {/* Product Info */}
                      <div className="flex gap-6">
                        <div className="w-[80px] h-[80px] relative flex-shrink-0">
                          {itemImage ? (
                            <Image
                              src={itemImage}
                              alt={item.productName}
                              fill
                              className="object-contain"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#f9f9f9] flex items-center justify-center">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                                <rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3-3-2 2-6-6-7 7"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <h4 className="text-[14px] text-[#212121] hover:text-[#2874f0] cursor-pointer mb-1 font-normal">
                            {item.productName}
                          </h4>
                          <p className="text-[12px] text-[#878787] mb-1">Seller: {order.items[0]?.productName?.split(' ')[0] || 'Seller'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[16px] font-semibold text-[#212121]">₹{item.totalPrice.toLocaleString()}</span>
                            <span className="text-[12px] text-[#26a541] font-medium">1 offer</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Timeline */}
                      <div className="flex-grow pt-4 border-t border-[#f0f0f0]">
                        <div className="relative pl-6 space-y-4">
                          {["confirmed", "shipped", "out for delivery", "delivered"].map((step, sIdx) => {
                            const isCompleted = sIdx <= currentStep;
                            const isCurrent = sIdx === currentStep;
                            
                            // Only show completed steps and the next pending step, or all if delivered
                            if (!isCompleted && sIdx !== currentStep + 1 && currentStep !== 3) return null;

                            return (
                              <div key={step} className="relative">
                                {/* Dot */}
                                <div className={`absolute -left-[23px] top-1.5 w-[8px] h-[8px] rounded-full ${
                                  isCompleted ? 'bg-[#26a541]' : 'bg-[#e0e0e0]'
                                }`}></div>
                                
                                {/* Connecting Line */}
                                {sIdx < 3 && isCompleted && (
                                  <div className="absolute -left-[19.5px] top-3.5 w-[1px] h-full bg-[#26a541]"></div>
                                )}
                                
                                <div className="flex items-center gap-2">
                                  <span className={`text-[14px] font-medium capitalize ${isCompleted ? 'text-[#212121]' : 'text-[#878787]'}`}>
                                    Order {step}
                                  </span>
                                  {isCompleted && (
                                    <span className="text-[14px] font-medium text-[#212121]">
                                      , {new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          
                        <div className="mt-4 flex flex-col gap-2">
                          {/* <button className="text-[14px] font-medium text-[#2874f0] hover:underline w-fit">See All Updates</button> */}
                          <p className="text-[13px] text-[#212121]">
                            {/* {currentStep === 3 ? "Your item has been delivered." : `Your order is ${order.orderStatus.toLowerCase()} as per your request.`} */}
                          </p>
                        </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Bar */}
                 
                </div>
              );
            })}

            {/* Other Items Section */}
            {order.items.length > 1 && (
              <div className="bg-white rounded-sm shadow-sm border border-[#e0e0e0] p-6">
                <h3 className="text-[16px] font-medium text-[#212121] mb-4">Other Items In This Order</h3>
                <div className="space-y-4">
                  {order.items.slice(1).map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <div className="w-12 h-12 bg-[#f9f9f9] rounded-sm relative">
                         {item.images?.[0] && <Image src={item.images[0].startsWith('http') ? item.images[0] : `${API_BASE_URL}${item.images[0]}`} alt="" fill className="object-contain p-1" />}
                      </div>
                      <span className="text-[14px] text-[#212121] line-clamp-1">{item.productName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:w-[35%] w-full space-y-4">
            {/* Address Card */}
            <div className="bg-white rounded-sm shadow-sm border border-[#e0e0e0] p-6">
              <h3 className="text-[16px] font-medium text-[#212121] mb-4 flex items-center gap-2">
                Delivery Address
                <span className="bg-[#f0f0f0] text-[10px] px-2 py-0.5 rounded-full uppercase">Home</span>
              </h3>
              <div className="space-y-1">
                <p className="text-[14px] font-medium text-[#212121]">{order.deliveryAddress.name}</p>
                <p className="text-[14px] text-[#212121] leading-[1.6]">
                  {order.deliveryAddress.doorNo && `${order.deliveryAddress.doorNo}, `}
                  {order.deliveryAddress.street}, {order.deliveryAddress.landmark}<br />
                  {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                </p>
                <div className="pt-3">
                  <span className="text-[14px] font-medium text-[#212121]">Phone number: </span>
                  <span className="text-[14px] text-[#212121]">{order.deliveryAddress.phone}</span>
                </div>
              </div>
            </div>

            {/* Price Details Card */}
            <div className="bg-white rounded-sm shadow-sm border border-[#e0e0e0]">
              <div className="p-4 border-b border-[#f0f0f0]">
                <h3 className="text-[16px] font-medium text-[#212121]">Price Details</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between text-[14px]">
                  <span className="text-[#212121]">Listing price</span>
                  <span className="text-[#212121]">₹{order.subTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[14px]">
                  <span className="text-[#212121]">Special price</span>
                  <span className="text-[#212121]">₹{order.subTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[14px]">
                  <span className="text-[#212121]">Total fees</span>
                  <span className="text-[#212121]">₹{(order.shippingFees || 0).toLocaleString()}</span>
                </div>
                {order.gst > 0 && (
                  <div className="flex justify-between text-[14px]">
                    <span className="text-[#212121]">GST</span>
                    <span className="text-[#212121]">₹{order.gst.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-[14px] pt-4 border-t border-dashed border-[#e0e0e0]">
                  <span className="text-[16px] font-semibold text-[#212121]">Total Amount</span>
                  <span className="text-[16px] font-semibold text-[#212121]">₹{order.grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            {/* <div className="bg-white rounded-sm shadow-sm border border-[#e0e0e0] p-6 space-y-4">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-[#e0e0e0] rounded-sm text-[14px] font-medium text-[#212121] hover:bg-[#fafafa]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                </svg>
                Download Invoice
              </button>
              
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-sm">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#d48c00">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[12px] font-medium text-[#212121]">Offers earned</p>
                  <p className="text-[10px] text-[#878787]">15 SuperCoins will be credited...</p>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
