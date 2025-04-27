import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
	return (
		<div data-aos='fade-up' className='flex items-center justify-center gap-4 mt-8'>
			<button onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className='p-2 rounded hover:bg-gray-100 disabled:text-gray-400'>
				<FiChevronLeft size={20} />
			</button>
			<span className='text-lg font-medium'>{currentPage}</span>
			<button
				onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
				disabled={currentPage === totalPages}
				className='p-2 rounded hover:bg-gray-100 disabled:text-gray-400'
			>
				<FiChevronRight size={20} />
			</button>
		</div>
	);
};

export default Pagination;
