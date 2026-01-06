export type Product = {
  id: string | number;
  title: string;
  reviews: number;
  price: number;
  discountedPrice: number;
  imgs: {
    thumbnails: string[];
    previews: string[];
  };
  category?: string;
  subCategory?: string;
  stock?: number;
  slug?: string;
  description?: string;
  shortDescription?: string;
  isWishlisted?: boolean;
};
