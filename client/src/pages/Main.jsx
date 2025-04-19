import React, { useEffect, useState } from 'react';
import HeroSlider from '../components/HeroSlider';
import EventFilters from '../components/EventFilters';
import EventCard from '../components/EventCard';
import Pagination from '../components/Pagination';
import { Link, useSearchParams } from 'react-router-dom';
import { eventStore } from '../store/eventStore';
import Subscribe from '../components/Subscribe';
import { observer } from 'mobx-react-lite';

const Main = observer(() => {
	const [filters, setFilters] = useState({});
	const [searchParams] = useSearchParams();
	const page = parseInt(searchParams.get('page')) || 1;
	const pageSize = 60;

	useEffect(() => {
		eventStore.fetchEvents(page, pageSize);
	}, [page]);

	const filteredEvents = eventStore.events?.filter(e => {
		return true;
	});

	const totalPages = Math.ceil(filteredEvents?.length / pageSize);

	return (
		<>
			<main>
				<HeroSlider />

				<section className='px-4 mt-10'>
					<EventFilters filters={filters} onChange={setFilters} />
				</section>

				<section className='px-4 py-8'>
					<div className='flex flex-wrap justify-center gap-15'>
						{eventStore.loading && <p>Loading events ...</p>}
						{eventStore.error && <p className='text-red-500'>{eventStore.error}</p>}
						{!eventStore.loading &&
							filteredEvents?.map(event => (
								<Link key={event.id} to={`/event/${event.id}`}>
									<EventCard event={event} />
								</Link>
							))}
					</div>
				</section>

				<section>
					<Pagination currentPage={page} totalPages={totalPages} />
				</section>

				<Subscribe />
			</main>
		</>
	);
});

export default Main;
