'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'

interface SellerInfo {
    _id: string
    userId: string
    shopName: string
    gstin: string | null
    panNumber: string | null
    kycApproved: boolean
    kycApprovedBy: string | null
    kycApprovedAt: string | null
    onboardingCompleted: boolean
    isLive: boolean
    commissionPercentage: number | null
    goLiveApprovedBy: string | null
    goLiveApprovedAt: string | null
    bankDetails: any
    createdAt: string
    updatedAt: string
}

interface User {
    _id: string
    userId: string
    firstName: string
    lastName: string
    email: string
    phone: string
    roles: number[]
    profileImage: string | null
    addresses: any[]
    status: boolean
    authenticator: boolean
    lastLoginAt: string | null
    createdAt: string
    updatedAt: string
    createdBy: string
    updatedBy: string | null
    roleNames: string[]
    sellerInfo?: SellerInfo
}

interface AuthContextType {
    user: User | null
    token: string | null
    login: (token: string, userData: User) => void
    logout: () => void
    updateUser: (userData: User) => void
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)

    useEffect(() => {
        const storedToken = localStorage.getItem('seller_token')
        const storedUser = localStorage.getItem('seller_user')
        
        if (storedToken && storedUser) {
            setToken(storedToken)
            setUser(JSON.parse(storedUser))
        }
    }, [])

    const login = (newToken: string, userData: User) => {
        setToken(newToken)
        setUser(userData)
        localStorage.setItem('seller_token', newToken)
        localStorage.setItem('seller_user', JSON.stringify(userData))
    }

    const logout = () => {
        setToken(null)
        setUser(null)
        localStorage.removeItem('seller_token')
        localStorage.removeItem('seller_user')
    }

    const updateUser = (userData: User) => {
        setUser(userData)
        localStorage.setItem('seller_user', JSON.stringify(userData))
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                logout,
                updateUser,
                isAuthenticated: !!token,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
