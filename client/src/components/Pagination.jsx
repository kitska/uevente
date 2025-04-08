import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ currentPage, totalPages }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const goToPage = (page) => {
        searchParams.set('page', page);
        navigate({ search: searchParams.toString() });
    };

    return (
        <div data-aos="fade-up" className="flex items-center justify-center mt-8 gap-4">
            <button
                onClick={() => goToPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded hover:bg-gray-100 disabled:text-gray-400"
            >
                <FiChevronLeft size={20} />
            </button>
            <span className="font-medium text-lg">{currentPage}</span>
            <button
                onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded hover:bg-gray-100 disabled:text-gray-400"
            >
                <FiChevronRight size={20} />
            </button>
        </div>
    );
};

export default Pagination;
