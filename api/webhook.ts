import { Telegraf } from 'telegraf';
import { config } from '../src/config';
import { checkSubscription } from '../src/middlewares/subscription';
import { handleStart } from '../src/handlers/start';
import { handleMyPoints, handleGetLink, handleAboutSeminar } from '../src/handlers/menu';
import { handleAdmin } from '../src/handlers/admin';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const bot = new Telegraf(config.BOT_TOKEN!);

// Global error handler
bot.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        console.error('Bot Error:', err);
    }
});

// /start command
bot.start(async (ctx) => {
    return handleStart(ctx);
});

bot.action('check_sub', async (ctx) => {
    await ctx.answerCbQuery().catch(() => { });
    return handleStart(ctx);
});

// Subscription middleware for other commands
bot.use(checkSubscription);

bot.hears('📊 Ballarim', handleMyPoints);
bot.hears('🔗 Havola olish', handleGetLink);
bot.hears('ℹ️ Seminar haqida', handleAboutSeminar);

bot.command('admin', handleAdmin);

// Vercel serverless handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        if (req.method === 'POST') {
            await bot.handleUpdate(req.body);
            res.status(200).json({ ok: true });
        } else {
            res.status(200).json({ status: 'Bot is running' });
        }
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
