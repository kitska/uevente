import React, { useEffect, useState } from 'react';
import HeroSlider from '../components/HeroSlider';
import EventFilters from '../components/EventFilters';
import EventCard from '../components/EventCard';
import Pagination from '../components/Pagination';
import { Link, useSearchParams } from 'react-router-dom';
import { eventStore } from '../store/eventStore'

const Main = () => {
    const [filters, setFilters] = useState({});
    const [searchParams] = useSearchParams();
    const page = parseInt(searchParams.get('page')) || 1;
    const pageSize = 60;

    const filteredEvents = eventStore.mockEvents.filter(e => {
        // Apply filtering if needed
        return true;
    });

    const paginatedEvents = filteredEvents.slice((page - 1) * pageSize, page * pageSize);
    const totalPages = Math.ceil(filteredEvents.length / pageSize);

    return (
        <>
            <main className="">
                <HeroSlider />

                <section className="px-4 mt-10">
                    <EventFilters filters={filters} onChange={setFilters} />
                </section>

                <section className="px-4 py-8">
                    <div className="flex flex-wrap justify-center gap-15">
                        {paginatedEvents.map(event => (
                            <Link to={`/event/${event.id}`}><EventCard key={event.id} event={event} /></Link>
                        ))}
                    </div>
                </section>


                <section className="pb-12">
                    <Pagination currentPage={page} totalPages={totalPages} />
                </section>
            </main>
        </>
    );
};

export default Main;
