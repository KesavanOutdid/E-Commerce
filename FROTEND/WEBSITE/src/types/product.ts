export type Product = {
  // New backend structure
  product?: {
    _id: string;
    productId: string;
    productName: string;
    slug: string;
    price: string | number;
    salePrice: number | null;
    images: string[];
    avgRating: number;
    totalReviews: number;
    minPriceDetails?: {
      price: number;
      sellerName: string;
      shopName: string;
      stock: number | string;
      deliveryDays: number;
      isSeller: boolean;
    };
    isWishlisted?: boolean;
    description?: string;
    shortDescription?: string;
  };
  sellerCount?: number;

  // Old static structure (fallback)
  id?: string | number;
  title?: string;
  reviews?: number;
  price?: number;
  discountedPrice?: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};
