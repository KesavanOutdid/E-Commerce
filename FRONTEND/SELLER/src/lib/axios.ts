import axios from 'axios';

const getDynamicApiUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }
    if (typeof window !== 'undefined') {
        return `${window.location.protocol}//${window.location.hostname}:5000`;
    }
    return 'http://localhost:5000';
};

const axiosInstance = axios.create({
    baseURL: getDynamicApiUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('seller_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const currentPath = typeof window !== 'undefined' ? window.location.pathname.replace(/\/$/, '') : ''
            const isAuthPage = currentPath === '/signin' || currentPath === '/signup' || currentPath === '/forgot-password'
            
            if (!isAuthPage) {
                localStorage.removeItem('seller_token')
                localStorage.removeItem('seller_user')
                window.location.href = '/signin'
            }
        }
        return Promise.reject(error)
    }
)

export default axiosInstance
