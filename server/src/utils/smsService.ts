// sendSMS.ts
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const client = twilio(accountSid, authToken);

export async function sendSMS(to: string, message: string) {
  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to, // e.g. '+380XXXXXXXXX'
    });
    console.log('Message SID:', result.sid);
  } catch (err) {
    console.error('Twilio error:', err);
  }
}
