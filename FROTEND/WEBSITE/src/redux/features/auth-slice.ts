import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  user: any | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ user: any; accessToken: string }>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      // Also store in localStorage if needed for persistence
      if (typeof window !== "undefined") {
        if (action.payload.user) {
          localStorage.setItem("user", JSON.stringify(action.payload.user));
        }
        if (action.payload.accessToken) {
          localStorage.setItem("accessToken", action.payload.accessToken);
        }
      }
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
      }
    },
    hydrateAuth: (state) => {
      if (typeof window !== "undefined") {
        const user = localStorage.getItem("user");
        const accessToken = localStorage.getItem("accessToken");
        if (user && user !== "undefined" && accessToken) {
          try {
            state.user = JSON.parse(user);
            state.accessToken = accessToken;
            state.isAuthenticated = true;
          } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            state.user = null;
            state.accessToken = null;
            state.isAuthenticated = false;
          }
        }
      }
    },
  },
});

export const { setAuth, logout, hydrateAuth } = authSlice.actions;
export default authSlice.reducer;
