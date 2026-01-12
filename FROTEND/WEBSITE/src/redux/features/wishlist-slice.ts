import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type InitialState = {
  items: WishListItem[];
};

type WishListItem = {
  id: string | number;
  _id?: string;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  status?: string;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

const getInitialWishlist = (): WishListItem[] => {
  if (typeof window !== "undefined") {
    const savedWishlist = localStorage.getItem("wishlist");
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  }
  return [];
};

const initialState: InitialState = {
  items: getInitialWishlist(),
};

export const wishlist = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addItemToWishlist: (state, action: PayloadAction<WishListItem>) => {
      const { id, title, price, quantity, imgs, discountedPrice, status } =
        action.payload;
      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          id,
          title,
          price,
          quantity,
          imgs,
          discountedPrice,
          status,
        });
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("wishlist", JSON.stringify(state.items));
      }
    },
    removeItemFromWishlist: (state, action: PayloadAction<string | number>) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item.id !== itemId);
      if (typeof window !== "undefined") {
        localStorage.setItem("wishlist", JSON.stringify(state.items));
      }
    },

    removeAllItemsFromWishlist: (state) => {
      state.items = [];
      if (typeof window !== "undefined") {
        localStorage.setItem("wishlist", JSON.stringify(state.items));
      }
    },

    setWishlist: (state, action: PayloadAction<WishListItem[]>) => {
      state.items = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("wishlist", JSON.stringify(state.items));
      }
    },
  },
});

export const {
  addItemToWishlist,
  removeItemFromWishlist,
  removeAllItemsFromWishlist,
  setWishlist,
} = wishlist.actions;
export default wishlist.reducer;
