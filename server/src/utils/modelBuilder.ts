import * as fs from 'fs'
import { Event } from '../models/Event'

export const getAllEventsFromDB = async () => {
    const events = await Event.find({
        relations: ['company', 'formats', 'themes'],
    })

    const lines = events.map(event => {
        const title = event.title;
        const date = event.date;
        const companyName = event.company?.name;
        const formats = event.formats.map(f => f.title).join(', ');
        const themes = event.themes.map(t => t.title).join(', ');
        const price = event.price;
        const location = event.location;
        const ticketLimit = event.ticket_limit

        return `ID: ${event.id} | Title: ${title} | Description: ${event.description} | Location: ${location} | Ticket Limit: ${ticketLimit} | Price: $${price} | Date: ${date} |  Company: ${companyName} | Formats: [${formats}] | Themes: [${themes}]`;
    });

    fs.writeFile('Events', lines.join('\n'), function (err) {
        if (err) {
            return console.error(err);
        }
        console.log("File created!");
    });

    return events;
}