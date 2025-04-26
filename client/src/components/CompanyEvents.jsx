import { useEffect, useState, useRef } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { api } from '../services';

export default function CompanyEvents({ event }) {
    const scrollRef = useRef(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCompanyEvents() {
            try {
                const response = await api.get(`/companies/${event.company.id}/events`);
                const fetchedEvents = response.data || [];
                const filteredEvents = fetchedEvents.filter(e => e.id !== event.id);
                setEvents(filteredEvents.slice(0, 10));
            } catch (error) {
                console.error('Failed to fetch company events:', error);
                setEvents([]);
            } finally {
                setLoading(false);
            }
        }

        if (event?.company?.id) {
            fetchCompanyEvents();
        }
    }, [event.company.id, event.id]);

    const scroll = (direction) => {
        const container = scrollRef.current;
        const scrollAmount = 320;
        if (direction === 'left') container.scrollLeft -= scrollAmount;
        if (direction === 'right') container.scrollLeft += scrollAmount;
    };

    if (loading) {
        return (
            <div className="max-w-6xl px-4 pb-16 mx-auto text-left">
                <h2 className="mb-4 text-2xl font-bold">Other Events by Company</h2>
                <p className="text-gray-500">Loading events...</p>
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <>
                {/* <hr className="max-w-6xl mx-auto my-8 border-gray-300" />
                <div className="max-w-6xl pb-16 mx-auto text-left">
                    <h2 className="mb-4 text-2xl font-bold">Company Events</h2>
                    <p className="text-gray-500">Company has no other events.</p>
                </div> */}
            </>
        );
    }

    const showArrows = events.length > 4;

    return (
        <>
            <hr className="max-w-6xl mx-auto my-8 border-gray-300" />
            <div className="px-4 max-w-6xl mx-auto mb-10">
                <h2 className="mb-4 text-2xl font-bold">Company Events</h2>

                <div className="relative">
                    {/* Left Arrow */}
                    {showArrows && (
                        <button
                            onClick={() => scroll('left')}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow p-2 hover:bg-gray-100"
                        >
                            <FaArrowLeft className="w-5 h-5" />
                        </button>
                    )}

                    {/* Scrollable Area */}
                    <div
                        ref={scrollRef}
                        className="flex overflow-x-auto space-x-5 scroll-smooth snap-x snap-mandatory scrollbar-hide"
                    >
                        {events.map((e) => (
                            <a
                                key={e.id}
                                href={`/event/${e.id}`}
                                className="min-w-[300px] max-w-[300px] flex-shrink-0 snap-center bg-white rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                            >
                                <img
                                    src={e.poster || 'https://picsum.photos/300/200'}
                                    alt={e.title}
                                    className="object-cover w-full h-40"
                                />
                                <div className="p-4">
                                    <h3 className="mb-1 text-lg font-semibold">{e.title}</h3>
                                    <p className="text-sm text-gray-600 line-clamp-3">{e.description}</p>
                                </div>
                            </a>
                        ))}
                    </div>

                    {/* Right Arrow */}
                    {showArrows && (
                        <button
                            onClick={() => scroll('right')}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow p-2 hover:bg-gray-100"
                        >
                            <FaArrowRight className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}
