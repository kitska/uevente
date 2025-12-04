import React, { useState, useEffect } from 'react';
import { FaUser, FaCog, FaSignOutAlt, FaKey, FaBell, FaTicketAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { userStore } from '../store/userStore';
import ProfileSection from '../components/ProfileSection';
import TicketSection from '../components/TicketSection';
import { useLocation } from 'react-router-dom';
import { getAllVerifyRequests, getVerifyRequestsByUser, updateVerifyRequestStatus } from '../services/verifyService';
import VerifyRequestModal from '../components/VerifyRequestModal';
import Swal from 'sweetalert2';

const Account = () => {
	const navigate = useNavigate();
	// const initialSection = location.state?.section;
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
	const initialSection = queryParams.get('section');
	const [activeSection, setActiveSection] = useState(initialSection || 'profile');
	const [imgLoaded, setImgLoaded] = useState(false);

	const [fullName, setFullName] = useState(userStore?.user?.fullName || '');
	const [email, setEmail] = useState(userStore?.user?.email || '');
	const [login, setLogin] = useState(userStore?.user?.login || '');
	const [profilePicture, setProfilePicture] = useState(userStore?.user?.profilePicture || '');
	// в начале компонента Account
	const [verifyRequests, setVerifyRequests] = useState([]);
	const [loading, setLoading] = useState(false);

	// Загружаем данные только если активная секция === 'verifing'
	useEffect(() => {
		if (activeSection !== 'verifing' || userStore.user.isVerified || !userStore.user.isAdmin) return;

		const fetchRequests = async () => {
			setLoading(true);
			try {
				if (userStore.user.isAdmin) {
					const data = await getAllVerifyRequests();
					setVerifyRequests(data.data);
				} else {
					const data = await getVerifyRequestsByUser(userStore.user.id);
					setVerifyRequests(data);
				}
			} catch (e) {
				console.error(e);
			} finally {
				setLoading(false);
			}
		};

		fetchRequests();
	}, [activeSection]);


	const handleMenuClick = section => {
		setActiveSection(section);
		navigate(`/account?section=${section}`, { replace: true });
	};
	const handleStatusUpdate = async (requestId, status) => {
		setLoading(true);
		try {
			await updateVerifyRequestStatus(requestId, {
				status,
				adminId: userStore.user.id,
			});

			// обновляем локальный стейт, чтобы сразу отражалось в UI
			setVerifyRequests((prev) =>
				prev.map((req) =>
					req.id === requestId ? { ...req, status, admin: { ...userStore.user } } : req
				)
			);
		} catch (err) {
			console.error('Failed to update request status', err);
			Swal.fire({
				icon: 'error',
				title: 'Update failed',
				text: 'Failed to update verification request. Please try again later.'
			});
		} finally {
			setLoading(false);
		}
	};
	const [openRequestId, setOpenRequestId] = useState(null);

	const handleOpenRequest = (id) => {
		setOpenRequestId(id);
	};

	const handleStatusChange = (id, status) => {
		setVerifyRequests((prev) =>
			prev.map((req) => (req.id === id ? { ...req, status } : req))
		);
	};

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
			case 'verifing':
				return (
					<div className="p-4 space-y-4">
						<h2 className="text-xl font-bold text-gray-800">Verification Requests</h2>
						{loading ? (
							<div>Loading...</div>
						) : verifyRequests.length === 0 ? (
							<div>No opened verification requests</div>
						) : (
							<ul className="space-y-2">
								{verifyRequests.map((req) => (
									<li
										key={req.id}
										className="p-3 border border-gray-300 rounded-md bg-white flex justify-between items-center"
									>
										<div>
											<p><strong>User:</strong> {req.user.fullName}</p>
											<p><strong>Status:</strong> {req.status}</p>
										</div>

										<button
											className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
											onClick={() => handleOpenRequest(req.id)}
										>
											Open
										</button>
									</li>
								))}
							</ul>
						)}
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
					{(userStore.user.isAdmin || !userStore.user.isVerified) && (
						<li>
							<button onClick={() => handleMenuClick('verifing')} className='flex items-center w-full p-2 space-x-2 rounded-md hover:bg-gray-700'>
								<FaCog />
								<span className='text-sm'>Verifing</span>
							</button>
						</li>
					)}
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
			{openRequestId && (
				<VerifyRequestModal
					requestId={openRequestId}
					onClose={() => setOpenRequestId(null)}
					onStatusChange={handleStatusChange}
				/>
			)}
		</div>
	);
};

export default Account;
