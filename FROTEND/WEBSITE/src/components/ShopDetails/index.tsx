"use client";
import React, { useEffect, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import Newsletter from "../Common/Newsletter";
import LoginModal from "../Common/LoginModal";
import { useAppSelector, AppDispatch } from "@/redux/store";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api";
import { useDispatch } from "react-redux";
import { addItemToWishlist, removeItemFromWishlist } from "@/redux/features/wishlist-slice";
import { addToCart, clearCartServer } from "@/redux/features/cart-slice";
import { setAuth } from "@/redux/features/auth-slice";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";

const ShopDetails = ({ productId }: { productId?: string }) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [activeColor, setActiveColor] = useState("blue");
  const [previewImg, setPreviewImg] = useState(0);

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [attributeOptions, setAttributeOptions] = useState<any>({});
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [allOffers, setAllOffers] = useState<any[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<any>({});

  const { accessToken, isAuthenticated, user } = useAppSelector((state) => state.authReducer);
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  
  const isWishlisted = product ? wishlistItems.some((item) => item.id === product.id) : false;

  const [quantity, setQuantity] = useState(1);

  const colorImages = React.useMemo(() => {
    const map: Record<string, string> = {};
    allOffers.forEach((variant) => {
      const colorAttr = variant.attributes.find((a: any) => a.name.toLowerCase() === "color");
      if (colorAttr) {
        const colorKey = colorAttr.value.toString().toLowerCase();
        if (!map[colorKey] && variant.images && variant.images.length > 0) {
          map[colorKey] = `${API_BASE_URL}${variant.images[0]}`;
        }
      }
    });
    return map;
  }, [allOffers]);

  const [activeTab, setActiveTab] = useState("tabOne");
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showFullSpecs, setShowFullSpecs] = useState(false);

  // Login Modal State
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Buy Now States
  const [showBuyNowModal, setShowBuyNowModal] = useState(false);
  const [payment, setPayment] = useState("cod");
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

  const handleOrderPlacement = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please login to place an order");
      return;
    }

    if (!formData.name || !formData.email || !formData.phone || !formData.doorNo || !formData.street || !formData.town || !formData.pincode || !formData.state) {
      toast.error("Please fill in all required billing details");
      return;
    }

    const shippingFees = 150;
    const codFees = payment === "cod" ? 50 : 0;
    const seller = product.minPriceDetails;
    const totalPrice = product.discountedPrice * quantity;

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
      productIds: [product.id],
      items: [{
        productId: product.id,
        sellerProductId: seller?.variantId || null,
        sellerId: seller?.sellerId || null,
        qty: quantity,
        price: product.discountedPrice,
      }],
      totalPrice: totalPrice,
      gst: 0,
      subTotal: totalPrice,
      shippingFees: shippingFees,
      codFees: codFees,
      grandTotal: totalPrice + shippingFees + codFees,
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
          setShowBuyNowModal(false);
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
      key: "rzp_test_oHoZ3Q1fF6pYEI", 
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
              orderId: order.orderId
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            toast.success("Payment successful!");
            setShowBuyNowModal(false);
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
        name: formData.name,
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


  const tabs = [
    {
      id: "tabOne",
      title: "Description",
    },
    {
      id: "tabTwo",
      title: "Additional Information",
    }
  ];

  const colors = ["red", "blue", "orange", "pink", "purple"];

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.PRODUCT_DETAILS(productId));
        const data = await response.json();
        if (data.success) {
          const { product: p, selectedVariant: sv, allOffers: ao } = data.data;
          
          setAttributeOptions(p.attributeOptions || {});
          setSelectedVariant(sv);
          setAllOffers(ao || []);
          
          // Set initial selected attributes from the selected variant
          const initialAttrs: any = {};
          sv.attributes.forEach((attr: any) => {
            initialAttrs[attr.name] = attr.value;
          });
          setSelectedAttributes(initialAttrs);

          const images = sv?.images || [];
          const transformedProduct = {
            id: p.productId,
            title: p.productName,
            reviews: p.totalReviews || 0,
            price: sv?.price || 0,
            discountedPrice: sv?.currentPrice || sv?.salePrice || sv?.price || 0,
            imgs: {
              thumbnails: images.length > 0 
                ? images.map((img: string) => `${API_BASE_URL}${img}`) 
                : ["/images/products/product-1-bg-1.png"],
              previews: images.length > 0 
                ? images.map((img: string) => `${API_BASE_URL}${img}`) 
                : ["/images/products/product-1-bg-1.png"],
            },
            slug: p.slug,
            description: p.description,
            shortDescription: p.shortDescription,
            brand: p.brand || "",
            highlights: p.highlights || [],
            attributes: sv?.attributes || [],
            stock: sv?.stock || 0,
            avgRating: p.avgRating || 0,
            sellerName: sv?.sellerName || "Admin",
            shopName: sv?.shopName || "Outdid",
            allOffers: ao || [],
            minPriceDetails: sv
          };
          setProduct(transformedProduct);
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [productId]);

  const handleAttributeChange = (name: string, value: string) => {
    // Determine the next set of attributes
    const newAttributes = { ...selectedAttributes, [name]: value };
    
    // Find the best matching variant
    // 1. Try to find a variant that matches ALL current selections plus the NEW one (case-insensitive)
    let matchingVariant = allOffers.find((variant: any) => {
      return Object.entries(newAttributes).every(([key, val]) => {
        const attr = variant.attributes.find((a: any) => a.name.toLowerCase() === key.toLowerCase());
        return attr && attr.value.toString().toLowerCase() === val.toString().toLowerCase();
      });
    });

    // 2. If no exact match, find variant with the new selection + most other matches (case-insensitive)
    if (!matchingVariant) {
      const sortedOffers = [...allOffers].sort((a, b) => {
        // Prioritize variants that match the newly selected attribute
        const aPrimaryMatch = a.attributes.some(attr => 
          attr.name.toLowerCase() === name.toLowerCase() && 
          attr.value.toString().toLowerCase() === value.toString().toLowerCase()
        );
        const bPrimaryMatch = b.attributes.some(attr => 
          attr.name.toLowerCase() === name.toLowerCase() && 
          attr.value.toString().toLowerCase() === value.toString().toLowerCase()
        );

        if (aPrimaryMatch && !bPrimaryMatch) return -1;
        if (!aPrimaryMatch && bPrimaryMatch) return 1;

        // Then prioritize by the number of other attributes that match the current selection
        const aMatches = a.attributes.filter((attr: any) => {
          const matchingKey = Object.keys(newAttributes).find(k => k.toLowerCase() === attr.name.toLowerCase());
          return matchingKey && attr.value.toString().toLowerCase() === newAttributes[matchingKey].toString().toLowerCase();
        }).length;
        const bMatches = b.attributes.filter((attr: any) => {
          const matchingKey = Object.keys(newAttributes).find(k => k.toLowerCase() === attr.name.toLowerCase());
          return matchingKey && attr.value.toString().toLowerCase() === newAttributes[matchingKey].toString().toLowerCase();
        }).length;
        
        return bMatches - aMatches;
      });
      matchingVariant = sortedOffers[0];
    }

    if (matchingVariant) {
      setSelectedVariant(matchingVariant);
      
      // Update selected attributes based on the actual variant found
      const updatedAttrs: any = {};
      matchingVariant.attributes.forEach((attr: any) => {
        // Find the matching key in attributeOptions (case-insensitive)
        const optionKey = Object.keys(attributeOptions).find(
          key => key.toLowerCase() === attr.name.toLowerCase()
        );
        if (optionKey) {
          updatedAttrs[optionKey] = attr.value;
        }
      });
      setSelectedAttributes(updatedAttrs);

      const images = matchingVariant.images || [];
      
      // Update the product state for UI rendering
      setProduct((prev: any) => ({
        ...prev,
        price: matchingVariant.price,
        discountedPrice: matchingVariant.currentPrice || matchingVariant.salePrice || matchingVariant.price,
        imgs: {
          thumbnails: images.length > 0 
            ? images.map((img: string) => `${API_BASE_URL}${img}`) 
            : ["/images/products/product-1-bg-1.png"],
          previews: images.length > 0 
            ? images.map((img: string) => `${API_BASE_URL}${img}`) 
            : ["/images/products/product-1-bg-1.png"],
        },
        attributes: matchingVariant.attributes,
        stock: matchingVariant.stock,
        sellerName: matchingVariant.sellerName,
        shopName: matchingVariant.shopName,
        minPriceDetails: matchingVariant
      }));
      setPreviewImg(0);
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    try {
      if (isWishlisted) {
        const response = await fetch(API_ENDPOINTS.REMOVE_FROM_WISHLIST(product.id), {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          dispatch(removeItemFromWishlist(product.id));
          toast.success("Removed from wishlist");
        }
      } else {
        const response = await fetch(API_ENDPOINTS.ADD_TO_WISHLIST, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ productId: product.id }),
        });
        const data = await response.json();
        if (data.success) {
          dispatch(addItemToWishlist({
            ...product,
            quantity: 1,
            status: parseInt(product.stock) > 0 ? "In Stock" : "Out of Stock"
          }));
          toast.success("Added to wishlist");
        }
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      toast.error("Failed to update wishlist");
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    if (parseInt(product.minPriceDetails?.stock || product.stock) <= 0) {
      toast.error("Product is out of stock");
      return;
    }

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    const seller = product.minPriceDetails;

    dispatch(
      addToCart({
        item: {
          ...product,
          sellerProductId: seller?.variantId || null,
          sellerId: seller?.sellerId || null,
          quantity,
        },
        accessToken,
        isAuthenticated
      })
    );
    toast.success("Added to cart");
  };

  const handleAddToCartOtherSeller = (offer: any) => {
    if (!product) return;
    
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    dispatch(
      addToCart({
        item: {
          ...product,
          price: offer.price,
          discountedPrice: offer.currentPrice || offer.salePrice || offer.price,
          sellerProductId: offer.variantId,
          sellerId: offer.sellerId,
          quantity: 1,
        },
        accessToken,
        isAuthenticated
      })
    );
    toast.success(`Added ${product.title} from ${offer.sellerName} to cart`);
  };

  const onLoginSuccess = (userData: any, token: string) => {
    if (!product) return;
    const seller = product.minPriceDetails;
    // After login, proceed to add to cart
    dispatch(
      addToCart({
        item: {
          ...product,
          sellerProductId: seller?.variantId || null,
          sellerId: seller?.sellerId || null,
          quantity,
        },
        accessToken: token,
        isAuthenticated: true
      })
    );
    toast.success("Added to cart");
  };

  const handleBuyNow = () => {
    if (!product) return;

    if (parseInt(product.minPriceDetails?.stock || product.stock) <= 0) {
      toast.error("Product is out of stock");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please login to proceed with Buy Now");
      router.push("/signin");
      return;
    }
    setShowBuyNowModal(true);
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      {/* <button
        onClick={() => router.back()}
        className="fixed top-40 left-5 flex items-center gap-1.5 text-blue hover:text-blue-dark text-sm font-medium z-40 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        Back
      </button> */}
      <Breadcrumb title={"Shop Details"} pages={["shop details"]} />

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onSuccess={onLoginSuccess}
      />

      {/* Buy Now Modal */}
      {showBuyNowModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[92vh] overflow-hidden flex flex-col animate-fadeIn">
            <div className="p-6 flex items-center justify-between bg-white z-10">
              <div>
                <h3 className="text-xl font-bold text-dark uppercase tracking-wider">Checkout</h3>
                <p className="text-xs text-gray-400 mt-0.5">Complete your purchase by providing your shipping and payment details.</p>
              </div>
              <button 
                onClick={() => setShowBuyNowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-dark transition-all"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <form onSubmit={handleOrderPlacement} className="flex-1 overflow-y-auto px-6 pb-6 lg:px-10 lg:pb-10 pt-0">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Billing Details */}
                <div className="lg:col-span-7 space-y-8">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-base text-dark flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue/10 text-blue flex items-center justify-center text-[10px] font-bold">1</span>
                        Shipping Address
                      </h4>
                      {selectedAddressIndex !== null && (
                        <button 
                          type="button"
                          onClick={() => handleAddressSelect(null)}
                          className="text-blue text-xs font-semibold hover:underline"
                        >
                          + Add New Address
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar pb-2">
                      {savedAddresses.map((addr, idx) => (
                        <div 
                          key={idx}
                          onClick={() => handleAddressSelect(idx)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all relative group ${selectedAddressIndex === idx ? "border-blue bg-blue/5" : "border-gray-100 hover:border-gray-200 bg-white"}`}
                        >
                          <div className={`absolute top-4 right-4 w-4 h-4 rounded-full border flex items-center justify-center transition-all ${selectedAddressIndex === idx ? "border-blue bg-blue text-white" : "border-gray-200"}`}>
                            {selectedAddressIndex === idx && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                          </div>
                          <p className="font-bold text-dark text-base mb-1">{addr.name}</p>
                          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-2">
                            {addr.doorNo}, {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                            {addr.phone}
                          </div>
                        </div>
                      ))}

                      <div 
                        onClick={() => handleAddressSelect(null)}
                        className="p-4 rounded-xl border-2 border-dashed border-gray-100 cursor-pointer transition-all flex flex-col items-center justify-center min-h-[110px] text-center bg-white hover:border-blue/20 text-gray-300 hover:text-blue/50"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center mb-1.5 transition-colors">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </div>
                        <span className="font-semibold text-xs">Add New Address</span>
                      </div>
                    </div>
                  </div>

                  {selectedAddressIndex === null && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pt-0 animate-fadeIn">
                      <div className="col-span-full">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Full Name *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="John Doe" required className="w-full rounded-lg border-gray-100/50 border bg-white py-2 px-3 text-dark text-sm hover:border-gray-200/50 focus:border-blue/20 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Email *</label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com" required className="w-full rounded-lg border-gray-100/50 border bg-white py-2 px-3 text-dark text-sm hover:border-gray-200/50 focus:border-blue/20 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Phone *</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 9876543210" required className="w-full rounded-lg border-gray-100/50 border bg-white py-2 px-3 text-dark text-sm hover:border-gray-200/50 focus:border-blue/20 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Flat/House No *</label>
                        <input type="text" name="doorNo" value={formData.doorNo} onChange={handleInputChange} placeholder="Door No" required className="w-full rounded-lg border-gray-100/50 border bg-white py-2 px-3 text-dark text-sm hover:border-gray-200/50 focus:border-blue/20 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Street/Area *</label>
                        <input type="text" name="street" value={formData.street} onChange={handleInputChange} placeholder="Street Name" required className="w-full rounded-lg border-gray-100/50 border bg-white py-2 px-3 text-dark text-sm hover:border-gray-200/50 focus:border-blue/20 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">City *</label>
                        <input type="text" name="town" value={formData.town} onChange={handleInputChange} placeholder="City" required className="w-full rounded-lg border-gray-100/50 border bg-white py-2 px-3 text-dark text-sm hover:border-gray-200/50 focus:border-blue/20 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Pincode *</label>
                        <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="600001" required className="w-full rounded-lg border-gray-100/50 border bg-white py-2 px-3 text-dark text-sm hover:border-gray-200/50 focus:border-blue/20 outline-none transition-all" />
                      </div>
                      <div className="col-span-full">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">State *</label>
                        <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="State" required className="w-full rounded-lg border-gray-100/50 border bg-white py-2 px-3 text-dark text-sm hover:border-gray-200/50 focus:border-blue/20 outline-none transition-all" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Summary & Payment */}
                <div className="lg:col-span-5">
                  <div className="sticky top-0 space-y-6">
                    <div className="bg-gray-50/50 p-6 rounded-3xl">
                      <h4 className="font-semibold text-base text-dark mb-5 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue/10 text-blue flex items-center justify-center text-[10px] font-bold">2</span>
                        Order Review
                      </h4>
                      
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                          {product.imgs?.thumbnails?.[0] && (
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-gray-100 p-1.5 flex-shrink-0">
                              <Image src={product.imgs.thumbnails[0]} alt={product.title} width={64} height={64} className="object-contain w-full h-full" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-dark font-bold text-sm mb-1 line-clamp-1">{product.title}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-blue bg-blue/10 px-1.5 py-0.5 rounded">Qty: {quantity}</span>
                              <span className="text-xs text-gray-500">₹{product.discountedPrice}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2.5 pt-1">
                          <div className="flex justify-between text-gray-600 text-sm">
                            <span>Subtotal</span>
                            <span className="text-dark">₹{product.discountedPrice * quantity}</span>
                          </div>
                          <div className="flex justify-between text-gray-600 text-sm">
                            <span>Shipping</span>
                            <span className="text-dark">₹150</span>
                          </div>
                          {payment === "cod" && (
                            <div className="flex justify-between text-gray-600 text-sm">
                              <span>COD Fee</span>
                              <span className="text-dark">₹50</span>
                            </div>
                          )}
                          <div className="flex justify-between text-lg  text-dark pt-4 border-t border-dashed border-gray-300">
                            <span>Total Amount</span>
                            <span className="text-blue">₹{product.discountedPrice * quantity + 150 + (payment === "cod" ? 50 : 0)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h4 className="font-bold text-xs text-dark mb-2">Payment Method</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <label className={`relative flex flex-row items-center gap-3 p-2 border font-medium rounded-xl cursor-pointer transition-all ${payment === "cod" ? "border-blue bg-blue/5 ring-1 ring-blue/10" : "border-gray-200 hover:border-blue/10 bg-white"}`}>
                            <input type="radio" name="payment" checked={payment === "cod"} onChange={() => setPayment("cod")} className="sr-only" />
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 ${payment === "cod" ? "border-blue bg-blue text-white" : "border-gray-300"}`}>
                              {payment === "cod" && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                            </div>
                            <div className="min-w-0">
                              <p className={`text-xs font-bold ${payment === "cod" ? "text-blue" : "text-gray-700"}`}>COD</p>
                              <p className="text-[9px] text-gray-400 truncate">Pay at doorstep</p>
                            </div>
                          </label>
                          <label className={`relative flex flex-row items-center gap-3 p-2  font-medium border rounded-xl cursor-pointer transition-all ${payment === "online" ? "border-blue bg-blue/5 ring-1 ring-blue/10" : "border-gray-200 hover:border-blue/10 bg-white"}`}>
                            <input type="radio" name="payment" checked={payment === "online"} onChange={() => setPayment("online")} className="sr-only" />
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 ${payment === "online" ? "border-blue bg-blue text-white" : "border-gray-300"}`}>
                              {payment === "online" && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                            </div>
                            <div className="min-w-0">
                              <p className={`text-xs font-bold ${payment === "online" ? "text-blue" : "text-gray-700"}`}>ONLINE</p>
                              <p className="text-[9px] text-gray-400 truncate">UPI, Cards, etc.</p>
                            </div>
                          </label>
                        </div>
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-blue text-white py-3 px-6 rounded-xl font-bold text-base hover:bg-blue-dark transition-all mt-6 active:scale-[0.98] flex items-center justify-center gap-2 group"
                      >
                        Place Order
                        <svg className="group-hover:translate-x-1 transition-transform" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                      </button>

                      <p className="text-center text-[10px] text-gray-400 mt-4 flex items-center justify-center gap-1">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        Secure 256-bit SSL Payment
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue"></div>
        </div>
      ) : !product ? (
        <div className="text-center py-20">Product not found</div>
      ) : (
        <>
          <section className="relative pb-4 pt-6 lg:pt-10">
            <div className="max-w-[1300px] w-full mx-auto px-4 sm:px-8 xl:px-0">
              <div className="flex flex-col lg:flex-row gap-8 xl:gap-16 items-center lg:items-start">
                <div className="lg:basis-[42%] w-full lg:sticky lg:top-24 flex-shrink-0 self-start">
                  <div className="flex flex-col pt-4">
                    <div className="flex gap-4 sm:gap-6 items-center lg:items-start">
                    {/* Thumbnails Left Side */}
                    {product.imgs?.thumbnails?.length > 0 && (
                      <div className="hidden sm:flex flex-col gap-3 sm:gap-4">
                        {product.imgs.thumbnails.map((item, key) => (
                          <button
                            onClick={() => setPreviewImg(key)}
                            key={key}
                            className={`flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded-lg bg-gray-2 shadow-1 ease-out duration-200 border-2 hover:border-blue flex-shrink-0 ${key === previewImg
                              ? "border-blue"
                              : "border-transparent"
                              }`}
                          >
                            <Image
                              width={60}
                              height={60}
                              src={item}
                              alt="thumbnail"
                            />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Main Image */}
                    <div className="flex-1 relative group">
                      <div className="min-h-[300px] lg:min-h-[500px] rounded-lg shadow-1 bg-gray-2 p-1 sm:p-2 relative flex items-start justify-center text-center">
                        <div className="w-full h-full flex items-start justify-center">
                          <button
                            onClick={handleAddToWishlist}
                            className="absolute top-4 left-4 z-50 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-md transition-all duration-200 hover:scale-110"
                          >
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill={isWishlisted ? "#FF0000" : "none"}
                              xmlns="http://www.w3.org/2000/svg"
                              stroke={isWishlisted ? "#FF0000" : "#64748B"}
                              strokeWidth="2"
                            >
                              <path
                                d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                              />
                            </svg>
                          </button>

                          {product.imgs?.previews?.[previewImg] ? (
                            <Image
                              src={product.imgs.previews[previewImg]}
                              alt="products-details"
                              width={600}
                              height={600}
                              className="object-contain max-h-[550px]"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full w-full py-20 text-gray-400">
                              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                              </svg>
                              <p className="mt-2 text-sm font-medium">No Image Available</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Mobile Thumbnails Below */}
                      {product.imgs?.thumbnails?.length > 0 && (
                        <div className="flex sm:hidden flex-wrap gap-3 mt-4">
                          {product.imgs.thumbnails.map((item, key) => (
                            <button
                              onClick={() => setPreviewImg(key)}
                              key={key}
                              className={`flex items-center justify-center w-16 h-16 overflow-hidden rounded-lg bg-gray-2 shadow-1 ease-out duration-200 border-2 hover:border-blue ${key === previewImg
                                ? "border-blue"
                                : "border-transparent"
                                }`}
                            >
                              <Image
                                width={50}
                                height={50}
                                src={item}
                                alt="thumbnail"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Flipkart Style Buttons for Desktop */}
                  <div className="hidden lg:flex flex-row justify-end gap-2.5 mt-6">
                    <button
                      onClick={handleAddToCart}
                      disabled={parseInt(product.minPriceDetails?.stock || product.stock) <= 0}
                      className={`inline-flex items-center justify-center gap-2 font-bold text-white py-4 px-10 rounded-sm ease-out duration-200 uppercase tracking-wide shadow-md text-sm ${
                        parseInt(product.minPriceDetails?.stock || product.stock) > 0 
                          ? "bg-blue hover:bg-blue-dark" 
                          : "bg-gray-4 cursor-not-allowed opacity-70"
                      }`}
                    >
                      <svg
                        className="fill-current"
                        width="18"
                        height="18"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M16.9231 4.30769H4.61538L3.69231 1.23077H0.615385V2.76923H2.61538L5.38462 12.3077H16.9231V10.7692H7.23077L6.61538 8.61538H16.9231L18.4615 4.30769ZM16.0385 7.07692H6.18462L5.69231 5.38462H17.4154L16.0385 7.07692ZM6.15385 13.8462C5.30769 13.8462 4.61538 14.5385 4.61538 15.3846C4.61538 16.2308 5.30769 16.9231 6.15385 16.9231C7 16.9231 7.69231 16.2308 7.69231 15.3846C7.69231 14.5385 7 13.8462 6.15385 13.8462ZM15.3846 13.8462C14.5385 13.8462 13.8462 14.5385 13.8462 15.3846C13.8462 16.2308 14.5385 16.9231 15.3846 16.9231C16.2308 16.9231 16.9231 16.2308 16.9231 15.3846C16.9231 14.5385 16.2308 13.8462 15.3846 13.8462Z"
                          fill=""
                        />
                      </svg>
                      ADD TO CART
                    </button>
                    {/* <button
                      onClick={handleBuyNow}
                      disabled={parseInt(product.minPriceDetails?.stock || product.stock) <= 0}
                      className={`flex-1 inline-flex items-center justify-center gap-2 font-bold text-white py-4 px-2 rounded-sm ease-out duration-200 uppercase tracking-wide shadow-md text-sm ${
                        parseInt(product.minPriceDetails?.stock || product.stock) > 0 
                          ? "bg-[#fb641b] hover:bg-[#e65a17]" 
                          : "bg-gray-4 cursor-not-allowed opacity-70"
                      }`}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                      </svg>
                      BUY NOW
                    </button> */}
                  </div>
                </div>
              </div>

                {/* <!-- product content --> */}
                <div className="flex-1 min-w-0 lg:pt-4">
                  <div className="flex flex-col mb-3">
                    {product.brand && (
                      <span className="text-blue text-xs sm:text-sm font-semibold uppercase tracking-wider mb-1.5">
                        {product.brand}
                      </span>
                    )}
                    <div className="mb-2">
                      <h2 className="text-xs sm:text-sm xl:text-lg font-normal text-dark line-clamp-2 overflow-hidden" title={product.title}>
                        {product.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-1.5 mb-4">
                      {parseInt(product.minPriceDetails?.stock || product.stock) > 0 ? (
                        <>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g clipPath="url(#clip0_375_9221)">
                              <path
                                d="M10 0.5625C4.78125 0.5625 0.5625 4.78125 0.5625 10C0.5625 15.2188 4.78125 19.4688 10 19.4688C15.2188 19.4688 19.4688 15.2188 19.4688 10C19.4688 4.78125 15.2188 0.5625 10 0.5625ZM10 18.0625C5.5625 18.0625 1.96875 14.4375 1.96875 10C1.96875 5.5625 5.5625 1.96875 10 1.96875C14.4375 1.96875 18.0625 5.59375 18.0625 10.0312C18.0625 14.4375 14.4375 18.0625 10 18.0625Z"
                                fill="#22AD5C"
                              />
                              <path
                                d="M12.6875 7.09374L8.9688 10.7187L7.2813 9.06249C7.00005 8.78124 6.56255 8.81249 6.2813 9.06249C6.00005 9.34374 6.0313 9.78124 6.2813 10.0625L8.2813 12C8.4688 12.1875 8.7188 12.2812 8.9688 12.2812C9.2188 12.2812 9.4688 12.1875 9.6563 12L13.6875 8.12499C13.9688 7.84374 13.9688 7.40624 13.6875 7.12499C13.4063 6.84374 12.9688 6.84374 12.6875 7.09374Z"
                                fill="#22AD5C"
                              />
                            </g>
                            <defs>
                              <clipPath id="clip0_375_9221">
                                <rect width="20" height="20" fill="white" />
                              </clipPath>
                            </defs>
                          </svg>
                          <span className="text-green text-xs font-semibold uppercase tracking-wide"> In Stock </span>
                        </>
                      ) : (
                        <>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            stroke="#FF0000"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                          </svg>
                          <span className="text-red text-xs font-semibold uppercase tracking-wide"> Out of Stock </span>
                        </>
                      )}
                    </div>
                  </div>



                  <div className="flex items-center gap-3 mb-4.5">
                    <h3 className="font-bold text-2xl text-dark">
                      ₹{product.discountedPrice}
                    </h3>
                    {product.price > product.discountedPrice && (
                      <div className="flex items-center gap-2">
                        <span className="line-through text-gray-400 text-base">
                          ₹{product.price}
                        </span>
                        <span className="text-green-600 text-sm font-normal">
                          {Math.round(((product.price - product.discountedPrice) / product.price) * 100)}% off
                        </span>
                      </div>
                    )}
                  </div>

                  {product.shortDescription && (
                    <p className="text-sm text-gray-500 mb-4 leading-relaxed max-w-2xl line-clamp-3 ">
                      {product.shortDescription}
                    </p>
                  )}

                  {/* Variant Selection UI */}
                  <div className="flex flex-col gap-3 mb-2 mt-2 ">
                    <h3 className="font-medium text-md text-dark mb-1 tracking-tight">Product Variants</h3>
                    {Object.entries(attributeOptions).map(([name, values]: [string, any]) => {
                      return (
                        <div key={name} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                          <span className="text-gray-500 text-sm w-20 flex-shrink-0">{name}</span>
                          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full sm:w-auto">
                            {values.map((val: string) => {
                              const isSelected = selectedAttributes[name]?.toString().toLowerCase() === val.toString().toLowerCase();
                              
                              // Check if this option is available in ANY variant
                              const isAvailable = allOffers.some(v => 
                                v.attributes.some((a: any) => a.name.toLowerCase() === name.toLowerCase() && a.value.toString().toLowerCase() === val.toString().toLowerCase())
                              );

                              const isColor = name.toLowerCase() === "color";
                              const colorImg = isColor ? colorImages[val.toLowerCase()] : null;

                              return (
                                <button
                                  key={val}
                                  disabled={!isAvailable}
                                  onClick={() => handleAttributeChange(name, val)}
                                  className={`relative rounded-[2px] border transition-all flex items-center justify-center overflow-hidden px-1 ${
                                    isColor ? "w-24 h-16" : "w-16 h-7"
                                  } ${
                                    !isAvailable ? "border-gray-100 text-gray-300 cursor-not-allowed" :
                                    isSelected
                                      ? "border-blue text-blue font-medium bg-white shadow-sm"
                                      : "border-[#e0e0e0] text-dark font-normal bg-white"
                                  } text-[11px]`}
                                  title={val}
                                >
                                  {isColor && colorImg ? (
                                    <div className={`w-full h-full p-0.5 bg-white ${!isSelected && "opacity-80"}`}>
                                      <Image 
                                        src={colorImg} 
                                        alt={val} 
                                        width={80} 
                                        height={28} 
                                        className="w-full h-full object-contain"
                                      />
                                    </div>
                                  ) : (
                                    <span className="text-center px-1 truncate w-full leading-tight">
                                      {val}{(name.toUpperCase() === "RAM" || name.toUpperCase() === "STORAGE") && "GB"}
                                    </span>
                                  )}
                                  {isSelected && isColor && (
                                    <div className="absolute top-0 right-0 bg-blue text-white w-2.5 h-2.5 flex items-center justify-center rounded-bl-sm">
                                      <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Delivery & Stock Info */}
                  <div className="mt-8 border-t border-gray-3 pt-8 flex items-start gap-2 mb-6">
                    <span className="text-gray-500 font-medium text-md w-20 pt-0.5">Delivery</span>
                    <div className="flex-1 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-dark  text-md">
                          {product.minPriceDetails?.deliveryDays 
                            ? `Delivery by ${new Date(Date.now() + (product.minPriceDetails.deliveryDays * 24 * 60 * 60 * 1000)).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' })}` 
                            : "Free delivery available"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {product.minPriceDetails?.deliveryDays ? `In ${product.minPriceDetails.deliveryDays} days` : "Standard delivery"}
                        </span>
                      </div>
                      {/* <span className={`text-sm  ${parseInt(product.minPriceDetails?.stock || product.stock) > 0 ? 'text-green' : 'text-red'}`}>
                        {parseInt(product.minPriceDetails?.stock || product.stock) > 0 
                          ? `In Stock (${product.minPriceDetails?.stock || product.stock} units)` 
                          : 'Out of Stock'}
                      </span> */}
                    </div>
                  </div>

                  {/* Seller Section - Flipkart Style */}
                  {product.sellerName && (
                    <div className="mb-6 flex items-start gap-2">
                      <span className="text-gray-500 font-medium text-md w-20 flex-shrink-0 pt-0.5">Seller</span>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-blue  text-md cursor-pointer hover:underline">
                            {product.sellerName}
                          </span>
                          {product.shopName && (
                            <span className="bg-blue/10 text-blue text-[10px]  px-1.5 py-0.5 rounded uppercase">
                              {product.shopName}
                            </span>
                          )}
                        </div>
                        
                        {(() => {
                          const otherSellersOffers = product.allOffers?.filter((s: any) => s.sellerId !== product.minPriceDetails?.sellerId) || [];
                          const uniqueOtherSellersCount = new Set(otherSellersOffers.map((s: any) => s.sellerId)).size;
                          
                          if (uniqueOtherSellersCount > 0) {
                            const minPrice = Math.min(...otherSellersOffers.map((s: any) => s.currentPrice));
                            return (
                              <div className="pt-1">
                                <Link 
                                  href={`/shop-details/${productId}/sellers`}
                                  className="text-blue text-sm flex items-center gap-1 group"
                                >
                                  {uniqueOtherSellersCount === 1 
                                    ? `1 other seller from ₹${minPrice}`
                                    : `View ${uniqueOtherSellersCount} more sellers from ₹${minPrice}`
                                  }
                                  <svg className="transform group-hover:translate-x-0.5 transition-transform" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </Link>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  )}

                  {product.highlights && product.highlights.length > 0 && (
                    <div className="mt-8 mb-9 border-t border-gray-3 pt-8">
                      <h3 className="font-medium text-md text-dark mb-4 tracking-tight">Key Highlights</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-600">
                        {product.highlights.map((highlight: string, index: number) => (
                          <li key={index} className="text-sm">
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-8 mb-9 border-t border-gray-3 pt-8">
                    <h3 className="font-medium text-md text-dark mb-7 tracking-tight">High Specifications</h3>
                    <div className="space-y-5">
                      {(showFullSpecs 
                        ? product.attributes 
                        : product.attributes?.slice(0, 3)
                      )?.map((attr: any, index: number) => (
                        <div key={index} className="flex items-center gap-8 group">
                          <div className="w-1/4 sm:w-[150px] text-dark text-[12px] font-medium uppercase tracking-[0.1em]">
                            {attr.name}
                          </div>
                          <div className="hidden sm:block w-px h-6 bg-gray-3 group-hover:bg-blue group-hover:h-8 transition-all duration-300"></div>
                          <div className="flex-1 text-dark font-normal text-[15px] border-l sm:border-l-0 pl-4 sm:pl-0 border-gray-3">
                            {attr.value}
                          </div>
                        </div>
                      ))}
                    </div>
                    {product.attributes?.length > 3 && (
                      <button 
                        onClick={() => setShowFullSpecs(!showFullSpecs)}
                        className="text-blue text-sm font-medium mt-6 hover:underline focus:outline-none flex items-center gap-1"
                      >
                        {showFullSpecs ? "View Less Specifications" : "View All Specifications"}
                        <svg 
                          className={`fill-current transition-transform duration-300 ${showFullSpecs ? "rotate-180" : ""}`}
                          width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M6 8.5L2.5 5H9.5L6 8.5Z" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <form onSubmit={(e) => e.preventDefault()} className="lg:hidden">
                    <div className="flex flex-wrap items-center justify-end gap-2 mt-8">
                      <button
                        onClick={handleAddToCart}
                        disabled={parseInt(product.minPriceDetails?.stock || product.stock) <= 0}
                        className={`inline-flex items-center justify-center gap-2 font-bold text-white py-4 px-10 rounded-sm ease-out duration-200 uppercase tracking-wide shadow-md text-xs ${
                          parseInt(product.minPriceDetails?.stock || product.stock) > 0 
                            ? "bg-blue hover:bg-blue-dark" 
                            : "bg-gray-4 cursor-not-allowed opacity-70"
                        }`}
                      >
                        <svg
                          className="fill-current"
                          width="16"
                          height="16"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M16.9231 4.30769H4.61538L3.69231 1.23077H0.615385V2.76923H2.61538L5.38462 12.3077H16.9231V10.7692H7.23077L6.61538 8.61538H16.9231L18.4615 4.30769ZM16.0385 7.07692H6.18462L5.69231 5.38462H17.4154L16.0385 7.07692ZM6.15385 13.8462C5.30769 13.8462 4.61538 14.5385 4.61538 15.3846C4.61538 16.2308 5.30769 16.9231 6.15385 16.9231C7 16.9231 7.69231 16.2308 7.69231 15.3846C7.69231 14.5385 7 13.8462 6.15385 13.8462ZM15.3846 13.8462C14.5385 13.8462 13.8462 14.5385 13.8462 15.3846C13.8462 16.2308 14.5385 16.9231 15.3846 16.9231C16.2308 16.9231 16.9231 16.2308 16.9231 15.3846C16.9231 14.5385 16.2308 13.8462 15.3846 13.8462Z"
                            fill=""
                          />
                        </svg>
                        ADD TO CART
                      </button>
                      {/* <button
                        onClick={handleBuyNow}
                        disabled={parseInt(product.minPriceDetails?.stock || product.stock) <= 0}
                        className={`flex-1 inline-flex items-center justify-center gap-2 font-bold text-white py-4 px-2 rounded-sm ease-out duration-200 uppercase tracking-wide shadow-md text-xs min-w-[140px] ${
                          parseInt(product.minPriceDetails?.stock || product.stock) > 0 
                            ? "bg-[#fb641b] hover:bg-[#e65a17]" 
                            : "bg-gray-4 cursor-not-allowed opacity-70"
                        }`}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                        </svg>
                        BUY NOW
                      </button> */}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </section>

          {/* Mobile Sticky Footer */}
          <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white flex items-center border-t border-gray-200 z-[999] p-2 gap-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
            <button
              onClick={handleAddToCart}
              disabled={parseInt(product.minPriceDetails?.stock || product.stock) <= 0}
              className={`w-full font-bold text-white py-3.5 text-sm rounded-sm uppercase ${
                parseInt(product.minPriceDetails?.stock || product.stock) > 0 
                  ? "bg-blue hover:bg-blue-dark shadow-sm" 
                  : "bg-gray-4 cursor-not-allowed"
              }`}
            >
              Add to Cart
            </button>
            {/* <button
              onClick={handleBuyNow}
              disabled={parseInt(product.minPriceDetails?.stock || product.stock) <= 0}
              className={`w-full font-bold text-white py-3.5 text-sm rounded-sm uppercase ${
                parseInt(product.minPriceDetails?.stock || product.stock) > 0 
                  ? "bg-[#fb641b] hover:bg-[#e65a17] shadow-sm" 
                  : "bg-gray-4 cursor-not-allowed"
              }`}
            >
              Buy Now
            </button> */}
          </div>

          <section className="overflow-hidden bg-gray-2 pt-4 pb-20">
            <div className="max-w-[1300px] w-full mx-auto px-4 sm:px-8 xl:px-0">
              {/* <!--== tab header start ==--> */}
              <div className="flex flex-wrap items-center bg-white rounded-[10px] shadow-1 gap-5 xl:gap-12.5 py-4.5 px-4 sm:px-6">
                {tabs.map((item, key) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(item.id)}
                    className={`font-medium lg:text-lg ease-out duration-200 hover:text-blue relative before:h-0.5 before:bg-blue before:absolute before:left-0 before:bottom-0 before:ease-out before:duration-200 hover:before:w-full ${activeTab === item.id
                      ? "text-blue before:w-full"
                      : "text-dark before:w-0"
                      }`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
              {/* <!--== tab header end ==--> */}

              {/* <!--== tab content start ==--> */}
              {/* <!-- tab content one start --> */}
              <div>
                <div
                  className={`flex-col sm:flex-row gap-2 xl:gap-12.5 mt-6 ${activeTab === "tabOne" ? "flex" : "hidden"
                    }`}
                >
                  <div className="w-full">
                    <h2 className="font-medium text-2xl text-dark mb-7">
                      Description:
                    </h2>

                    <div className="mb-6 text-dark">
                      <p className="line-clamp-3 overflow-hidden" style={{ display: showFullDescription ? 'block' : undefined, WebkitLineClamp: showFullDescription ? 'unset' : 3 }}>
                        {product.description}
                      </p>
                      {product.description && product.description.split('\n').length > 3 && (
                        <button 
                          onClick={() => setShowFullDescription(!showFullDescription)}
                          className="text-blue text-sm font-medium mt-4 hover:underline focus:outline-none flex items-center gap-1"
                        >
                          {showFullDescription ? "View Less" : "View More"}
                          <svg 
                            className={`fill-current transition-transform duration-300 ${showFullDescription ? "rotate-180" : ""}`}
                            width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M6 8.5L2.5 5H9.5L6 8.5Z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* <!-- tab content one end --> */}

              {/* <!-- tab content two start --> */}
              <div>
                <div
                  className={`rounded-xl bg-white shadow-1 p-4 sm:p-6 mt-6 ${activeTab === "tabTwo" ? "block" : "hidden"
                    }`}
                >
                  {product.attributes?.map((attr: any, index: number) => (
                    <div key={index} className="rounded-md even:bg-gray-1 flex py-4 px-4 sm:px-5">
                      <div className="max-w-[450px] min-w-[140px] w-full">
                        <p className="text-sm sm:text-base text-dark">{attr.name}</p>
                      </div>
                      <div className="w-full">
                        <p className="text-sm sm:text-base text-dark font-normal">{attr.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* <!-- tab content two end --> */}

              {/* <!-- tab content three start --> */}
              <div>
                <div
                  className={`flex-col sm:flex-row gap-7.5 xl:gap-12.5 mt-6 ${activeTab === "tabThree" ? "flex" : "hidden"
                    }`}
                >
                  <div className="max-w-[570px] w-full">
                    <h2 className="font-medium text-2xl text-dark mb-9">
                      03 Review for this product
                    </h2>

                    <div className="flex flex-col gap-6">
                      {/* <!-- review item --> */}
                      <div className="rounded-xl bg-white shadow-1 p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                          <a href="#" className="flex items-center gap-4">
                            <div className="w-12.5 h-12.5 rounded-full overflow-hidden">
                              <Image
                                src="/images/users/user-01.jpg"
                                alt="author"
                                className="w-12.5 h-12.5 rounded-full overflow-hidden"
                                width={50}
                                height={50}
                              />
                            </div>

                            <div>
                              <h3 className="font-medium text-dark">
                                Davis Dorwart
                              </h3>
                              <p className="text-custom-sm">
                                Serial Entrepreneur
                              </p>
                            </div>
                          </a>

                          <div className="flex items-center gap-1">
                            <span className="cursor-pointer text-[#FBB040]">
                              <svg
                                className="fill-current"
                                width="15"
                                height="16"
                                viewBox="0 0 15 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
                                  fill=""
                                />
                              </svg>
                            </span>

                            <span className="cursor-pointer text-[#FBB040]">
                              <svg
                                className="fill-current"
                                width="15"
                                height="16"
                                viewBox="0 0 15 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
                                  fill=""
                                />
                              </svg>
                            </span>

                            <span className="cursor-pointer text-[#FBB040]">
                              <svg
                                className="fill-current"
                                width="15"
                                height="16"
                                viewBox="0 0 15 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
                                  fill=""
                                />
                              </svg>
                            </span>

                            <span className="cursor-pointer text-[#FBB040]">
                              <svg
                                className="fill-current"
                                width="15"
                                height="16"
                                viewBox="0 0 15 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
                                  fill=""
                                />
                              </svg>
                            </span>

                            <span className="cursor-pointer text-[#FBB040]">
                              <svg
                                className="fill-current"
                                width="15"
                                height="16"
                                viewBox="0 0 15 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
                                  fill=""
                                />
                              </svg>
                            </span>
                          </div>
                        </div>

                        <p className="text-dark mt-6">
                          “Lorem ipsum dolor sit amet, adipiscing elit. Donec
                          malesuada justo vitaeaugue suscipit beautiful
                          vehicula’’
                        </p>
                      </div>

                      {/* <!-- review item --> */}
                      <div className="rounded-xl bg-white shadow-1 p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                          <a href="#" className="flex items-center gap-4">
                            <div className="w-12.5 h-12.5 rounded-full overflow-hidden">
                              <Image
                                src="/images/users/user-01.jpg"
                                alt="author"
                                className="w-12.5 h-12.5 rounded-full overflow-hidden"
                                width={50}
                                height={50}
                              />
                            </div>

                            <div>
                              <h3 className="font-medium text-dark">
                                Davis Dorwart
                              </h3>
                              <p className="text-custom-sm">
                                Serial Entrepreneur
                              </p>
                            </div>
                          </a>

                          <div className="flex items-center gap-1">
                            <span className="cursor-pointer text-[#FBB040]">
                              <svg
                                className="fill-current"
                                width="15"
                                height="16"
                                viewBox="0 0 15 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
                                  fill=""
                                />
                              </svg>
                            </span>

                            <span className="cursor-pointer text-[#FBB040]">
                              <svg
                                className="fill-current"
                                width="15"
                                height="16"
                                viewBox="0 0 15 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
                                  fill=""
                                />
                              </svg>
                            </span>

                            <span className="cursor-pointer text-[#FBB040]">
                              <svg
                                className="fill-current"
                                width="15"
                                height="16"
                                viewBox="0 0 15 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
                                  fill=""
                                />
                              </svg>
                            </span>

                            <span className="cursor-pointer text-[#FBB040]">
                              <svg
                                className="fill-current"
                                width="15"
                                height="16"
                                viewBox="0 0 15 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
                                  fill=""
                                />
                              </svg>
                            </span>

                            <span className="cursor-pointer text-[#FBB040]">
                              <svg
                                className="fill-current"
                                width="15"
                                height="16"
                                viewBox="0 0 15 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
                                  fill=""
                                />
                              </svg>
                            </span>
                          </div>
                        </div>

                        <p className="text-dark mt-6">
                          “Lorem ipsum dolor sit amet, adipiscing elit. Donec
                          malesuada justo vitaeaugue suscipit beautiful
                          vehicula’’
                        </p>
                      </div>

                      {/* <!-- review item --> */}
                      <div className="rounded-xl bg-white shadow-1 p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                          <a href="#" className="flex items-center gap-4">
                            <div className="w-12.5 h-12.5 rounded-full overflow-hidden">
                              <Image
                                src="/images/users/user-01.jpg"
                                alt="author"
                                className="w-12.5 h-12.5 rounded-full overflow-hidden"
                                width={50}
                                height={50}
                              />
                            </div>

                            <div>
                              <h3 className="font-medium text-dark">
                                Davis Dorwart
                              </h3>
                              <p className="text-custom-sm">
                                Serial Entrepreneur
                              </p>
                            </div>
                          </a>

                          <div className="flex items-center gap-1">
                            <span className="cursor-pointer text-[#FBB040]">
                              <svg
                                className="fill-current"
                                width="15"
                                height="16"
                                viewBox="0 0 15 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
                                  fill=""
                                />
                              </svg>
                            </span>

                            <span className="cursor-pointer text-[#FBB040]">
                              <svg
                                className="fill-current"
                                width="15"
                                height="16"
                                viewBox="0 0 15 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
                                  fill=""
                                />
                              </svg>
                            </span>

                            <span className="cursor-pointer text-[#FBB040]">
                              <svg
                                className="fill-current"
                                width="15"
                                height="16"
                                viewBox="0 0 15 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
                                  fill=""
                                />
                              </svg>
                            </span>

                            <span className="cursor-pointer text-[#FBB040]">
                              <svg
                                className="fill-current"
                                width="15"
                                height="16"
                                viewBox="0 0 15 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
                                  fill=""
                                />
                              </svg>
                            </span>

                            <span className="cursor-pointer text-[#FBB040]">
                              <svg
                                className="fill-current"
                                width="15"
                                height="16"
                                viewBox="0 0 15 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
                                  fill=""
                                />
                              </svg>
                            </span>
                          </div>
                        </div>

                        <p className="text-dark mt-6">
                          “Lorem ipsum dolor sit amet, adipiscing elit. Donec
                          malesuada justo vitaeaugue suscipit beautiful
                          vehicula’’
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="max-w-[550px] w-full">
                    <form>
                      <h2 className="font-medium text-2xl text-dark mb-3.5">
                        Add a Review
                      </h2>

                      <p className="mb-6">
                        Your email address will not be published. Required
                        fields are marked *
                      </p>

                      <div className="flex items-center gap-3 mb-7.5">
                        <span>Your Rating*</span>

                        <div className="flex items-center gap-1">
                          <span className="cursor-pointer text-[#FBB040]">
                            <svg
                              className="fill-current"
                              width="15"
                              height="16"
                              viewBox="0 0 15 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
                                fill=""
                              />
                            </svg>
                          </span>

                          <span className="cursor-pointer text-[#FBB040]">
                            <svg
                              className="fill-current"
                              width="15"
                              height="16"
                              viewBox="0 0 15 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
                                fill=""
                              />
                            </svg>
                          </span>

                          <span className="cursor-pointer text-[#FBB040]">
                            <svg
                              className="fill-current"
                              width="15"
                              height="16"
                              viewBox="0 0 15 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
                                fill=""
                              />
                            </svg>
                          </span>

                          <span className="cursor-pointer text-gray-5">
                            <svg
                              className="fill-current"
                              width="15"
                              height="16"
                              viewBox="0 0 15 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
                                fill=""
                              />
                            </svg>
                          </span>

                          <span className="cursor-pointer text-gray-5">
                            <svg
                              className="fill-current"
                              width="15"
                              height="16"
                              viewBox="0 0 15 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
                                fill=""
                              />
                            </svg>
                          </span>
                        </div>
                      </div>

                      <div className="rounded-xl bg-white shadow-1 p-4 sm:p-6">
                        <div className="mb-5">
                          <label htmlFor="comments" className="block mb-2.5">
                            Comments
                          </label>

                          <textarea
                            name="comments"
                            id="comments"
                            rows={5}
                            placeholder="Your comments"
                            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                          ></textarea>

                          <span className="flex items-center justify-between mt-2.5">
                            <span className="text-custom-sm text-dark-4">
                              Maximum
                            </span>
                            <span className="text-custom-sm text-dark-4">
                              0/250
                            </span>
                          </span>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-5 sm:gap-7.5 mb-5.5">
                          <div>
                            <label htmlFor="name" className="block mb-2.5">
                              Name
                            </label>

                            <input
                              type="text"
                              name="name"
                              id="name"
                              placeholder="Your name"
                              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                            />
                          </div>

                          <div>
                            <label htmlFor="email" className="block mb-2.5">
                              Email
                            </label>

                            <input
                              type="email"
                              name="email"
                              id="email"
                              placeholder="Your email"
                              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark"
                        >
                          Submit Reviews
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              {/* <!-- tab content three end --> */}
              {/* <!--== tab content end ==--> */}

              {/* <!-- Image showcase start --> */}
              <div className="bg-gray-2/50 rounded-[2.5rem] p-6 pt-2 md:p-8 md:pt-4 lg:p-10 lg:pt-6">
                <div className="mb-4 text-center">
                  <h3 className="text-xl text-dark">Product Spotlight</h3>
                  <div className="mt-2 w-16 h-1 bg-blue mx-auto rounded-full opacity-20"></div>
                </div>
                
                <div className={
                  product?.imgs?.previews?.length <= 2 
                  ? "flex flex-wrap justify-center gap-6 lg:gap-8" 
                  : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
                }>
                  {product?.imgs?.previews?.map((img: string, index: number) => (
                    <div 
                      key={index} 
                      className={`group relative overflow-hidden rounded-2xl bg-white p-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all duration-500 hover:shadow-[0_8px_25px_rgba(0,0,0,0.04)] hover:-translate-y-1 ${
                        product?.imgs?.previews?.length <= 2 ? "w-full max-w-[400px]" : ""
                      }`}
                    >
                      <div className="overflow-hidden rounded-xl aspect-square w-full">
                        <Image
                          src={img}
                          alt={`${product.title} showcase ${index + 1}`}
                          width={600}
                          height={600}
                          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                      
                      {/* Subtle corner accent */}
                      <div className="absolute top-5 right-5 w-7 h-7 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold text-blue shadow-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* <!-- Image showcase end --> */}
            </div>
          </section>

          {/* All Offers Modal */}
          <div id="allOffers" className="hidden fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-6 flex items-center justify-between border-b border-gray-3 bg-white">
                <h3 className="text-xl font-bold text-dark">All Sellers ({product?.allOffers?.length || 0})</h3>
                <button 
                  onClick={() => {
                    const modal = document.getElementById('allOffers');
                    if (modal) modal.classList.add('hidden');
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-dark transition-all"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              <div className="overflow-y-auto flex-1 p-6">
                <div className="space-y-4">
                  {product?.allOffers?.map((offer: any, idx: number) => (
                    <div key={idx} className="border border-gray-3 rounded-lg p-4 hover:border-blue hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Link 
                            href={`/shop-details/${offer.variantId}`}
                            className="cursor-pointer group/seller"
                            onClick={() => {
                              const modal = document.getElementById('allOffers');
                              if (modal) modal.classList.add('hidden');
                            }}
                          >
                            <h4 className="font-semibold text-dark group-hover/seller:text-blue transition-colors">{offer.sellerName}</h4>
                            {offer.shopName && (
                              <p className="text-xs text-gray-500">{offer.shopName}</p>
                            )}
                          </Link>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-dark">₹{offer.currentPrice?.toLocaleString()}</p>
                          {offer.salePrice && offer.price && offer.salePrice < offer.price && (
                            <p className="text-xs text-gray-500 line-through">₹{offer.price?.toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="text-gray-600">
                          {offer.stock > 0 ? `${offer.stock} in stock` : 'Out of stock'}
                        </span>
                        <span className="text-blue">
                          Delivery in {offer.deliveryDays} days
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          handleAddToCartOtherSeller(offer);
                          const modal = document.getElementById('allOffers');
                          if (modal) modal.classList.add('hidden');
                        }}
                        disabled={offer.stock <= 0}
                        className="w-full py-2.5 px-4 bg-blue text-white rounded-md font-medium hover:bg-blue-dark disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Newsletter />
        </>
      )}
    </>
  );
};

export default ShopDetails;
