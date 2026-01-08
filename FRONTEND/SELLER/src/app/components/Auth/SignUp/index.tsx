'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import SocialSignUp from '../SocialSignUp'
import Logo from '@/app/components/Layout/Header/Logo'
import { useState } from 'react'
import Loader from '@/app/components/Common/Loader'
import { authService } from '@/services/authService'
import { Icon } from '@iconify/react/dist/iconify.js'

interface SignUpProps {
    onSuccess?: () => void
    onSwitchToSignIn?: () => void
}

const SignUp = ({ onSuccess, onSwitchToSignIn }: SignUpProps) => {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<'email' | 'register'>('email')
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
                toast.success('OTP sent to your email')
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
                if (onSuccess) {
                    onSuccess()
                } else {
                    router.push('/signin')
                }
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
        <>
            <div className='mb-10 text-center mx-auto inline-block max-w-[160px]'>
                <Logo />
            </div>

            <SocialSignUp />

            <span className="z-1 relative my-8 block text-center before:content-[''] before:absolute before:h-px before:w-[40%] before:bg-black/20 before:left-0 before:top-3 after:content-[''] after:absolute after:h-px after:w-[40%] after:bg-black/20 after:top-3 after:right-0">
                <span className='text-body-secondary relative z-10 inline-block px-3 text-base text-black'>
                    OR
                </span>
            </span>

            {step === 'email' ? (
                <form onSubmit={handleSendOTP}>
                    <div className='mb-[22px]'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type='email'
                            placeholder='Email'
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className='w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary focus-visible:shadow-none text-black'
                        />
                    </div>
                    <div className='mb-9'>
                        <button
                            type='submit'
                            disabled={loading || !formData.email}
                            className='flex w-full items-center text-18 font-medium justify-center rounded-md text-white bg-primary px-5 py-3 text-darkmode transition duration-300 ease-in-out hover:bg-transparent hover:text-primary border-primary border hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'>
                            Send OTP {loading && <Loader />}
                        </button>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className='mb-[22px]'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type='text'
                            placeholder='First Name'
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            required
                            className='w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary focus-visible:shadow-none text-black'
                        />
                    </div>
                    <div className='mb-[22px]'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type='text'
                            placeholder='Last Name'
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            required
                            className='w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary focus-visible:shadow-none text-black'
                        />
                    </div>
                    <div className='mb-[22px]'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type='tel'
                            placeholder='Phone Number'
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
                            className='w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary focus-visible:shadow-none text-black'
                        />
                    </div>
                    <div className='mb-[22px]'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            OTP Code <span className="text-red-500">*</span>
                        </label>
                        <input
                            type='text'
                            placeholder='OTP Code'
                            value={formData.otpCode}
                            onChange={(e) => setFormData({ ...formData, otpCode: e.target.value })}
                            required
                            className='w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary focus-visible:shadow-none text-black'
                        />
                    </div>
                    <div className='mb-[22px]'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder='Password'
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                className='w-full rounded-md border border-solid bg-transparent px-5 py-3 pr-12 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary focus-visible:shadow-none text-black'
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
                    <div className='mb-[22px]'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder='Confirm Password'
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                                className='w-full rounded-md border border-solid bg-transparent px-5 py-3 pr-12 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary focus-visible:shadow-none text-black'
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
                    <div className='mb-9'>
                        <button
                            type='submit'
                            disabled={loading || !formData.firstName || !formData.lastName || !formData.phone || !formData.otpCode || !formData.password || !formData.confirmPassword}
                            className='flex w-full items-center text-18 font-medium justify-center rounded-md text-white bg-primary px-5 py-3 text-darkmode transition duration-300 ease-in-out hover:bg-transparent hover:text-primary border-primary border hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'>
                            Register & Continue {loading && <Loader />}
                        </button>
                    </div>
                </form>
            )}

            <p className='text-body-secondary mb-4 text-black text-base'>
                By creating an account you are agree with our{' '}
                <Link href='/#' className='text-primary hover:underline'>
                    Privacy
                </Link>{' '}
                and{' '}
                <Link href='/#' className='text-primary hover:underline'>
                    Policy
                </Link>
            </p>

            <p className='text-body-secondary text-black text-base'>
                Already have an account?
                <button 
                    onClick={onSwitchToSignIn}
                    className='pl-2 text-primary hover:underline'>
                    Sign In
                </button>
            </p>
        </>
    )
}

export default SignUp
