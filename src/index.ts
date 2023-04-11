import { bot } from "./bot";

// @ts-ignore
export const handler = async function (event, context) {
    try {
        const update = typeof event.body === 'string' ? JSON.parse(event.body) : event.body; // Parse the incoming event
        await bot.handleUpdate(update);
        return { statusCode: 200, body: `OK` };
    } catch (error) {
        console.error('Error:', error);
        return { statusCode: 500, body: 'An error occurred.' };
    }
}
