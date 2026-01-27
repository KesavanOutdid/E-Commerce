'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import SocialSignUp from '../SocialSignUp'
import { useState } from 'react'
import Loader from '@/app/components/Common/Loader'
import { authService } from '@/services/authService'
import { Icon } from '@iconify/react/dist/iconify.js'

const SignUp = () => {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<'email' | 'register'>('email')
    const [otpSent, setOtpSent] = useState(false)
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        otpCode: '',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const handleSendOTP = async (e: any) => {
        e.preventDefault()

        if (!formData.email) {
            toast.error('Please enter your email')
            return
        }

        setLoading(true)
        
        try {
            const response = await authService.sendOTP(formData.email)
            
            if (response.success) {
                setOtpSent(true)
                toast.success(`OTP sent to ${formData.email} successfully!`, {
                    duration: 5000,
                    icon: '✉️'
                })
                setStep('register')
            } else {
                toast.error(response.message || 'Failed to send OTP')
            }
        } catch (err: any) {
            console.error('Send OTP error:', err)
            toast.error(err.response?.data?.message || err.message || 'Failed to send OTP')
        } finally {
            setLoading(false)
        }
    }

    const handleResendOTP = async () => {
        if (!formData.email) {
            toast.error('Email is required')
            return
        }

        setLoading(true)
        
        try {
            const response = await authService.sendOTP(formData.email)
            
            if (response.success) {
                toast.success(`New OTP sent to ${formData.email}!`, {
                    duration: 5000,
                    icon: '✉️'
                })
            } else {
                toast.error(response.message || 'Failed to resend OTP')
            }
        } catch (err: any) {
            console.error('Resend OTP error:', err)
            toast.error(err.response?.data?.message || err.message || 'Failed to resend OTP')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault()

        if (!formData.firstName || !formData.lastName || !formData.phone || !formData.password || !formData.otpCode) {
            toast.error('Please fill all fields')
            return
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }

        setLoading(true)
        
        try {
            const response = await authService.register({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                otpCode: formData.otpCode,
            })
            
            if (response.success) {
                toast.success('Successfully registered! Please sign in.')
                router.push('/signin')
            } else {
                toast.error(response.message || 'Registration failed')
            }
        } catch (err: any) {
            console.error('Registration error:', err)
            toast.error(err.response?.data?.message || err.message || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='w-full max-w-lg mx-auto mt-25'>
            <div className='mb-8'>
                <h1 className='text-3xl font-bold text-gray-900 mb-2'>Sign Up</h1>
                <p className='text-gray-600'>Create your seller account to start selling.</p>
            </div>

            <SocialSignUp />

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">OR</span>
                </div>
            </div>

            {step === 'email' ? (
                <form onSubmit={handleSendOTP} className='space-y-6'>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type='email'
                            placeholder='Enter your email address'
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400'
                        />
                        <p className='mt-2 text-sm text-gray-500'>We'll send you a verification code to this email.</p>
                    </div>
                    <button
                        type='submit'
                        disabled={loading || !formData.email}
                        className='w-full bg-primary text-white py-3 rounded-lg text-base font-medium border-2 border-primary hover:bg-primary/90 hover:cursor-pointer transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                        {loading ? (
                            <>
                                <Loader />
                                Sending OTP...
                            </>
                        ) : (
                            <>
                                <Icon icon='mdi:email-fast' width={20} height={20} />
                                Send OTP
                            </>
                        )}
                    </button>
                </form>
            ) : (
                <>
                    {otpSent && (
                        <div className='mb-6 p-4 bg-green-50 border border-green-200 rounded-lg'>
                            <div className='flex items-start gap-3'>
                                <Icon icon='mdi:check-circle' width={24} height={24} className='text-green-600 mt-0.5' />
                                <div className='flex-1'>
                                    <p className='text-sm font-medium text-green-900'>OTP sent successfully!</p>
                                    <p className='text-sm text-green-700 mt-1'>
                                        Please check your email <span className='font-semibold'>{formData.email}</span> for the verification code.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className='space-y-6'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type='text'
                                    placeholder='Enter first name'
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    required
                                    className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400'
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type='text'
                                    placeholder='Enter last name'
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    required
                                    className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400'
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type='tel'
                                placeholder='Enter 10-digit phone number'
                                value={formData.phone}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '')
                                    if (value.length <= 10) {
                                        setFormData({ ...formData, phone: value })
                                    }
                                }}
                                pattern="[0-9]{10}"
                                maxLength={10}
                                required
                                className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400'
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                OTP Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type='text'
                                placeholder='Enter 6-digit OTP'
                                value={formData.otpCode}
                                onChange={(e) => setFormData({ ...formData, otpCode: e.target.value })}
                                maxLength={6}
                                required
                                className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400'
                            />
                            <div className='mt-2 flex items-center justify-between'>
                                <p className='text-sm text-gray-500'>Didn't receive the code?</p>
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={loading}
                                    className='text-sm text-primary hover:underline font-medium disabled:opacity-50'>
                                    Resend OTP
                                </button>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder='Create a strong password'
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-base text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400'
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
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder='Re-enter your password'
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                    className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-base text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400'
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition"
                                >
                                    <Icon icon={showConfirmPassword ? 'mdi:eye-off' : 'mdi:eye'} width={20} height={20} />
                                </button>
                            </div>
                        </div>
                        
                        <button
                            type='submit'
                            disabled={loading || !formData.firstName || !formData.lastName || !formData.phone || !formData.otpCode || !formData.password || !formData.confirmPassword}
                            className='w-full bg-primary text-white py-3 rounded-lg text-base font-medium border-2 border-primary hover:bg-primary/90 hover:cursor-pointer transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                            {loading ? (
                                <>
                                    <Loader />
                                    Registering...
                                </>
                            ) : (
                                'Register & Continue'
                            )}
                        </button>
                    </form>
                </>
            )}

            <p className='text-center text-gray-600 text-sm mt-6'>
                By creating an account you agree to our{' '}
                <Link href='/privacy' className='text-primary hover:underline font-medium'>
                    Privacy Policy
                </Link>{' '}
                and{' '}
                <Link href='/terms' className='text-primary hover:underline font-medium'>
                    Terms of Service
                </Link>
            </p>

            <p className='text-center text-gray-600 text-base mt-4'>
                Already have an account?{' '}
                <Link 
                    href='/signin'
                    className='text-primary hover:underline font-medium'>
                    Sign In
                </Link>
            </p>
        </div>
    )
}

export default SignUp
