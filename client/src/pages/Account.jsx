import React, { useState } from 'react';
import { FaUser, FaCog, FaSignOutAlt, FaKey, FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { userStore } from '../store/userStore';
import ProfileSection from '../components/ProfileSection'

const Account = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('profile');
    const [imgLoaded, setImgLoaded] = useState(false);

    const [fullName, setFullName] = useState(userStore?.user?.fullName || '');
    const [email, setEmail] = useState(userStore?.user?.email || '');
    const [login, setLogin] = useState(userStore?.user?.login || '');
    const [profilePicture, setProfilePicture] = useState(userStore?.user?.profilePicture || '');

    const handleMenuClick = (section) => setActiveSection(section);

    const goToMainPage = () => navigate('/');

    const handleSaveProfile = () => {
        console.log('Saving Profile:', { fullName, login, profilePicture });
        setEditingProfile(false);
        // Optionally update userStore here
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'profile':
                return (
                    <ProfileSection />
                );
            case 'login':
                return (
                    <div className="p-4 space-y-4">
                        <h2 className="text-xl font-bold text-gray-800">Login Settings</h2>
                        <div className="space-y-2">
                            <button className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                                Reset Password
                            </button>
                            <button className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                                Enable Passkeys
                            </button>
                            <button className="w-full py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600">
                                Delete Account
                            </button>
                        </div>
                    </div>
                );
            case 'accessibility':
                return (
                    <div className="p-4 space-y-4">
                        <h2 className="text-xl font-bold text-gray-800">Accessibility Settings</h2>
                        <div className="space-y-2">
                            <button className="w-full py-2 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-600">
                                Toggle Dark Mode
                            </button>
                            <button className="w-full py-2 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-600">
                                Change Font Size
                            </button>
                        </div>
                    </div>
                );
            default:
                return <div className="p-4">Select a section</div>;
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-56 bg-gray-800 text-white p-4 fixed h-full">
                <div
                    onClick={goToMainPage}
                    className="text-2xl font-bold text-white cursor-pointer mb-6"
                >
                    Go Event
                </div>

                <h2 className="text-lg font-bold mb-6">Account Settings</h2>
                <ul className="space-y-3">
                    <li>
                        <button
                            onClick={() => handleMenuClick('profile')}
                            className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded-md w-full"
                        >
                            <FaUser />
                            <span className="text-sm">Your Profile</span>
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => handleMenuClick('login')}
                            className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded-md w-full"
                        >
                            <FaKey />
                            <span className="text-sm">Login</span>
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => handleMenuClick('accessibility')}
                            className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded-md w-full"
                        >
                            <FaCog />
                            <span className="text-sm">Accessibility</span>
                        </button>
                    </li>
                </ul>
                <button
                    className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded-md w-full mt-6"
                    onClick={() => {
                        userStore?.logout();
                        goToMainPage();
                    }}
                >
                    <FaSignOutAlt />
                    <span className="text-sm">Sign Out</span>
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-56 p-6">
                {renderContent()}
            </div>
        </div>
    );
};

export default Account;
