import React, { useState } from 'react';
import { FaCalendarAlt, FaDollarSign } from 'react-icons/fa';
import soldout from '../assets/soldout.png';

const EventCard = ({ event }) => {
	const [hovered, setHovered] = useState(false);
	const defaultImage = 'http://localhost:8000/avatars/mr.penis.png';

	return (
		<div
			className='z-10 relative overflow-hidden rounded-2xl shadow-lg cursor-pointer w-100 h-[300px] transition-transform transform hover:scale-105'
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			<img src={event.poster || defaultImage} alt={event.title} className='object-cover w-full h-full' />

			{/* ✅ Sold out badge */}
			{event.ticket_limit === 0 && (
				<img
					src={soldout}
					alt='Sold Out'
					className='absolute z-30 w-64 h-64 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none top-1/2 left-1/2 opacity-90'
				/>
			)}

			{/* Hover gradient overlay */}
			{hovered && <div className='absolute inset-0 bg-gradient-to-b from-[#9747FF99] to-[#97007E99] transition-opacity duration-300 z-10' />}

			{/* Hover content */}
			{hovered && (
				<div className='absolute inset-0 z-20 flex flex-col justify-end p-4 text-white'>
					<h3 className='mb-1 text-lg font-semibold'>{event.title}</h3>
					<p className='mb-2 text-sm line-clamp-3'>{event.description}</p>
					<div className='flex items-center justify-between gap-4 text-sm'>
						<span className='flex items-center gap-1'>
							<FaCalendarAlt />
							{new Date(event.date).toLocaleDateString()}
						</span>
						<span className='flex items-center gap-1'>
							<FaDollarSign />
							{event.price}
						</span>
					</div>
				</div>
			)}
		</div>
	);
};

export default EventCard;
