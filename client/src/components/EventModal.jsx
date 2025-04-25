import React, { useRef } from 'react';
import { api } from '../services';

const EventModal = ({ show, onClose, onSubmit, form, onChange, setForm }) => {
    const fileInputRef = useRef();

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

            setForm((prev) => ({ ...prev, poster: imageUrl }));
        } catch (err) {
            console.error('Upload failed:', err);
        }
    };

    const previewSrc =
        typeof form.poster === 'string'
            ? form.poster
            : form.poster instanceof File
            ? URL.createObjectURL(form.poster)
            : '';

    return (
        <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/30 flex justify-center items-center">
            <div className="bg-white rounded-lg p-6 w-96 shadow-lg space-y-6">
                <h3 className="text-2xl font-semibold text-gray-800">Create Event</h3>
                <form className="space-y-4">
                    <input
                        type="text"
                        name="title"
                        placeholder="Title"
                        value={form.title}
                        onChange={onChange}
                        className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                        name="description"
                        placeholder="Description"
                        value={form.description}
                        onChange={onChange}
                        className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="4"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="number"
                            name="price"
                            placeholder="Price"
                            value={form.price}
                            onChange={onChange}
                            className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            name="location"
                            placeholder="Location"
                            value={form.location}
                            onChange={onChange}
                            className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="date"
                            name="date"
                            value={form.date}
                            onChange={onChange}
                            className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="number"
                            name="ticket_limit"
                            placeholder="Ticket Limit"
                            value={form.ticket_limit}
                            onChange={onChange}
                            className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Poster Section */}
                    <div className="space-y-2">
                        <input
                            type="text"
                            name="poster"
                            placeholder="Poster (Image URL)"
                            value={typeof form.poster === 'string' ? form.poster : ''}
                            onChange={onChange}
                            className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <div className="flex items-center gap-2">
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
                            <div className="mt-2">
                                <img
                                    src={previewSrc}
                                    alt="Preview"
                                    className="rounded-md shadow max-h-48 mx-auto"
                                />
                            </div>
                        )}
                    </div>
                </form>

                <div className="flex justify-between items-center mt-4">
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
