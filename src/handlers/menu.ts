import { Context } from 'telegraf';
import { userService } from '../database/users';
import { config } from '../config';

export async function handleMyPoints(ctx: Context) {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const user = await userService.getUserByTelegramId(telegramId);
    if (!user) return;

    const pointsLeft = Math.max(0, config.POINTS_REQUIRED - user.points);
    let message = `Sizning joriy ballaringiz: ${user.points}\n`;

    if (user.points >= config.POINTS_REQUIRED) {
        message += `\n✅ Tabriklaymiz! Siz ekg baza kanali uchun 1 oylik obuna ga ega boldingiz, ` +
            `va biz sizni yopiq kanalga qo'shib qo'yamiz`;
    } else {
        message += `Maqsadga yetish uchun yana ${pointsLeft} ta ball to'plashingiz kerak.`;
    }

    await ctx.reply(message, { parse_mode: 'Markdown' });
}

export async function handleGetLink(ctx: Context) {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const botInfo = await ctx.telegram.getMe();
    const referralLink = `https://t.me/${botInfo.username}?start=${telegramId}`;

    const escapedLink = referralLink.replace(/_/g, '\\_');
    const text = `🩺 *Bepul EKG darslari*\n\nMalakali kardiolog tomonidan olib boriladi.\n\n1 hafta davomida EKG asoslaridan boshlab murakkab aritmiyalargacha o'rgatiladi.\n\nBepul darslarda qatnashish uchun kamida 5 ta do'stingizni taklif qilishingiz kerak bo'ladi.\n\nRo'yxatdan o'tish: ${escapedLink}`;

    await ctx.reply(`Sizning shaxsiy referal havolangiz:\n\n${referralLink}\n\nUshbu matnni nusxalab do'stlaringizga yuboring:`);
    await ctx.reply(text, { parse_mode: 'Markdown' });
}

export async function handleAboutSeminar(ctx: Context) {
    await ctx.reply(`ℹ️ *Darslar haqida*\n\nMavzu: EKG asoslari va aritmiyalar\nDavomiyligi: 1 hafta\nFormat: Telegram kanal orqali bepul darslar\n\nUshbu darslar malakali kardiolog tomonidan olib boriladi va EKGni o'qish hamda tahlil qilishni o'rgatadi.`, {
        parse_mode: 'Markdown'
    });
}
