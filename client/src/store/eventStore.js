import { makeAutoObservable, runInAction } from 'mobx';
import * as eventService from '../services/eventService';
import { userStore } from './userStore';

class EventStore {
	events = [];
	loading = false;
	error = null;

	constructor() {
		makeAutoObservable(this);
	}

	async fetchEvents(page = 1, limit = 10, sort = 'date', order = 'ASC') {
		this.loading = true;
		this.error = null;

		try {
			const response = await eventService.fetchEvents(page, limit, sort, order);

			runInAction(() => {
				this.events = response.data;
				this.total = response.meta.total;
				this.totalPages = response.meta.totalPages;
				this.currentPage = response.meta.page;
				this.loading = false;
			});
		} catch (err) {
			runInAction(() => {
				this.error = err.response?.data?.message || 'Failed to load events';
				this.loading = false;
			});
		}
	}

	async fetchEventById(id) {
		const cachedEvent = this.events.find(e => e.id === Number(id));
		if (cachedEvent) return cachedEvent;

		this.loading = true;
		this.error = null;

		try {
			const data = await eventService.getEventById(id);
			runInAction(() => {
				this.events.push(data);
				this.loading = false;
			});
			return data;
		} catch (err) {
			runInAction(() => {
				this.error = err.response?.data?.message || 'Failed to load event';
				this.loading = false;
			});
			throw err;
		}
	}
	async handleSubscribe(subscribed, id) {
		try {
			if (subscribed) await eventService.subscibe(id, userStore?.user?.id);
			else await eventService.unsubscibe(id, userStore?.user?.id);
			// api.post('/api/subscriptions/subscribe')
		} catch (error) {
			throw error;
		}
	}

	mockEvents = Array.from({ length: 600 }, (_, i) => ({
		id: i + 1,
		title: `Event ${i + 1}`,
		description: `Lorem Ipsum is simply dummy text... ${i + 1}.`,
		startDate: new Date().toISOString(),
		image: 'https://picsum.photos/1920/1080',
		price: `$${(10 + i * 2).toFixed(2)}`,
		location: `City ${i + 1}, Country ${i + 1}`,
	}));
}

export const eventStore = new EventStore();
