import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa'; // FontAwesome user icon
import { AiOutlineLogin } from 'react-icons/ai'; // FontAwesome login icon
import ThemeToggleButton from './ThemeToggleButton';
import SearchBar from './SearchBar';
import UserDropdown from './UserDropdown';
import { userStore } from '../store/userStore';

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
			{/* <div className="flex-1 max-w-md mx-8">
				<SearchBar onSearch={handleSearch} />
			</div> */}
			{
				userStore?.user ? (
					<UserDropdown />
					// <img src={userStore.user.profilePicture} alt="" />
				) : (
					<div className="flex gap-2 items-center">
						<Link to="/login" className="text-pink-400 text-2xl hover:text-pink-700">
							<div className="flex items-center">
								<AiOutlineLogin className="text-2xl" />
								<span className="text-xl ml-2">Login</span>
							</div>
						</Link>
					</div>
				)
			}
			{/* Right: Login */}
		</header >
	);
};

export default Header;
