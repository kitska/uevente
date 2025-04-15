import React, { useState } from 'react';

const ProfileSection = (initialUser) => {
    const [user, setUser] = useState(initialUser);
    const [editingField, setEditingField] = useState(null);
    const [tempValue, setTempValue] = useState('');
    const [organizations, setOrganizations] = useState(['Org Alpha', 'Beta Team']);
    const [newOrgName, setNewOrgName] = useState('');
    const [selectedOrg, setSelectedOrg] = useState('Org Alpha');

    const handleEdit = (field) => {
        setEditingField(field);
        setTempValue(user[field]);
    };

    const handleSave = () => {
        setUser((prev) => ({ ...prev, [editingField]: tempValue }));
        setEditingField(null);
        setTempValue('');
    };

    const handleCancel = () => {
        setEditingField(null);
        setTempValue('');
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUser((prev) => ({ ...prev, profilePicture: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setUser((prev) => ({ ...prev, profilePicture: '' }));
    };

    const handleCreateOrg = () => {
        if (newOrgName.trim() && !organizations.includes(newOrgName.trim())) {
            setOrganizations((prev) => [...prev, newOrgName.trim()]);
            setNewOrgName('');
        }
    };

    const renderEditableField = (label, field) => (
        <div className="flex items-center justify-between border-b py-4">
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
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            Save
                        </button>
                        <button
                            onClick={handleCancel}
                            className="px-3 py-1 bg-gray-300 text-black rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => handleEdit(field)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
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
                    onChange={handleImageChange}
                    className="block text-sm"
                />
                <button
                    onClick={handleRemoveImage}
                    className="text-red-500 hover:underline text-sm"
                >
                    Remove Photo
                </button>
            </div>
        </div>
    );

    const renderUserInfoSection = () => (
        <div className="space-y-4">
            {renderEditableField('Full Name', 'fullName')}
            {renderEditableField('Email Address', 'email')}
            {renderEditableField('Login', 'login')}
        </div>
    );

    const renderOrganizationsSection = () => (
        <div className="space-y-4 mt-10">
            <h3 className="text-lg font-bold">Organizations</h3>

            <ul className="list-disc list-inside text-gray-700 pl-4">
                {organizations.map((org) => (
                    <li key={org}>{org}</li>
                ))}
            </ul>

            <div className="flex space-x-2">
                <input
                    type="text"
                    placeholder="New Organization Name"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    className="border p-2 rounded-md"
                />
                <button
                    onClick={handleCreateOrg}
                    className="px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                >
                    Create
                </button>
            </div>

            <div className="mt-4">
                <label className="block text-sm text-gray-600 mb-1">Switch Organization</label>
                <select
                    className="border p-2 rounded-md"
                    value={selectedOrg}
                    onChange={(e) => setSelectedOrg(e.target.value)}
                >
                    {organizations.map((org) => (
                        <option key={org} value={org}>
                            {org}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 p-6 bg-white rounded-md shadow-md">
            {renderProfilePicture()}
            {renderUserInfoSection()}
            {renderOrganizationsSection()}
        </div>
    );
};

export default ProfileSection;
