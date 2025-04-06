import axios from "axios";
import { useNavigate } from "react-router-dom";
import { userStore } from "../store/userStore";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    withCredentials: true,
    baseURL: API_URL,
    headers: {
		'Content-Type': 'application/json',
	},
});

const AxiosInterceptor = () => {
    const navigate = useNavigate();

    api.interceptors.request.use((config) => {
        if (userStore.user && !userStore.user.isEmailConfirmed) {
            Swal.fire({
                text: 'Confirm your email first',
                icon: 'warning',
                confirmButtonText: 'Ok'
            })

            const controller = new AbortController();
            config.signal = controller.signal;

            controller.abort();

            return config;
        }

        if (userStore.user) {
            config.headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
        }

        return config;
    });

    api.interceptors.response.use(
        (response) => {
            return response;
        },
        async (error) => {
            if (axios.isCancel(error)) {
                return Promise.resolve({ data: null });
            }
            if (error.response) {
                if (error.response.status === 401) {
                    await userStore.logout();
                    navigate("/login");
                }
                if (error.response.status === 403) {
                }
            }
            throw error;
        }
    );

    return null;
};

export { api, AxiosInterceptor };