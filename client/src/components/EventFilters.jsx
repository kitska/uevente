import React, { useState } from 'react';
import { X } from 'lucide-react';

const EventFilters = ({ filters, onChange, onClearAll, themes = [], formats = [] }) => {
    const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
    const [formatDropdownOpen, setFormatDropdownOpen] = useState(false);
    const [openFilter, setOpenFilter] = useState(null);  // Track which filter is open

    const handleThemeChange = (themeName) => {
        const newThemes = filters.themes?.includes(themeName)
            ? filters.themes.filter((t) => t !== themeName)
            : [...(filters.themes || []), themeName];

        // Limit selection to 5 themes
        if (newThemes.length <= 5) {
            onChange({ ...filters, themes: newThemes });
        }
    };

    const handleFormatChange = (formatName) => {
        const newFormats = filters.formats?.includes(formatName)
            ? filters.formats.filter((f) => f !== formatName)
            : [...(filters.formats || []), formatName];

        // Limit selection to 5 formats
        if (newFormats.length <= 5) {
            onChange({ ...filters, formats: newFormats });
        }
    };

    const handleClearField = (field) => {
        onChange({ ...filters, [field]: [] });
    };

    const handleMinPriceChange = (e) => {
        const value = e.target.value;
        // Prevent setting a negative price
        if (value >= 0) {
            onChange({ ...filters, minPrice: value });
        }
    };

    const handleMaxPriceChange = (e) => {
        const value = e.target.value;
        // Prevent setting a negative price
        if (value >= 0) {
            onChange({ ...filters, maxPrice: value });
        }
    };

    const toggleDropdown = (filterType) => {
        if (openFilter === filterType) {
            setOpenFilter(null); // Close the dropdown if it was already open
        } else {
            setOpenFilter(filterType); // Open the selected dropdown and close others
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6 mb-8 flex flex-col gap-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-6 relative z-50">
                {/* Theme Multi-select Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => toggleDropdown('theme')}
                        className="border px-3 py-2 rounded w-48 text-left"
                    >
                        {filters.themes?.length ? filters.themes?.length === 5 ? `Max themes selected` : `${filters.themes.length} Theme(s) Selected` : 'Select Theme(s)'}
                    </button>
                    {openFilter === 'theme' && (
                        <div className="absolute w-48 mt-2 bg-white divide-y divide-gray-100 rounded-lg shadow-sm">
                            <ul className="p-3 space-y-3 text-sm text-gray-700">
                                {themes.map((theme) => (
                                    <li key={theme.id}>
                                        <div className="flex items-center">
                                            <input
                                                id={`theme-${theme.id}`}
                                                type="checkbox"
                                                checked={filters.themes?.includes(theme.title) || false}
                                                onChange={() => handleThemeChange(theme.title)}
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500"
                                                disabled={filters.themes?.length >= 5 && !filters.themes.includes(theme.title)} // Disable when 5 themes are selected
                                            />
                                            <label htmlFor={`theme-${theme.id}`} className="ml-2 text-sm font-medium text-gray-900">
                                                {theme.title}
                                            </label>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Format Multi-select Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => toggleDropdown('format')}
                        className="border px-3 py-2 rounded w-48 text-left"
                    >
                        {filters.formats?.length ? filters.formats?.length === 5 ? `Max formats selected` : `${filters.formats.length} Format(s) Selected` : 'Select Format(s)'}
                    </button>
                    {openFilter === 'format' && (
                        <div className="absolute z-50 w-48 mt-2 bg-white divide-y divide-gray-100 rounded-lg shadow-sm">
                            <ul className="p-3 space-y-3 text-sm text-gray-700">
                                {formats.map((format) => (
                                    <li key={format.id}>
                                        <div className="flex items-center">
                                            <input
                                                id={`format-${format.id}`}
                                                type="checkbox"
                                                checked={filters.formats?.includes(format.title) || false}
                                                onChange={() => handleFormatChange(format.title)}
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500"
                                                disabled={filters.formats?.length >= 5 && !filters.formats.includes(format.title)} // Disable when 5 formats are selected
                                            />
                                            <label htmlFor={`format-${format.id}`} className="ml-2 text-sm font-medium text-gray-900">
                                                {format.title}
                                            </label>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Price Filters */}
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        placeholder="Min Price"
                        className="border px-3 py-2 rounded w-24"
                        value={filters.minPrice || ''}
                        onChange={handleMinPriceChange}
                        onFocus={() => setOpenFilter(null)} // Close other dropdowns when focusing on the price filter
                    />
                    <span>-</span>
                    <input
                        type="number"
                        placeholder="Max Price"
                        className="border px-3 py-2 rounded w-24"
                        value={filters.maxPrice || ''}
                        onChange={handleMaxPriceChange}
                        onFocus={() => setOpenFilter(null)} // Close other dropdowns when focusing on the price filter
                    />
                </div>

                {/* Date Filters */}
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        className="border px-3 py-2 rounded bg-gray-50"
                        value={filters.startDate || ''}
                        onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
                        onFocus={() => setOpenFilter(null)} // Close other dropdowns when focusing on the date filter
                    />
                    <span>-</span>
                    <input
                        type="date"
                        className="border px-3 py-2 rounded bg-gray-50"
                        value={filters.endDate || ''}
                        onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
                        onFocus={() => setOpenFilter(null)} // Close other dropdowns when focusing on the date filter
                    />
                </div>

                {/* Exclude Sold Out */}
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="excludeSoldOut"
                        checked={filters.excludeSoldOut || false}
                        onChange={(e) => onChange({ ...filters, excludeSoldOut: e.target.checked })}
                    />
                    <label htmlFor="excludeSoldOut" className="text-gray-700 text-sm">
                        Exclude Sold Out
                    </label>
                </div>
            </div>

            {/* Selected Filters (Chips) */}
            <div className="flex flex-wrap gap-4 items-center">
                {filters.themes?.map((theme) => (
                    <FilterChip
                        key={theme}
                        label={theme}
                        onClear={() => handleThemeChange(theme)}
                        color="blue"
                    />
                ))}
                {filters.formats?.map((format) => (
                    <FilterChip
                        key={format}
                        label={format}
                        onClear={() => handleFormatChange(format)}
                        color="green"
                    />
                ))}
                {(filters.minPrice || filters.maxPrice) && (
                    <FilterChip
                        label={`Price: ${filters.minPrice || 0} - ${filters.maxPrice || '∞'}`}
                        onClear={() => onChange({ ...filters, minPrice: '', maxPrice: '' })}
                        color="purple"
                    />
                )}
                {(filters.startDate || filters.endDate) && (
                    <FilterChip
                        label={`Date: ${filters.startDate || '...'} - ${filters.endDate || '...'}`}
                        onClear={() => onChange({ ...filters, startDate: '', endDate: '' })}
                        color="blue"
                    />
                )}
                {/* Add chips for other filters */}
                <button
                    className="ml-auto text-sm text-red-600 hover:underline"
                    onClick={onClearAll}
                >
                    Clear All
                </button>
            </div>
        </div>
    );
};

const FilterChip = ({ label, onClear, color }) => (
    <div className={`flex items-center bg-${color}-100 text-${color}-700 px-3 py-1 rounded-full`}>
        {label}
        <button className="ml-2 hover:text-black" onClick={onClear}>
            <X size={16} />
        </button>
    </div>
);

export default EventFilters;
