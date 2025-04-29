import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services';
import { userStore } from '../store/userStore';
import EventCard from '../components/EventCard';
import EventModal from '../components/EventModal';
import { FaPlus, FaPencilAlt, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import ChatWindow from '../components/ChatWindow'

const Company = () => {
    const { companyId } = useParams();
    const userId = userStore?.user?.id;
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [posterFile, setPosterFile] = useState(null);
    const [posterPreview, setPosterPreview] = useState(null);

    const [eventForm, setEventForm] = useState({
        id:'',
        title: '',
        description: '',
        price: '',
        location: '',
        date: null,
        publishDate: null,
        visibility: 'everyone',
        receiveEmails: true,
        ticket_limit: '',
        poster: '',
    });

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const response = await api.get(`/companies/${companyId}`);
                setCompany(response.data);
                setIsOwner(response.data.owner.id === userId);

                const eventRes = await api.get(`/companies/${companyId}/events`);
                setEvents(eventRes.data);
            } catch (err) {
                console.error('Error fetching company or events', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCompany();
    }, [companyId, userId]);

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;

        if (name === 'posterFile') {
            const file = files?.[0];
            setPosterFile(file);
            setPosterPreview(file ? URL.createObjectURL(file) : null);
            setEventForm((prev) => ({ ...prev, poster: '' }));
        } else {
            setEventForm((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleCreateEvent = async () => {
        try {
            const {
                id,
                title,
                description,
                price,
                location,
                date,
                publishDate,
                visibility,
                receiveEmails,
                ticket_limit,
                poster,
            } = eventForm;

            const body = {
                id,
                title,
                description,
                price,
                location,
                date,
                publishDate,
                visibility,
                receiveEmails,
                ticket_limit,
                companyId,
                poster: posterFile ? null : poster || null,
            };

            console.log(body)

            let response;
            if (editingEvent) {
                response = await api.put(`/events/${editingEvent.id}`, body);
            } else {
                response = await api.post(`/events`, body);
            }

            const createdEvent = response.data.event || response.data;

            // Upload poster file if exists
            if (posterFile) {
                const formData = new FormData();
                formData.append('avatar', posterFile);

                await api.post(`/events/${createdEvent.id}/upload`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }

            const updatedEvents = await api.get(`/companies/${companyId}/events`);
            setEvents(updatedEvents.data);

            // Reset state
            setShowModal(false);
            setEditingEvent(null);
            setPosterFile(null);
            setPosterPreview(null);
            setEventForm({
                id:'',
                title: '',
                description: '',
                price: '',
                location: '',
                date: null,
                publishDate: null,
                visibility: '',
                receiveEmails: true,
                ticket_limit: '',
                poster: '',
            });
        } catch (err) {
            console.error('Error creating/updating event', err);
        }
    };

    const handleEditEvent = (event) => {
        setEditingEvent(event);
        setEventForm({
            id: event.id,
            title: event.title,
            description: event.description,
            price: event.price,
            location: event.location,
            date: event.date,
            publishDate: event.publishDate,
            visibility: event.visibility,
            receiveEmails: event.receiveEmails,
            ticket_limit: event.ticket_limit,
            poster: event.poster || '',
        });
        setPosterFile(null);
        setPosterPreview(null);
        setShowModal(true);
    };

    const handleDeleteEvent = async (eventId) => {
        const confirm = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you really want to delete this event?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        });

        if (confirm.isConfirmed) {
            try {
                await api.delete(`/events/${eventId}`);
                const eventRes = await api.get(`/companies/${companyId}/events`);
                setEvents(eventRes.data);
                Swal.fire('Deleted!', 'The event has been deleted.', 'success');
            } catch (err) {
                console.error('Error deleting event', err);
                Swal.fire('Error', 'There was an issue deleting the event.', 'error');
            }
        }
    };

    if (loading) {
        return <div className="p-10 text-center text-gray-600">Loading company...</div>;
    }

    if (!company) {
        return <div className="p-10 text-center text-red-500">Company not found.</div>;
    }

    return (
        <div className="mt-24 space-y-12">
            <div className="flex items-end justify-between w-full max-w-screen-xl pb-2 mx-auto border-b border-gray-300">
                <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">{company.name}</h1>
                <p className="text-sm text-gray-500">{company.email}</p>
            </div>

            <div className="flex items-center justify-between w-full max-w-screen-xl mx-auto">
                <h2 className="text-2xl font-semibold text-gray-800">Events</h2>
                {isOwner && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white transition bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700"
                    >
                        <FaPlus size={12} /> Create
                    </button>
                )}
            </div>

            <div className="flex items-center justify-center w-full max-w-screen-xl mx-auto">
                {events.length === 0 ? (
                    <p className="mt-8 italic text-gray-400">No events have been created yet.</p>
                ) : (
                    <div className="relative grid grid-cols-1 gap-6 mt-6 mb-6 sm:grid-cols-2 md:grid-cols-3">
                        {events.map((event) => (
                            <div key={event.id} className="relative">
                                <Link to={`/event/${event.id}`}>
                                    <EventCard event={event} />
                                </Link>
                                {isOwner && (
                                    <div className="absolute space-y-2 top-2 right-2">
                                        <button
                                            onClick={() => handleEditEvent(event)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <FaPencilAlt size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteEvent(event.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <FaTrash size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ChatWindow/>

            <EventModal
                show={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditingEvent(null);
                    setPosterFile(null);
                    setPosterPreview(null);
                }}
                onSubmit={handleCreateEvent}
                form={eventForm}
                onChange={handleInputChange}
                isEdit={editingEvent !== null}
                event={editingEvent}
                posterFile={posterFile}
                posterPreview={posterPreview}
                setForm={setEventForm}
            />
        </div>
    );
};

export default Company;
