'use client'

import { useEffect, useRef, useState } from 'react'
import Logo from './Logo'
import HeaderLink from './Navigation/HeaderLink'
import MobileHeaderLink from './Navigation/MobileHeaderLink'
import Signin from '@/app/components/Auth/SignIn'
import SignUp from '@/app/components/Auth/SignUp'
import { Icon } from '@iconify/react/dist/iconify.js'
import { HeaderItem } from '@/app/types/menu'
import withBasePath from '@/utils/basePath'
import { useAuth } from '@/context/AuthContext'
import { useRouter, usePathname } from 'next/navigation'

const Header: React.FC = () => {
    const { user, logout, isAuthenticated } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [headerData, setHeaderData] = useState<HeaderItem[]>([])

    const [navbarOpen, setNavbarOpen] = useState(false)
    const [sticky, setSticky] = useState(false)
    const [isSignInOpen, setIsSignInOpen] = useState(false)
    const [isSignUpOpen, setIsSignUpOpen] = useState(false)
    const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false)

    const navbarRef = useRef<HTMLDivElement>(null)
    const signInRef = useRef<HTMLDivElement>(null)
    const signUpRef = useRef<HTMLDivElement>(null)
    const mobileMenuRef = useRef<HTMLDivElement>(null)
    const accountDropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(withBasePath('/data/data.json'))
                if (!res.ok) throw new Error('Failed to fetch')
                const data = await res.json()
                setHeaderData(data.HeaderData)
            } catch (error) {
                console.error('Error fetching services:', error)
            }
        }
        fetchData()
    }, [])

    const handleScroll = () => {
        setSticky(window.scrollY >= 10)
    }

    const handleClickOutside = (event: MouseEvent) => {
        if (
            signInRef.current &&
            !signInRef.current.contains(event.target as Node)
        ) {
            setIsSignInOpen(false)
        }
        if (
            signUpRef.current &&
            !signUpRef.current.contains(event.target as Node)
        ) {
            setIsSignUpOpen(false)
        }
        if (
            mobileMenuRef.current &&
            !mobileMenuRef.current.contains(event.target as Node) &&
            navbarOpen
        ) {
            setNavbarOpen(false)
        }
        if (
            accountDropdownRef.current &&
            !accountDropdownRef.current.contains(event.target as Node)
        ) {
            setIsAccountDropdownOpen(false)
        }
    }

    const handleLogout = () => {
        logout()
        setIsAccountDropdownOpen(false)
        router.push('/')
    }

    useEffect(() => {
        window.addEventListener('scroll', handleScroll)
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            window.removeEventListener('scroll', handleScroll)
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [navbarOpen, isSignInOpen, isSignUpOpen])

    useEffect(() => {
        if (isSignInOpen || isSignUpOpen || navbarOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
    }, [isSignInOpen, isSignUpOpen, navbarOpen])

    const filteredHeaderData = headerData.filter(item => {
        if (!isAuthenticated && (item.label === 'Products' || item.label === 'Orders')) {
            return false
        }
        return true
    })

    return (
        <header
            className={`fixed top-0 z-40 w-full transition-all duration-300 ${sticky ? ' shadow-lg bg-primary py-4' : 'shadow-none py-4 bg-primary'
                }`}>
            <div>
                <div className='container mx-auto max-w-7xl px-4 flex items-center justify-between'>
                    <Logo />
                    <nav className='hidden lg:flex grow items-center gap-8 justify-start ml-14'>
                        {filteredHeaderData.map((item, index) => (
                            <HeaderLink key={index} item={item} />
                        ))}
                    </nav>
                    <div className='flex items-center gap-4'>
                        {!isAuthenticated ? (
                            <>
                                <button
                                    className='hidden lg:block bg-white text-primary border border-white hover:bg-transparent hover:text-white duration-300 px-6 py-2 rounded-lg hover:cursor-pointer font-medium'
                                    onClick={() => {
                                        setIsSignInOpen(true)
                                    }}>
                                    Sign In
                                </button>
                                <button
                                    className='hidden lg:block bg-white text-primary text-base font-medium hover:bg-transparent hover:text-white border border-white px-6 py-2 rounded-lg hover:cursor-pointer'
                                    onClick={() => {
                                        setIsSignUpOpen(true)
                                    }}>
                                    Start Selling
                                </button>
                            </>
                        ) : (
                            <div className='hidden lg:block relative' ref={accountDropdownRef}>
                                <button
                                    onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                                    className='flex items-center gap-2 bg-white text-primary border border-white hover:bg-transparent hover:text-white duration-300 px-6 py-2 rounded-lg hover:cursor-pointer font-medium'>
                                    <Icon icon='mdi:account-circle' width={24} height={24} />
                                    <span>{user?.firstName} {user?.lastName}</span>
                                    <Icon icon='mdi:chevron-down' width={20} height={20} />
                                </button>
                                {isAccountDropdownOpen && (
                                    <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50'>
                                        <button
                                            onClick={() => {
                                                setIsAccountDropdownOpen(false)
                                                router.push('/profile')
                                            }}
                                            className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 ${
                                                pathname === '/profile' ? 'bg-primary/10 text-primary font-semibold' : 'text-black'
                                            }`}>
                                            <Icon icon='mdi:account' width={20} height={20} />
                                            Profile
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsAccountDropdownOpen(false)
                                                router.push('/kyc')
                                            }}
                                            className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 ${
                                                pathname === '/kyc' ? 'bg-primary/10 text-primary font-semibold' : 'text-black'
                                            }`}>
                                            <Icon icon='mdi:file-document-check' width={20} height={20} />
                                            KYC
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsAccountDropdownOpen(false)
                                                router.push('/pickup-addresses')
                                            }}
                                            className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 ${
                                                pathname === '/pickup-addresses' ? 'bg-primary/10 text-primary font-semibold' : 'text-black'
                                            }`}>
                                            <Icon icon='mdi:map-marker-multiple' width={20} height={20} />
                                            Pickup Address
                                        </button>
                                        <hr className='my-2' />
                                        <button
                                            onClick={handleLogout}
                                            className='w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-red-600'>
                                            <Icon icon='mdi:logout' width={20} height={20} />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        {isSignInOpen && (
                            <div className='fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-50'>
                                <div
                                    ref={signInRef}
                                    className='relative mx-auto w-full max-w-md overflow-hidden rounded-lg px-8 pt-14 pb-8 text-center bg-dark_grey/90 backdrop-blur-md bg-white'>
                                    <button
                                        onClick={() => setIsSignInOpen(false)}
                                        className='absolute top-0 right-0 mr-8 mt-8 dark:invert'
                                        aria-label='Close Sign In Modal'>
                                        <Icon
                                            icon='material-symbols:close-rounded'
                                            width={24}
                                            height={24}
                                            className='text-black hover:text-primary inline-block hover:cursor-pointer'
                                        />
                                    </button>
                                    <Signin 
                                        onSwitchToSignUp={() => {
                                            setIsSignInOpen(false)
                                            setIsSignUpOpen(true)
                                        }}
                                        onCloseModal={() => setIsSignInOpen(false)}
                                    />
                                </div>
                            </div>
                        )}
                        {isSignUpOpen && (
                            <div className='fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-50'>
                                <div
                                    ref={signUpRef}
                                    className='relative mx-auto bg-white w-full max-w-md overflow-hidden rounded-lg bg-dark_grey/90 backdrop-blur-md px-8 pt-14 pb-8 text-center'>
                                    <button
                                        onClick={() => setIsSignUpOpen(false)}
                                        className='absolute top-0 right-0 mr-8 mt-8 dark:invert'
                                        aria-label='Close Sign Up Modal'>
                                        <Icon
                                            icon='material-symbols:close-rounded'
                                            width={24}
                                            height={24}
                                            className='text-black hover:text-primary inline-block hover:cursor-pointer'
                                        />
                                    </button>
                                    <SignUp 
                                        onSuccess={() => {
                                            setIsSignUpOpen(false)
                                            setIsSignInOpen(true)
                                        }}
                                        onSwitchToSignIn={() => {
                                            setIsSignUpOpen(false)
                                            setIsSignInOpen(true)
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                        <button
                            onClick={() => setNavbarOpen(!navbarOpen)}
                            className='block lg:hidden p-2 rounded-lg'
                            aria-label='Toggle mobile menu'>
                            <span className='block w-6 h-0.5 bg-white'></span>
                            <span className='block w-6 h-0.5 bg-white mt-1.5'></span>
                            <span className='block w-6 h-0.5 bg-white mt-1.5'></span>
                        </button>
                    </div>
                </div>
                {navbarOpen && (
                    <div className='fixed top-0 left-0 w-full h-full bg-black/50 z-40' />
                )}
                <div
                    ref={mobileMenuRef}
                    className={`lg:hidden fixed top-0 right-0 h-full w-full bg-white shadow-lg transform transition-transform duration-300 max-w-xs ${navbarOpen ? 'translate-x-0' : 'translate-x-full'
                        } z-50`}>
                    <div className='flex items-center justify-between p-4'>
                        <h2 className='text-lg font-bold text-midnight_text'>
                            <Logo />
                        </h2>
                        {/*  */}
                        <button
                            onClick={() => setNavbarOpen(false)}
                            className='bg-black/30 rounded-full p-1 text-white'
                            aria-label='Close menu Modal'>
                            <Icon
                                icon={'material-symbols:close-rounded'}
                                width={24}
                                height={24}
                            />
                        </button>
                    </div>
                    <nav className='flex flex-col items-start p-4'>
                        {filteredHeaderData.map((item, index) => (
                            <MobileHeaderLink key={index} item={item} />
                        ))}
                        <div className='mt-4 flex flex-col gap-4 w-full'>
                            {!isAuthenticated ? (
                                <>
                                    <button
                                        className='bg-primary text-white px-4 py-2 rounded-lg border  border-primary hover:text-primary hover:bg-transparent hover:cursor-pointer transition duration-300 ease-in-out'
                                        onClick={() => {
                                            setIsSignInOpen(true)
                                            setNavbarOpen(false)
                                        }}>
                                        Sign In
                                    </button>
                                    <button
                                        className='bg-primary text-white px-4 py-2 rounded-lg border  border-primary hover:text-primary hover:bg-transparent hover:cursor-pointer transition duration-300 ease-in-out'
                                        onClick={() => {
                                            setIsSignUpOpen(true)
                                            setNavbarOpen(false)
                                        }}>
                                        Start Selling
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className='px-4 py-2 border-b border-gray-200'>
                                        <p className='text-sm text-gray-600'>Welcome,</p>
                                        <p className='font-semibold text-black'>{user?.firstName} {user?.lastName}</p>
                                    </div>
                                    <button
                                        className={`px-4 py-2 rounded-lg border hover:bg-gray-100 hover:cursor-pointer transition duration-300 ease-in-out flex items-center gap-2 ${
                                            pathname === '/profile' 
                                                ? 'bg-primary/10 border-primary text-primary font-semibold' 
                                                : 'bg-transparent text-black border-gray-300'
                                        }`}
                                        onClick={() => {
                                            router.push('/profile')
                                            setNavbarOpen(false)
                                        }}>
                                        <Icon icon='mdi:account' width={20} height={20} />
                                        Profile
                                    </button>
                                    <button
                                        className={`px-4 py-2 rounded-lg border hover:bg-gray-100 hover:cursor-pointer transition duration-300 ease-in-out flex items-center gap-2 ${
                                            pathname === '/kyc' 
                                                ? 'bg-primary/10 border-primary text-primary font-semibold' 
                                                : 'bg-transparent text-black border-gray-300'
                                        }`}
                                        onClick={() => {
                                            router.push('/kyc')
                                            setNavbarOpen(false)
                                        }}>
                                        <Icon icon='mdi:file-document-check' width={20} height={20} />
                                        KYC
                                    </button>
                                    <button
                                        className={`px-4 py-2 rounded-lg border hover:bg-gray-100 hover:cursor-pointer transition duration-300 ease-in-out flex items-center gap-2 ${
                                            pathname === '/pickup-addresses' 
                                                ? 'bg-primary/10 border-primary text-primary font-semibold' 
                                                : 'bg-transparent text-black border-gray-300'
                                        }`}
                                        onClick={() => {
                                            router.push('/pickup-addresses')
                                            setNavbarOpen(false)
                                        }}>
                                        <Icon icon='mdi:map-marker-multiple' width={20} height={20} />
                                        Pickup Address
                                    </button>
                                    <button
                                        className='bg-red-600 text-white px-4 py-2 rounded-lg border border-red-600 hover:bg-red-700 hover:cursor-pointer transition duration-300 ease-in-out flex items-center gap-2'
                                        onClick={() => {
                                            handleLogout()
                                            setNavbarOpen(false)
                                        }}>
                                        <Icon icon='mdi:logout' width={20} height={20} />
                                        Logout
                                    </button>
                                </>
                            )}
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    )
}

export default Header
