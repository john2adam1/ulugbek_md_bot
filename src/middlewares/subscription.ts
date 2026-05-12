import { Context, Markup } from 'telegraf';
import { config } from '../config';

export async function checkSubscription(ctx: Context, next: () => Promise<void>) {
    if (ctx.from?.id) {
        try {
            const member = await ctx.telegram.getChatMember(config.CHANNEL_ID, ctx.from.id);
            const statuses = ['member', 'administrator', 'creator'];

            if (statuses.includes(member.status)) {
                return next();
            } else {
                await ctx.reply(`Iltimos, botdan foydalanish uchun kanalimizga a'zo bo'ling:`,
                    Markup.inlineKeyboard([
                        [Markup.button.url('📢 Kanalga a\'zo bo\'lish', config.CHANNEL_URL)],
                        [Markup.button.callback('✅ Tekshirish', 'check_sub')]
                    ])
                );
            }
        } catch (error) {
            console.error('Subscription check error:', error);
            // If error occurs (e.g. bot not admin in channel), we might want to let them through or warn admin
            return next();
        }
    }
}
