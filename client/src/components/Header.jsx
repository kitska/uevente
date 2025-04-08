import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa'; // FontAwesome user icon
import { AiOutlineLogin } from 'react-icons/ai'; // FontAwesome login icon
import SearchBar from './SearchBar';

const Header = () => {
	const handleSearch = (query) => {
		// You can later trigger search request here
		console.log('Searching for:', query);
	};

	return (
		<header className="w-full fixed top-0 left-0 z-50 bg-transparent text-white px-8 py-4 flex items-center justify-between backdrop-blur-md shadow-sm">
			{/* Left: Logo/Name */}
			<Link to="/" className="text-pink-400 text-2xl font-bold tracking-wide">
				Go Event
			</Link>

			{/* Middle: Search */}
			<div className="flex-1 max-w-md mx-8">
				<SearchBar onSearch={handleSearch} />
			</div>

			{/* Right: Login */}
			<div className="flex gap-6 items-center">
				{/* If user is not logged in, show Login icon */}
				<Link to="/login" className="text-pink-400 text-2xl hover:text-pink-700">
					<AiOutlineLogin />
				</Link>
			</div>
		</header>
	);
};

export default Header;
