import { PaymentElement } from '@stripe/react-stripe-js';

const CheckoutForm = () => {
	return (
		<form>
			<PaymentElement />
			<button type='submit'>Pay</button>
		</form>
	);
};

export default CheckoutForm;
