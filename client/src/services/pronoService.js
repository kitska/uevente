import { api } from './index';

const API_URL = import.meta.env.VITE_API_URL;

export const promoService = {
	createPromocode: async data => {
		try {
			const response = await api.post(`${API_URL}/promocodes`, data);
			return response.data;
		} catch (error) {
			console.error('Failed to create promocode:', error);
			throw error;
		}
	},

	getPromocodesByEvent: async eventId => {
		try {
			const response = await api.get(`${API_URL}/promocodes/event/${encodeURIComponent(eventId)}`);
			return response.data;
		} catch (error) {
			console.error('Failed to fetch promocodes by event:', error);
			throw error;
		}
	},

	deletePromocode: async id => {
		try {
			const response = await api.delete(`${API_URL}/promocodes/${encodeURIComponent(id)}`);
			return response.data;
		} catch (error) {
			console.error('Failed to delete promocode:', error);
			throw error;
		}
	},
};
