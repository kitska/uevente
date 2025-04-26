import React, { useState, useEffect, useRef } from 'react';
import { userStore } from '../store/userStore';
import { api } from '../services';
import { FaPlusCircle } from 'react-icons/fa';
import CompanySection from './CompanySection';
import { savePushSubscription } from '../services/userService'
import Swal from 'sweetalert2';

const ProfileSection = () => {
    const fileInputRef = useRef(null);

    const [user, setUser] = useState({
        id: userStore?.user?.id || 0,
        login: userStore?.user?.login || '',
        email: userStore?.user?.email || '',
        fullName: userStore?.user?.fullName || '',
        profilePicture: userStore?.user?.profilePicture || '',
        phone: userStore?.user?.phone || '',
        isShowName: userStore?.user?.isShowName || false
    });

    console.log(userStore?.user);

    const [notifications, setNotifications] = useState({
        push: userStore?.user?.pushNotifications,
        email: userStore?.user?.emailNotifications,
        sms: userStore?.user?.smsNotifications,
    });
    useEffect(() => {
        const initPushSubscription = async () => {
            await savePushSubscription();
        };
        initPushSubscription();
    }, [userStore?.user?.pushNotifications]);
    // console.log(userStore.user);

    const [companies, setCompanies] = useState([]);
    const [editingField, setEditingField] = useState(null);
    const [tempValue, setTempValue] = useState('');
    const [showCompanyForm, setShowCompanyForm] = useState(false);
    const [newCompany, setNewCompany] = useState({ name: '', email: '' });

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await api.get(`/users/${userStore?.user?.id}/companies`);
                setCompanies(response.data);
            } catch (err) {
                console.error('Failed to fetch companies:', err);
            }
        };

        if (userStore?.user?.id) {
            fetchCompanies();
        }
    }, []);

    const handleEdit = (field) => {
        setEditingField(field);
        setTempValue(user[field]);
    };

    const handleSave = () => {
        setUser((prev) => ({ ...prev, [editingField]: tempValue }));
        setEditingField(null);
        setTempValue('');
        userStore.updateUser({ ...user, [editingField]: tempValue });
    };

    const handleCancel = () => {
        setEditingField(null);
        setTempValue('');
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];


        if (!file) return;

        console.log(file)

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await api.post(`/users/${userStore?.user?.id}/avatar`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const newAvatar = response.data.avatar;
            setUser((prev) => ({ ...prev, profilePicture: newAvatar }));
            userStore.updateUser({ ...user, profilePicture: newAvatar });
        } catch (err) {
            console.error('Failed to upload avatar:', err);
        }
    };

    const handleCheckboxChange = async () => {
        const newValue = !user.isShowName;
        setUser((prev) => ({ ...prev, isShowName: newValue }));

        try {
            const response = await api.patch(`/users/${user.id}`, { isShowName: newValue });
        } catch (error) {
            console.error('Failed to update show name preference', error);
            setIsShowName(!newValue); // revert if request failed
        }
    };

    const handleCompanySubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post(`/companies`, {
                ...newCompany,
                userId: userStore?.user?.id
            });
            setCompanies((prev) => [...prev, response.data]);
            setNewCompany({ name: '', email: '' });
            setShowCompanyForm(false);
        } catch (error) {
            console.error('Failed to create company:', error);
        }
    };

    const numberHandler = (val) => {
        if (val.startsWith('+')) {
            val = '+' + val.slice(1).replace(/[^0-9]/g, '');
        } else {
            val = '+' + val.replace(/[^0-9]/g, '');
        }

        if (val === '+') {
            setTempValue('');
            return;
        }

        if (val.length > 15) {
            val = val.slice(0, 15);
        }

        setTempValue(val);
    };
    const renderEditableField = (label, field) => (
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                {
                    editingField === field ? field === 'phone' ? (
                        <input
                            type="tel"
                            value={tempValue}
                            onChange={(e) => numberHandler(e.target.value)}
                            className="w-64 p-2 mt-1 border rounded-md"
                            placeholder="Enter phone number"
                        />
                    ) : (
                        <input
                            type="text"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            className="w-64 p-2 mt-1 border rounded-md"
                        />
                    ) : (
                        <p className="text-lg font-medium">{user[field]}</p>
                    )}
            </div>
            <div>
                {editingField === field ? (
                    <div className="space-x-2">
                        <button
                            onClick={handleSave}
                            className="px-3 py-1 text-white bg-green-500 rounded cursor-pointer hover:bg-green-600"
                        >
                            Save
                        </button>
                        <button
                            onClick={handleCancel}
                            className="px-3 py-1 text-black bg-gray-300 rounded cursor-pointer hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => handleEdit(field)}
                        className="px-3 py-1 text-white bg-blue-500 rounded cursor-pointer hover:bg-blue-600"
                    >
                        Edit
                    </button>
                )}
            </div>
        </div>
    );

    const renderNotifications = () => (
        <ul className="items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <li className="pr-2 w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                <div className="flex items-center ps-3">
                    <input id="push-checkbox-list" type="checkbox"
                        checked={notifications.push}
                        onChange={async () => {
                            const permission = await Notification.requestPermission();
                            if (permission !== 'granted' && notifications.push === false) {
                                Swal.fire({
                                    text: 'Provide notify permission first',
                                    icon: 'warning',
                                    confirmButtonText: 'Ok'
                                })
                                await Notification.requestPermission();
                                return;
                            }
                            const updated = { ...notifications, push: !notifications.push };
                            setNotifications(updated);
                            await userStore.updateUser({
                                ...user,
                                pushNotify: updated.push,
                                emailNotify: updated.email,
                                smsNotify: updated.sms,
                            });
                        }}
                        value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                    <label htmlFor="push-checkbox-list" className="w-full py-3 text-sm font-medium text-gray-900 ms-2 dark:text-gray-300">Push</label>
                </div>
            </li>
            <li className="pr-2 w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                <div className="flex items-center ps-3">
                    <input id="email-checkbox-list" type="checkbox"
                        checked={notifications.email}
                        onChange={async () => {
                            const updated = { ...notifications, email: !notifications.email };
                            setNotifications(updated);
                            await userStore.updateUser({
                                ...user,
                                pushNotify: updated.push,
                                emailNotify: updated.email,
                                smsNotify: updated.sms,
                            });
                        }}
                        value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                    <label htmlFor="email-checkbox-list" className="w-full py-3 text-sm font-medium text-gray-900 ms-2 dark:text-gray-300">Email</label>
                </div>
            </li>
            <li className="pr-2 w-full dark:border-gray-600">
                <div className="flex items-center ps-3">
                    <input id="sms-checkbox-list" type="checkbox"
                        checked={notifications.sms}
                        onChange={async () => {
                            if (userStore?.user?.phone) {
                                const updated = { ...notifications, sms: !notifications.sms };
                                setNotifications(updated);
                                await userStore.updateUser({
                                    ...user,
                                    pushNotify: updated.push,
                                    emailNotify: updated.email,
                                    smsNotify: updated.sms,
                                });
                            }
                            else {
                                Swal.fire({
                                    text: 'Provide phone number first',
                                    icon: 'warning',
                                    confirmButtonText: 'Ok'
                                })
                            }
                        }}
                        value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                    <label htmlFor="sms-checkbox-list" className="w-full py-3 text-sm font-medium text-gray-900 ms-2 dark:text-gray-300">SMS</label>
                </div>
            </li>
        </ul>
    );

    const renderProfilePicture = () => (
        <div className='flex justify-between'>
            <div className="flex items-center space-x-6">
                <img
                    src={user.profilePicture || '/placeholder-profile.png'}
                    alt="Profile"
                    className="object-cover w-24 h-24 border rounded-full"
                />
                <div className="space-y-2">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block text-sm"
                    />
                    <button
                        // onClick={handleRemoveImage}
                        className="text-sm text-red-500 hover:underline"
                    >
                        Remove Photo
                    </button>
                </div>
            </div>
            <div>
                {renderNotifications()}
            </div>
            {/* <div className="flex space-y-2">
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={notifications.push}
                        onChange={() => setNotifications(prev => ({ ...prev, push: !prev.push }))}
                    />
                    <span>Push</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={notifications.email}
                        onChange={() => setNotifications(prev => ({ ...prev, email: !prev.email }))}
                    />
                    <span>Email</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={notifications.sms}
                        onChange={() => setNotifications(prev => ({ ...prev, sms: !prev.sms }))}
                    />
                    <span>SMS</span>
                </label>
            </div> */}
        </div>
    );

    const renderUserInfoCard = () => (
        <div className="p-6 space-y-6 text-black bg-white rounded-md shadow-md">
            {renderProfilePicture()}
            <div className="space-y-4">
                {renderEditableField('Full Name', 'fullName')}
                {renderEditableField('Login', 'login')}
                {renderEditableField('Phone', 'phone')}
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="showName"
                        checked={user.isShowName}
                        onChange={handleCheckboxChange}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="showName" className="text-gray-700">Show name on Events</label>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {renderUserInfoCard()}

            <CompanySection userId={userStore?.user?.id} />
        </div>
    );
};

export default ProfileSection;
