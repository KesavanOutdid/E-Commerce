'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'

interface SellerInfo {
    _id: string
    userId: string
    shopName: string
    shopLogo?: string | null
    shopAddress?: any
    gstin: string | null
    panNumber: string | null
    kycApproved: boolean
    kycApprovedBy: string | null
    kycApprovedAt: string | null
    onboardingCompleted: boolean
    commissionPercentage: number | null
    bankDetails: any
    isLive?: boolean
    createdAt: string
    updatedAt: string
}

interface User {
    _id?: string
    userId: string
    sellerId?: string
    firstName: string
    lastName: string
    email: string
    phone: string
    role?: string
    roles: number[]
    kycApproved?: boolean
    profileImage?: string | null
    addresses?: any[]
    status?: boolean
    authenticator?: boolean
    lastLoginAt?: string | null
    createdAt?: string
    updatedAt?: string
    createdBy?: string
    updatedBy?: string | null
    roleNames: string[]
    sellerInfo?: SellerInfo
}

interface AuthContextType {
    user: User | null
    token: string | null
    login: (token: string, userData: Partial<User>) => void
    logout: () => void
    updateUser: (userData: Partial<User>) => void
    isAuthenticated: boolean
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const storedToken = localStorage.getItem('seller_token')
        const storedUser = localStorage.getItem('seller_user')
        
        if (storedToken && storedUser && storedUser !== 'undefined') {
            try {
                setToken(storedToken)
                setUser(JSON.parse(storedUser))
            } catch (error) {
                console.error('Failed to parse stored user data:', error)
                localStorage.removeItem('seller_token')
                localStorage.removeItem('seller_user')
            }
        }
        setIsLoading(false)
    }, [])

    const login = (newToken: string, userData: Partial<User>) => {
        setToken(newToken)
        setUser(userData as User)
        localStorage.setItem('seller_token', newToken)
        localStorage.setItem('seller_user', JSON.stringify(userData))
    }

    const logout = () => {
        setToken(null)
        setUser(null)
        localStorage.removeItem('seller_token')
        localStorage.removeItem('seller_user')
    }

    const updateUser = (userData: Partial<User>) => {
        const updatedUser = { ...user, ...userData } as User
        setUser(updatedUser)
        localStorage.setItem('seller_user', JSON.stringify(updatedUser))
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
                isLoading,
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
