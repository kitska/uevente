import { makeAutoObservable, runInAction } from 'mobx';

class EventStore {
    mockEvents = Array.from({ length: 600 }, (_, i) => ({
        id: i + 1,
        title: `Event ${i + 1}`,
        description: `This is a short description for event ${i + 1}.`,
        startDate: new Date().toISOString(),
        image: 'https://picsum.photos/1920/1080',
        price: `$${(10 + i * 2).toFixed(2)}`,
        location: `City ${i + 1}, Country ${i + 1}`,
    }));

    constructor() {
        makeAutoObservable(this);
    }
}

export const eventStore = new EventStore();