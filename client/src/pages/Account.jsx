import React, { useState } from 'react';
import { FaUser, FaCog, FaSignOutAlt, FaKey, FaLanguage, FaTrashAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // Using useNavigate for navigation
import { userStore } from '../store/userStore';

const Account = () => {
    const [activeSection, setActiveSection] = useState('profile'); // Default section
    const navigate = useNavigate(); // Hook for navigation
    const [imgLoaded, setImgLoaded] = useState(false);

    // Handlers for the sidebar menu
    const handleMenuClick = (section) => {
        setActiveSection(section);
    };

    // Navigate back to the main page
    const goToMainPage = () => {
        navigate('/'); // Assuming '/' is the main page
    };

    // Render Profile Section
    const ProfileSection = () => (
        <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Your Profile</h2>
            {userStore?.user && (
                <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 rounded-full bg-gray-200">
                        {!imgLoaded && (
                            <div className="w-8 h-8 me-2 rounded-full bg-gray-300 animate-pulse" />
                        )}
                        <img
                            className={`w-8 h-8 me-2 rounded-full transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0 absolute'
                                }`}
                            src={userStore?.user.profilePicture}
                            alt="user"
                            onLoad={() => setImgLoaded(true)}
                        />
                    </div>
                    <div>
                        <p className="text-lg font-semibold">{userStore?.user.fullName}</p>
                        <p className="text-gray-600">{userStore?.user.email}</p>
                        <p className="text-gray-600">Language: English</p>
                    </div>
                </div>
            )}

        </div>
    );

    // Render Login Section
    const LoginSection = () => (
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

    // Render Accessibility Section
    const AccessibilitySection = () => (
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

    // Main Content rendering based on selected section
    const renderContent = () => {
        switch (activeSection) {
            case 'profile':
                return <ProfileSection />;
            case 'login':
                return <LoginSection />;
            case 'accessibility':
                return <AccessibilitySection />;
            default:
                return <div>Select a section</div>;
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-56 bg-gray-800 text-white p-4 fixed h-full">
                {/* "Go Event" logo at the top */}
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
                <button className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded-md w-full mt-6" onClick={() => {
                    userStore?.logout();
                    goToMainPage();
                }}>
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
