import React, { useState, useEffect, useRef } from 'react';
import { userStore } from '../store/userStore';
import { api } from '../services';
import { FaPlusCircle } from 'react-icons/fa';
import CompanySection from './CompanySection';

const ProfileSection = () => {
    const fileInputRef = useRef(null);

    const [user, setUser] = useState({
        login: userStore?.user?.login || '',
        email: userStore?.user?.email || '',
        fullName: userStore?.user?.fullName || '',
        profilePicture: userStore?.user?.profilePicture || ''
    });

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

    const renderEditableField = (label, field) => (
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                {editingField === field ? (
                    <input
                        type="text"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="mt-1 p-2 border rounded-md w-64"
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
                            className="cursor-pointer px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            Save
                        </button>
                        <button
                            onClick={handleCancel}
                            className="cursor-pointer px-3 py-1 bg-gray-300 text-black rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => handleEdit(field)}
                        className="cursor-pointer px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Edit
                    </button>
                )}
            </div>
        </div>
    );

    const renderProfilePicture = () => (
        <div className="flex items-center space-x-6">
            <img
                src={user.profilePicture || '/placeholder-profile.png'}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border"
            />
            <div className="space-y-2">
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                />
                <button
                    onClick={triggerFileInput}
                    className="cursor-pointer px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                    Upload New Photo
                </button>
            </div>
        </div>
    );

    const renderUserInfoCard = () => (
        <div className="p-6 bg-white text-black rounded-md shadow-md space-y-6">
            {renderProfilePicture()}
            <div className="space-y-4">
                {renderEditableField('Full Name', 'fullName')}
                {renderEditableField('Login', 'login')}
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
