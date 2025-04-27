import cron from 'node-cron';
import { Subscription } from '../models/Subscription';
import { sendEmail } from './emailService';
import { Between } from 'typeorm';
import { sendPushNotification } from './pushService';
import { sendSMS } from './smsService';
cron.schedule('* * * * *', async () => {
  const now = new Date();
  const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const oneDayLaterEnd = new Date(oneDayLater.getTime() + 60 * 60 * 1000); // окно +1 час
  try {
    const subscriptions = await Subscription.find({
      relations: ['event', 'user'],
      where: {
        event: {
          date: Between(oneDayLater, oneDayLaterEnd),
          is_published: true,
        },
      },
    });

    for (const sub of subscriptions) {
      const user = sub.user;
      const event = sub.event;

      if (!event || (!user.emailNotifications && !user.pushNotifications)) continue;
      if (user?.emailNotifications) {
        const subject = `Reminder: event "${event.title}" tomorrow`;
        const emailContent = {
          html: `
          <h2>Hi, ${user.fullName}!</h2>
          <p>GoEvent reminds, that tomorrow will be event <strong>${event.title}</strong>.</p>
          <p>🗓 <strong>When:</strong> ${new Date(event.date).toLocaleString()}</p>
          <p>📍 <strong>Where:</strong> ${event.location}</p>
          <br/>
          <p>See you there!</p>
          <hr/>
          <small>You received this email, because you are subscribed to this event</small>
        `,
        };

        await sendEmail(user.email, emailContent, subject);
      }
      if (user?.pushNotifications) {
        await sendPushNotification(user.pushSubscription, {
          title: 'Event Reminder 📅',
          body: `Don't forget: ${event.title} is tomorrow!`,
          data: { eventId: event.id },
        });
      }
      if (user?.smsNotifications) {
        await sendSMS(user.phone, `GoEvent reminds you to not forget about event ${event.title} on ${event.date}`);
      }
    }

  } catch (err) {
    console.error('Error during sending notification:', err);
  }
});

// Every day at 9 AM
cron.schedule('0 9 * * *', async () => {
  const now = new Date();
  const tomorrowStart = new Date(now);
  tomorrowStart.setDate(now.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0); // 00:00

  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setHours(23, 59, 59, 999); // 23:59:59

  try {
    const subscriptions = await Subscription.find({
      relations: ['event', 'user'],
      where: {
        event: {
          date: Between(tomorrowStart, tomorrowEnd),
          is_published: true,
        },
      },
    });

    for (const sub of subscriptions) {
      const user = sub.user;
      const event = sub.event;

      if (!event || (!user.emailNotifications && !user.pushNotifications)) continue;

      if (user?.emailNotifications) {
        const subject = `Reminder: event "${event.title}" is tomorrow!`;
        const emailContent = `
          <h2>Hello, ${user.fullName}!</h2>
          <p>Don't forget! Tomorrow you have an event <strong>${event.title}</strong>.</p>
          <p>🗓 <strong>When:</strong> ${new Date(event.date).toLocaleString()}</p>
          <p>📍 <strong>Where:</strong> ${event.location}</p>
          <br/>
          <p>Have a great time!</p>
          <hr/>
          <small>You received this email, because you subscribed to this event</small>
        `;
        await sendEmail(user.email, { html: emailContent }, subject);
      }

      if (user?.pushNotifications) {
        await sendPushNotification(user.pushSubscription, {
          title: 'Upcoming Event Reminder 📅',
          body: `Your event "${event.title}" is tomorrow!`,
          data: { eventId: event.id },
        });
      }

      if (user?.smsNotifications) {
        await sendSMS(user.phone, `Don't forget: your event "${event.title}" is tomorrow (${new Date(event.date).toLocaleString()})`);
      }
    }
  } catch (err) {
    console.error('Error during daily reminder sending:', err);
  }
});


