import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

export const sendConfirmationEmail = async (email: string, token: string) => {
	const confirmationUrl = `${process.env.FRONT_URL}/confirm-email/${token}`;

	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: email,
		subject: 'Email Confirmation',
		html: `
      <h2>Welcome to Our Service!</h2>
      <p>Please confirm your email address by clicking the link below:</p>
      <a href="${confirmationUrl}">Confirm Email</a>
      <p>If you did not sign up for this account, please ignore this email.</p>
    `,
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log('Confirmation email sent');
	} catch (error) {
		console.error('Error sending confirmation email:', error);
		throw new Error('Failed to send confirmation email');
	}
};

export const sendResetPasswordEmail = async (email: string, token: string) => {
	const resetUrl = `${process.env.FRONT_URL}/password-reset/${token}`;

	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: email,
		subject: 'Password Reset Request',
		html: `
      <h2>Reset your password</h2>
      <p>We received a request to reset your password. Click the link below to reset it:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
    `,
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log('Reset password email sent');
	} catch (error) {
		console.error('Error sending reset password email:', error);
		throw new Error('Failed to send reset password email');
	}


};

export const sendInviteEmail = async (email: string, inviteUrl: string, rights: 'owner' | 'editor' | 'viewer', type: 'event' | 'calendar') => {
	const subject = type === 'event' ? 'Event Invitation' : 'Calendar Invitation';
	const roleText = `You have been invited as a <strong>${rights}</strong>.`;
	const message = `
        <h2>You have been invited!</h2>
        <p>${roleText}</p>
        <p>Click the link below to join:</p>
        <a href="${inviteUrl}">InviteUrl</a>
        <p>If you did not expect this invitation, you can ignore this email.</p>
    `;

	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: email,
		subject,
		html: message,
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log(`Invitation email sent to ${email}`);
	} catch (error) {
		console.error('Error sending invitation email:', error);
		throw new Error('Failed to send invitation email');
	}
};

export const sendEmail = async (email: string, { html, attachments }: { html: string; attachments?: any[] }, subject: string) => {
	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: email,
		subject,
		html,
		attachments,
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log(`Email sent to ${email}`);
	} catch (error) {
		console.error('Error sending email:', error);
		throw new Error('Failed to send email');
	}
};

