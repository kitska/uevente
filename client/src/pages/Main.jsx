import React, { useEffect, useState } from 'react';
import HeroSlider from '../components/HeroSlider';
import EventFilters from '../components/EventFilters';
import EventCard from '../components/EventCard';
import Pagination from '../components/Pagination';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { eventStore } from '../store/eventStore';
import Subscribe from '../components/Subscribe';
import { observer } from 'mobx-react-lite';
import { userStore } from '../store/userStore';

const Main = observer(() => {
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();

	const page = parseInt(searchParams.get('page')) || 1;
	const pageSize = 60;

	// Filters from search params or state
	const filtersFromParams = {
		theme: searchParams.get('theme') || '',
		format: searchParams.get('format') || '',
		minPrice: searchParams.get('minPrice') || '',
		maxPrice: searchParams.get('maxPrice') || '',
		startDate: searchParams.get('startDate') || '',
		endDate: searchParams.get('endDate') || '',
	};

	const [filters, setFilters] = useState(filtersFromParams);

	useEffect(() => {
		eventStore.fetchEvents(page, pageSize, 'date', 'ASC', filters);  // Передаем фильтры в запрос
	}, [page, pageSize, filters]);  // При изменении страницы или фильтров перезапрашиваем события

	useEffect(() => {
		eventStore.fetchThemes();
		eventStore.fetchFormats();
	}, []);

	const events = eventStore.events || [];
	const totalPages = eventStore.totalPages || 1;

	const themes = eventStore.themes || [];
	const formats = eventStore.formats || [];

	const handlePageChange = newPage => {
		setSearchParams({ ...searchParams, page: newPage });
		navigate({ search: searchParams.toString() });
	};

	const handleClearAll = () => {
		setFilters({
			theme: '',
			format: '',
			minPrice: '',
			maxPrice: '',
			startDate: '',
			endDate: '',
		});
		setSearchParams({});  // Сбросить параметры фильтров в URL
	};

	const handleFilterChange = (newFilters) => {
		setFilters({ ...filters, ...newFilters });
		setSearchParams(newFilters);  // Обновить URL с новыми фильтрами
	};

	return (
		<>
			<main>
				<HeroSlider />

				<section className='px-4 mt-10 overflow-visible'>
					<EventFilters
						filters={filters}
						onChange={handleFilterChange}
						onClearAll={handleClearAll}
						themes={themes}
						formats={formats}
					/>
				</section>

				<section className='px-4 py-8 overflow-visible'>
					<div className='flex flex-wrap justify-center gap-15'>
						{eventStore.loading && <p>Loading events ...</p>}
						{eventStore.error && <p className='text-red-500'>{eventStore.error}</p>}
						{!eventStore.loading &&
							events.map(event => (
								<Link key={event.id} to={`/event/${event.id}`}>
									<EventCard event={event} />
								</Link>
							))}
					</div>
				</section>

				{totalPages > 1 && (
					<section>
						<Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
					</section>
				)}

				<Subscribe />
			</main>
		</>
	);
});

export default Main;
