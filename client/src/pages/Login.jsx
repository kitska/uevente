import { useState, useEffect } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import Tooltip from '@mui/material/Tooltip';
import { userStore } from '../store/userStore';
import { FaGoogle, FaGithub } from "react-icons/fa";
import { FaDiscord } from "react-icons/fa"; // ✅ Add Discord icon
import queryString from 'query-string';

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
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
            <h2 className="text-2xl font-bold mb-6">Login</h2>

            {/* Email/password login */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
                <input
                    type="text"
                    value={emailValue}
                    onChange={(e) => setEmailValue(e.target.value)}
                    placeholder="Email or Login"
                    className="p-2 border border-gray-300 rounded"
                />
                <input
                    type="password"
                    value={passwordValue}
                    onChange={(e) => setPasswordValue(e.target.value)}
                    placeholder="Password"
                    className="p-2 border border-gray-300 rounded"
                />
                {serverError && <p className="text-red-500 text-sm">{serverError}</p>}
                <button type="submit" className="p-2 bg-blue-500 text-white rounded">Login</button>
            </form>

            {/* Social login buttons */}
            <div className="flex gap-4 mt-6">
                <Tooltip title="Login with Google">
                    <button onClick={() => googleLogin()} className="text-red-500 text-2xl">
                        <FaGoogle />
                    </button>
                </Tooltip>
                <Tooltip title="Login with GitHub">
                    <button onClick={loginWithGitHub} className="text-gray-800 text-2xl">
                        <FaGithub />
                    </button>
                </Tooltip>
                <Tooltip title="Login with Discord">
                    <button onClick={loginWithDiscord} className="text-indigo-500 text-2xl">
                        <FaDiscord />
                    </button>
                </Tooltip>
            </div>
        </div>
    );
}

export default Login;
