import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { confirmEmail } from '../services/userService';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

const EmailConfirmation = () => {
	const { token } = useParams();
	const [status, setStatus] = useState('loading');
	const navigate = useNavigate();

	useEffect(() => {
		const confirm = async () => {
			try {
				await confirmEmail(token);
				setStatus('success');
				setTimeout(() => navigate('/login'), 3000);
			} catch {
				setStatus('error');
			}
		};

		confirm();
	}, [token, navigate]);

	return (
		<div className='flex items-center justify-center min-h-screen bg-gray-100'>
			<div className='p-6 text-center bg-white rounded-lg shadow-md w-96'>
				{status === 'loading' && <div className='text-lg font-medium text-gray-600'>Confirming your email...</div>}

				{status === 'success' && (
					<div className='text-green-600'>
						<FiCheckCircle size={48} className='mx-auto mb-3' />
						<h2 className='text-xl font-bold'>Email confirmed!</h2>
						<p className='text-gray-600'>You will be redirected to login.</p>
					</div>
				)}

				{status === 'error' && (
					<div className='text-red-600'>
						<FiXCircle size={48} className='mx-auto mb-3' />
						<h2 className='text-xl font-bold'>Confirmation failed</h2>
						<p className='text-gray-600'>Invalid or expired link.</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default EmailConfirmation;
