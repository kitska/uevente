import { api } from './index';
// import { userStore } from '../store/userStore';

const API_URL = import.meta.env.VITE_API_URL;

export const createUser = async (fullName, email, password, login) => {
	try {
		const response = await api.post(`${API_URL}/auth/register`, {
			fullName,
			email,
			password,
			login,
		});
		// const response = await userStore.register(login, email, fullName, password);
		return response.data;
	} catch (error) {
		throw error;
	}
};

export const getUser = async (email, password, login) => {
	try {
		const response = await api.post(`${API_URL}/auth/login`, {
			email,
			password,
			login,
		});
		return response.data;
	} catch (error) {
		throw error;
	}
};

export const getUserById = async userId => {
	try {
		const response = await api.get(`${API_URL}/users/${encodeURIComponent(userId)}`);
		return response.data;
	} catch (error) {
		console.error('Error when receiving user data:', error);
		throw error;
	}
};

export const requestPasswordReset = async email => {
	try {
		const response = await api.post(`${API_URL}/auth/password-reset`, { email });
		return response.data; // Ожидаем сообщение от сервера
	} catch (error) {
		console.error('Password reset request failed:', error);
		throw error;
	}
};

export const resetPassword = async (token, newPassword) => {
	try {
		const response = await api.post(`${API_URL}/auth/password-reset/${token}`, {
			newPassword,
		});
		return response.data;
	} catch (error) {
		throw error;
	}
};

export const updateUser = async (userId, updatedData) => {
	try {
		const response = await api.patch(`${API_URL}/users/${encodeURIComponent(userId)}`, updatedData);
		return response.data;
	} catch (error) {
		console.error('Failed to update user:', error);
		throw error;
	}
};

export const fetchCurrentUser = async () => {
	const token = localStorage.getItem('token');
	if (!token) return null;

	try {
		const response = await api.post(`${API_URL}/auth/me`, { token });
		return response.data.user;
	} catch (error) {
		if (error.response?.status === 401) {
			return null; // Token is invalid/expired, return null
		}
		throw error; // Rethrow other errors
	}
};

export const confirmEmail = async token => {
	try {
		const response = await api.get(`${API_URL}/auth/confirm-email/${token}`);
		return response.data;
	} catch (error) {
		throw error;
	}
};

export const getSharedEvents = async userId => {
	try {
		const response = await api.get(`${API_URL}/users/${encodeURIComponent(userId)}/shared-events`);
		return response.data;
	} catch (error) {
		console.error('Failed to fetch shared events:', error);
		throw error;
	}
};