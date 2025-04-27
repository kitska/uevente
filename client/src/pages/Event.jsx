import { useParams } from 'react-router-dom';
import { eventStore } from '../store/eventStore';
import { useEffect, useState } from 'react';
import Comment from '../components/Comment';
import { FaMapMarkerAlt, FaCalendarAlt, FaMoneyBillAlt, FaMinus, FaPlus } from 'react-icons/fa';
import Subscribe from '../components/Subscribe';
import SimilarEvents from '../components/SimilarEvents';
import CompanyEvents from '../components/CompanyEvents';
import { observer } from 'mobx-react-lite';
import { loadStripe } from '@stripe/stripe-js';
import { api } from '../services';
import { PiStar, PiStarFill } from 'react-icons/pi';
import { userStore } from '../store/userStore';
import Swal from 'sweetalert2';
import Attendees from '../components/Attendees';

const Event = observer(() => {
	const { id } = useParams();
	const [event, setEvent] = useState(null);
	const [count, setCount] = useState(1);
	const [showPromo, setShowPromo] = useState(false);
	const [promoCode, setPromoCode] = useState('');
	const [discountPercent, setDiscountPercent] = useState(0);
	const [comments, setComments] = useState([]);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isAdmin, setIsAdmin] = useState(false);
	const [showCommentBox, setShowCommentBox] = useState(false);
	const [newComment, setNewComment] = useState('');
	const [loadingComment, setLoadingComment] = useState(false);
	const [promoMessage, setPromoMessage] = useState('');
	const [promocodeId, setPromocodeId] = useState('');
	const [promoError, setPromoError] = useState(false);

	const [favourited, setFavourited] = useState(false);
	useEffect(() => {
		const fetchEvent = async () => {
			try {
				const data = await eventStore.fetchEventById(id);
				setEvent(data);
				
				// console.log(userStore.isEventSubscribed(data.id));
				setFavourited(userStore.isEventSubscribed(data.id));
			} catch (error) {
				console.error('Error fetching event:', error);
			}
		};

		const fetchComments = async () => {
			try {
				const res = await api.get(`http://localhost:8000/api/comments/event/${id}`);
				const data = res.data.data;

				setComments(data.reverse());
			} catch (error) {
				console.error('Error fetching comments:', error);
			}
		};

		const checkLogin = () => {
			const token = localStorage.getItem('token');
			setIsLoggedIn(!!token);
		};

		const checkIsAdmin = () => {
			setIsAdmin(userStore?.user?.isAdmin);
		};

		fetchEvent();
		fetchComments();
		checkLogin();
		checkIsAdmin();

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
			if (!userStore?.user?.id) {
				Swal.fire('Error', 'Dear user, don\'t be an <b>idiot</b>. <p>Login to continue!</p>', 'error');
				return;
			}
			const stripe = await loadStripe(import.meta.env.VITE_STRIPE_API_KEY);
			const finalPrice = discountPercent > 0 ? Math.round(event.price * (1 - discountPercent / 100) * 100) : Math.round(event.price * 100);
			const paymentResponse = await api.post(`/payment`, {
				userId: userStore.user.id,
				amount: finalPrice,
				quantity: count,
				eventId: id,
				status: 'pending',
				promocodeId: promocodeId,
			});
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
							amount: finalPrice,
							quantity: count,
							image: event.poster,
						},
					],
					paymentId: paymentResponse.data.payment.id,
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

	const handleCommentSubmit = async () => {
		if (!newComment.trim()) return;

		setLoadingComment(true);
		try {
			const res = await api.post(
				`/comments/${id}`,
				{ content: newComment },
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			);

			if (res.status != 201) throw new Error('Failed to create a comment!');

			setComments(prev => [res.data, ...prev]);
			setNewComment('');
			setShowCommentBox(false);
		} catch (err) {
			console.error(err);
		} finally {
			setLoadingComment(false);
		}
	};

	const handleApplyPromo = async () => {
		if (!promoCode.trim()) return;

		try {
			const res = await api.post('/promocodes/validate', {
				code: promoCode.trim(),
				eventId: id,
				userId: userStore.user.id,
			});

			if (res.status === 200) {
				const { message, discount, id } = res.data;
				setPromocodeId(id);
				setPromoMessage(message);
				setPromoError(false);
				setDiscountPercent(discount);
			}
		} catch (error) {
			console.error('Promo code validation error:', error);
			setPromoMessage(error.response?.data?.message || 'Failed to apply promo code');
			setPromoError(true);
		}
	};

	const handleDeleteComment = async commentId => {
		try {
			await api.delete(`/comments/${commentId}`, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			});
			setComments(prev => prev.filter(c => c.id !== commentId));
		} catch (err) {
			console.error('Error deleting comment:', err);
		}
	};

	return (
		<div className='min-h-screen bg-gray-100'>
			{/* Header image */}
			<div
				className='relative bg-cover h-200'
				style={{
					backgroundImage: `url('${event.poster || 'http://localhost:8000/avatars/mr.penis.png'}')`,
					backgroundPosition: 'center 10%', // move background down from center
				}}
			>
				<div className='absolute inset-0 flex items-center justify-center bg-opacity-50'>
					<h1 className='text-4xl font-bold text-white md:text-5xl drop-shadow-lg'>{event.title}</h1>
				</div>
			</div>

			{/* Event details */}
			<div className='relative z-10 grid max-w-6xl grid-cols-1 gap-8 px-6 pt-5 pb-10 mx-auto -mt-16 bg-white shadow-xl md:grid-cols-3 rounded-xl'>
				<div className='space-y-4 md:col-span-2'>
					<button
						onClick={() => {
							const newValue = !favourited;
							setFavourited(newValue);
							eventStore.handleSubscribe(newValue, event.id);
							newValue ? userStore.addSub(event) : userStore.removeSub(event);
						}}
						className='flex items-center justify-center p-2 hover:scale-110'
					>
						{favourited ? <PiStarFill size={24} color='#FACC15' /> : <PiStar size={24} />}
					</button>
					<div className='space-y-2 text-gray-700'>
						<p className='flex items-center gap-2 text-lg font-semibold'>
							<FaMapMarkerAlt className='text-red-600' /> {event.location}
						</p>
						<p className='flex items-center gap-2 text-lg font-semibold'>
							<FaCalendarAlt className='text-blue-600' /> {new Date(event.date).toLocaleString()}
						</p>
						<p className='flex items-center gap-2 text-lg font-semibold'>
							<FaMoneyBillAlt className='text-green-600' />
							{discountPercent > 0 ? (
								<>
									<span className='mr-2 text-red-500 line-through'>${Number(event.price).toFixed(2)}</span>
									<span className='font-bold text-green-600'>${Number(event.price * (1 - discountPercent / 100)).toFixed(2)}</span>
								</>
							) : (
								<span>${Number(event.price).toFixed(2)}</span>
							)}
						</p>
					</div>

					<p className='text-lg leading-relaxed text-gray-800 break-words'>{event.description}</p>
					<div className='pt-4 mt-4 border-t border-gray-200'>
						<div className='flex justify-between flex-wrap gap-4 mb-6'>
							{event.themes?.length > 0 && (
								<div>
									<h4 className='font-semibold text-gray-800'>Themes:</h4>
									<div className='flex flex-wrap gap-2 mt-1'>
										{event.themes.map(theme => (
											<span
												key={theme.id}
												className='px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full'
											>
												{theme.title}
											</span>
										))}
									</div>
								</div>
							)}
							{event.formats?.length > 0 && (
								<div>
									<h4 className='font-semibold text-gray-800'>Formats:</h4>
									<div className='flex flex-wrap gap-2 mt-1'>
										{event.formats.map(format => (
											<span
												key={format.id}
												className='px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full'
											>
												{format.title}
											</span>
										))}
									</div>
								</div>
							)}
						</div>
						{/* <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-start'> */}
						<div>
							<h3 className='mb-2 text-xl font-semibold text-gray-800'>Organised by {event.company?.name || 'N/A'}</h3>
							{/* <p className='text-gray-700'>
								<span className='font-medium'>We are located in {event.company?.location || 'N/A'}</span> 
							</p>
							<p className='text-gray-700'>
								<span className='font-medium'>For any questions contact us </span> {event.company?.email || 'N/A'}
							</p> */}
						</div>

						{/* Subscribe to organizer */}
						<div className='mt-2'>
							<p className='text-sm text-gray-600'>Want to get notifications about this organiser’s events?</p>
						</div>
						{/* </div> */}
					</div>

				</div>

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
				<div className='space-y-4 md:col-span-4'>
					<div className='w-full p-6 mt-2 transition-all duration-300 border border-gray-200 shadow-xl bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl'>
						<h3 className='mb-4 text-2xl font-bold text-gray-800'>🎟️ Ticket Selection</h3>

						{/* Ticket Counter */}
						<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
							<div className='flex items-center'>
								<span className='mr-4 text-lg font-medium text-gray-700'>Number of tickets:</span>
								<div className='flex items-center overflow-hidden bg-white border border-gray-300 rounded-full shadow-inner'>
									<button onClick={decrease} className='px-4 py-2 text-gray-600 transitio hover:text-red-600'>
										<FaMinus />
									</button>
									<input
										type='number'
										value={count}
										onChange={handleChange}
										onBlur={handleBlur}
										min={1}
										max={100}
										className='w-16 px-2 py-2 text-lg font-semibold text-center bg-transparent outline-none'
									/>
									<button onClick={increase} className='px-4 py-2 text-gray-600 transition hover:text-green-600'>
										<FaPlus />
									</button>
								</div>
							</div>

							{/* Buy Button */}
							<button
								onClick={handleBuy}
								className='flex items-center gap-2 px-6 py-3 text-white bg-blue-600 rounded-full shadow-lg transition hover:bg-blue-700 hover:scale-[1.02]'
							>
								<FaMoneyBillAlt />
								<span className='text-lg font-semibold'>
									Buy {count || 1} ticket{count > 1 ? 's' : ''}
								</span>
							</button>
						</div>

						{/* Promo Code */}
						<div className='mt-6'>
							<button onClick={() => setShowPromo(prev => !prev)} className='text-sm font-semibold text-blue-500'>
								{showPromo ? 'Hide promo code' : 'Have a promo code?'}
							</button>

							{showPromo && (
								<>
									<div className='flex flex-col gap-2 mt-3 sm:flex-row sm:items-center'>
										<input
											type='text'
											value={promoCode}
											onChange={e => setPromoCode(e.target.value)}
											placeholder='Enter promo code'
											className='flex-1 px-4 py-2 text-sm border border-gray-300 shadow-sm rounded-xl focus:ring focus:ring-blue-200 focus:outline-none'
										/>
										<button
											onClick={handleApplyPromo}
											className='px-5 py-2 text-sm font-semibold text-white transition bg-green-600 rounded-full hover:bg-green-700'
										>
											Apply
										</button>
									</div>
									{promoMessage && <p className={`text-sm mt-1 ${promoError ? 'text-red-500' : 'text-green-600'}`}>{promoMessage}</p>}
								</>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Comments */}
			<div className='px-4 max-w-6xl mx-auto mt-10 mb-8'>
				<div className='flex items-center justify-between mb-4'>
					<h2 className='text-2xl font-bold'>Comments</h2>
					{isLoggedIn && (
						<button onClick={() => setShowCommentBox(prev => !prev)} className='px-4 py-2 text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700'>
							{showCommentBox ? 'Cancel' : 'Create Comment'}
						</button>
					)}
				</div>

				{showCommentBox && (
					<div className='mb-6'>
						<textarea
							className='w-full p-3 border border-gray-300 rounded-lg resize-none'
							rows={4}
							placeholder='Type your comment here...'
							value={newComment}
							onChange={e => setNewComment(e.target.value)}
						/>
						<button
							onClick={handleCommentSubmit}
							disabled={loadingComment}
							className='px-4 py-2 mt-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50'
						>
							{loadingComment ? 'Submitting...' : 'Submit Comment'}
						</button>
					</div>
				)}

				<div className='space-y-4'>
					{comments.length > 0 ? (
						comments.map(comment => <Comment key={comment.id} id={comment.id} content={comment.content} isAdmin={isAdmin} onDelete={handleDeleteComment} />)
					) : (
						<p className='text-gray-500'>No comments yet.</p>
					)}
				</div>
			</div>

			{/* Attendees */}
			<Attendees event={event}/>

			{/* Company Events */}
			<CompanyEvents event={event} />

			{/* Similar Events */}
			<SimilarEvents event={event} />

			{/* Subscribe Section */}
			{/* <Subscribe /> */}
		</div>
	);
});

export default Event;
