import { useEffect, useRef, useState } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { getEventsByTheme } from '../services/eventService';

export default function SimilarEvents({ event }) {
	const scrollRef = useRef(null);
	const [similarEvents, setSimilarEvents] = useState([]);

	useEffect(() => {
		const loadSimilarEvents = async () => {
			if (!event?.themes || event.themes.length === 0) return;

			try {
				const allEventsMap = new Map(); // key: id, value: event

				for (const theme of event.themes) {
					const eventsByTheme = await getEventsByTheme(theme.id);
					for (const e of eventsByTheme) {
						if (e.id !== event.id && !allEventsMap.has(e.id)) {
							allEventsMap.set(e.id, e);
						}
					}
				}

				// ограничиваем до 10
				const uniqueEvents = Array.from(allEventsMap.values()).slice(0, 10);
				setSimilarEvents(uniqueEvents);
			} catch (error) {
				console.error('Failed to load similar events:', error);
			}
		};

		loadSimilarEvents();
	}, [event]);

	const scroll = direction => {
		const container = scrollRef.current;
		const scrollAmount = 320;
		if (direction === 'left') container.scrollLeft -= scrollAmount;
		if (direction === 'right') container.scrollLeft += scrollAmount;
	};

	if (similarEvents.length === 0) return null;

	const showArrows = similarEvents.length > 4;

	return (
		<>
			<hr className='max-w-6xl mx-auto my-8 border-gray-300' />
			<div className='max-w-6xl px-4 mx-auto mb-10'>
				<h2 className='mb-4 text-2xl font-bold'>Similar Events</h2>

				<div className='relative'>
					{showArrows && (
						<button onClick={() => scroll('left')} className='absolute left-0 z-10 p-2 -translate-y-1/2 bg-white rounded-full shadow top-1/2 hover:bg-gray-100'>
							<FaArrowLeft className='w-5 h-5' />
						</button>
					)}

					<div ref={scrollRef} className='flex space-x-5 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide'>
						{similarEvents.map(e => (
							<a
								key={e.id}
								href={`/event/${e.id}`}
								className='min-w-[300px] max-w-[300px] flex-shrink-0 snap-center bg-white rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300'
							>
								<img src={e.poster || 'https://picsum.photos/300/200'} alt={e.title} className='object-cover w-full h-40' />
								<div className='p-4'>
									<h3 className='mb-1 text-lg font-semibold'>{e.title}</h3>
									<p className='text-sm text-gray-600 line-clamp-3'>{e.description}</p>
								</div>
							</a>
						))}
					</div>

					{showArrows && (
						<button onClick={() => scroll('right')} className='absolute right-0 z-10 p-2 -translate-y-1/2 bg-white rounded-full shadow top-1/2 hover:bg-gray-100'>
							<FaArrowRight className='w-5 h-5' />
						</button>
					)}
				</div>
			</div>
		</>
	);
}
