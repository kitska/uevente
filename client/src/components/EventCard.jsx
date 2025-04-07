// src/components/EventCard.jsx
import React, { useState } from 'react';
import { FaCalendarAlt, FaDollarSign } from 'react-icons/fa';

const EventCard = ({ event }) => {
    const [hovered, setHovered] = useState(false);

    const defaultImage = 'https://i1.sndcdn.com/avatars-IDREzi3RhXdPHLsZ-MBxJoQ-t1080x1080.jpg';

    return (
        <div
            className="relative overflow-hidden rounded-2xl shadow-lg cursor-pointer w-50 h-[300px] transition-transform transform hover:scale-105"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <img
                src={event.image || defaultImage}
                alt={event.title}
                className="w-full h-full object-cover"
            />

            {/* Gradient overlay on hover */}
            {hovered && (
                <div className="absolute inset-0 bg-gradient-to-b from-[#9747FF99] to-[#97007E99] transition-opacity duration-300 z-10" />
            )}

            {/* Content on top of everything */}
            {hovered && (
                <div className="absolute inset-0 p-4 text-white flex flex-col justify-end z-20">
                    <h3 className="text-lg font-semibold mb-1">{event.title}</h3>
                    <p className="text-sm line-clamp-3 mb-2">{event.description}</p>
                    <div className="flex justify-between text-sm items-center gap-4">
                        <span className="flex items-center gap-1">
                            <FaCalendarAlt />
                            {new Date(event.startDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                            {event.price}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventCard;
