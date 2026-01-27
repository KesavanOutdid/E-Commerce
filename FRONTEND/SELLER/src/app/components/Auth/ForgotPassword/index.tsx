'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Loader from '@/app/components/Common/Loader'
import { authService } from '@/services/authService'
import { Icon } from '@iconify/react/dist/iconify.js'

const ForgotPassword = () => {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [otpRef, setOtpRef] = useState('')
    const [resetToken, setResetToken] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [otpSent, setOtpSent] = useState(false)

    const handleForgotPassword = async (e: any) => {
        e.preventDefault()

        if (!email) {
            toast.error('Please enter your email')
            return
        }

        setLoading(true)
        try {
            const response = await authService.forgotPassword(email)
            
            if (response.success) {
                setOtpRef(response.data?.otpRef || response.otpRef)
                setOtpSent(true)
                toast.success(`OTP sent to ${email} successfully!`, {
                    duration: 5000,
                    icon: '✉️'
                })
                setStep(2)
            } else {
                toast.error(response.message || 'Failed to send OTP')
            }
        } catch (err: any) {
            console.error('Forgot password error:', err)
            toast.error(err.response?.data?.message || err.message || 'Failed to send OTP')
        } finally {
            setLoading(false)
        }
    }

    const handleValidateOTP = async (e: any) => {
        e.preventDefault()

        if (!otp) {
            toast.error('Please enter the OTP')
            return
        }

        if (!otpRef) {
            toast.error('OTP reference is missing. Please try again.')
            return
        }

        setLoading(true)
        try {
            const response = await authService.validateOTP(otp, otpRef)
            
            if (response.success) {
                setResetToken(response.data?.resetToken || response.resetToken)
                toast.success(response.message || 'OTP verified successfully')
                setStep(3)
            } else {
                toast.error(response.message || 'Invalid OTP')
            }
        } catch (err: any) {
            console.error('OTP validation error:', err)
            toast.error(err.response?.data?.message || err.message || 'Invalid OTP')
        } finally {
            setLoading(false)
        }
    }

    const handleSetNewPassword = async (e: any) => {
        e.preventDefault()

        if (!newPassword || !confirmPassword) {
            toast.error('Please fill in all fields')
            return
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }

        if (!resetToken) {
            toast.error('Reset token is missing. Please try again.')
            return
        }

        setLoading(true)
        try {
            const response = await authService.setNewPassword(newPassword, confirmPassword, resetToken)
            
            if (response.success) {
                toast.success(response.message || 'Password reset successfully! Please sign in.')
                router.push('/signin')
            } else {
                toast.error(response.message || 'Failed to reset password')
            }
        } catch (err: any) {
            console.error('Set new password error:', err)
            toast.error(err.response?.data?.message || err.message || 'Failed to reset password')
        } finally {
            setLoading(false)
        }
    }

    const handleResendOTP = async () => {
        setLoading(true)
        try {
            const response = await authService.forgotPassword(email)
            
            if (response.success) {
                setOtpRef(response.data?.otpRef || response.otpRef)
                toast.success('OTP resent to your email')
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

    return (
        <div className='w-full max-w-lg mx-auto'>
            <div className='mb-8'>
                <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                    {step === 1 && 'Forgot Password'}
                    {step === 2 && 'Verify OTP'}
                    {step === 3 && 'Reset Password'}
                </h1>
                <p className='text-gray-600'>
                    {step === 1 && 'Enter your email address and we\'ll send you an OTP to reset your password.'}
                    {step === 2 && 'Enter the verification code sent to your email.'}
                    {step === 3 && 'Create a new strong password for your account.'}
                </p>
            </div>

            {step === 1 && (
                <form onSubmit={handleForgotPassword} className='space-y-6'>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type='email'
                            placeholder='Enter your email address'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400'
                            required
                        />
                    </div>
                    <button
                        type='submit'
                        disabled={loading || !email}
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
            )}

            {step === 2 && (
                <>
                    {otpSent && (
                        <div className='mb-6 p-4 bg-green-50 border border-green-200 rounded-lg'>
                            <div className='flex items-start gap-3'>
                                <Icon icon='mdi:check-circle' width={24} height={24} className='text-green-600 mt-0.5' />
                                <div className='flex-1'>
                                    <p className='text-sm font-medium text-green-900'>OTP sent successfully!</p>
                                    <p className='text-sm text-green-700 mt-1'>
                                        Please check your email <span className='font-semibold'>{email}</span> for the verification code.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <form onSubmit={handleValidateOTP} className='space-y-6'>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                OTP <span className="text-red-500">*</span>
                            </label>
                            <input
                                type='text'
                                placeholder='Enter 6-digit OTP'
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                                className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400'
                                required
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
                        <button
                            type='submit'
                            disabled={loading || !otp}
                            className='w-full bg-primary text-white py-3 rounded-lg text-base font-medium border-2 border-primary hover:bg-primary/90 hover:cursor-pointer transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                            {loading ? (
                                <>
                                    <Loader />
                                    Verifying...
                                </>
                            ) : (
                                'Verify OTP'
                            )}
                        </button>
                    </form>
                </>
            )}

            {step === 3 && (
                <form onSubmit={handleSetNewPassword} className='space-y-6'>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? 'text' : 'password'}
                                placeholder='Create a new password'
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-base text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400'
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition"
                            >
                                <Icon icon={showNewPassword ? 'mdi:eye-off' : 'mdi:eye'} width={20} height={20} />
                            </button>
                        </div>
                        <p className='mt-2 text-sm text-gray-500'>Password must be at least 6 characters.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder='Re-enter your password'
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-base text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400'
                                required
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
                        disabled={loading || !newPassword || !confirmPassword}
                        className='w-full bg-primary text-white py-3 rounded-lg text-base font-medium border-2 border-primary hover:bg-primary/90 hover:cursor-pointer transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                        {loading ? (
                            <>
                                <Loader />
                                Resetting...
                            </>
                        ) : (
                            'Reset Password'
                        )}
                    </button>
                </form>
            )}

            <p className='text-center text-gray-600 text-base mt-6'>
                Remember your password?{' '}
                <Link 
                    href='/signin'
                    className='text-primary hover:underline font-medium'>
                    Back to Sign In
                </Link>
            </p>
        </div>
    )
}

export default ForgotPassword
