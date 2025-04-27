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
import CompanyCard from '../components/CompanyCard';

const Subscriptions = observer(() => {
    const subscribedEvents = userStore.subscriptions;

    return (
        <div className='min-h-screen bg-gray-100 pt-10'>
            <div className='text-center text-4xl font-semibold mt-15'>Your Subscriptions</div>

            <section className='px-4 py-8'>
                <div className='flex flex-wrap justify-center gap-10'>
                    {/* {userStore.loadingSubscriptions && <p>Loading subscriptions...</p>} */}
                    {/* {userStore.subscriptionError && <p className='text-red-500'>{userStore.subscriptionError}</p>} */}
                    {/* {!userStore.loadingSubscriptions && subscribedEvents.length === 0 && (
						<p className='text-gray-500'>You don’t have any subscriptions yet.</p>
					)} */}
                    {
                        subscribedEvents.map(sub => sub.event != null ? (<Link key={sub.id} to={`/event/${sub.event.id}`}>
                            <EventCard event={sub.event} />
                        </Link>) : ((<Link key={sub.id} to={`/company/${sub.company.id}`}>
                            <CompanyCard company={sub.company} />
                        </Link>))

                        )}
                </div>
            </section>
        </div>
    );
});

export default Subscriptions;
