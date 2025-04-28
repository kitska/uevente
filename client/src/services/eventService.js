import axios from 'axios';
import { api } from './index';

const API_URL = import.meta.env.VITE_API_URL;

export const fetchEvents = async (page = 1, limit = 10, sort = 'date', order = 'ASC', filters = {} ) => {
	try {
		const response = await axios.get(`${API_URL}/events`, {
			params: { page, limit, sort, order, ...filters},
		});
		return response.data;
	} catch (error) {
		console.error('Failed to fetch events:', error);
		throw error;
	}
};

export const fetchThemes = async () => {
	try {
		const response = await axios.get(`${API_URL}/themes`);
		return response.data;
	} catch (error) {
		console.error('Failed to fetch events:', error);
		throw error;
	}
};
export const fetchFormats = async () => {
	try {
		const response = await axios.get(`${API_URL}/formats`);
		return response.data;
	} catch (error) {
		console.error('Failed to fetch events:', error);
		throw error;
	}
};
export const getEventById = async eventId => {
	try {
		const response = await axios.get(`${API_URL}/events/${encodeURIComponent(eventId)}`);
		return response.data;
	} catch (error) {
		console.error('Failed to fetch event by ID:', error);
		throw error;
	}
};

export const createEvent = async eventData => {
	try {
		const response = await api.post(`${API_URL}/events`, eventData);
		return response.data;
	} catch (error) {
		console.error('Failed to create event:', error);
		throw error;
	}
};

export const updateEvent = async (eventId, updatedData) => {
	try {
		const response = await api.patch(`${API_URL}/events/${encodeURIComponent(eventId)}`, updatedData);
		return response.data;
	} catch (error) {
		console.error('Failed to update event:', error);
		throw error;
	}
};

export const deleteEvent = async eventId => {
	try {
		const response = await api.delete(`${API_URL}/events/${encodeURIComponent(eventId)}`);
		return response.data;
	} catch (error) {
		console.error('Failed to delete event:', error);
		throw error;
	}
};

export const getSubscribedEvents = async userId => {
	try {
		const response = await api.get(`${API_URL}/users/subscriptions/${encodeURIComponent(userId)}`);
		return response.data;
	} catch (error) {
		console.error('Failed to get subs:', error);
		throw error;
	}
}

export const subscibe = async (eventId, userId) => {
	try {
		const response = await api.post(`${API_URL}/subscriptions/subscribe`, {
			eventId, userId
		});
		return response.data;
	} catch (error) {
		console.error('Failed to subscribe:', error);
		throw error;
	}
}

export const unsubscibe = async (eventId, userId) => {
	try {
		const response = await api.post(`${API_URL}/subscriptions/unsubscribe`, {
			eventId, userId
		});
		return response.data;
	} catch (error) {
		console.error('Failed to unsubscribe:', error);
		throw error;
	}
}
