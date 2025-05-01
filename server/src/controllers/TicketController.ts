import { Request, Response } from 'express';
import { Ticket } from '../models/Ticket';
import { User } from '../models/User';
import { Event } from '../models/Event';
import * as QRCode from 'qrcode';
import { sendEmail } from '../utils/emailService';
import { converBase64ToImage } from 'convert-base64-to-image';
import { Jimp } from 'jimp';
import jsQR from 'jsqr';
import fs from 'fs/promises';
import path from 'path';

export class TicketController {
	static async createTicket(req: Request, res: Response): Promise<Response> {
		const { eventId, userId } = req.body;

		try {
			const event = await Event.findOne({ where: { id: eventId } });
			const user = await User.findOne({ where: { id: userId } });

			if (!event || !user) {
				return res.status(404).json({ message: 'Event or User not found' });
			}

			const ticketId = `${userId}--${eventId}--${new Date().getTime()}`;
			const qrCodeData = await this.generateQRCode(ticketId, 300);

			const ticket = new Ticket();
			ticket.event = event;
			ticket.user = user;
			ticket.qr_code = qrCodeData;
			await ticket.save();

			const htmlQRCode = qrCodeData.split(',')[1];
			const message = {
				html: `<div style="max-width:600px;margin:20px auto;padding:30px;border-radius:20px;font-family:sans-serif;background:linear-gradient(135deg,#ff9a9e,#a18cd1);box-shadow:0 4px 15px rgba(0,0,0,0.2);color:white;">
        <h2 style="text-align:center;font-size:28px;margin-bottom:20px;">🎟️ Your Event Ticket</h2>

        <div style="background:rgba(255,255,255,0.15);padding:20px;border-radius:15px;margin-bottom:20px;">
          <p><strong>Event:</strong> ${event.title}</p>
          <p><strong>Date:</strong> ${new Date(event.date).toLocaleString()}</p>
          <p><strong>Location:</strong> ${event.location || 'Location will be announced'}</p>
          <p><strong>Ticket Holder:</strong> ${user.fullName}</p>
        </div>

        <div style="text-align:center;margin:30px 0;">
          <img src="cid:qrCode" alt="Ticket QR Code" style="width:200px;height:200px;background:white;padding:10px;border-radius:10px;" />
        </div>

        <p style="text-align:center;font-size:14px;opacity:0.8;">Please present this QR code at the event entrance.</p>
      </div>`,
				attachments: [
					{
						filename: 'image.png',
						path: `data:image/png;base64,${htmlQRCode}`,
						cid: 'qrCode',
					},
				],
			};

			await sendEmail(user.email, message, `Your Ticket for ${event.title}`);
			if (event.receiveEmails) {
				if (event.receiveEmails) {
					const subject = 'New Ticket Sold for Your Event';

					const html = `
					  <p>Hello,</p>
					  <p>A ticket has just been purchased for your event: <strong>${event.title}</strong>.</p>
					  <h4>Buyer Information:</h4>
					  <ul>
						<li><strong>Name:</strong> ${user.fullName}</li>
						<li><strong>Email:</strong> ${user.email}</li>
						${user.phone ? `<li><strong>Phone:</strong> ${user.phone}</li>` : ''}
					  </ul>
					  <p>You can view the full details in your dashboard.</p>
					  <p>Best regards,<br/>The UEvent Team</p>
					`;

					await sendEmail(event.company.email, { html }, subject);
				}
			}
			return res.status(201).json(ticket);
		} catch (error) {
			console.error('Error creating ticket:', error);
			return res.status(500).json({ message: 'Error creating ticket' });
		}
	}

	private static async generateQRCode(data: string, size: number): Promise<string> {
		return new Promise((resolve, reject) => {
			QRCode.toDataURL(data, { width: size, type: 'image/png' }, (err, url) => {
				if (err) reject(err);
				resolve(url);
			});
		});
	}

	static async decodeQRCode(req: Request, res: Response): Promise<Response> {
		const { qrCode } = req.body;

		try {
			// Remove base64 prefix if present
			const base64Data = qrCode.replace(/^data:image\/\w+;base64,/, '');
			const buffer = Buffer.from(base64Data, 'base64');

			// Read image from buffer using Jimp
			const image = await Jimp.read(buffer);

			// Extract image data
			const imageData = {
				data: new Uint8ClampedArray(image.bitmap.data),
				width: image.bitmap.width,
				height: image.bitmap.height,
			};

			// Decode with jsQR
			const decodedQR = jsQR(imageData.data, imageData.width, imageData.height);

			if (!decodedQR) {
				return res.status(400).json({ message: 'QR code not found in the image.' });
			}

			return res.status(200).json({ decodedText: decodedQR.data });
		} catch (error) {
			console.error('Error when processing a QR code:', error);
			return res.status(500).json({ message: 'There was an error when decoding the QR code' });
		}
	}

	static async getTicketsByEvent(req: Request, res: Response): Promise<Response> {
		const { eventId } = req.params;

		try {
			const tickets = await Ticket.find({
				where: { event: { id: eventId } },
				relations: ['event', 'user'],
			});

			return res.status(200).json(tickets);
		} catch (error) {
			console.error('Error fetching tickets:', error);
			return res.status(500).json({ message: 'Error fetching tickets' });
		}
	}

	static async getTicketById(req: Request, res: Response): Promise<Response> {
		const { ticketId } = req.params;

		try {
			const ticket = await Ticket.findOne({
				where: { id: ticketId },
				relations: ['event', 'user'],
			});

			if (!ticket) {
				return res.status(404).json({ message: 'Ticket not found' });
			}

			return res.status(200).json(ticket);
		} catch (error) {
			console.error('Error fetching ticket:', error);
			return res.status(500).json({ message: 'Error fetching ticket' });
		}
	}
}
