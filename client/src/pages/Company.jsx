import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services';
import { userStore } from '../store/userStore';
import EventCard from '../components/EventCard';
import EventModal from '../components/EventModal';
import { FaPlus } from 'react-icons/fa';

const Company = () => {
    const { companyId } = useParams();
    const userId = userStore?.user?.id;
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [eventForm, setEventForm] = useState({
        title: '',
        description: '',
        price: '',
        location: '',
        date: '',
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
        const { name, value } = e.target;
        setEventForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCreateEvent = async () => {
        try {
            const newEvent = { ...eventForm, companyId };
            await api.post(`/events`, newEvent);
            const eventRes = await api.get(`/companies/${companyId}/events`);
            setEvents(eventRes.data);
            setShowModal(false);
            setEventForm({
                title: '',
                description: '',
                price: '',
                location: '',
                date: '',
                ticket_limit: '',
                poster: '',
            });
        } catch (err) {
            console.error('Error creating event', err);
        }
    };

    if (loading) {
        return <div className="text-center p-10 text-gray-600">Loading company...</div>;
    }

    if (!company) {
        return <div className="text-center p-10 text-red-500">Company not found.</div>;
    }

    return (
        <div className="mt-20 p-6 max-w-5xl mx-auto space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h1 className="text-3xl font-bold text-gray-800">{company.name}</h1>
                <p className="text-gray-600">{company.location}</p>
                <p className="text-sm text-gray-500">{company.email}</p>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-gray-800">Events</h2>
                    {isOwner && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                        >
                            <FaPlus /> Create
                        </button>
                    )}
                </div>

                {events.length === 0 ? (
                    <p className="text-gray-500 italic">No events available.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {events.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                )}
            </div>

            <EventModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleCreateEvent}
                form={eventForm}
                onChange={handleInputChange}
            />
        </div>
    );
};

export default Company;
