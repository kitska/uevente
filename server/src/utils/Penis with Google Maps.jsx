import React, { useState, useEffect } from "react";
import { calendarStore } from "../store/calendarStore";
import { eventStore } from "../store/eventStore";

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API; // Replace with your API key

const EventModal = ({ event, setNewEvent, handleSave, setShowModal, updating = false }) => {
    const [participantsInput, setParticipantsInput] = useState("");
    const [selectedCalendar, setSelectedCalendar] = useState(event.calendarId || (calendarStore.calendars?.length > 0 ? calendarStore.calendars[0].id : null));
    const [address, setAddress] = useState(event.address || ""); // Address state
    const [showMap, setShowMap] = useState(false); // Control map visibility

    useEffect(() => {
        if (!event.calendarId && calendarStore.calendars?.length > 0) {
            setSelectedCalendar(calendarStore.calendars[0].id);
        }
    }, []);

    const handleCalendarChange = (e) => {
        setSelectedCalendar(e.target.value);
    };

    const handleAddressChange = (e) => {
        setAddress(e.target.value);
        setNewEvent({ ...event, address: e.target.value });
    };

    const validateFields = () => {
        if (!event.title || event.title.trim() === "") {
            setNewEvent({ ...event, title: "(No Title)" });
        }

        if (!selectedCalendar && calendarStore.calendars?.length > 0) {
            setSelectedCalendar(calendarStore.calendars[0].id);
        }
    };

    const handleSubmit = async () => {
        validateFields();
        setShowModal(false);
        handleSave(selectedCalendar);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-lg font-bold mb-4">Create New Event</h2>

                {!updating && calendarStore.calendars?.length > 1 && (
                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700">Select Calendar:</label>
                        <select
                            className="border p-2 w-full"
                            value={selectedCalendar || ""}
                            onChange={handleCalendarChange}
                        >
                            {calendarStore.calendars.map((calendar) => (
                                <option key={calendar.id} value={calendar.id}>{calendar.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="mb-3">
                    <input
                        type="text"
                        placeholder="Title"
                        className="border p-1.5 w-full"
                        value={event.title || ""}
                        onChange={(e) => setNewEvent({ ...event, title: e.target.value })}
                    />
                </div>

                <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700">Type:</label>
                    <select
                        className="border p-1.5 w-full"
                        value={event.type || "event"}
                        onChange={(e) => setNewEvent({ ...event, type: e.target.value })}
                    >
                        <option value="event">Event</option>
                        <option value="task">Task</option>
                        <option value="reminder">Reminder</option>
                    </select>
                </div>

                <textarea
                    placeholder="Description"
                    className="border p-1.5 w-full mb-3"
                    value={event.description || ""}
                    onChange={(e) => setNewEvent({ ...event, description: e.target.value })}
                />

                <label className="block text-sm font-medium text-gray-700">Start Date & Time:</label>
                <input
                    type="datetime-local"
                    className="border p-1.5 w-full mb-3"
                    value={event.start ? new Date(event.start).toISOString().slice(0, 16) : ""}
                    onChange={(e) => setNewEvent({ ...event, start: new Date(e.target.value) })}
                />

                <label className="block text-sm font-medium text-gray-700">End Date & Time:</label>
                <input
                    type="datetime-local"
                    className="border p-1.5 w-full mb-3"
                    value={event.end ? new Date(event.end).toISOString().slice(0, 16) : ""}
                    onChange={(e) => setNewEvent({ ...event, end: new Date(e.target.value) })}
                />

                {/* Address Input */}
                <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700">Address:</label>
                    <input
                        type="text"
                        placeholder="Enter address"
                        className="border p-1.5 w-full"
                        value={address}
                        onChange={handleAddressChange}
                    />
                    <p
                        className="text-blue-500 cursor-pointer text-sm mt-1"
                        onClick={() => setShowMap(true)}
                    >
                        Show on map
                    </p>
                </div>

                <div className="mb-4">
                    <input
                        type="color"
                        id="colorPicker"
                        className="w-7 h-7"
                        value={event.color}
                        onChange={(e) => setNewEvent({ ...event, color: e.target.value })}
                    />
                </div>

                <div className="flex justify-end space-x-5">
                    <button
                        className="px-4 py-1 bg-gray-300 rounded"
                        onClick={() => setShowModal(false)}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-1 bg-blue-500 text-white rounded"
                        onClick={handleSubmit}
                    >
                        Save
                    </button>
                </div>

                {/* Google Maps Embed */}
                {showMap && address && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-[800px] h-[650px] relative">
                            <button
                                className="absolute top-2 right-2 text-gray-700"
                                onClick={() => setShowMap(false)}
                            >
                                ✖
                            </button>
                            <iframe
                                width="100%"
                                height="100%"
                                loading="lazy"
                                allowFullScreen
                                referrerPolicy="no-referrer-when-downgrade"
                                src={`https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(address)}`}
                            ></iframe>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventModal;
