'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'
import SocialSignIn from '../SocialSignIn'
import Loader from '@/app/components/Common/Loader'
import { authService } from '@/services/authService'
import { useAuth } from '@/context/AuthContext'
import { Icon } from '@iconify/react/dist/iconify.js'

const Signin = () => {
    const router = useRouter()
    const { login } = useAuth()

    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
    })
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const loginUser = async (e: any) => {
        e.preventDefault()

        if (!loginData.email || !loginData.password) {
            toast.error('Please enter email and password')
            return
        }

        setLoading(true)
        
        try {
            const response = await authService.login(loginData.email, loginData.password)
            
            if (response.success) {
                const userData = {
                    userId: response.data.userId,
                    firstName: response.data.firstName,
                    lastName: response.data.lastName,
                    email: response.data.email,
                    phone: response.data.phone,
                    roles: response.data.roles,
                    roleNames: response.data.roleNames,
                }
                
                login(response.data.accessToken, userData)
                toast.success('Login successful')
                router.push('/')
            } else {
                toast.error(response.message || 'Login failed')
            }
        } catch (err: any) {
            console.error('Login error:', err)
            toast.error(err.response?.data?.message || err.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='w-full max-w-lg mx-auto'>
            <div className='mb-8'>
                <h1 className='text-3xl font-bold text-gray-900 mb-2'>Sign In</h1>
                <p className='text-gray-600'>Welcome back! Please sign in to your account.</p>
            </div>

            <SocialSignIn />

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">OR</span>
                </div>
            </div>

            <form onSubmit={loginUser} className='space-y-6'>
                <div className='grid grid-cols-1 gap-4'>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type='email'
                            placeholder='Enter your email'
                            value={loginData.email}
                            onChange={(e) =>
                                setLoginData({ ...loginData, email: e.target.value })
                            }
                            className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400'
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder='Enter your password'
                                value={loginData.password}
                                onChange={(e) =>
                                    setLoginData({ ...loginData, password: e.target.value })
                                }
                                className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-base text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400'
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition"
                            >
                                <Icon icon={showPassword ? 'mdi:eye-off' : 'mdi:eye'} width={20} height={20} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className='flex items-center justify-end'>
                    <Link 
                        href='/forgot-password'
                        className='text-sm text-primary hover:underline font-medium'>
                        Forgot Password?
                    </Link>
                </div>

                <button
                    type='submit'
                    disabled={loading || !loginData.email || !loginData.password}
                    className='w-full bg-primary text-white py-3 rounded-lg text-base font-medium border-2 border-primary hover:bg-primary/90 hover:cursor-pointer transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                    {loading ? (
                        <>
                            <Loader />
                            Signing In...
                        </>
                    ) : (
                        'Sign In'
                    )}
                </button>
            </form>

            <p className='text-center text-gray-600 text-base mt-6'>
                Not a member yet?{' '}
                <Link 
                    href='/signup'
                    className='text-primary hover:underline font-medium'>
                    Sign Up
                </Link>
            </p>
        </div>
    )
}

export default Signin
