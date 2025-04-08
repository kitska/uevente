import React from 'react';

const EventFilters = ({ filters, onChange }) => {
    return (
        <div data-aos="fade-up" className="bg-white rounded-lg shadow p-4 mb-8 flex flex-wrap gap-4">
            <input
                type="text"
                placeholder="Category"
                className="border px-3 py-2 rounded w-40"
                onChange={(e) => onChange({ ...filters, category: e.target.value })}
            />
            <input
                type="date"
                className="border px-3 py-2 rounded"
                onChange={(e) => onChange({ ...filters, date: e.target.value })}
            />
            <input
                type="text"
                placeholder="Price Range"
                className="border px-3 py-2 rounded w-40"
                onChange={(e) => onChange({ ...filters, price: e.target.value })}
            />
        </div>
    );
};

export default EventFilters;
