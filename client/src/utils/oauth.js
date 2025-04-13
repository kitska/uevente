// oauth.js
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userStore } from '../store/userStore';

export const useOAuth = () => {
    const navigate = useNavigate();
    const googleLogin = useGoogleLogin({
        prompt: "select_account",
        onSuccess: (codeResponse) => {
            // Handle Google login success
            fetchGoogleProfile(codeResponse.access_token);
        },
        onError: (error) => console.log('Google Login Failed:', error),
    });

    const fetchGoogleProfile = async (accessToken) => {
        try {
            const res = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/json',
                },
            });

            const status = await userStore.oauth('google', res.data);
            if(status === "OK"){
                navigate('/');
            }
            else{
                navigate('/login');
            }

            // console.log('Google profile', res.data);
            // Handle profile data (e.g., set user state)
        } catch (err) {
            console.log(err);
        }
    };

    const loginWithGitHub = () => {
        const clientID = import.meta.env.VITE_GITHUB_OAUTH_API;
        const state = generateState();
        localStorage.setItem("latestCSRFToken", state);
        const redirectURI = 'http://localhost:3000/auth/github/callback';
        const link = `https://github.com/login/oauth/authorize?client_id=${clientID}&scope=read:user%20user:email&redirect_uri=${redirectURI}&state=${state}`;
        window.location.href = link;
    };

    const loginWithDiscord = () => {
        const clientID = import.meta.env.VITE_DISCORD_OAUTH_CLIENTID;
        const state = generateState();
        localStorage.setItem("latestCSRFToken", state);
        const redirectURI = 'http://localhost:3000/auth/discord/callback';
        const scope = 'identify email';
        const link = `https://discord.com/api/oauth2/authorize?client_id=${clientID}&redirect_uri=${encodeURIComponent(redirectURI)}&response_type=code&scope=${scope}`;
        window.location.assign(link);
    };

    const generateState = () => {
        const array = new Uint8Array(16);
        window.crypto.getRandomValues(array);
        return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
    };

    return { googleLogin, loginWithGitHub, loginWithDiscord };
};

export const useOAuthCallback = (provider) => {
    const navigate = useNavigate();
    useEffect(() => {
        const fetchOAuthCallback = async () => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');
            const state = params.get('state');

            if (window.location.href.includes(`/auth/${provider}/callback`)) {
                localStorage.removeItem("latestCSRFToken");
                try {
                    const res = await axios.post(`http://localhost:8000/auth/${provider}/callback`, { code });
                    const status = await userStore.oauth(provider, res.data);
                    if(status === "OK"){
                        navigate('/');
                    }
                    else{
                        navigate('/login');
                    }
                    // console.log(res.data);
                } catch (error) {
                    console.error(`${provider.charAt(0).toUpperCase() + provider.slice(1)} OAuth callback error:`, error);
                }
            }
        };

        fetchOAuthCallback();
    }, [provider]);
};