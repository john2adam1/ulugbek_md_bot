import { Telegraf } from 'telegraf';
import { config } from './config';
import { checkSubscription } from './middlewares/subscription';
import { handleStart } from './handlers/start';
import { handleMyPoints, handleGetLink, handleAboutSeminar } from './handlers/menu';
import { handleAdmin } from './handlers/admin';

if (!config.BOT_TOKEN) {
    console.error('BOT_TOKEN is missing in .env file');
    process.exit(1);
}

const bot = new Telegraf(config.BOT_TOKEN);

// Global Middlewares
bot.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        console.error('Bot Error:', err);
    }
});

// Protected routes (require subscription)
bot.start(async (ctx) => {
    // We check subscription during /start as well, but only to decide if we count the points or show the menu
    // For the very first /start, they might not be subscribed yet.
    return handleStart(ctx);
});

bot.action('check_sub', async (ctx) => {
    await ctx.answerCbQuery().catch(() => { });
    return handleStart(ctx);
});

// Middleware for other commands
bot.use(checkSubscription);

bot.hears('📊 Ballarim', handleMyPoints);
bot.hears('🔗 Havola olish', handleGetLink);
bot.hears('ℹ️ Seminar haqida', handleAboutSeminar);

bot.command('admin', handleAdmin);

// Start bot
bot.launch().then(() => {
    console.log('Bot started successfully');
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
