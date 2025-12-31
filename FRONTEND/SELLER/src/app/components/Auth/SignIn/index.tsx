'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'
import SocialSignIn from '../SocialSignIn'
import Logo from '@/app/components/Layout/Header/Logo'
import Loader from '@/app/components/Common/Loader'
import { authService } from '@/services/authService'
import { useAuth } from '@/context/AuthContext'

interface SigninProps {
    onSwitchToSignUp?: () => void
    onCloseModal?: () => void
}

const Signin = ({ onSwitchToSignUp, onCloseModal }: SigninProps) => {
    const router = useRouter()
    const { login } = useAuth()

    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
        checkboxToggle: false,
    })
    const [loading, setLoading] = useState(false)

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
                    kycApproved: response.data.kycApproved,
                }
                
                login(response.data.accessToken, userData)
                toast.success('Login successful')
                if (onCloseModal) {
                    onCloseModal()
                }
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
        <>
            <div className='mb-10 text-center mx-auto inline-block max-w-[160px]'>
                <Logo />
            </div>

            <SocialSignIn />

            <span className="z-1 relative my-8 block text-center before:content-[''] before:absolute before:h-px before:w-[40%] before:bg-black/20 before:left-0 before:top-3 after:content-[''] after:absolute after:h-px after:w-[40%] after:bg-black/20 after:top-3 after:right-0">
                <span className='text-body-secondary relative z-10 inline-block px-3 text-base text-black'>
                    OR
                </span>
            </span>

            <form onSubmit={loginUser}>
                <div className='mb-[22px]'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        type='email'
                        placeholder='Email'
                        value={loginData.email}
                        onChange={(e) =>
                            setLoginData({ ...loginData, email: e.target.value })
                        }
                        className='w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary focus-visible:shadow-none text-black'
                        required
                    />
                </div>
                <div className='mb-[22px]'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password <span className="text-red-500">*</span>
                    </label>
                    <input
                        type='password'
                        placeholder='Password'
                        value={loginData.password}
                        onChange={(e) =>
                            setLoginData({ ...loginData, password: e.target.value })
                        }
                        className='w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary focus-visible:shadow-none text-black'
                        required
                    />
                </div>
                <div className='mb-9'>
                    <button
                        type='submit'
                        disabled={loading || !loginData.email || !loginData.password}
                        className='bg-primary w-full py-3 rounded-lg text-18 font-medium border text-white border-primary hover:text-primary hover:bg-transparent hover:cursor-pointer transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed'>
                        Sign In {loading && <Loader />}
                    </button>
                </div>
            </form>

            <Link
                href='/'
                className='mb-2 inline-block text-base text-primary hover:underline'>
                Forgot Password?
            </Link>
            <p className='text-body-secondary text-black text-base'>
                Not a member yet?{' '}
                <button 
                    onClick={onSwitchToSignUp}
                    className='text-primary hover:underline'>
                    Sign Up
                </button>
            </p>
        </>
    )
}

export default Signin
