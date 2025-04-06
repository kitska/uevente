import { Elements } from '@stripe/react-stripe-js';
import { useEffect, useState } from 'react';
//import { stripePromise } from './utils/Stripe';
import { Routes, Route } from 'react-router-dom';
import CheckoutForm from './pages/Stripe';
import { CheckoutProvider } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const App = () => {
	const clientSecret = 'pi_1Hh1JpKZr6ejZ6gkAxKNJ4Yv_secret_KJ1wA9wWyZyUm3mYZ7DffuqVJ';

	const fetchClientSecret = async () => {
    const stripePromise = await loadStripe(import.meta.env.VITE_STRIPE_API_KEY);
		const response = await fetch('http://localhost:8000/api/auth/create-checkout-session', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				items: [
					{ name: 'Product 1', amount: 2000, quantity: 1 },
					{ name: 'Product 2', amount: 1500, quantity: 2 },
				],
			}),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error); // Throw an error if the response is not ok
		}

		const json = await response.json();
    const result = stripePromise.redirectToCheckout({
      sessionId:json.sessionId
    })
	};

	return <button onClick={fetchClientSecret}></button>;
};

export default App;
