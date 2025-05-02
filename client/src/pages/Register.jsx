// src/pages/Register.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import LoadingSpinner from '../components/LoadingSpinner';
import { userStore } from '../store/userStore'; // Импортируйте userStore
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import Tooltip from '@mui/material/Tooltip';
import { FaGithub, FaDiscord } from "react-icons/fa";
import { useOAuth, useOAuthCallback } from '../utils/oauth';
// import Notification from '../components/Notification';
// import { createUser } from '../services/userService';

function Register() {
    const [form, setForm] = useState({
        fullName: '',
        login: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const { googleLogin, loginWithGitHub, loginWithDiscord } = useOAuth();
    const validate = () => {
        const errors = {};
        if (!form.fullName) errors.fullName = "Full name is required";
        if (!form.login) errors.login = "Full name is required";
        // if (!username) errors.username = "Username is required";
        if (form.fullName.length < 2) errors.fullName = "Full name must be at least 2 characters";
        if (form.login.length < 2) errors.login = "Full name must be at least 2 characters";
        // if (username.length < 2) errors.username = "Username must be at least 2 characters";
        if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errors.email = "Valid Email is required";
        if (form.password.length < 6) errors.password = "Password must be at least 6 characters";
        if (form.password !== form.confirmPassword) errors.confirmPassword = "Passwords must match";
        return errors;
    };

    const [serverError, setServerError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    // const [notification, setNotification] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        setErrors(validationErrors);
        setServerError('');
        setLoading(true);

        if (Object.keys(validationErrors).length === 0) {
            if (form.password !== form.confirmPassword) {
                setServerError("Passwords do not match");
                setLoading(false);
                return;
            }

            try {
                const message = await userStore.register(form.fullName, form.email, form.password, form.login);
                if (message) {
                    toast('ℹ️ Confirm your email!');
                    navigate('/login');
                }
            } catch (error) {
                setServerError(error.response?.data?.message || 'Registration failed');
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };
    useOAuthCallback('github');
    useOAuthCallback('discord');
    useEffect(() => {
        if (userStore.user) {
            navigate('/');
        }
    }, [navigate, userStore.user]);

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
            <div data-aos="slide-up" className="relative z-10 bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
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
                    {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
                    <input
                        name="login"
                        value={form.login}
                        onChange={handleChange}
                        placeholder="Login Name"
                        className="p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                    {errors.login && <p className="text-sm text-red-500">{errors.login}</p>}
                    <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Email"
                        className="p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    <input
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Password"
                        className="p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                    <input
                        name="confirmPassword"
                        type="password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm Password"
                        className="p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                    {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                    {serverError && <p className="text-red-500 text-sm">{serverError}</p>}

                    <button
                        type="submit"
                        className="cursor-pointer p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-80 transition duration-200"
                    >
                        Register
                    </button>
                </form>

                <div className="flex ">
                    <button
                        onClick={() => googleLogin()}
                        className="cursor-pointer w-full mt-4 p-3 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition duration-200 flex justify-center items-center"
                    >
                        <FcGoogle className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => loginWithGitHub()}
                        className="cursor-pointer w-full mt-4 p-3 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition duration-200 flex justify-center items-center"
                    >
                        <FaGithub className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => loginWithDiscord()}
                        className="cursor-pointer w-full mt-4 p-3 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition duration-200 flex justify-center items-center"
                    >
                        <FaDiscord className="w-6 h-6" />
                    </button>
                </div>

                <div className="mt-4 text-center text-gray-600">
                    <span>Already have an account? </span>
                    <Link to="/login" className="cursor-pointer text-blue-500 hover:underline">
                        Sign in
                    </Link>
                </div >
            </div >
        </div >
    );
}

export default Register;
