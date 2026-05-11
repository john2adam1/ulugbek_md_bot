import { Context } from 'telegraf';
import { userService } from '../database/users';

const ADMIN_IDS = [12345678]; // Add actual admin Telegram IDs here

export async function handleAdmin(ctx: Context) {
    const telegramId = ctx.from?.id;
    if (!telegramId || !ADMIN_IDS.includes(telegramId)) {
        return ctx.reply('Sizda ushbu komandani ishlatish uchun ruxsat yo\'q.');
    }

    const stats = await userService.getAdminStats();

    await ctx.reply(`📊 *Bot Statistikasi*\n\nUmumiy ro'yxatdan o'tganlar: ${stats.totalUsers}\nSeminarga yo'llanma olganlar: ${stats.totalWinners}`, {
        parse_mode: 'Markdown'
    });
}
