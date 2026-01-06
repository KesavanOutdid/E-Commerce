import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/types/product";

type InitialState = {
  value: Product;
};

const initialState = {
  value: {
    product: {
      _id: "",
      productId: "",
      productName: "",
      slug: "",
      price: 0,
      salePrice: null,
      images: [],
      avgRating: 0,
      totalReviews: 0,
      minPriceDetails: {
        price: 0,
        sellerName: "",
        shopName: "",
        stock: 0,
        deliveryDays: 0,
        isSeller: false,
      },
    },
    sellerCount: 0,
  } as Product,
} as InitialState;

export const quickView = createSlice({
  name: "quickView",
  initialState,
  reducers: {
    updateQuickView: (_, action) => {
      return {
        value: {
          ...action.payload,
        },
      };
    },

    resetQuickView: () => {
      return {
        value: initialState.value,
      };
    },
  },
});

export const { updateQuickView, resetQuickView } = quickView.actions;
export default quickView.reducer;
