// src/components/CompanyCard.jsx
import React, { useState } from 'react';
import { FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const CompanyCard = ({ company }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      data-aos="fade-up"
      className="relative w-full h-[120px] overflow-hidden rounded-2xl shadow-md cursor-pointer bg-amber-100 transition-transform transform hover:scale-[1.02] hover:shadow-lg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center h-full gap-6 p-4">
        {/* Avatar-like block */}
        <div className="w-20 h-20 flex items-center justify-center rounded-full bg-amber-300 text-white text-3xl font-bold">
          {company.name?.charAt(0) || 'C'}
        </div>

        {/* Company Info */}
        <div className="flex flex-col justify-center text-gray-800">
          <h3 className="text-xl font-semibold mb-1">{company.name}</h3>
          <div className="flex flex-col gap-1 text-sm">
            <div className="flex items-center gap-2">
              <FaEnvelope />
              {company.email || 'No email provided'}
            </div>
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt />
              {company.location || 'No location'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyCard;
