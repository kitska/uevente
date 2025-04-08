import { useState, useEffect } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import Tooltip from '@mui/material/Tooltip';
import { FaGoogle } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

import { userStore } from '../store/userStore';
<<<<<<< HEAD
import { Link } from 'react-router-dom';
=======
import { FaGoogle, FaGithub } from "react-icons/fa";
import { FaDiscord } from "react-icons/fa"; // ✅ Add Discord icon
import queryString from 'query-string';
>>>>>>> cdf0dc8d04685fbebeaa05e6c750f08739a5a56d

function Login() {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [emailValue, setEmailValue] = useState('');
    const [passwordValue, setPasswordValue] = useState('');
    const [serverError, setServerError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const onSuccess = response => console.log(response);
    const onFailure = response => console.error(response);

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

    // GitHub login
    const loginWithGitHub = () => {
        const clientID = import.meta.env.VITE_GITHUB_OAUTH_API;
        const array = new Uint8Array(16);
        window.crypto.getRandomValues(array);
        const state = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');

        localStorage.setItem("latestCSRFToken", state);
        const redirectURI = 'http://localhost:3000/auth/github/callback';
        const link = `https://github.com/login/oauth/authorize?client_id=${clientID}&scope=read:user user:email&redirect_uri=${redirectURI}&state=${state}`;
        // window.location.assign(link);
        window.location.href = link;
    };

    useEffect(() => {
        const fetchGitHubCallback = async () => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');
            const state = params.get('state');
    
            if (window.location.href.includes('/auth/github/callback')) {
                localStorage.removeItem("latestCSRFToken");
                try {
                    const res = await axios.post("http://localhost:8000/auth/github/callback", {
                        code
                    });
                    console.log(res.data);
                    // Optional: handle response, maybe set user token, etc.
                } catch (error) {
                    console.error('GitHub OAuth callback error:', error);
                }
            }
        };
    
        fetchGitHubCallback();
    }, []);
    

    // Discord login
    const loginWithDiscord = () => {
        const clientID = import.meta.env.VITE_DISCORD_OAUTH_CLIENTID;
        const array = new Uint8Array(16);
        window.crypto.getRandomValues(array);
        const state = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');

        localStorage.setItem("latestCSRFToken", state);

        const redirectURI = 'http://localhost:3000/auth/discord/callback';
        const scope = 'identify email';
        const link = `https://discord.com/api/oauth2/authorize?client_id=${clientID}&redirect_uri=${encodeURIComponent(redirectURI)}&response_type=code&scope=${scope}`;
        window.location.assign(link);
    };

    useEffect(() => {
        const fetchDiscordCallBack = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const state = urlParams.get('state');
            console.log("x1");
            // if (state && state === localStorage.getItem("latestCSRFToken")) {
            if (window.location.href.includes('/auth/discord/callback')) {
                console.log("<x2></x2>");
                localStorage.removeItem("latestCSRFToken");
                try {
                    const res = await axios.post("http://localhost:8000/auth/discord/callback", {
                        code
                    });
                    console.log(res.data);
                } catch (error) {
                    console.error('Discord OAuth callback error:', error);
                }
            }
        };

        fetchDiscordCallBack();

            // fetch('http://localhost:8000/auth/discord/callback', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ code }),
            // })
            //     .then(response => response.json())
            //     .then(data => {
            //         console.log('Discord OAuth data:', data);
            //     });
        // }
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
                className="absolute inset-0 scale-110 bg-center bg-cover blur-sm"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1485470733090-0aae1788d5af?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8d2FsbHBhcGVyJTIwNGt8ZW58MHx8MHx8fDA%3D')",
                }}
            ></div>
            <div className="absolute z-10 top-4 left-4">
                <button
                    onClick={() => navigate('/')}
                    className="p-2 text-2xl font-semibold text-white transition bg-opacity-50 rounded-lg cursor-pointer hover:bg-opacity-70"
                >
                    Go Event
                </button>
            </div>
            <div className="absolute inset-0 z-0 bg-opacity-50"></div> {/* Vignette Effect */}
            <div className="relative z-10 w-full max-w-md p-8 bg-white rounded-lg shadow-xl">
                <h2 className="mb-6 text-3xl font-semibold text-left text-gray-900">Welcome Back!</h2>

                {/* Email/password login */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <input
                        type="text"
                        value={emailValue}
                        onChange={(e) => setEmailValue(e.target.value)}
                        placeholder="Email or Login"
                        className="p-3 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="password"
                        value={passwordValue}
                        onChange={(e) => setPasswordValue(e.target.value)}
                        placeholder="Password"
                        className="p-3 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {serverError && <p className="text-sm text-red-500">{serverError}</p>}
                    <button
                        type="submit"
                        className="p-3 text-white transition duration-200 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-80"
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
                        <img src={profile.picture} alt="Profile" className="w-16 h-16 mb-2 rounded-full" />
                        <p className="font-semibold text-gray-800">Welcome, {profile.name}!</p>
                        <p className="text-sm text-gray-500">{profile.email}</p>
                        <button
                            onClick={logOut}
                            className="p-3 mt-3 text-white transition duration-200 bg-red-500 rounded-lg hover:bg-red-600"
                        >
                            Log out
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => googleLogin()}
                        className="flex items-center justify-center w-full p-3 mt-4 text-gray-800 transition duration-200 bg-white rounded-lg hover:bg-gray-100"
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
