import { Context } from 'telegraf';
import { userService } from '../database/users';
import { config } from '../config';

export async function handleAdmin(ctx: Context) {
    const telegramId = ctx.from?.id;
    if (!telegramId || !config.ADMIN_IDS.includes(telegramId)) {
        return ctx.reply('Sizda ushbu komandani ishlatish uchun ruxsat yo\'q.');
    }

    const stats = await userService.getAdminStats();

    await ctx.reply(`📊 *Bot Statistikasi*\n\nUmumiy ro'yxatdan o'tganlar: ${stats.totalUsers}\nSeminarga yo'llanma olganlar: ${stats.totalWinners}`, {
        parse_mode: 'Markdown'
    });
}
