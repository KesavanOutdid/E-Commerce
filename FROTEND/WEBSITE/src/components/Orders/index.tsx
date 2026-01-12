"use client";
import React, { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/store";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api";
import { Order, OrderHistoryResponse } from "@/types/order";
import Link from "next/link";
import Image from "next/image";

const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { accessToken } = useAppSelector((state) => state.authReducer);
  const limit = 8;

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch(API_ENDPOINTS.ORDER_HISTORY(currentPage, limit), {
          headers: {
            Authorization: `Bearer ${accessToken || localStorage.getItem("accessToken")}`,
          },
        });
        const data: OrderHistoryResponse = await res.json();
        if (data.success) {
          setOrders(data.data);
          setTotalPages(data.pagination.pages);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [accessToken, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusTextColor = (status: string) => {
    switch (status.toLowerCase().trim()) {
      case "ordered":
      case "confirmed":
      case "delivered":
        return "text-green";
      case "pending":
        return "text-yellow";
      case "cancelled":
        return "text-red";
      default:
        return "text-dark-5";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase().trim()) {
      case "ordered":
      case "confirmed":
      case "delivered":
        return "bg-green";
      case "pending":
        return "bg-yellow";
      case "cancelled":
        return "bg-red";
      default:
        return "bg-dark-5";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pt-4">
      {/* Flipkart-like Search and Filter Header */}
      <div className="bg-white pt-4 pb-4 px-4 rounded-sm border border-[#f1f3f6] flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-1/2">
          <input 
            type="text" 
            placeholder="Search your orders here" 
            className="w-full pl-10 pr-4 py-2 border border-[#f1f3f6] rounded-sm focus:outline-none focus:border-blue text-sm"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <select className="flex-grow md:flex-grow-0 px-4 py-2 border border-[#f1f3f6] rounded-sm text-sm focus:outline-none">
            <option>All Orders</option>
            <option>On the way</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>
        </div>
      </div>

      {orders.length > 0 ? (
        <>
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <div key={order._id} className="flex flex-col">
                {order.items.map((item, index) => (
                  <Link
                    href={`/view-orders/${order.orderId}`}
                    key={`${order._id}-${index}`}
                    className="bg-white pt-3 pb-6 px-6 border border-[#f1f3f6] hover:shadow-md transition-all flex flex-col md:flex-row items-center gap-8 mb-[-1px]"
                  >
                    {/* Product Image */}
                    <div className="w-24 h-24 relative flex-shrink-0 bg-gray-50 flex items-center justify-center rounded">
                      {item.images && item.images.length > 0 ? (
                        <Image
                          src={item.images[0]?.startsWith('http') ? item.images[0] : `${API_BASE_URL}${item.images[0]}`}
                          alt={item.productName}
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-grow flex flex-col md:grid md:grid-cols-5 items-start w-full gap-6">
                      <div className="md:col-span-2">
                        <h3 className="text-[15px] font-normal text-dark hover:text-blue transition-colors line-clamp-2 mb-1">
                          {item.productName}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Order ID: {order.orderId}
                        </p>
                      </div>

                      <div className="text-left">
                        <p className="text-[15px] font-medium text-dark">
                          ₹{item.totalPrice.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <div>
                          <p className={`text-sm font-normal capitalize ${getStatusTextColor(order.orderStatus)}`}>
                            {order.orderStatus.toLowerCase() === 'ordered' ? 'Confirmed' : order.orderStatus}
                          </p>
                          <p className="text-[12px] text-gray-500 mt-0.5">
                            {(order.orderStatus === 'confirmed' || order.orderStatus === 'ordered') ? 'Your order has been placed' : ''}
                            {order.orderStatus === 'delivered' ? `Delivered on ${new Date(order.updatedAt).toLocaleDateString()}` : ''}
                            {order.orderStatus === 'pending' ? 'Waiting for confirmation' : ''}
                            {order.orderStatus === 'cancelled' ? 'Order has been cancelled' : ''}
                          </p>
                        </div>
                      </div>

                      <div className="text-left">
                        <p className="text-sm font-medium text-dark">
                          Ordered on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8 pb-10">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </button>
              
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`w-10 h-10 rounded-full border transition-colors ${
                    currentPage === index + 1
                      ? "bg-blue border-blue text-white"
                      : "border-gray-300 hover:bg-gray-100 text-dark"
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white p-10 rounded-sm text-center">
          <div className="flex justify-center mb-5">
            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <p className="text-lg font-medium text-dark">You haven't placed any order yet!</p>
          <Link
            href="/shop"
            className="inline-block mt-5 bg-blue text-white py-2 px-10 rounded-sm hover:bg-opacity-90 transition-all"
          >
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
