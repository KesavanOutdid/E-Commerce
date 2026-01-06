"use client";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setAuth } from "@/redux/features/auth-slice";
import { API_ENDPOINTS } from "@/lib/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (userData: any, accessToken: string) => void;
}

const LoginModal = ({ isOpen, onClose, onSuccess }: LoginModalProps) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [loginForm, setLoginForm] = useState({ identifier: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.identifier || !loginForm.password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setLoginLoading(true);
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await response.json();

      if (data.success) {
        dispatch(setAuth({ user: data.data.user, accessToken: data.data.accessToken }));
        onClose();
        if (onSuccess) {
          onSuccess(data.data.user, data.data.accessToken);
        }
      } else {
        toast.error(data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Connection error. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-dark/40 transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative bg-white w-full max-w-[440px] rounded-2xl shadow-2xl p-6 sm:p-8 animate-fadeIn">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-dark transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-dark tracking-tight">Account Login</h3>
          <p className="text-gray-500 text-sm mt-0.5">Access your account to continue</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
            <input 
              type="email" 
              value={loginForm.identifier}
              onChange={(e) => setLoginForm({...loginForm, identifier: e.target.value})}
              placeholder="name@example.com"
              className="w-full bg-white rounded-xl py-2.5 px-4 text-dark text-sm outline-none border border-gray-3 duration-200 focus:border-blue focus:ring-4 focus:ring-blue/5"
              required
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
            <input 
              type="password" 
              value={loginForm.password}
              onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              placeholder="••••••••"
              className="w-full bg-white rounded-xl py-2.5 px-4 text-dark text-sm outline-none border border-gray-3 duration-200 focus:border-blue focus:ring-4 focus:ring-blue/5"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loginLoading}
            className="w-full bg-blue text-white font-bold py-3 rounded-xl hover:bg-blue/90 transition-all active:scale-[0.98] flex items-center justify-center mt-2"
          >
            {loginLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
            ) : "Continue"}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Don't have an account?{" "}
            <button 
              type="button" 
              onClick={() => { onClose(); router.push("/signup"); }}
              className="text-blue font-bold hover:underline transition-colors"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
