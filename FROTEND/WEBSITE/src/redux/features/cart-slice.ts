import { createSelector, createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { API_ENDPOINTS, API_BASE_URL } from "@/lib/api";

type InitialState = {
  items: CartItem[];
  loading: boolean;
  error: string | null;
};

export type CartItem = {
  id: string | number; // Support both backend string ID and frontend number if any
  productId: string;
  sellerProductId?: string | null;
  sellerId?: string | null;
  title: string;
  productName?: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  qty?: number; // Backend uses qty
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
  images?: string[]; // Backend uses images
  totalPrice?: number;
  gst?: number;
  subTotal?: number;
  slug?: string;
};

const getInitialCart = (): CartItem[] => {
  if (typeof window !== "undefined") {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  }
  return [];
};

const initialState: InitialState = {
  items: getInitialCart(),
  loading: false,
  error: null,
};

// Async Thunks
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (accessToken: string, { rejectWithValue }) => {
    try {
      const response = await fetch(API_ENDPOINTS.CART, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        return data.data.items.map((item: any) => ({
          id: item.variantId || item.sellerProductId || item.productId,
          productId: item.productId,
          sellerProductId: item.variantId || item.sellerProductId,
          sellerId: item.sellerId,
          title: item.productName,
          price: parseFloat(item.price),
          discountedPrice: item.salePrice ? parseFloat(item.salePrice) : parseFloat(item.price),
          quantity: item.qty,
          gst: item.gst || 0,
          subTotal: item.subTotal || (parseFloat(item.salePrice || item.price) * item.qty),
          imgs: {
            thumbnails: item.images?.map((img: string) => 
              img.startsWith("http") ? img : `${API_BASE_URL}${img}`
            ) || [],
            previews: item.images?.map((img: string) => 
              img.startsWith("http") ? img : `${API_BASE_URL}${img}`
            ) || [],
          },
          slug: item.slug,
        }));
      }
      return rejectWithValue(data.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCartItemServer = createAsyncThunk(
  "cart/updateCartItemServer",
  async ({ productId, sellerProductId, qty, totalPrice, gst, subTotal, accessToken }: { productId: string, sellerProductId?: string | null, qty: number, totalPrice: number, gst: number, subTotal: number, accessToken: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(API_ENDPOINTS.UPDATE_CART(productId), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ qty, totalPrice, gst, subTotal, variantId: sellerProductId }),
      });
      const data = await response.json();
      if (data.success) {
        return { productId, sellerProductId, qty };
      }
      return rejectWithValue(data.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeCartItemServer = createAsyncThunk(
  "cart/removeCartItemServer",
  async ({ productId, variantId, accessToken }: { productId: string, variantId?: string | null, accessToken: string }, { rejectWithValue }) => {
    try {
      const url = new URL(API_ENDPOINTS.REMOVE_FROM_CART(productId));
      if (variantId) {
        url.searchParams.append("variantId", variantId);
      }
      
      const response = await fetch(url.toString(), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        return { productId, variantId };
      }
      return rejectWithValue(data.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const clearCartServer = createAsyncThunk(
  "cart/clearCartServer",
  async (accessToken: string, { rejectWithValue }) => {
    try {
      const response = await fetch(API_ENDPOINTS.CLEAR_CART, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        return true;
      }
      return rejectWithValue(data.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ item, accessToken, isAuthenticated }: { item: any, accessToken?: string, isAuthenticated: boolean }, { dispatch, getState, rejectWithValue }) => {
    // Always add to local state first for immediate UI feedback
    const cartItem: CartItem = {
      id: item.id || item.productId,
      productId: item.id || item.productId,
      sellerProductId: item.sellerProductId || null,
      sellerId: item.sellerId || null,
      title: item.title || item.productName,
      price: item.price,
      discountedPrice: item.discountedPrice || item.price,
      quantity: item.quantity || 1,
      imgs: item.imgs,
    };
    
    const state = getState() as RootState;
    const existingItem = state.cartReducer.items.find(i => i.productId === cartItem.productId && ((i.sellerProductId ?? null) === (cartItem.sellerProductId ?? null)));

    dispatch(addItemToCart(cartItem));

    if (isAuthenticated && accessToken) {
      try {
        if (existingItem) {
          // If item already exists, we update quantity on server
          const newQty = existingItem.quantity + cartItem.quantity;
          const totalPrice = cartItem.discountedPrice * newQty;
          await dispatch(updateCartItemServer({ 
            productId: cartItem.productId, 
            sellerProductId: cartItem.sellerProductId,
            qty: newQty,
            totalPrice,
            gst: 0,
            subTotal: totalPrice,
            accessToken 
          })).unwrap();
        } else {
          // New item, so we add to cart on server (Inlined logic to keep only one thunk)
          const response = await fetch(API_ENDPOINTS.ADD_TO_CART, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              variantId: cartItem.sellerProductId,
              productId: cartItem.productId,
              sellerId: cartItem.sellerId,
              qty: cartItem.quantity,
              totalPrice: cartItem.discountedPrice * cartItem.quantity,
              gst: 0,
              subTotal: cartItem.discountedPrice * cartItem.quantity,
              salePrice: cartItem.discountedPrice
            }),
          });
          const data = await response.json();
          if (!data.success) {
            return rejectWithValue(data.message);
          }
        }
      } catch (error: any) {
        console.error("Failed to sync cart with server:", error);
        return rejectWithValue(error.message);
      }
    }
  }
);

export const cart = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItemToCart: (state, action: PayloadAction<CartItem>) => {
      const { id, title, price, quantity, discountedPrice, imgs, sellerProductId, sellerId } =
        action.payload;
      const existingItem = state.items.find((item) => item.productId === action.payload.productId && ((item.sellerProductId ?? null) === (sellerProductId ?? null)));

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          id,
          productId: action.payload.productId,
          sellerProductId,
          sellerId,
          title,
          price,
          quantity,
          discountedPrice,
          imgs,
        });
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("cart", JSON.stringify(state.items));
      }
    },
    removeItemFromCart: (state, action: PayloadAction<string | number>) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item.id !== itemId);
      if (typeof window !== "undefined") {
        localStorage.setItem("cart", JSON.stringify(state.items));
      }
    },
    updateCartItemQuantity: (
      state,
      action: PayloadAction<{ id: string | number; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        existingItem.quantity = quantity;
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("cart", JSON.stringify(state.items));
      }
    },

    removeAllItemsFromCart: (state) => {
      state.items = [];
      if (typeof window !== "undefined") {
        localStorage.setItem("cart", JSON.stringify(state.items));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        if (typeof window !== "undefined") {
          localStorage.setItem("cart", JSON.stringify(state.items));
        }
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateCartItemServer.fulfilled, (state, action) => {
        const { productId, sellerProductId, qty } = action.payload;
        const item = state.items.find((i) => i.productId === productId && ((i.sellerProductId ?? null) === (sellerProductId ?? null)));
        if (item) {
          item.quantity = qty;
          if (typeof window !== "undefined") {
            localStorage.setItem("cart", JSON.stringify(state.items));
          }
        }
      })
      .addCase(removeCartItemServer.fulfilled, (state, action) => {
        const { productId, variantId } = action.payload;
        state.items = state.items.filter((i) => !(i.productId === productId && ((i.sellerProductId ?? null) === (variantId ?? null))));
        if (typeof window !== "undefined") {
          localStorage.setItem("cart", JSON.stringify(state.items));
        }
      })
      .addCase(clearCartServer.fulfilled, (state) => {
        state.items = [];
        if (typeof window !== "undefined") {
          localStorage.setItem("cart", JSON.stringify(state.items));
        }
      });
  },
});

export const selectCartItems = (state: RootState) => state.cartReducer.items;

export const selectTotalPrice = createSelector([selectCartItems], (items) => {
  return items.reduce((total, item) => {
    return total + item.discountedPrice * item.quantity;
  }, 0);
});

export const {
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  removeAllItemsFromCart,
} = cart.actions;
export default cart.reducer;
