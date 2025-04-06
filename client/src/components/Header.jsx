import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { IoSettingsSharp } from 'react-icons/io5'; // Import settings icon
import { userStore } from '../store/userStore';

const Header = observer(() => {
	const navigate = useNavigate();

	return (
		<div className='flex items-center justify-between w-full p-2 text-black bg-purple-200 shadow-md gradient'>
			<h1 className='hidden ml-4 text-2xl font-bold sm:block text-gradient'>
				<Link
					to='/'
					onClick={() => {
						
					}}
				>
					Gay Orgiy Eventovich
				</Link>
			</h1>

			{/* Large Screen Menu */}
			<div className='flex items-center hidden sm:flex'>
				{userStore.user === null ? (
					<button className='header-btn' onClick={() => navigate('/login')}>
						Login
					</button>
				) : (
					<button className='header-btn' onClick={() => navigate('/settings')}>
						<IoSettingsSharp size={20} />
					</button>
				)}
			</div>
		</div>
	);
});

export default Header;
