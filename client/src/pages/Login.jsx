import { useState, useEffect } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import Tooltip from '@mui/material/Tooltip';
import { FaGoogle } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

import { userStore } from '../store/userStore';
import { Link } from 'react-router-dom';

function Login() {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [emailValue, setEmailValue] = useState('');
    const [passwordValue, setPasswordValue] = useState('');
    const [serverError, setServerError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Redirect if already logged in (custom app auth)
    useEffect(() => {
        if (userStore.user) {
            navigate('/');
        }
    }, [navigate]);

    // Google Login
    const googleLogin = useGoogleLogin({
        onSuccess: (codeResponse) => setUser(codeResponse),
        onError: (error) => console.log('Google Login Failed:', error),
    });

    // Fetch Google profile after login
    useEffect(() => {
        if (user) {
            axios
                .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
                    headers: {
                        Authorization: `Bearer ${user.access_token}`,
                        Accept: 'application/json',
                    },
                })
                .then((res) => {
                    setProfile(res.data);
                    console.log('Google profile', res.data);
                })
                .catch((err) => console.log(err));
        }
    }, [user]);

    // GitHub login button
    const loginWithGitHub = () => {
        const clientID = import.meta.env.VITE_GITHUB_OAUTH_API;
        const redirectURI = 'http://localhost:3000/auth/github/callback';
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientID}&redirect_uri=${redirectURI}`;
    };

    // Handle GitHub OAuth callback
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            fetch('http://localhost:5000/auth/github/callback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('GitHub OAuth data:', data);
                    // Optionally: setUser(data); or navigate to a page
                });
        }
    }, []);

    // Email/password login
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
            setServerError(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleForgot = () => {
        navigate('/password-reset');
    };

    const logOut = () => {
        googleLogout();
        setProfile(null);
    };

    return loading ? (
        <LoadingSpinner />
    ) : (
        <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
            {/* Blurred Background */}
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
            <div className="absolute inset-0 bg-opacity-50 z-0"></div> {/* Vignette Effect */}
            <div className="relative z-10 bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-3xl font-semibold text-left text-gray-900 mb-6">Welcome Back!</h2>

                {/* Email/password login */}
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
                        className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:opacity-80 transition duration-200"
                    >
                        Sign in
                    </button>
                    <Tooltip title="Reset your password">
                        <button
                            type="button"
                            onClick={handleForgot}
                            className="text-sm text-blue-500 hover:underline"
                        >
                            Forgot Password?
                        </button>
                    </Tooltip>
                </form>

                {/* Google login */}
                {profile ? (
                    <div className="flex flex-col items-center">
                        <img src={profile.picture} alt="Profile" className="w-16 h-16 rounded-full mb-2" />
                        <p className="font-semibold text-gray-800">Welcome, {profile.name}!</p>
                        <p className="text-sm text-gray-500">{profile.email}</p>
                        <button
                            onClick={logOut}
                            className="mt-3 p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
                        >
                            Log out
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => googleLogin()}
                        className="w-full mt-4 p-3 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition duration-200 flex justify-center items-center"
                    >
                        <FcGoogle className="w-6 h-6 mr-2" />
                        Sign in with Google
                    </button>
                )}

                {/* Sign Up link */}
                <div className="mt-4 text-center text-gray-600">
                    <span>Don't have an account? </span>
                    <Link to="/register" className="text-blue-500 hover:underline">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;
