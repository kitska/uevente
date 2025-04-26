import React, { useEffect, useState } from 'react';
import { api } from '../services';
import TicketModal from './TicketModal';

const TicketSection = () => {
	const [tickets, setTickets] = useState([]);
	const [selectedTicket, setSelectedTicket] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	useEffect(() => {
		const fetchTickets = async () => {
			try {
				const response = await api.get('/users/tickets');
				setTickets(response.data.tickets);
			} catch (error) {
				console.error('Failed to fetch tickets:', error);
			}
		};

		fetchTickets();
	}, []);

	const openModal = ticket => {
		setSelectedTicket(ticket);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setSelectedTicket(null);
		setIsModalOpen(false);
	};

	return (
		<div className='grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3'>
			{tickets.map(ticket => (
				<div key={ticket.ticketId} className='p-4 transition bg-white rounded-lg shadow-md cursor-pointer hover:shadow-xl' onClick={() => openModal(ticket)}>
					<h3 className='text-lg font-bold'>{ticket.event.title}</h3>
					<p className='text-gray-600'>{new Date(ticket.event.date).toLocaleDateString()}</p>
					<p className='text-sm text-gray-600'>{ticket.event.location || 'Location will be announced'}</p>
				</div>
			))}

			<TicketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} ticket={selectedTicket} />
		</div>
	);
};

export default TicketSection;
