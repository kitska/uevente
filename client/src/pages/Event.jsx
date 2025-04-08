import { useParams } from 'react-router-dom';
import { eventStore } from '../store/eventStore';
import { useEffect, useState } from 'react';
import Comment from '../components/Comment';
import { FaMapMarkerAlt, FaCalendarAlt, FaMoneyBillAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Subscribe from '../components/Subscribe'

const Event = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);

    useEffect(() => {
        const foundEvent = eventStore.mockEvents.find(e => e.id == id);
        setEvent(foundEvent);
    }, [id]);

    if (!event) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-xl text-gray-700">Event not found 😢</p>
            </div>
        );
    }

    const handleMapClick = () => {
        const query = encodeURIComponent(event.location);
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Hero */}
            <div
                className="h-96 bg-cover bg-center relative"
                style={{ backgroundImage: `url('${event.image}')` }}
            >
                <div className="absolute inset-0 bg-opacity-50 flex items-center justify-center">
                    <h1 className="text-white text-4xl md:text-5xl font-bold drop-shadow-lg">{event.title}</h1>
                </div>
            </div>

            {/* Event Details + Map */}
            <div data-aos="fade-up" className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6 py-10 bg-white -mt-16 shadow-xl rounded-xl relative z-10">
                {/* Left: Details */}
                <div className="md:col-span-2 space-y-4">
                    <div className="text-gray-700 space-y-2">
                        <p className="flex items-center gap-2 text-lg font-semibold">
                            <FaMapMarkerAlt className="text-red-600" /> {event.location}
                        </p>
                        <p className="flex items-center gap-2 text-lg font-semibold">
                            <FaCalendarAlt className="text-blue-600" /> {event.startDate}
                        </p>
                        <p className="flex items-center gap-2 text-lg font-semibold">
                            <FaMoneyBillAlt className="text-green-600" /> {event.price}
                        </p>


                    </div>

                    <p className="text-gray-800 text-lg leading-relaxed">{event.description}</p>

                    <button className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition">
                        Register Now
                    </button>
                </div>

                {/* Right: Map Embed */}
                <div className="rounded-xl overflow-hidden shadow-lg w-full h-80">
                    <iframe
                        title="Google Maps"
                        width="100%"
                        height="100%"
                        loading="lazy"
                        allowFullScreen
                        src={`https://www.google.com/maps?q=Niger&output=embed`}
                    ></iframe>
                </div>
            </div>

            {/* Comments */}
            <div className="max-w-4xl mx-auto mt-10 mb-8 px-4">
                <h2 className="text-2xl font-bold mb-4">Comments</h2>
                <div className="space-y-4">
                    <Comment id={1} content="This looks amazing!" />
                    <Comment id={2} content="I’ve been to the last one, it was insane!" />
                    <Comment id={3} content="Any age restriction for the event?" />
                </div>
            </div>

            {/* Similar Events */}
            <hr className="border-gray-300 max-w-6xl mx-auto my-8" />
            <div className="max-w-6xl mx-auto px-4 pb-16">
                <h2 className="text-2xl font-bold mb-4">Similar Events</h2>

                <div className="relative overflow-hidden">
                    <div className="flex w-max animate-scroll space-x-6">
                        {[...eventStore.mockEvents.filter(e => e.id !== event.id).slice(0, 10),
                        ...eventStore.mockEvents.filter(e => e.id !== event.id).slice(0, 10)]
                            .map(e => (
                                <Link
                                    key={`${e.id}-${Math.random()}`}
                                    to={`/event/${e.id}`}
                                    className="min-w-[300px] max-w-[300px] flex-shrink-0 snap-center bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                                >
                                    <img
                                        src={e.image}
                                        alt={e.title}
                                        className="h-40 w-full object-cover"
                                    />
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold mb-1">{e.title}</h3>
                                        <p className="text-gray-600 text-sm line-clamp-3">{e.description}</p>
                                    </div>
                                </Link>
                            ))}
                    </div>
                </div>
            </div>

            <Subscribe />
        </div>
    );
};

export default Event;
