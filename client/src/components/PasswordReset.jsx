import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiLock, FiCheckCircle } from 'react-icons/fi';
import { resetPassword } from '../services/userService';
import Notification from '../components/Notification';

const ResetPassword = () => {
	const { token } = useParams(); // Получаем токен из URL
	const navigate = useNavigate();

	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [notification, setNotification] = useState(null);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async e => {
		e.preventDefault();
		if (password !== confirmPassword) {
			setNotification({ message: 'Passwords do not match!', type: 'error' });
			return;
		}

		setLoading(true);
		try {
			const response = await resetPassword(token, password);
			setNotification({ message: response.message || 'Password successfully reset!', type: 'success' });
			setTimeout(() => navigate('/login'), 3000);
		} catch (error) {
			setNotification({ message: error.response?.data?.message || 'Password reset failed.', type: 'error' });
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='flex flex-col items-center justify-center min-h-screen p-6 bg-purple-100'>
			{notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}

			<div className='w-full max-w-md p-6 bg-white rounded-lg shadow'>
				<h2 className='mb-6 text-2xl font-bold text-center'>Reset Password</h2>

				<form onSubmit={handleSubmit} className='flex flex-col gap-4'>
					{/* New Password */}
					<div className='relative'>
						<FiLock className='absolute text-gray-500 top-3 left-3' size={20} />
						<input
							type='password'
							placeholder='New Password'
							value={password}
							onChange={e => setPassword(e.target.value)}
							className='w-full p-3 pl-10 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-purple-500'
							required
						/>
					</div>

					{/* Confirm Password */}
					<div className='relative'>
						<FiLock className='absolute text-gray-500 top-3 left-3' size={20} />
						<input
							type='password'
							placeholder='Confirm Password'
							value={confirmPassword}
							onChange={e => setConfirmPassword(e.target.value)}
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
						{loading ? 'Resetting...' : 'Reset Password'}
						{loading ? <FiCheckCircle size={18} /> : <FiLock size={18} />}
					</button>
				</form>
			</div>
		</div>
	);
};

export default ResetPassword;
