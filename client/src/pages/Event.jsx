import { useParams } from 'react-router-dom';
import { eventStore } from '../store/eventStore';
import { useEffect, useState } from 'react';
import Comment from '../components/Comment';

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

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-10 bg-white -mt-16 shadow-xl rounded-xl relative z-10">
                <div className="mb-6 text-gray-700 space-y-2">
                    <p className="text-lg font-semibold">📍 {event.location}</p>
                    <p className="text-lg font-semibold">📅 {event.startDate}</p>
                    <p className="text-lg font-semibold">💸 {event.price}</p>
                    <button
                        onClick={handleMapClick}
                        className="mt-2 inline-block bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                    >
                        Show on Map
                    </button>
                </div>

                <p className="text-gray-800 text-lg leading-relaxed">{event.description}</p>

                <button className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition">
                    Register Now
                </button>
            </div>

            {/* Comments Section */}
            <div className="max-w-4xl mx-auto mt-8 mb-8">
                <h2 className="text-2xl font-bold mb-4">Comments</h2>
                <div className="space-y-4">
                    {/* Sample comments — these would come from state/backend later */}
                    <Comment id={1} content="This looks amazing! 🔥" />
                    <Comment id={2} content="I’ve been to the last one, it was insane!" />
                    <Comment id={3} content="Any age restriction for the event?" />
                </div>
            </div>
        </div>
    );
};

export default Event;
