import { makeAutoObservable, runInAction } from 'mobx';

class EventStore {
    mockEvents = Array.from({ length: 600 }, (_, i) => ({
        id: i + 1,
        title: `Event ${i + 1}`,
        description: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. ${i + 1}.`,
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