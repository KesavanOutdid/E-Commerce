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
    const steps = ["confirmed", "packed", "shipped", "out_of_delivery", "delivered"];
    const currentStatus = status.toLowerCase();
    const currentIdx = steps.indexOf(currentStatus);
    return currentIdx >= 0 ? currentIdx : 0;
  };

  const statusSteps = [
    { label: "Confirmed", key: "confirmed", color: "#26a541" }, // Green
    { label: "Packed", key: "packed", color: "#f39c12" },      // Orange
    { label: "Shipped", key: "shipped", color: "#2874f0" },     // Blue
    { label: "Out for Delivery", key: "out_of_delivery", color: "#9b59b6" }, // Purple
    { label: "Delivered", key: "delivered", color: "#26a541" }  // Green
  ];

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
                        <div className="relative pl-8 space-y-8">
                          {/* Vertical Line Background */}
                          <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-[#f0f0f0]"></div>

                          {statusSteps.map((step, sIdx) => {
                            const historyItem = order.statusHistory?.find(h => h.status.toLowerCase() === step.key.toLowerCase());
                            const isCompleted = !!historyItem || sIdx <= currentStep;
                            const isCurrent = sIdx === currentStep;
                            const stepDate = historyItem ? new Date(historyItem.timestamp) : null;
                            
                            // Only show completed steps and the next pending step, or all if delivered
                            if (!isCompleted && sIdx !== currentStep + 1 && currentStep !== statusSteps.length - 1) return null;

                            return (
                              <div key={step.key} className="relative flex gap-4">
                                {/* Indicator Dot */}
                                <div className="absolute -left-[32px] top-1 z-10 flex items-center justify-center">
                                  {isCompleted ? (
                                    <div 
                                      className="w-[16px] h-[16px] rounded-full border-4 border-white shadow-sm"
                                      style={{ backgroundColor: step.color }}
                                    >
                                      {isCurrent && (
                                        <div className="absolute inset-0 rounded-full animate-ping opacity-25" style={{ backgroundColor: step.color }}></div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="w-[16px] h-[16px] rounded-full bg-white border-2 border-[#e0e0e0]"></div>
                                  )}
                                </div>

                                {/* Active Line Highlight */}
                                {sIdx < statusSteps.length - 1 && isCompleted && (
                                  <div 
                                    className="absolute -left-[25px] top-[18px] w-[2px] h-[calc(100%+32px)] z-0"
                                    style={{ backgroundColor: step.color }}
                                  ></div>
                                )}
                                
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span 
                                      className={`text-[14px] font-medium ${isCompleted ? '' : 'text-[#878787]'}`}
                                      style={{ color: isCompleted ? step.color : '#878787' }}
                                    >
                                      {step.label}
                                    </span>
                                    {stepDate && (
                                      <span className="text-[12px] text-[#878787] bg-[#f5f5f5] px-2 py-0.5 rounded">
                                        {stepDate.toLocaleDateString(undefined, { 
                                          day: 'numeric', 
                                          month: 'short', 
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                    )}
                                  </div>
                                  {historyItem?.note && historyItem.note !== "Automatically updated due to subsequent status change" && (
                                    <p className="text-[12px] text-[#878787] mt-1 italic">
                                      {historyItem.note}
                                    </p>
                                  )}
                                  {isCurrent && currentStep === statusSteps.length - 1 && (
                                    <p className="text-[13px] text-[#26a541] mt-1 font-medium">
                                      Your item has been delivered successfully.
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
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
                {order.discountAmount !== undefined && order.discountAmount > 0 && (
                  <div className="flex justify-between text-[14px]">
                    <span className="text-[#212121]">Coupon Applied ({order.couponCode})</span>
                    <span className="text-[#26a541] font-medium">- ₹{order.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                {order.offerDiscount !== undefined && order.offerDiscount > 0 && (
                  <div className="flex justify-between text-[14px]">
                    <span className="text-[#212121]">Offer Applied ({order.offerCode || 'Offer'})</span>
                    <span className="text-[#26a541] font-medium">- ₹{order.offerDiscount.toLocaleString()}</span>
                  </div>
                )}
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
