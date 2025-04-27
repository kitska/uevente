import React, { useState } from 'react';
import { FaUser, FaCog, FaSignOutAlt, FaKey, FaBell, FaTicketAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { userStore } from '../store/userStore';
import ProfileSection from '../components/ProfileSection';
import TicketSection from '../components/TicketSection';

const Account = () => {
	const navigate = useNavigate();
	const [activeSection, setActiveSection] = useState('profile');
	const [imgLoaded, setImgLoaded] = useState(false);

	const [fullName, setFullName] = useState(userStore?.user?.fullName || '');
	const [email, setEmail] = useState(userStore?.user?.email || '');
	const [login, setLogin] = useState(userStore?.user?.login || '');
	const [profilePicture, setProfilePicture] = useState(userStore?.user?.profilePicture || '');

	const handleMenuClick = section => setActiveSection(section);

	const goToMainPage = () => navigate('/');

	const renderContent = () => {
		switch (activeSection) {
			case 'profile':
				return <ProfileSection />;
			case 'login':
				return (
					<div className='p-4 space-y-4'>
						<h2 className='text-xl font-bold text-gray-800'>Login Settings</h2>
						<div className='space-y-2'>
							<button className='w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600'>Reset Password</button>
							<button className='w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600'>Enable Passkeys</button>
							<button className='w-full px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600'>Delete Account</button>
						</div>
					</div>
				);
			case 'accessibility':
				return (
					<div className='p-4 space-y-4'>
						<h2 className='text-xl font-bold text-gray-800'>Accessibility Settings</h2>
						<div className='space-y-2'>
							<button className='w-full px-4 py-2 text-white bg-gray-500 rounded-md hover:bg-gray-600'>Toggle Dark Mode</button>
							<button className='w-full px-4 py-2 text-white bg-gray-500 rounded-md hover:bg-gray-600'>Change Font Size</button>
						</div>
					</div>
				);
			case 'tickets':
				return <TicketSection />;
			default:
				return <div className='p-4'>Select a section</div>;
		}
	};

	return (
		<div className='flex min-h-screen bg-gray-100'>
			<div className='fixed w-56 h-full p-4 text-white bg-gray-800'>
				<div onClick={goToMainPage} className='mb-6 text-2xl font-bold text-white cursor-pointer'>
					Go Event
				</div>

				<h2 className='mb-6 text-lg font-bold'>Account Settings</h2>
				<ul className='space-y-3'>
					<li>
						<button onClick={() => handleMenuClick('profile')} className='flex items-center w-full p-2 space-x-2 rounded-md hover:bg-gray-700'>
							<FaUser />
							<span className='text-sm'>Your Profile</span>
						</button>
					</li>
					<li>
						<button onClick={() => handleMenuClick('login')} className='flex items-center w-full p-2 space-x-2 rounded-md hover:bg-gray-700'>
							<FaKey />
							<span className='text-sm'>Login</span>
						</button>
					</li>
					<li>
						<button onClick={() => handleMenuClick('accessibility')} className='flex items-center w-full p-2 space-x-2 rounded-md hover:bg-gray-700'>
							<FaCog />
							<span className='text-sm'>Accessibility</span>
						</button>
					</li>
					<li>
						<button onClick={() => handleMenuClick('tickets')} className='flex items-center w-full p-2 space-x-2 rounded-md hover:bg-gray-700'>
							<FaTicketAlt />
							<span className='text-sm'>Your Tickets</span>
						</button>
					</li>
				</ul>

				<button
					className='flex items-center w-full p-2 mt-6 space-x-2 rounded-md hover:bg-gray-700'
					onClick={() => {
						userStore?.logout();
						goToMainPage();
					}}
				>
					<FaSignOutAlt />
					<span className='text-sm'>Sign Out</span>
				</button>
			</div>

			<div className='flex-1 p-6 ml-56'>{renderContent()}</div>
		</div>
	);
};

export default Account;
