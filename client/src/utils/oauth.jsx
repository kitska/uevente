import { googleLogout, useGoogleLogin } from '@react-oauth/google';

export const googleLogin = useGoogleLogin({
    onSuccess: (codeResponse) => setUser(codeResponse),
    onError: (error) => console.log('Google Login Failed:', error),
});

export const loginWithGitHub = () => {
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
