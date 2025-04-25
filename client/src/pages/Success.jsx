// src/pages/Success.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Success = () => {
    return (
        <div className="bg-green-50 flex items-center justify-center min-h-screen">
            <div className="text-center p-8 bg-white shadow-xl rounded-xl max-w-md">
                <h1 className="text-3xl font-bold text-green-600 mb-4">🎉 Purchase Successful!</h1>
                <p className="text-gray-700 mb-6">Thank you for your purchase. Your ticket has been confirmed.</p>
                <Link
                    to="/"
                    className="inline-block bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition"
                >
                    Go to Main Page
                </Link>
            </div>
        </div>
    );
};

export default Success;
