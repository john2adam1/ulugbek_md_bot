import { Context, Markup } from 'telegraf';
import { userService } from '../database/users';
import { config } from '../config';

async function isSubscribed(ctx: Context, userId: number): Promise<boolean> {
    try {
        const member = await ctx.telegram.getChatMember(config.CHANNEL_ID, userId);
        return ['member', 'administrator', 'creator'].includes(member.status);
    } catch (e: any) {
        if (e.description === 'Bad Request: chat not found') {
            console.error(`ERROR: Bot cannot find the channel ${config.CHANNEL_ID}. Make sure the ID/username is correct and the bot is an ADMIN in the channel.`);
        } else {
            console.error('Subscription check error:', e);
        }
        return false;
    }
}

export async function handleStart(ctx: Context) {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const fullName = ctx.from?.first_name + (ctx.from?.last_name ? ` ${ctx.from.last_name}` : '');
    const username = ctx.from?.username;

    // Extract referral ID from /start?start=REFERRAL_ID
    const startPayload = (ctx as any).startPayload;
    const referrerId = startPayload ? parseInt(startPayload) : null;

    try {
        let user = await userService.getUserByTelegramId(telegramId);
        const subscribed = await isSubscribed(ctx, telegramId);

        if (!user) {
            // New user
            const isSelfReferral = referrerId === telegramId;
            const validReferrer = referrerId && !isSelfReferral ? referrerId : null;

            user = await userService.createUser({
                telegram_id: telegramId,
                full_name: fullName,
                username: username,
                invited_by: validReferrer || undefined,
                points: 0,
                is_winner: false,
                is_point_given: false
            });
        }

        // Check if we should award point now
        if (subscribed && user.invited_by && !user.is_point_given) {
            const referrer = await userService.getUserByTelegramId(user.invited_by);
            if (referrer) {
                const updatedReferrer = await userService.addPoint(user.invited_by);
                await userService.markPointAsGiven(telegramId);

                // Notify referrer
                await ctx.telegram.sendMessage(user.invited_by, `Tabriklaymiz! Taklif qilgan do'stingiz kanalga a'zo bo'ldi. Sizga +1 ball berildi.`);

                // Check if referrer reached the goal
                if (updatedReferrer && updatedReferrer.points >= config.POINTS_REQUIRED && !updatedReferrer.is_winner) {
                    await userService.setWinner(user.invited_by);
                    const successMessage = `🎉 Tabriklaymiz! Siz muvaffaqiyatli ${config.POINTS_REQUIRED} ta ball to'pladingiz!\n\n` +
                        `Mana siz kutgan yopiq guruh havolasi:\n` +
                        `${config.PRIVATE_GROUP_LINK}\n\n` +
                        `Guruhga a'zo bo'ling va darslarni kuting!`;

                    await ctx.telegram.sendMessage(user.invited_by, successMessage);
                }
            }
        }

        if (!subscribed) {
            return ctx.reply(`Salom ${fullName}! Botdan foydalanish va ball yig'ish uchun avval kanalimizga a'zo bo'ling:`,
                Markup.inlineKeyboard([
                    [Markup.button.url('📢 Kanalga a\'zo bo\'lish', config.CHANNEL_URL)],
                    [Markup.button.callback('✅ Tekshirish', 'check_sub')]
                ])
            );
        }

        await ctx.reply(`Salom ${fullName}! Seminar registratsiya botiga xush kelibsiz.\n\nPastdagi tugmalar orqali referal havolangizni oling va ball to'plashni boshlang!`, {
            reply_markup: {
                keyboard: [
                    [{ text: '📊 Ballarim' }, { text: '🔗 Havola olish' }],
                    [{ text: 'ℹ️ Seminar haqida' }]
                ],
                resize_keyboard: true
            }
        });

    } catch (error) {
        console.error('Start handler error:', error);
        await ctx.reply('Xatolik yuz berdi. Iltimos keyinroq urinib ko\'ring.');
    }
}
