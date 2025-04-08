import { useState } from 'react';
import { FaEnvelope } from 'react-icons/fa';

const Subscribe = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!email.includes('@')) {
            setMessage('Please enter a valid email address.');
            return;
        }

        console.log('Subscribed with:', email);
        setMessage('Thank you for subscribing!');
        setEmail('');
    };

    return (
        <div data-aos="fade-up" className="w-full mt-16">
            <div className="w-full bg-gradient-to-r from-blue-700 to-purple-700 text-white py-16 px-6 sm:px-12 rounded-none shadow-2xl">
                <h2 className="text-4xl font-bold mb-4 text-center">Stay in the loop!</h2>
                <p className="text-center mb-8 text-lg">Subscribe to our newsletter for updates, promotions, and more.</p>

                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-4xl mx-auto">
                    <div className="flex items-center bg-white rounded-full px-5 py-3 w-full md:w-2/3 shadow-md">
                        <FaEnvelope className="text-gray-600 mr-3" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="flex-grow outline-none text-gray-800 bg-transparent"
                        />
                    </div>
                    <button
                        type="submit"
                        className="border border-white cursor-pointer text-white font-semibold px-6 py-3 rounded-full hover:bg-white hover:text-blue-700 transition duration-300"
                    >
                        Subscribe
                    </button>
                </form>

                {message && (
                    <p className="text-center mt-6 text-sm font-medium text-white">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default Subscribe;
