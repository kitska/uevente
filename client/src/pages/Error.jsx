// src/pages/Error.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Error = () => {
    return (
        <div className="bg-red-50 flex items-center justify-center min-h-screen">
            <div className="text-center p-8 bg-white shadow-xl rounded-xl max-w-md">
                <h1 className="text-3xl font-bold text-red-600 mb-4">❌ Purchase Failed</h1>
                <p className="text-gray-700 mb-6">Something went wrong with your ticket purchase. Please try again.</p>
                <Link
                    to="/"
                    className="inline-block bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition"
                >
                    Return to Main
                </Link>
            </div>
        </div>
    );
};

export default Error;
