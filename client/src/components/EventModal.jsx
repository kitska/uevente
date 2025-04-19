import React from 'react';

const EventModal = ({ show, onClose, onSubmit, form, onChange }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/30 flex justify-center items-center">
            <div className="bg-white rounded-lg p-6 w-96 shadow-lg space-y-6">
                <h3 className="text-2xl font-semibold text-gray-800">Create Event</h3>
                <form className="space-y-4">
                    <div>
                        <input
                            type="text"
                            name="title"
                            placeholder="Title"
                            value={form.title}
                            onChange={onChange}
                            className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <textarea
                            name="description"
                            placeholder="Description"
                            value={form.description}
                            onChange={onChange}
                            className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="4"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="number"
                            name="price"
                            placeholder="Price"
                            value={form.price}
                            onChange={onChange}
                            className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            name="location"
                            placeholder="Location"
                            value={form.location}
                            onChange={onChange}
                            className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="date"
                            name="date"
                            value={form.date}
                            onChange={onChange}
                            className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="number"
                            name="ticket_limit"
                            placeholder="Ticket Limit"
                            value={form.ticket_limit}
                            onChange={onChange}
                            className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            name="poster"
                            placeholder="Poster (Image URL)"
                            value={form.poster}
                            onChange={onChange}
                            className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </form>
                <div className="flex justify-between items-center mt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-500 hover:text-gray-700 rounded-md"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSubmit}
                        className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventModal;
