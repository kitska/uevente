import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services';
import { userStore } from '../store/userStore';
import EventCard from '../components/EventCard';
import EventModal from '../components/EventModal';
import { FaPlus, FaPencilAlt, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { eventStore } from '../store/eventStore';

const Company = () => {
    const { companyId } = useParams();
    const [favourited, setFavourited] = useState(false);
    const userId = userStore?.user?.id;
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [posterFile, setPosterFile] = useState(null);
    const [posterPreview, setPosterPreview] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [editPromo, setEditPromo] = useState(false);

    const [eventForm, setEventForm] = useState({
        id: '',
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
        redirectURL: null,
        formatIds: [],
        themeIds: [],
    });

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const response = await api.get(`/companies/${companyId}`);
                setCompany(response.data);
                setIsOwner(response.data.owner.id === userId);

                const eventRes = await api.get(`/companies/${companyId}/events`);
                setEvents(eventRes.data);
                // console.log(response.data.id);
                setFavourited(userStore.isEventSubscribed(response.data.id));
            } catch (err) {
                console.error('Error fetching company or events', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCompany();
    }, [companyId, userId]);

    const stringIsAValidUrl = (s) => {
        try {
            new URL(s);
            return true;
        } catch (err) {
            return false;
        }
    };

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

    const handleCreateClick = () => {
        setEventForm({
            id: '',
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
            redirectURL: null,
            formatIds: [],
            themeIds: [],
        });
        setUpdating(false);
        setShowModal(true);
    }

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
                redirectURL,
                formatIds,
                themeIds,
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
                redirectURL,
                formatIds,
                themeIds,
            };

            if (title == '') return Swal.fire('Validation Error', 'Title cannot be empty', 'error');
            if (location == '') return Swal.fire('Validation Error', 'Location cannot be empty', 'error');
            if (description == '') return Swal.fire('Validation Error', 'Description cannot be empty', 'error');
            if (!price || isNaN(price) || Number(price) < 0) return Swal.fire('Validation Error', 'Price must be a valid non-negative number.', 'error');
            if (!date) return Swal.fire('Validation Error', 'Event date is not selected', 'error');
            if (redirectURL && !stringIsAValidUrl(redirectURL)) return Swal.fire('Validation Error', 'Redirect URL is not valid', 'error');

            let response;
            if (editingEvent) {
                response = await api.patch(`/events/${editingEvent.id}`, body);
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
                id: '',
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
                redirectURL: null,
                formatIds: [],
                themeIds: [],
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
            visibility: event.allAttendeesVisible ? 'everyone' : 'attendees',
            receiveEmails: event.receiveEmails,
            ticket_limit: event.ticket_limit,
            poster: event.poster || '',
            redirectURL: event.paymentSuccessUrl || '',
            formatIds: event.formats || [],
            themeIds: event.themes || []
        });
        setUpdating(true);
        setShowModal(true);
    };

    const handleSubscribe = async () => {
        if (!userStore?.user?.id) {
            Swal.fire('Error', 'Dear user, don\'t be an <b>idiot</b>. <p>Login to continue!</p>', 'error');
            return;
        }
        const newValue = !favourited;
        setFavourited(newValue);
        eventStore.handleSubscribe(newValue, company.id, false);
        newValue ? userStore.addSub(company) : userStore.removeSub(company);
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

    const handlePromoEvent = async (event) => {
        setEditingEvent(event);
        setEventForm({
            id: event.id,
            title: event.title,
            description: event.description,
            price: event.price,
            location: event.location,
            date: event.date,
            publishDate: event.publishDate,
            visibility: event.allAttendeesVisible ? 'everyone' : 'attendees',
            receiveEmails: event.receiveEmails,
            ticket_limit: event.ticket_limit,
            poster: event.poster || '',
            redirectURL: event.paymentSuccessUrl || '',
            formatIds: event.formats || [],
            themeIds: event.themes || []
        });
        setUpdating(true);
        setShowModal(true);
        setEditPromo(true)
    };
    if (loading) {
        return <div className="p-10 text-center text-gray-600">Loading company...</div>;
    }

    if (!company) {
        return <div className="p-10 text-center text-red-500 mt-20">Company not found.</div>;
    }

    return (
        <div className='mt-24 space-y-3'>
            <div className='flex items-end justify-between w-full max-w-screen-xl pb-2 mx-auto border-b border-gray-300'>
                <h1 className='text-5xl font-extrabold tracking-tight text-gray-900'>{company.name}</h1>
                <p className='text-sm text-gray-500'>{company.email}</p>
            </div>

            <div className="flex items-center justify-between w-full max-w-screen-xl mx-auto">
                <h2 className="text-2xl font-semibold text-gray-800">Events</h2>
                {isOwner ? (
                    <button
                        onClick={handleCreateClick}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white transition bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700"
                    >
                        <FaPlus size={12} /> Create
                    </button>
                ) : (
                    <button
                        onClick={handleSubscribe}
                        className="mt-2 px-4 py-1.5 text-sm font-medium text-white bg-green-600 rounded-full hover:bg-green-700 transition"
                    >
                        {favourited ? "Unsubscribe" : "Subscribe"}
                    </button>
                )}
            </div>

            <div className='flex items-center justify-center w-full max-w-screen-xl mx-auto'>
                {events.length === 0 ? (
                    <p className='mt-8 italic text-gray-400'>No events have been created yet.</p>
                ) : (
<div className='relative grid grid-cols-1 gap-6 mt-6 mb-6 sm:grid-cols-2 md:grid-cols-3'>
    {events.map(event => (
        <div key={event.id} className='relative group'>
            <Link to={`/event/${event.id}`}>
                <EventCard event={event} />
            </Link>

            {isOwner && (
                <div className='absolute left-0 right-0 top-full mt-2 flex justify-center gap-2 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-in-out pointer-events-none group-hover:pointer-events-auto z-20'>
                    <button
                        onClick={() => handleEditEvent(event)}
                        className='flex items-center gap-2 px-3 py-1.5 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400'
                    >
                        <FaPencilAlt className='text-sm' />
                        Edit
                    </button>
                    <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className='flex items-center gap-2 px-3 py-1.5 text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400'
                    >
                        <FaTrash className='text-sm' />
                        Delete
                    </button>
                    <button
                        onClick={() => handlePromoEvent(event)}
                        className='flex items-center gap-2 px-3 py-1.5 text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400'
                    >
                        <FaPlus className='text-sm' />
                        Add promo
                    </button>
                </div>
            )}
        </div>
    ))}
</div>

                )}
            </div>


            <EventModal
                show={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditingEvent(null);
                    setPosterFile(null);
                    setPosterPreview(null);
                    setEditPromo(false);
                }}
                onSubmit={handleCreateEvent}
                form={eventForm}
                onChange={handleInputChange}
                setForm={setEventForm}
                updating={updating}
                promocodes={editPromo}
            />
        </div>
    );
};

export default Company;
