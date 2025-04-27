import React from 'react';
import { userStore } from '../store/userStore';

const TicketModal = ({ isOpen, onClose, ticket }) => {
	if (!isOpen || !ticket) return null;

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30'>
			<div className='relative w-full max-w-md p-6 mx-4 text-white shadow-2xl rounded-2xl bg-gradient-to-br from-pink-300 to-purple-400'>
				<button onClick={onClose} className='absolute text-2xl text-white top-4 right-4 hover:text-gray-300'>
					&times;
				</button>

				<h2 className='mb-6 text-2xl font-bold text-center'>🎟️ Your Event Ticket</h2>

				<div className='p-4 mb-6 bg-white/20 rounded-xl'>
					<p>
						<strong>Event:</strong> {ticket.event.title}
					</p>
					<p>
						<strong>Date:</strong> {new Date(ticket.event.date).toLocaleString()}
					</p>
					<p>
						<strong>Location:</strong> {ticket.event.location || 'Location will be announced'}
					</p>
					<p>
						<strong>Ticket Holder:</strong> {userStore.user.fullName}
					</p>
				</div>

				<div className='flex justify-center my-6'>
					<img src={ticket.qrCode} alt='QR Code' className='w-48 h-48 p-2 bg-white rounded-lg' />
				</div>

				<p className='text-sm text-center opacity-80'>Please present this QR code at the event entrance.</p>
			</div>
		</div>
	);
};

export default TicketModal;
