import React, { useRef, useState, useEffect } from 'react';
import { api } from '../services';

const EventModal = ({ show, onClose, onSubmit, form, onChange, setForm }) => {
    const fileInputRef = useRef();

    const today = new Date().toISOString().split('T')[0]; // yyyy-mm-dd format

    if (!show) return null;

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await api.post('/events/upload-poster', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const imageUrl = res.data.url;
            setForm(prev => ({ ...prev, poster: imageUrl }));
        } catch (err) {
            console.error('Upload failed:', err);
        }
    };

    const handleCheckboxChange = (e) => {
        setForm(prev => ({ ...prev, receiveEmails: e.target.checked }));
    };

    const handleVisibilityChange = (e) => {
        setForm(prev => ({ ...prev, visibility: e.target.value }));
    };

    const handlePublishDateChange = (e) => {
        const publishDate = e.target.value;
        setForm(prev => ({
            ...prev,
            publishDate,
            // if event date already selected and it's before new publish date -> reset event date
            date: prev.date && prev.date < publishDate ? '' : prev.date
        }));
    };

    const previewSrc =
        typeof form.poster === 'string'
            ? form.poster
            : form.poster instanceof File
                ? URL.createObjectURL(form.poster)
                : '';

    return (
        <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/30 flex justify-center items-center">
            <div className="bg-white rounded-lg p-8 w-full max-w-4xl shadow-lg space-y-8 overflow-y-auto max-h-[90vh]">
                <h3 className="text-3xl font-semibold text-gray-800">Create Event</h3>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Title */}
                    <input
                        type="text"
                        name="title"
                        placeholder="Title"
                        value={form.title}
                        onChange={onChange}
                        className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Location */}
                    <input
                        type="text"
                        name="location"
                        placeholder="Location"
                        value={form.location}
                        onChange={onChange}
                        className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Description */}
                    <textarea
                        name="description"
                        placeholder="Description"
                        value={form.description}
                        onChange={onChange}
                        className="w-full md:col-span-2 p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="4"
                    />

                    {/* Price */}
                    <input
                        type="number"
                        name="price"
                        placeholder="Price"
                        value={form.price}
                        onChange={onChange}
                        className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Ticket Limit */}
                    <input
                        type="number"
                        name="ticket_limit"
                        placeholder="Ticket Limit"
                        value={form.ticket_limit}
                        onChange={onChange}
                        className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Publish Date */}
                    <div className="flex flex-col">
                        <label className="text-sm text-gray-500 mb-1">Publish Date</label>
                        <input
                            type="date"
                            name="publishDate"
                            value={form.publishDate || ''}
                            onChange={handlePublishDateChange}
                            min={today}
                            className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Event Date */}
                    <div className="flex flex-col">
                        <label className="text-sm text-gray-500 mb-1">Event Date</label>
                        <input
                            type="date"
                            name="date"
                            value={form.date || ''}
                            onChange={onChange}
                            min={form.publishDate || today}
                            className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Visibility */}
                    <div className="flex flex-col">
                        <label className="text-sm text-gray-500 mb-1">Attendee Visibility</label>
                        <select
                            name="visibility"
                            value={form.visibility || 'everyone'}
                            onChange={handleVisibilityChange}
                            className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="everyone">Everyone can see attendees</option>
                            <option value="attendees">Only attendees can see other attendees</option>
                        </select>
                    </div>

                    {/* Receive Emails Checkbox */}
                    <div className="flex flex-col">
                        <label className="text-sm text-gray-500 mb-1">Emails</label>
                        <div className="flex items-center py-3">
                            <input
                                type="checkbox"
                                id="receiveEmails"
                                name="receiveEmails"
                                checked={form.receiveEmails || false}
                                onChange={handleCheckboxChange}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="receiveEmails" className="text-gray-700 ml-2">
                                Receive new attendees email
                            </label>
                        </div>
                    </div>


                    {/* Poster Input */}
                    <div className="flex flex-col space-y-2 md:col-span-2">
                        <input
                            type="text"
                            name="poster"
                            placeholder="Poster (Image URL)"
                            value={typeof form.poster === 'string' ? form.poster : ''}
                            onChange={onChange}
                            className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className="bg-gray-100 border border-gray-300 px-4 py-2 rounded-md text-sm hover:bg-gray-200"
                            >
                                Upload Image
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </div>

                        {previewSrc && (
                            <div className="mt-2 text-center">
                                <img
                                    src={previewSrc}
                                    alt="Preview"
                                    className="rounded-md shadow max-h-48 mx-auto"
                                />
                            </div>
                        )}
                    </div>
                </form>

                {/* Buttons */}
                <div className="flex justify-end items-center gap-4 mt-6">
                    <button
                        onClick={onClose}
                        className="cursor-pointer px-4 py-2 text-gray-500 hover:text-gray-700 rounded-md"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSubmit}
                        className="cursor-pointer bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventModal;
