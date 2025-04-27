import { useEffect, useState, useRef } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { api } from '../services';

const Attendees = ({ event }) => {
    const [attendees, setAttendees] = useState([]);
    const [canView, setCanView] = useState(false);
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        const container = scrollRef.current;
        const scrollAmount = 320;
        if (direction === 'left') container.scrollLeft -= scrollAmount;
        if (direction === 'right') container.scrollLeft += scrollAmount;
    };

    useEffect(() => {
        const fetchAttendees = async () => {
            if (!event) return;

            if (!event.allAttendeesVisible) {
                if (localStorage.getItem('token') == null) {
                    setCanView(false);
                    return;
                }

                const response = await api.get('/users/tickets');
                const hasTicket = response.data.tickets.some(ticket => ticket.event.id === event.id);

                if (!hasTicket) {
                    setCanView(false);
                    return;
                }
            }

            const fetchedAttendees = await api.get(`/events/${event.id}/attendees`);
            setAttendees(fetchedAttendees.data.attendees);
            setCanView(true);
        };

        fetchAttendees();
    }, [event]);

    if (!canView || attendees.length === 0) {
        return <></>;
    }

    const showArrows = attendees.length > 6; // can adjust depending on how much space

    return (
        <>
            <hr className="max-w-6xl mx-auto my-8 border-gray-300" />
            <div className="px-4 max-w-6xl mx-auto mb-10">
                <h2 className="mb-4 text-2xl font-bold">Attendees</h2>

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
                        className="flex overflow-x-auto pt-3 pb-3 space-x-6 scroll-smooth snap-x snap-mandatory scrollbar-hide"
                    >
                        {attendees.map((user) => (
                            <div key={user.id} className="relative w-28 h-28 snap-center flex-shrink-0">
                                <div className="group w-full h-full rounded-full overflow-hidden border-2 border-white shadow-md bg-white cursor-pointer relative">
                                    {/* Profile Picture */}
                                    <img
                                        src={user.profilePicture || 'https://via.placeholder.com/150'}
                                        alt={user.fullName}
                                        className="w-full h-full object-cover rounded-full group-hover:opacity-0 transition duration-300"
                                    />
                                    {/* Info on hover */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 bg-white rounded-full">
                                        <p className="text-xs font-semibold text-gray-800">{user.fullName}</p>
                                        <p className="text-[10px] text-gray-500">@{user.login}</p>
                                    </div>
                                </div>
                            </div>
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

export default Attendees;
