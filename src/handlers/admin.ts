import { Context } from 'telegraf';
import { userService } from '../database/users';
import { config } from '../config';

export async function handleAdmin(ctx: Context) {
    const telegramId = ctx.from?.id;
    if (!telegramId || !config.ADMIN_IDS.includes(telegramId)) {
        return ctx.reply('Sizda ushbu komandani ishlatish uchun ruxsat yo\'q.');
    }

    const stats = await userService.getAdminStats();
    const winners = await userService.getAllWinners();

    let message = `📊 *Bot Statistikasi*\n\n` +
        `Umumiy ro'yxatdan o'tganlar: ${stats.totalUsers}\n` +
        `Seminarga yo'llanma olganlar: ${stats.totalWinners}\n\n` +
        `🏆 *G'oliblar ro'yxati:*\n`;

    if (winners && winners.length > 0) {
        winners.forEach((winner, i) => {
            const username = winner.username ? `@${winner.username}` : 'No username';
            message += `${i + 1}. ${username} — ${winner.points} ta odam\n`;
        });
    } else {
        message += "Hozircha g'oliblar yo'q.";
    }

    await ctx.reply(message, { parse_mode: 'Markdown' });
}
