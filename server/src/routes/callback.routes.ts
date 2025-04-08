import { Router } from 'express';
import axios from "axios";

const router = Router();

router.post('/github/callback', async (req, res) => {
    const code = req.body.code;
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_SECRET;

    try {
        const tokenResponse = await axios.get(
            'https://github.com/login/oauth/access_token',
            {
                params: {
                    client_id: clientId,
                    client_secret: clientSecret,
                    code: code,
                    redirect_uri: `http://localhost:3000/auth/github/callback`,
                },
                headers: {
                    "Accept": "application/json",
                    "Accept-Encoding": "application/json",
                  },
            },
        );

        const accessToken = tokenResponse.data.access_token;

        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `token ${accessToken}`,
            },
        });

        res.json(userResponse.data);
    } catch (error) {
        console.error('GitHub OAuth error:', error.response.data);
        res.status(500).json({ error: 'Failed to authenticate with GitHub' });
    }
});

router.post('/discord/callback', async (req, res) => {
    const code = req.body.code;
    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_SECRET;
    const redirectUri = `${process.env.FRONT_URL}/auth/discord/callback`;

    // console.log(clientId, clientSecret, code);

    try {
        const tokenResponse = await axios.post(
            'https://discord.com/api/oauth2/token',
            new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: redirectUri,
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );
        
        // const tokenResponse = await axios.get(
        //     'https://github.com/login/oauth/access_token',
        //     {
        //         params: {
        //             client_id: clientId,
        //             client_secret: clientSecret,
        //             code: code,
        //             redirect_uri: `http://localhost:3000/auth/github/callback`,
        //         },
        //         headers: {
        //             "Accept": "application/json",
        //             "Accept-Encoding": "application/json",
        //           },
        //     },
        // );
        // console.log(tokenResponse);
        const accessToken = tokenResponse.data.access_token;

        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        res.json(userResponse.data);
    } catch (error) {
        console.error('Discord OAuth error:', error.response.data);
        res.status(500).json({ error: 'Failed to authenticate with Discord' });
    }
});

export default router;