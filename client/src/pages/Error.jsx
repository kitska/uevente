
import React from 'react';

function Error() {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-4xl font-bold text-red-600">404 Not Found</h1>
            <p className="mt-4 text-lg text-gray-700">The page you are looking for does not exist.</p>
            <a href="/" className="mt-6 text-blue-500 hover:underline">Go back to Home</a>
        </div>
    );
}

export default Error;
