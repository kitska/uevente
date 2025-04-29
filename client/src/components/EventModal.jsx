import React, { useRef, useState, useEffect } from 'react';
import { api } from '../services';
import { promoService } from '../services/pronoService';

const EventModal = ({ show, onClose, onSubmit, form, onChange, setForm }) => {
	const fileInputRef = useRef();
	const [promoDiscount, setPromoDiscount] = useState('');
	const [promoCodes, setPromoCodes] = useState([]);
	const [creatingPromo, setCreatingPromo] = useState(false);

	const handleGeneratePromo = async () => {
		if (!promoDiscount) return;

		try {
			setCreatingPromo(true);
			const newPromo = await promoService.createPromocode({
				eventId: form.id,
				discount: promoDiscount,
			});
			setPromoCodes(prev => [...prev, newPromo]);
			setPromoDiscount('');
		} catch (error) {
			console.error('Failed to create promocode', error);
		} finally {
			setCreatingPromo(false);
		}
	};

	const handleDeletePromo = async id => {
		try {
			await promoService.deletePromocode(id);
			setPromoCodes(prev => prev.filter(promo => promo.id !== id));
		} catch (error) {
			console.error('Failed to delete promocode', error);
		}
	};

	useEffect(() => {
		const fetchPromos = async () => {
			if (!form.id) return;
			try {
				const data = await promoService.getPromocodesByEvent(form.id);
				setPromoCodes(data);
			} catch (error) {
				console.error('Failed to load promocodes', error);
			}
		};

		fetchPromos();
	}, [!form.id]);

	const today = new Date().toISOString().split('T')[0]; // yyyy-mm-dd format

	if (!show) return null;

	const handleFileUpload = async e => {
		const file = e.target.files[0];
		if (!file) return;

		try {
			const formData = new FormData();
			formData.append('file', file);

			const res = await api.post('/events/upload-poster', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});

			const imageUrl = res.data.url;
			setForm(prev => ({ ...prev, poster: imageUrl }));
		} catch (err) {
			console.error('Upload failed:', err);
		}
	};

	const handleCheckboxChange = e => {
		setForm(prev => ({ ...prev, receiveEmails: e.target.checked }));
	};

	const handleVisibilityChange = e => {
		setForm(prev => ({ ...prev, visibility: e.target.value }));
	};

	const handlePublishDateChange = e => {
		const publishDate = e.target.value;
		setForm(prev => ({
			...prev,
			publishDate,
			// if event date already selected and it's before new publish date -> reset event date
			date: prev.date && prev.date < publishDate ? '' : prev.date,
		}));
	};

	const previewSrc = typeof form.poster === 'string' ? form.poster : form.poster instanceof File ? URL.createObjectURL(form.poster) : '';

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30'>
			<div className='bg-white rounded-lg p-8 w-full max-w-6xl shadow-lg overflow-y-auto max-h-[90vh] flex gap-8'>
				{/* Левая часть — форма создания события */}
				<div className='flex-1 space-y-8'>
					<h3 className='text-3xl font-semibold text-gray-800'>Create Event</h3>
					<form className='grid grid-cols-1 gap-6 md:grid-cols-2'>
						{/* Title */}
						<input
							type='text'
							name='title'
							placeholder='Title'
							value={form.title}
							onChange={onChange}
							className='w-full p-3 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
						/>

						{/* Location */}
						<input
							type='text'
							name='location'
							placeholder='Location'
							value={form.location}
							onChange={onChange}
							className='w-full p-3 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
						/>

						{/* Description */}
						<textarea
							name='description'
							placeholder='Description'
							value={form.description}
							onChange={onChange}
							className='w-full p-3 text-gray-700 border border-gray-300 rounded-lg md:col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
							rows='4'
						/>

						{/* Price */}
						<input
							type='number'
							name='price'
							placeholder='Price'
							value={form.price}
							onChange={onChange}
							className='w-full p-3 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
						/>

						{/* Ticket Limit */}
						<input
							type='number'
							name='ticket_limit'
							placeholder='Ticket Limit'
							value={form.ticket_limit}
							onChange={onChange}
							className='w-full p-3 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
						/>

						{/* Publish Date */}
						<div className='flex flex-col'>
							<label className='mb-1 text-sm text-gray-500'>Publish Date</label>
							<input
								type='date'
								name='publishDate'
								value={form.publishDate || ''}
								onChange={handlePublishDateChange}
								min={today}
								className='w-full p-3 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
							/>
						</div>

						{/* Event Date */}
						<div className='flex flex-col'>
							<label className='mb-1 text-sm text-gray-500'>Event Date</label>
							<input
								type='date'
								name='date'
								value={form.date || ''}
								onChange={onChange}
								min={form.publishDate || today}
								className='w-full p-3 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
							/>
						</div>

						{/* Visibility */}
						<div className='flex flex-col'>
							<label className='mb-1 text-sm text-gray-500'>Attendee Visibility</label>
							<select
								name='visibility'
								value={form.visibility}
								onChange={handleVisibilityChange}
								className='w-full p-3 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
							>
								<option value='everyone'>Everyone can see attendees</option>
								<option value='attendees'>Only attendees can see other attendees</option>
							</select>
						</div>

						{/* Receive Emails Checkbox */}
						<div className='flex flex-col'>
							<label className='mb-1 text-sm text-gray-500'>Emails</label>
							<div className='flex items-center py-3'>
								<input
									type='checkbox'
									id='receiveEmails'
									name='receiveEmails'
									checked={form.receiveEmails}
									onChange={handleCheckboxChange}
									className='w-4 h-4 text-blue-600 rounded focus:ring-blue-500'
								/>
								<label htmlFor='receiveEmails' className='ml-2 text-gray-700'>
									Receive new attendees email
								</label>
							</div>
						</div>

						{/* Poster Input */}
						<div className='flex flex-col space-y-2 md:col-span-2'>
							<input
								type='text'
								name='poster'
								placeholder='Poster (Image URL)'
								value={typeof form.poster === 'string' ? form.poster : ''}
								onChange={onChange}
								className='w-full p-3 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
							/>

							<div className='flex items-center gap-3'>
								<button
									type='button'
									onClick={() => fileInputRef.current.click()}
									className='px-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200'
								>
									Upload Image
								</button>
								<input type='file' ref={fileInputRef} accept='image/*' onChange={handleFileUpload} className='hidden' />
							</div>

							{previewSrc && (
								<div className='mt-2 text-center'>
									<img src={previewSrc} alt='Preview' className='mx-auto rounded-md shadow max-h-48' />
								</div>
							)}
						</div>
					</form>

					{/* Кнопки */}
					<div className='flex items-center justify-end gap-4 mt-6'>
						<button onClick={onClose} className='px-4 py-2 text-gray-500 rounded-md cursor-pointer hover:text-gray-700'>
							Cancel
						</button>
						<button
							onClick={onSubmit}
							className='px-6 py-2 m-5 text-white bg-blue-500 rounded-md cursor-pointer hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400'
						>
							Create
						</button>
					</div>
				</div>

				{/* Правая часть — промокоды */}
				<div className='flex flex-col w-full max-w-xs space-y-6'>
					<h4 className='text-2xl font-semibold text-gray-800'>Promocodes</h4>

					{/* Ввод скидки */}
					<div className='flex flex-col gap-2'>
						<input
							type='number'
							placeholder='Discount (%)'
							value={promoDiscount}
							onChange={e => {
								const value = parseInt(e.target.value);
								if (!isNaN(value) && value >= 1 && value <= 100) {
									setPromoDiscount(value);
								} else if (e.target.value === '') {
									setPromoDiscount('');
								}
							}}
							className='w-full p-3 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
						/>
						<button
							onClick={handleGeneratePromo}
							type='button'
							className='py-2 text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400'
						>
							Generate Promocode
						</button>
					</div>

					{/* Список промокодов */}
					<div className='flex flex-col gap-3 overflow-y-auto max-h-72'>
						{promoCodes.map((promo, idx) => (
							<div key={idx} className='flex items-center justify-between p-3 border border-gray-200 rounded-md'>
								<div>
									<p className='font-medium text-gray-800'>{promo.code}</p>
									<p className='text-sm text-gray-500'>{promo.discount}%</p>
								</div>
								<button onClick={() => handleDeletePromo(promo.id)} className='text-xl text-red-500 hover:text-red-700'>
									×
								</button>
							</div>
						))}
						{promoCodes.length === 0 && <p className='text-sm text-center text-gray-400'>No promocodes yet</p>}
					</div>
				</div>
			</div>
		</div>
	);
};

export default EventModal;
