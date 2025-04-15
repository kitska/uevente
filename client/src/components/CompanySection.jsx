import React, { useState, useEffect } from 'react';
import { FaPlusCircle, FaBuilding } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { api } from '../services';

const CompanySection = ({ userId }) => {
    const [companies, setCompanies] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newCompany, setNewCompany] = useState({
        name: '',
        email: '',
        location: '',
        ownerId: userId
    });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchCompanies = async () => {
            if (!userId) return;
            try {
                const response = await api.get(`/users/${userId}/companies`);
                setCompanies(response.data);
            } catch (err) {
                console.error('Failed to fetch companies', err);
            }
        };

        fetchCompanies();
    }, [userId]);

    const handleCompanySubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post(`/companies`, newCompany);
            setCompanies((prev) => [...prev, response.data]);
            setNewCompany({ name: '', email: '', location: '' });
            setShowModal(false);
        } catch (err) {
            console.error('Failed to create company', err);
        }
    };

    const handleCompanyClick = (companyId) => {
        navigate(`/company/${companyId}`);
    };

    return (
        <>
            <div className="p-6 bg-white bg-opacity-70 backdrop-blur-sm rounded-xl shadow-xl space-y-6 relative">
                <h3 className="text-2xl font-semibold text-gray-800">Your Companies</h3>

                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:opacity-90 transition"
                >
                    <FaPlusCircle size={20} />
                    <span>Create Company</span>
                </button>

                {companies.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {companies.map((company) => (
                            <div
                                key={company.id}
                                onClick={() => handleCompanyClick(company.id)}
                                className="cursor-pointer p-4 rounded-xl bg-white bg-opacity-60 backdrop-blur-md shadow-md border border-gray-200 hover:shadow-lg hover:scale-[1.02] transition-transform duration-200 group"
                            >
                                <div className="flex items-center gap-3">
                                    <FaBuilding
                                        className="text-blue-500 text-2xl group-hover:text-indigo-600 transition-colors"
                                    />
                                    <h4 className="text-lg font-semibold text-gray-800 group-hover:underline">
                                        {company.name}
                                    </h4>
                                </div>
                                <p className="text-sm text-gray-600 mt-2">{company.email}</p>
                                <p className="text-sm text-gray-500">{company.location}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative z-60">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-2xl"
                        >
                            &times;
                        </button>

                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Company</h2>
                        <form onSubmit={handleCompanySubmit} className="flex flex-col gap-5">
                            <input
                                type="text"
                                placeholder="Company Name"
                                value={newCompany.name}
                                onChange={(e) =>
                                    setNewCompany({ ...newCompany, name: e.target.value })
                                }
                                required
                                className="p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="email"
                                placeholder="Company Email"
                                value={newCompany.email}
                                onChange={(e) =>
                                    setNewCompany({ ...newCompany, email: e.target.value })
                                }
                                required
                                className="p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="text"
                                placeholder="Location"
                                value={newCompany.location}
                                onChange={(e) =>
                                    setNewCompany({ ...newCompany, location: e.target.value })
                                }
                                required
                                className="p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:opacity-90 transition"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default CompanySection;
