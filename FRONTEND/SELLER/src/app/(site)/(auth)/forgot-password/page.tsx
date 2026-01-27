import ForgotPassword from "@/app/components/Auth/ForgotPassword";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Forgot Password | OUTID E-Seller",
    description: "Reset your seller account password"
};

const ForgotPasswordPage = () => {
    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center pt-24 pb-8 px-4 sm:px-6 lg:px-8'>
            <div className='w-full max-w-7xl mx-auto'>
                <div className='bg-white rounded-2xl shadow-xl overflow-hidden'>
                    <div className='grid grid-cols-1 lg:grid-cols-2 min-h-[600px]'>
                        <div className='hidden lg:flex bg-gradient-to-br from-primary to-primary/80 p-12 text-white'>
                            <div className='flex flex-col justify-center'>
                                <h2 className='text-4xl font-bold mb-6'>Reset Your Password</h2>
                                <p className='text-lg mb-8 text-white/90'>
                                    Forgot your password? No worries! We'll help you reset it quickly and securely.
                                </p>
                                <div className='space-y-4'>
                                    <div className='flex items-start gap-3'>
                                        <div className='bg-white/20 rounded-full p-2 mt-1'>
                                            <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                                                <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className='font-semibold text-lg'>Secure Verification</h3>
                                            <p className='text-white/80'>OTP sent to your registered email</p>
                                        </div>
                                    </div>
                                    <div className='flex items-start gap-3'>
                                        <div className='bg-white/20 rounded-full p-2 mt-1'>
                                            <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                                                <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className='font-semibold text-lg'>Quick Process</h3>
                                            <p className='text-white/80'>Reset your password in just 3 steps</p>
                                        </div>
                                    </div>
                                    <div className='flex items-start gap-3'>
                                        <div className='bg-white/20 rounded-full p-2 mt-1'>
                                            <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                                                <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className='font-semibold text-lg'>Account Safety</h3>
                                            <p className='text-white/80'>Your account security is our priority</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className='flex items-center justify-center p-6 sm:p-8 lg:p-12'>
                            <div className='w-full'>
                                <ForgotPassword />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
