import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import EventCard from '../components/EventCard';
import Pagination from '../components/Pagination';
import Subscribe from '../components/Subscribe';
import { getEventsByTheme, getThemeById } from '../services/eventService';

const ThemeEvents = () => {
	const { id } = useParams();
	const [theme, setTheme] = useState('');
	const [events, setEvents] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [page, setPage] = useState(1);
	const pageSize = 60;

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				const data = await getEventsByTheme(id);
				const themedata = await getThemeById(id);
				setTheme(themedata.title);
				setEvents(data);
			} catch (err) {
				console.error(err);
				setError('Failed to fetch events.');
			} finally {
				setLoading(false);
			}
		};

		fetchEvents();
	}, [id]);

	const totalPages = Math.ceil(events.length / pageSize);
	const paginatedEvents = events.slice((page - 1) * pageSize, page * pageSize);

	return (
		<main>
			{/* <section className='px-8 overflow-visible mt-22'>
				<h1 className='mb-4 text-3xl font-bold'>Theme: {theme}</h1>
			</section> */}

			<section className='px-4 py-8 overflow-visible mt-22'>
				<div className='flex flex-wrap justify-center gap-15'>
					<h4 className='text-3xl font-semibold mb-8'>Theme : <span className='text-blue-300'>{theme}</span></h4>
				</div>
				<div className='flex flex-wrap justify-center gap-15'>
					{loading && <p>Loading events...</p>}
					{error && <p className='text-red-500'>{error}</p>}
					{!loading &&
						!error &&
						paginatedEvents.map(event => (
							<Link key={event.id} to={`/event/${event.id}`}>
								<EventCard event={event} />
							</Link>
						))}
				</div>
			</section>

			{totalPages > 1 && (
				<section>
					<Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
				</section>
			)}

			<Subscribe />

		</main>
	);
};

export default ThemeEvents;
