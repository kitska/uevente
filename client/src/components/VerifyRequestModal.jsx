import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { getVerifyRequestById, updateVerifyRequestStatus } from '../services/verifyService';
import { userStore } from '../store/userStore';

const VerifyRequestModal = ({ requestId, onClose, onStatusChange }) => {
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchRequest = async () => {
            setLoading(true);
            try {
                const data = await getVerifyRequestById(requestId);
                setRequest(data);
            } catch (err) {
                console.error(err);
                Swal.fire('Error', 'Failed to fetch request details', 'error');
                onClose();
            } finally {
                setLoading(false);
            }
        };

        if (requestId) fetchRequest();
    }, [requestId]);

    const handleStatusUpdate = async (status, userId) => {
        setLoading(true);
        try {
            await updateVerifyRequestStatus(request.id, {
                status,
                userId,
                adminId: userStore.user.id,
            });
            Swal.fire('Success', `Request ${status}`, 'success');
            onStatusChange(request.id, status);
            onClose();
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Failed to update request status', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!request) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg relative z-60">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-2xl"
                >
                    &times;
                </button>

                <h2 className="text-2xl font-bold mb-4">Verification Request</h2>

                <div className="space-y-2">
                    <p><strong>User:</strong> {request.user.fullName}</p>
                    <p><strong>Email:</strong> {request.user.email}</p>
                    <p><strong>Status:</strong> {request.status}</p>
                    <p><strong>Company Description:</strong> {request.companyDescription}</p>
                    <p><strong>Links:</strong> {request.links}</p>
                    <p><strong>Events Examples:</strong> {request.eventsExamples}</p>
                    {request.admin && <p><strong>Processed by:</strong> {request.admin.fullName}</p>}
                </div>

                {userStore.user.isAdmin && request.status === 'pending' && (
                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            onClick={() => handleStatusUpdate('accepted', request.user.id)}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                            disabled={loading}
                        >
                            Accept
                        </button>
                        <button
                            onClick={() => handleStatusUpdate('denied', request.user.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            disabled={loading}
                        >
                            Deny
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyRequestModal;
