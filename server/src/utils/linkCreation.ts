import { google } from "googleapis";
import axios from "axios";

export async function getZoomAccessToken() {
    const clientId = process.env.ZOOM_CLIENT_ID!;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET!;
    const accountId = process.env.ACCOUNT_ID;
    const base64String = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const url = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`;

    try {
        const response = await axios.post(url, null, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Basic ${base64String}`
            }
        });

        const accessToken = response.data.access_token;
        // console.log('Access Token:', accessToken);
        return accessToken;
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        throw error;
    }
}

export async function getGoogleAccessToken() {
    // try {
    //     const oauth2Client = new google.auth.OAuth2(
    //         process.env.GOOGLE_CLIENT_ID,
    //         process.env.GOOGLE_CLIENT_SECRET,
    //         "http://localhost:3000" // Redirect URI from Google Cloud Console
    //     );
        
    //     oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
    //     const { token } = await oauth2Client.getAccessToken();
    //     return token;
    // } catch (error) {
    //     console.error('Error retrieving access token', error);
    //     throw error;
    // }
}
export async function generateGoogleMeetLink() {
    try {
        return "https://meet.google.com/new"
    //     const token = await getGoogleAccessToken(); // Replace with OAuth token retrieval logic
    //     const event = {
    //         summary: 'Google Meet Event',
    //         start: {
    //             dateTime: '2024-09-30T10:30:00Z',
    //             timeZone: 'UTC'
    //         },
    //         end: {
    //             dateTime: '2024-09-30T11:00:00Z',
    //             timeZone: 'UTC'
    //         },
    //         conferenceData: {
    //             createRequest: {
    //                 requestId: 'unique-request-id',
    //                 conferenceSolutionKey: {
    //                     type: 'hangoutsMeet'
    //                 }
    //             }
    //         }
    //     };

    //     const response = await axios.post("https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1", event, {
    //         headers: {
    //             'Authorization': `Bearer ${token}`,
    //             'Content-Type': 'application/json'
    //         }
    //     });

    //     // console.log('Success:', response.data);
    //     return response.data.conferenceData.entryPoints[0].uri;
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        throw error;
    }
}
export async function generateZoomLink() {
    try {
        const token = await getZoomAccessToken();
        const data = {
            topic: 'Zoom meeting for something.',
            type: 2, // 2 for scheduled meeting
            start_time: new Date('2024-09-30T10:30:00Z').toISOString(),
            duration: 30
        };

        const response = await axios.post("https://api.zoom.us/v2/users/me/meetings", data, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // console.log('Success:', response.data.start_url);
        return response.data;
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        throw error;
    }
}
