import { useParams } from 'react-router-dom';
import { eventStore } from '../store/eventStore';
import { useEffect, useState } from 'react';
import Comment from '../components/Comment';
import { FaMapMarkerAlt, FaCalendarAlt, FaMoneyBillAlt, FaMinus, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Subscribe from '../components/Subscribe';
import { observer } from 'mobx-react-lite';
import { loadStripe } from '@stripe/stripe-js';

const Event = observer(() => {
	const { id } = useParams();
	const [event, setEvent] = useState(null);
	const [count, setCount] = useState(1);

	useEffect(() => {
		const fetchEvent = async () => {
			try {
				const data = await eventStore.fetchEventById(id);
				setEvent(data);
			} catch (error) {
				console.error('Error fetching event:', error);
			}
		};
		fetchEvent();
	}, [id]);

	if (eventStore.loading) {
		return <div className='mt-20 text-xl text-center'>Loading...</div>;
	}

	if (!event) {
		return (
			<div className='flex items-center justify-center h-screen'>
				<p className='text-xl text-gray-700'>Event not found 😢</p>
			</div>
		);
	}

	const handleBuy = async () => {
		try {
			const stripe = await loadStripe(import.meta.env.VITE_STRIPE_API_KEY);

			const response = await fetch('http://localhost:8000/api/payment/create-checkout-session', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
				body: JSON.stringify({
					items: [
						{
							name: event.title,
							amount: Math.round(event.price * 100), // Stripe expects amount in cents
							quantity: count,
							image: event.poster,
						},
					],
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Stripe checkout failed');
			}

			const data = await response.json();

			const result = await stripe.redirectToCheckout({
				sessionId: data.sessionId,
			});

			if (result.error) {
				console.error(result.error.message);
			}
		} catch (err) {
			console.error(err);
		}
	};

	const increase = () => {
		if (count < event.ticket_limit) setCount(prev => Number(prev) + 1);
	};

	const decrease = () => {
		if (count > 1) setCount(prev => Number(prev) - 1);
	};

	const handleChange = e => {
		const value = parseInt(e.target.value);
		if (!isNaN(value) && value >= 1 && value <= event.ticket_limit) {
			setCount(value);
		} else if (e.target.value === '') {
			setCount('');
		}
	};

	const handleBlur = () => {
		if (count === '' || count < 1) {
			setCount(1);
		}
	};

	const handleMapClick = () => {
		const query = encodeURIComponent(event.location);
		window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
	};

	return (
		<div className='min-h-screen bg-gray-100'>
			{/* Hero */}
			<div className='relative bg-center bg-cover h-96' style={{ backgroundImage: `url('${event.poster || 'https://picsum.photos/1920/1080'}')` }}>
				<div className='absolute inset-0 flex items-center justify-center bg-opacity-50'>
					<h1 className='text-4xl font-bold text-white md:text-5xl drop-shadow-lg'>{event.title}</h1>
				</div>
			</div>

			{/* Event Details + Map */}
			<div data-aos='fade-up' className='relative z-10 grid max-w-6xl grid-cols-1 gap-8 px-6 py-10 mx-auto -mt-16 bg-white shadow-xl md:grid-cols-3 rounded-xl'>
				{/* Left: Details */}
				<div className='space-y-4 md:col-span-2'>
					<div className='space-y-2 text-gray-700'>
						<p className='flex items-center gap-2 text-lg font-semibold'>
							<FaMapMarkerAlt className='text-red-600' /> {event.location}
						</p>
						<p className='flex items-center gap-2 text-lg font-semibold'>
							<FaCalendarAlt className='text-blue-600' /> {new Date(event.date).toLocaleString()}
						</p>
						<p className='flex items-center gap-2 text-lg font-semibold'>
							<FaMoneyBillAlt className='text-green-600' /> ${event.price}
						</p>
					</div>

					<p className='text-lg leading-relaxed text-gray-800'>{event.description}</p>

					<button className='px-6 py-3 mt-8 font-semibold text-white transition bg-blue-600 shadow-md hover:bg-blue-700 rounded-xl'>Register Now</button>
					<div className='flex flex-col items-start gap-4 mt-6'>
						<label className='text-lg font-medium text-gray-700'>Number of tickets</label>
						<div className='flex items-center gap-4'>
							<div className='flex items-center bg-gray-100 border border-gray-300 rounded-lg shadow-inner'>
								<button onClick={decrease} className='px-4 py-2 text-gray-700 transition hover:text-red-500'>
									<FaMinus />
								</button>
								<input
									type='number'
									value={count}
									onChange={handleChange}
									onBlur={handleBlur}
									min={1}
									max={100}
									className='w-16 px-2 py-2 text-lg text-center text-gray-800 bg-white border-0 outline-none'
								/>
								<button onClick={increase} className='px-4 py-2 text-gray-700 transition hover:text-green-500'>
									<FaPlus />
								</button>
							</div>

							<button onClick={handleBuy} className='px-6 py-2 font-semibold text-white transition bg-blue-600 rounded-lg shadow hover:bg-blue-700'>
								Buy {count || 1} ticket{count > 1 ? 's' : ''}
							</button>
						</div>
					</div>
				</div>

				{/* Right: Map Embed */}
				<div className='w-full overflow-hidden shadow-lg rounded-xl h-80'>
					<iframe
						title='Google Maps'
						width='100%'
						height='100%'
						loading='lazy'
						allowFullScreen
						src={`https://www.google.com/maps?q=${encodeURIComponent(event.location)}&output=embed`}
					></iframe>
				</div>
			</div>

			{/* Comments */}
			<div className='max-w-4xl px-4 mx-auto mt-10 mb-8'>
				<h2 className='mb-4 text-2xl font-bold'>Comments</h2>
				<div className='space-y-4'>
					<Comment id={1} content='This looks amazing!' />
					<Comment id={2} content='I’ve been to the last one, it was insane!' />
					<Comment id={3} content='Any age restriction for the event?' />
				</div>
			</div>

			{/* Similar Events */}
			<hr className='max-w-6xl mx-auto my-8 border-gray-300' />
			<div className='max-w-6xl px-4 pb-16 mx-auto'>
				<h2 className='mb-4 text-2xl font-bold'>Similar Events</h2>

				<div className='relative overflow-hidden'>
					<div className='flex space-x-6 w-max animate-scroll'>
						{[...eventStore.events.filter(e => e.id !== event.id).slice(0, 10)].map(e => (
							<Link
								key={e.id}
								to={`/event/${e.id}`}
								className='min-w-[300px] max-w-[300px] flex-shrink-0 snap-center bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300'
							>
								<img src={e.poster || 'https://picsum.photos/300/200'} alt={e.title} className='object-cover w-full h-40' />
								<div className='p-4'>
									<h3 className='mb-1 text-lg font-semibold'>{e.title}</h3>
									<p className='text-sm text-gray-600 line-clamp-3'>{e.description}</p>
								</div>
							</Link>
						))}
					</div>
				</div>
			</div>

			<Subscribe />
		</div>
	);
});

export default Event;
