import {Bot} from 'grammy';
import {chatCompletion} from "./openai";

const allowedUsers = (process.env.USERS as string).split(',');

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN is unset");

// @ts-ignore
export const bot = new Bot(token, {
    // @ts-ignore
    botInfo: {
        id: Number(process.env.BOT_ID),
        is_bot: true,
        first_name: process.env.BOT_FIRST_NAME as string,
        username: process.env.BOT_USERNAME as string
    }
});

bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));

bot.on('message', async (ctx) => {
    try {
        if (!ctx.message || !ctx.message.text) {
            await ctx.reply('Please send a text message');
            return;
        }

        const text = ctx.message.text;

        console.log('received: ', text);
        if (!allowedUsers.includes(<string>ctx.message.from.username)) {
            await ctx.reply('You are not allowed to use this bot');
            return;
        }

        const chatResponse = await chatCompletion(text);
        console.log('Chat response:', chatResponse);
        console.log('replying...');

        if (chatResponse === '') {
            await ctx.reply('I could not generate a summary for the given text. Please try again with a different text.');
        } else {
            await ctx.reply(chatResponse);
        }
    } catch (error) {
        console.error('Error:', error);
        await ctx.reply('An error occurred. Please try again later.');
    }
});
