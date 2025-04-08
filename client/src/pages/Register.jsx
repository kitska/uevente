// src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import Tooltip from '@mui/material/Tooltip';
import { FcGoogle } from 'react-icons/fc';
import LoadingSpinner from '../components/LoadingSpinner';
import { userStore } from '../store/userStore';

function Register() {
    const [form, setForm] = useState({
        fullName: '',
        login: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [serverError, setServerError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');
        setLoading(true);

        if (form.password !== form.confirmPassword) {
            setServerError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const message = await userStore.register(form.fullName, form.email, form.password, form.login);
            if (message) navigate('/');
        } catch (error) {
            setServerError(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    // Google login (optional)
    const googleLogin = useGoogleLogin({
        onSuccess: async (token) => {
            try {
                const { data } = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token.access_token}`);
                console.log("Google profile:", data);
                // You could optionally auto-register the user or redirect them
            } catch (err) {
                console.error("Google profile fetch failed", err);
            }
        },
        onError: (error) => console.error('Google Login Failed:', error),
    });

    return loading ? (
        <LoadingSpinner />
    ) : (
        <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
            {/* Blurred Background Layer */}
            <div
                className="absolute inset-0 bg-cover bg-center blur-md scale-110"
                style={{
                    backgroundImage: "url('https://4kwallpapers.com/images/wallpapers/windows-11-waves-3840x2400-11767.png')",
                }}
            ></div>
            <div className="absolute top-4 left-4 z-10">
                <button
                    onClick={() => navigate('/')}
                    className="text-2xl text-white cursor-pointer font-semibold bg-opacity-50 p-2 rounded-lg hover:bg-opacity-70 transition"
                >
                    Go Event
                </button>
            </div>
            <div className="absolute inset-0 bg-opacity-50 z-0"></div>
            <div data-aos="flip-right" className="relative z-10 bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-3xl font-semibold text-left text-gray-900 mb-6">Create Your Account</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <input
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        placeholder="Full Name"
                        className="p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                    <input
                        name="login"
                        value={form.login}
                        onChange={handleChange}
                        placeholder="Login Name"
                        className="p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                    <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Email"
                        className="p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                    <input
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Password"
                        className="p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                    <input
                        name="confirmPassword"
                        type="password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm Password"
                        className="p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                    {serverError && <p className="text-red-500 text-sm">{serverError}</p>}

                    <button
                        type="submit"
                        className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-80 transition duration-200"
                    >
                        Register
                    </button>
                </form>

                <button
                    onClick={() => googleLogin()}
                    className="w-full mt-5 p-3 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition duration-200 flex justify-center items-center"
                >
                    <FcGoogle className="w-6 h-6 mr-2" />
                    Sign up with Google
                </button>

                <div className="mt-4 text-center text-gray-600">
                    <span>Already have an account? </span>
                    <Link to="/login" className="text-blue-500 hover:underline">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Register;
