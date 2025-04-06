import React, { useEffect } from 'react';

const Notification = ({ message, type = 'info', onClose }) => {
	useEffect(() => {
		const timer = setTimeout(() => {
			onClose();
		}, 5000); // Уведомление исчезнет через 5 секунд
		return () => clearTimeout(timer);
	}, [onClose]);

	return (
		<div
			className={`fixed top-5 right-5 px-4 py-3 rounded-lg shadow-lg text-white text-sm 
            ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}
		>
			{message}
		</div>
	);
};

export default Notification;
