import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import Tooltip from '@mui/material/Tooltip';
import { FcGoogle } from "react-icons/fc";
import { userStore } from '../store/userStore';
import { Link } from 'react-router-dom';
import { FaGoogle, FaGithub, FaDiscord } from "react-icons/fa";
import { useOAuth, useOAuthCallback } from '../utils/oauth';

function Login() {
    const [profile, setProfile] = useState(null);
    const [emailValue, setEmailValue] = useState('');
    const [passwordValue, setPasswordValue] = useState('');
    const [serverError, setServerError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { googleLogin, loginWithGitHub, loginWithDiscord } = useOAuth();
    // const onSuccess = response => console.log(response);
    // const onFailure = response => console.error(response);

    useEffect(() => {
        if (userStore.user) {
            navigate('/');
        }
    }, [navigate, userStore.user]);

    useOAuthCallback('github');
    useOAuthCallback('discord');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');
        setLoading(true);

        const email = emailValue.includes('@') ? emailValue : '';
        const login = email ? '' : emailValue;

        try {
            const message = await userStore.login(email, passwordValue, login);
            if (message) {
                navigate('/');
            }
        } catch (error) {
            console.log(error);
            setServerError(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleForgot = () => {
        navigate('/password-reset');
    };

    const logOut = () => {
        // googleLogout();
        setProfile(null);
    };

    return loading ? (
        <LoadingSpinner />
    ) : (
        <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-center blur-sm scale-110"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1485470733090-0aae1788d5af?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8d2FsbHBhcGVyJTIwNGt8ZW58MHx8MHx8fDA%3D')",
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
                <h2 className="text-3xl font-semibold text-left text-gray-900 mb-6">Welcome Back!</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <input
                        type="text"
                        value={emailValue}
                        onChange={(e) => setEmailValue(e.target.value)}
                        placeholder="Email or Login"
                        className="p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="password"
                        value={passwordValue}
                        onChange={(e) => setPasswordValue(e.target.value)}
                        placeholder="Password"
                        className="p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {serverError && <p className="text-red-500 text-sm">{serverError}</p>}
                    <button
                        type="submit"
                        className="cursor-pointer p-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:opacity-80 transition duration-200"
                    >
                        Sign in
                    </button>
                    <Tooltip title="Reset your password">
                        <button
                            type="button"
                            onClick={handleForgot}
                            className="cursor-pointer text-sm text-blue-500 hover:underline"
                        >
                            Forgot Password?
                        </button>
                    </Tooltip>
                </form>

                {profile ? (
                    <div className="flex flex-col items-center">
                        <img src={profile.picture} alt="Profile" className="w-16 h-16 rounded-full mb-2" />
                        <p className="font-semibold text-gray-800">Welcome, {profile.name}!</p>
                        <p className="text-sm text-gray-500">{profile.email}</p>
                        <button
                            onClick={logOut}
                            className="cursor-pointer mt-3 p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
                        >
                            Log out
                        </button>
                    </div>
                ) : (
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
                )}

                <div className="mt-4 text-center text-gray-600">
                    <span>Don't have an account? </span>
                    <Link to="/register" className="cursor-pointer text-blue-500 hover:underline">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;