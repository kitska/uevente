import React, { useState } from 'react';
import { FiMail, FiSend } from 'react-icons/fi';
import { requestPasswordReset } from '../services/userService'; // Функция для запроса
import Notification from '../components/Notification';

const EmailSentPasswordReset = () => {
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [notification, setNotification] = useState(null);

	const handleSubmit = async e => {
		e.preventDefault();
		if (!email) {
			setNotification({ message: 'Please enter your email!', type: 'error' });
			return;
		}

		setLoading(true);
		try {
			await requestPasswordReset(email); // Отправляем запрос на сервер
			setNotification({ message: 'Password reset email sent!', type: 'success' });
		} catch (error) {
			setNotification({ message: error.response?.data?.message || 'Failed to send email.', type: 'error' });
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='flex flex-col items-center justify-center min-h-screen p-6 bg-purple-100'>
			{notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}

			<div className='w-full max-w-md p-6 bg-white rounded-lg shadow'>
				<h2 className='mb-6 text-2xl font-bold text-center'>Forgot Password?</h2>
				<p className='mb-4 text-center text-gray-600'>Enter your email, and we'll send you a link to reset your password.</p>

				<form onSubmit={handleSubmit} className='flex flex-col gap-4'>
					{/* Email Input */}
					<div className='relative'>
						<FiMail className='absolute text-gray-500 top-3 left-3' size={20} />
						<input
							type='email'
							placeholder='Enter your email'
							value={email}
							onChange={e => setEmail(e.target.value)}
							className='w-full p-3 pl-10 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-purple-500'
							required
						/>
					</div>

					{/* Submit Button */}
					<button
						type='submit'
						disabled={loading}
						className={`flex items-center justify-center gap-2 p-3 font-medium text-white bg-purple-600 rounded ${
							loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700'
						}`}
					>
						{loading ? 'Sending...' : 'Send Email'}
						{loading ? <FiSend size={18} /> : <FiMail size={18} />}
					</button>
				</form>
			</div>
		</div>
	);
};

export default EmailSentPasswordReset;
