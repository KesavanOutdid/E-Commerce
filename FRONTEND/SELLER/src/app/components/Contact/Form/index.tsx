'use client'
import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'

const ContactForm = () => {
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        phnumber: '',
        Message: '',
    })
    const [submitted, setSubmitted] = useState(false)
    const [showThanks, setShowThanks] = useState(false)
    const [showError, setShowError] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [loader, setLoader] = useState(false)
    const [isFormValid, setIsFormValid] = useState(false)

    useEffect(() => {
        const isValid = Object.values(formData).every(
            (value) => value.trim() !== ''
        )
        setIsFormValid(isValid)
    }, [formData])
    const handleChange = (e: any) => {
        const { name, value } = e.target
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }))
    }
    const reset = () => {
        formData.firstname = ''
        formData.lastname = ''
        formData.email = ''
        formData.phnumber = ''
        formData.Message = ''
    }
    const handleSubmit = async (e: any) => {
        e.preventDefault()
        setLoader(true)
        setShowError(false)
        setErrorMessage('')

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/contact/seller`, {
                firstName: formData.firstname,
                lastName: formData.lastname,
                email: formData.email,
                phone: formData.phnumber,
                message: formData.Message,
            })

            if (response.data.success) {
                setSubmitted(true)
                setShowThanks(true)
                reset()
                setFormData({
                    firstname: '',
                    lastname: '',
                    email: '',
                    phnumber: '',
                    Message: '',
                })

                setTimeout(() => {
                    setShowThanks(false)
                }, 5000)
            }
            setLoader(false)
        } catch (error: any) {
            setLoader(false)
            const message = error.response?.data?.message || 'Failed to send your message. Please try again later.'
            setErrorMessage(message)
            setShowError(true)
            
            setTimeout(() => {
                setShowError(false)
            }, 5000)
        }
    }
    return (
        <section id='contact' className='bg-gradient-to-br from-blue-50 to-purple-50 py-12 lg:py-20'>
            <div className='container'>
                <div className='relative bg-white rounded-[20px] p-6 lg:p-12 shadow-lg'>
                    <h2 className='mb-6 lg:mb-9 font-bold tracking-tight text-3xl sm:text-4xl lg:text-5xl text-center lg:text-left'>Get in Touch</h2>
                    <form
                        onSubmit={handleSubmit}
                        className='flex flex-wrap w-full m-auto justify-between'>
                        <div className='sm:flex gap-3 w-full'>
                            <div className='mx-0 my-2.5 flex-1'>
                                <label htmlFor='fname' className='pb-3 inline-block text-base'>
                                    First Name
                                </label>
                                <input
                                    id='fname'
                                    type='text'
                                    name='firstname'
                                    value={formData.firstname}
                                    onChange={handleChange}
                                    placeholder='Entry Firstname'
                                    className='w-full text-base px-4 rounded-2xl py-2.5 border-solid border transition-all duration-500 focus:border-primary focus:outline-0'
                                />
                            </div>
                            <div className='mx-0 my-2.5 flex-1'>
                                <label htmlFor='lname' className='pb-3 inline-block text-base'>
                                    Last Name
                                </label>
                                <input
                                    id='lname'
                                    type='text'
                                    name='lastname'
                                    value={formData.lastname}
                                    onChange={handleChange}
                                    placeholder='Entry Lastname'
                                    className='w-full text-base px-4 rounded-2xl py-2.5 border-solid border transition-all duration-500 focus:border-primary focus:outline-0'
                                />
                            </div>
                        </div>
                        <div className='sm:flex gap-3 w-full'>
                            <div className='mx-0 my-2.5 flex-1'>
                                <label htmlFor='email' className='pb-3 inline-block text-base'>
                                    Email address
                                </label>
                                <input
                                    id='email'
                                    type='email'
                                    name='email'
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder='Entry email'
                                    className='w-full text-base px-4 rounded-2xl py-2.5 border-solid border transition-all duration-500 focus:border-primary focus:outline-0'
                                />
                            </div>
                            <div className='mx-0 my-2.5 flex-1'>
                                <label
                                    htmlFor='Phnumber'
                                    className='pb-3 inline-block text-base'>
                                    Phone Number
                                </label>
                                <input
                                    id='Phnumber'
                                    type='tel'
                                    name='phnumber'
                                    placeholder='Entry phone number'
                                    value={formData.phnumber}
                                    onChange={handleChange}
                                    className='w-full text-base px-4 rounded-2xl py-2.5 border-solid border transition-all duration-500 focus:border-primary focus:outline-0'
                                />
                            </div>
                        </div>
                        <div className='w-full mx-0 my-2.5 flex-1'>
                            <label htmlFor='message' className='text-base inline-block'>
                                Message
                            </label>
                            <textarea
                                id='message'
                                name='Message'
                                value={formData.Message}
                                onChange={handleChange}
                                className='w-full mt-2 rounded-2xl px-5 py-3 border-solid border transition-all duration-500 focus:border-primary focus:outline-0'
                                placeholder='Anything else you wanna communicate'></textarea>
                        </div>
                        <div className='mx-0 my-2.5 w-full'>
                            <button
                                type='submit'
                                disabled={!isFormValid || loader}
                                className={`border leading-none px-6 text-lg font-medium py-4 rounded-full 
                    ${!isFormValid || loader
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-primary border-primary text-white hover:bg-transparent hover:text-primary cursor-pointer'
                                    }`}>
                                Submit
                            </button>
                        </div>
                    </form>
                    {showThanks && (
                        <div className='text-white bg-green-500 rounded-lg px-6 py-3 text-base mb-4 mt-4 flex items-center gap-3 shadow-lg'>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Thank you for contacting us! We will get back to you soon.</span>
                        </div>
                    )}
                    {showError && (
                        <div className='text-white bg-red-500 rounded-lg px-6 py-3 text-base mb-4 mt-4 flex items-center gap-3 shadow-lg'>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span>{errorMessage}</span>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

export default ContactForm
