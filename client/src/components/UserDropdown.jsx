import React, { useState, useContext, useRef, useEffect } from 'react';
import noname from '../assets/noname.png'
import { userStore } from '../store/userStore';

const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  // const { user, logout } = useContext(AuthContext);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleOutsideClick = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [userStore?.user]);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id="dropdownAvatarNameButton"
        onClick={toggleDropdown}
        className="flex items-center text-sm pe-1 p-1 pr-3 font-medium text-gray-900 bg-pink-400 rounded-full hover:text-white focus:text-white md:me-0 focus:ring-2 focus:ring-gray-100"
        type="button"
      >
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
        <span className="hidden sm:inline">{userStore?.user.fullName}</span>

        <svg
          className={`w-2.5 h-2.5 ms-3 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 4 4 4-4"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          id="dropdownAvatarName"
          className="z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 absolute right-0 mt-2"
        >
          <div className="px-4 py-3 text-sm text-gray-900">
            <div className="font-medium">{userStore?.user.fullName}</div>
            <div className="truncate">{userStore?.user.email}</div>
          </div>
          <ul className="py-2 text-sm text-gray-700">
            <li>
              <a
                href='/account'
                className="block px-4 py-2 hover:bg-gray-100"
              >
                Account
              </a>
            </li>
            <li>
              <a
                href='/settings'
                className="block px-4 py-2 hover:bg-gray-100"
              >
                Settings
              </a>
            </li>
            <li>
              <a
                href="/subscriptions"
                className="block px-4 py-2 hover:bg-gray-100"
              >
                Subscriptions
              </a>
            </li>
          </ul>
          <div className="py-2">
            <a
              href="/"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={userStore?.logout}
            >
              Log out
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
