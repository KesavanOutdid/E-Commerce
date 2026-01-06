"use client";
import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { fetchCart } from "@/redux/features/cart-slice";
import { hydrateAuth } from "@/redux/features/auth-slice";

const CartHydrator = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, accessToken } = useAppSelector((state) => state.authReducer);
  const hydrated = useRef(false);

  useEffect(() => {
    if (!hydrated.current) {
      dispatch(hydrateAuth());
      hydrated.current = true;
    }
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      dispatch(fetchCart(accessToken));
    }
  }, [isAuthenticated, accessToken, dispatch]);

  return null;
};

export default CartHydrator;
