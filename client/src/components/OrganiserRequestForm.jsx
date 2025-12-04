import React, { useState } from "react";
import { createVerifyRequest, getVerifyRequestsByUser } from "../services/verifyService"; // импорт сервиса
import Swal from "sweetalert2";
import { userStore } from "../store/userStore";

const OrganiserRequestForm = ({ onClose }) => {
    const [form, setForm] = useState({
        companyDescription: "",
        links: "",
        eventsExamples: ""
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        try {
            // Проверяем, есть ли уже запрос от пользователя
            const existingRequests = await getVerifyRequestsByUser(userStore.user.id);
            const pendingOrAccepted = existingRequests.find(
                (r) => r.status === "pending" 
                || r.status === "accepted"
            );

            if (pendingOrAccepted) {
                Swal.fire({
                    icon: "info",
                    title: "Request already exists",
                    text: `You already have a ${pendingOrAccepted.status} verification request. Please wait for admin review.`
                });
                setLoading(false);
                return;
            }

            // Отправляем новый запрос на сервер
            await createVerifyRequest({
                userId: userStore.user.id,
                companyDescription: form.companyDescription,
                links: form.links,
                eventsExamples: form.eventsExamples,
                status: "pending"
            });

            Swal.fire({
                icon: "success",
                title: "Request submitted",
                text: "Your verification request has been sent. Admin will review it soon."
            });

            onClose();
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "Submission failed",
                text: "Something went wrong. Please try again later."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative z-60 animate-fadeIn">
                
                <button
                    onClick={onClose}
                    className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-2xl"
                >
                    &times;
                </button>

                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                    Request Organiser Role
                </h2>

                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    Please provide as much information as possible. 
                    The more details you share, the higher the chance 
                    that an admin will approve your request.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                    <textarea
                        placeholder="Describe your company or who you are (required)"
                        value={form.companyDescription}
                        onChange={(e) =>
                            setForm({ ...form, companyDescription: e.target.value })
                        }
                        required
                        className="p-3 border border-gray-300 rounded-lg text-gray-700 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                        type="text"
                        placeholder="Links to your website or social media (required)"
                        value={form.links}
                        onChange={(e) =>
                            setForm({ ...form, links: e.target.value })
                        }
                        required
                        className="p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <textarea
                        placeholder="Examples of events you've organized (optional)"
                        value={form.eventsExamples}
                        onChange={(e) =>
                            setForm({ ...form, eventsExamples: e.target.value })
                        }
                        className="p-3 border border-gray-300 rounded-lg text-gray-700 min-h-[90px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:opacity-90 transition"
                            disabled={loading}
                        >
                            {loading ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrganiserRequestForm;
