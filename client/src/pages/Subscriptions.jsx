import { useParams } from 'react-router-dom';
import { eventStore } from '../store/eventStore';
import { useEffect, useState } from 'react';
import Comment from '../components/Comment';
import { FaMapMarkerAlt, FaCalendarAlt, FaMoneyBillAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Subscribe from '../components/Subscribe';
import { observer } from 'mobx-react-lite';
import { PiStar, PiStarFill } from "react-icons/pi";
import { userStore } from '../store/userStore';
import EventCard from '../components/EventCard';

const Subscriptions = observer(() => {
    const subscribedEvents = userStore.subscriptions.map(sub => sub.event);

    return (
        <div className='min-h-screen bg-gray-100 pt-10'>
            <div className='text-center text-4xl font-semibold mt-15'>Your Subscribed Events</div>

            <section className='px-4 py-8'>
                <div className='flex flex-wrap justify-center gap-10'>
                    {/* {userStore.loadingSubscriptions && <p>Loading subscriptions...</p>} */}
                    {/* {userStore.subscriptionError && <p className='text-red-500'>{userStore.subscriptionError}</p>} */}
                    {/* {!userStore.loadingSubscriptions && subscribedEvents.length === 0 && (
						<p className='text-gray-500'>You don’t have any subscriptions yet.</p>
					)} */}
                    {
                        subscribedEvents.map(event => (
                            <Link key={event.id} to={`/event/${event.id}`}>
                                <EventCard event={event} />
                            </Link>
                        ))}
                </div>
            </section>
        </div>
    );
});

export default Subscriptions;
