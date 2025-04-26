// src/pages/Success.jsx
import React, { useEffect } from 'react';
import { api } from '../services';
import { Link, useParams } from 'react-router-dom';

const Success = () => {
	const { id } = useParams();

	useEffect(() => {
		const updatePayment = async () => {
			try {
				const response = await api.patch(`/payment/${id}`, {
					status: 'successful',
				});
                const quantity = Number(response.data.payment.quantity || 0);

                await api.post('/events/decrease-tickets', {
					eventId: response.data.payment.event.id,
					quantity: quantity,
				});
				
				if (quantity > 0) {
					const createTicketsPromises = [];

					for (let i = 0; i < quantity; i++) {
						createTicketsPromises.push(
							api.post('/tickets', {
								eventId: response.data.payment.event.id,
								userId: response.data.payment.user.id,
							})
						);
					}

					await Promise.all(createTicketsPromises);
				}
			} catch (error) {
				console.error('Failed to update payment status or create tickets:', error);
			}
		};

		if (id) {
			updatePayment();
		}
	}, [id]);


	return (
		<div className='flex items-center justify-center min-h-screen bg-green-50'>
			<div className='max-w-md p-8 text-center bg-white shadow-xl rounded-xl'>
				<h1 className='mb-4 text-3xl font-bold text-green-600'>🎉 Purchase Successful!</h1>
				<p className='mb-6 text-gray-700'>Thank you for your purchase. Your ticket has been confirmed.</p>
				<Link to='/' className='inline-block px-6 py-2 text-white transition bg-green-500 rounded hover:bg-green-600'>
					Go to Main Page
				</Link>
			</div>
		</div>
	);
};

export default Success;
