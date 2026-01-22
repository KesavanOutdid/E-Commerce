'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import Logo from '@/app/components/Layout/Header/Logo'
import Loader from '@/app/components/Common/Loader'
import { authService } from '@/services/authService'
import { Icon } from '@iconify/react/dist/iconify.js'

interface ForgotPasswordProps {
    onBackToSignIn?: () => void
    onCloseModal?: () => void
}

const ForgotPassword = ({ onBackToSignIn, onCloseModal }: ForgotPasswordProps) => {
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
                toast.success(response.message || 'OTP sent to your email')
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

        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters')
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
                toast.success(response.message || 'Password reset successfully')
                if (onCloseModal) {
                    onCloseModal()
                }
                if (onBackToSignIn) {
                    onBackToSignIn()
                }
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
        <>
            <div className='mb-10 text-center mx-auto inline-block max-w-[160px]'>
                <Logo />
            </div>

            <h2 className='mb-3 text-2xl font-bold text-black'>
                {step === 1 && 'Forgot Password'}
                {step === 2 && 'Verify OTP'}
                {step === 3 && 'Reset Password'}
            </h2>
            <p className='mb-8 text-base text-gray-600'>
                {step === 1 && 'Enter your email to receive an OTP'}
                {step === 2 && 'Enter the OTP sent to your email'}
                {step === 3 && 'Create a new password for your account'}
            </p>

            {step === 1 && (
                <form onSubmit={handleForgotPassword}>
                    <div className='mb-[22px]'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type='email'
                            placeholder='Enter your email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary focus-visible:shadow-none text-black'
                            required
                        />
                    </div>
                    <div className='mb-6'>
                        <button
                            type='submit'
                            disabled={loading || !email}
                            className='bg-primary w-full py-3 rounded-lg text-18 font-medium border text-white border-primary hover:text-primary hover:bg-transparent hover:cursor-pointer transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed'>
                            Send OTP {loading && <Loader />}
                        </button>
                    </div>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleValidateOTP}>
                    <div className='mb-[22px]'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            OTP <span className="text-red-500">*</span>
                        </label>
                        <input
                            type='text'
                            placeholder='Enter 6-digit OTP'
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={6}
                            className='w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary focus-visible:shadow-none text-black'
                            required
                        />
                    </div>
                    <div className='mb-6'>
                        <button
                            type='submit'
                            disabled={loading || !otp}
                            className='bg-primary w-full py-3 rounded-lg text-18 font-medium border text-white border-primary hover:text-primary hover:bg-transparent hover:cursor-pointer transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed'>
                            Verify OTP {loading && <Loader />}
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={loading}
                        className='text-sm text-primary hover:underline disabled:opacity-50'>
                        Resend OTP
                    </button>
                </form>
            )}

            {step === 3 && (
                <form onSubmit={handleSetNewPassword}>
                    <div className='mb-[22px]'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? 'text' : 'password'}
                                placeholder='Enter new password'
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className='w-full rounded-md border border-solid bg-transparent px-5 py-3 pr-12 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary focus-visible:shadow-none text-black'
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
                    </div>
                    <div className='mb-[22px]'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder='Confirm new password'
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className='w-full rounded-md border border-solid bg-transparent px-5 py-3 pr-12 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary focus-visible:shadow-none text-black'
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
                    <div className='mb-6'>
                        <button
                            type='submit'
                            disabled={loading || !newPassword || !confirmPassword}
                            className='bg-primary w-full py-3 rounded-lg text-18 font-medium border text-white border-primary hover:text-primary hover:bg-transparent hover:cursor-pointer transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed'>
                            Reset Password {loading && <Loader />}
                        </button>
                    </div>
                </form>
            )}

            <button
                onClick={onBackToSignIn}
                className='text-base text-primary hover:underline'>
                Back to Sign In
            </button>
        </>
    )
}

export default ForgotPassword
