import { useState, useEffect } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import Tooltip from '@mui/material/Tooltip';
import { userStore } from '../store/userStore';

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
                <button type="submit" className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Sign in
                </button>
                <Tooltip title="Reset your password">
                    <button type="button" onClick={handleForgot} className="text-sm text-blue-500 hover:underline">
                        Forgot Password?
                    </button>
                </Tooltip>
            </form>

            {/* Divider */}
            <div className="my-6 text-gray-500">OR</div>

            {/* Google login */}
            {profile ? (
                <div className="flex flex-col items-center">
                    <img src={profile.picture} alt="Profile" className="w-16 h-16 rounded-full mb-2" />
                    <p>Welcome, {profile.name}!</p>
                    <p className="text-sm text-gray-500">{profile.email}</p>
                    <button onClick={logOut} className="mt-2 p-2 bg-red-500 text-white rounded hover:bg-red-600">
                        Log out
                    </button>
                </div>
            ) : (
                <button onClick={() => googleLogin()} className="p-2 bg-red-500 text-white rounded hover:bg-red-600">
                    Sign in with Google 🚀
                </button>
            )}

            {/* GitHub login */}
            <button onClick={loginWithGitHub} className="mt-4 p-2 bg-gray-800 text-white rounded hover:bg-black">
                Login with GitHub
            </button>
        </div>
    );
}

export default Login;
