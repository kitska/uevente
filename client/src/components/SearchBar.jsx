// src/components/SearchBar.jsx
import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState('');

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        if (onSearch) {
            onSearch(value);
        }
    };

    return (
        <div className="relative w-full">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder="Search events..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-500 bg-transparent text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
        </div>
    );
};

export default SearchBar;
