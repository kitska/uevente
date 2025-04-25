// src/pages/Error.jsx
import React, { useEffect } from 'react';
import { api } from '../services';
import { Link, useParams } from 'react-router-dom';

const Error = () => {
	const { id } = useParams();

	useEffect(() => {
		const updatePayment = async () => {
			try {
				await api.patch(`/payment/${id}`, {
					status: 'failed',
				});
			} catch (error) {
				console.error('Failed to update payment status:', error);
			}
		};

		if (id) {
			updatePayment();
		}
	}, [id]);
    
	return (
		<div className='flex items-center justify-center min-h-screen bg-red-50'>
			<div className='max-w-md p-8 text-center bg-white shadow-xl rounded-xl'>
				<h1 className='mb-4 text-3xl font-bold text-red-600'>❌ Purchase Failed</h1>
				<p className='mb-6 text-gray-700'>Something went wrong with your ticket purchase. Please try again.</p>
				<Link to='/' className='inline-block px-6 py-2 text-white transition bg-red-500 rounded hover:bg-red-600'>
					Return to Main
				</Link>
			</div>
		</div>
	);
};

export default Error;
