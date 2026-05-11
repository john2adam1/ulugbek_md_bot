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
        message += `\nTabriklaymiz! Siz maqsadga yetdingiz va seminarda qatnashish imkoniyatini qo'lga kiritdingiz.\nMaxsus ID: REF-${telegramId}`;
    } else {
        message += `Maqsadga yetish uchun yana ${pointsLeft} ta ball to'plashingiz kerak.`;
    }

    await ctx.reply(message);
}

export async function handleGetLink(ctx: Context) {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const botInfo = await ctx.telegram.getMe();
    const referralLink = `https://t.me/${botInfo.username}?start=${telegramId}`;

    const text = `🚀 Salom! Men "Zamonaviy IT" seminariga ro'yxatdan o'tdim.\n\nSiz ham ushbu seminarda qatnashmoqchi bo'lsangiz, quyidagi havola orqali ro'yxatdan o'ting va bepul chiptani qo'lga kiriting!\n\nRo'yxatdan o'tish: ${referralLink}`;

    await ctx.reply(`Sizning shaxsiy referal havolangiz:\n\n${referralLink}\n\nUshbu matnni nusxalab do'stlaringizga yuboring:`);
    await ctx.reply(text);
}

export async function handleAboutSeminar(ctx: Context) {
    await ctx.reply(`ℹ️ *Seminar haqida*\n\nMavzu: Web Development va AI integratsiyasi\nSana: 25-May, 2024\nJoy: IT Park Tashkent\n\nUshbu seminarda siz sohadagi so'nggi yangiliklar bilan tanishasiz va tajribali mutaxassislardan maslahatlar olasiz.`, {
        parse_mode: 'Markdown'
    });
}
