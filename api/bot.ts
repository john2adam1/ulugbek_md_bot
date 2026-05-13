import { Telegraf } from 'telegraf';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// ==================== CONFIG ====================
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const CHANNEL_ID = process.env.CHANNEL_ID || '@your_channel';
const CHANNEL_URL = 'https://t.me/Ulugbek_Zaylobidinov';
const POINTS_REQUIRED = 5;
const PRIVATE_GROUP_LINK = process.env.PRIVATE_GROUP_LINK || '';
const ADMIN_IDS = (process.env.ADMIN_IDS || '')
    .split(',')
    .map(id => parseInt(id.trim()))
    .filter(id => !isNaN(id));

// ==================== DATABASE ====================
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface User {
    telegram_id: number;
    full_name: string;
    username?: string;
    points: number;
    is_winner: boolean;
    is_point_given: boolean;
    invited_by?: number;
}

const userService = {
    async getUserByTelegramId(telegramId: number) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('telegram_id', telegramId)
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    async createUser(userData: Partial<User>) {
        const { data, error } = await supabase
            .from('users')
            .upsert(userData, { onConflict: 'telegram_id' })
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async addPoint(telegramId: number) {
        const { data: user } = await supabase
            .from('users')
            .select('points')
            .eq('telegram_id', telegramId)
            .single();

        if (user) {
            const { data, error } = await supabase
                .from('users')
                .update({ points: user.points + 1 })
                .eq('telegram_id', telegramId)
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    },

    async markPointAsGiven(telegramId: number) {
        const { error } = await supabase
            .from('users')
            .update({ is_point_given: true })
            .eq('telegram_id', telegramId);
        if (error) throw error;
    },

    async setWinner(telegramId: number) {
        const { error } = await supabase
            .from('users')
            .update({ is_winner: true })
            .eq('telegram_id', telegramId);
        if (error) throw error;
    },

    async getAdminStats() {
        const { count: totalUsers } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        const { count: totalWinners } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('is_winner', true);

        return { totalUsers, totalWinners };
    },

    async getAllWinners() {
        const { data, error } = await supabase
            .from('users')
            .select('username, points')
            .eq('is_winner', true)
            .order('points', { ascending: false });
        if (error) throw error;
        return data;
    }
};

// ==================== BOT SETUP ====================
const bot = new Telegraf(BOT_TOKEN);

// Global error handler
bot.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        console.error('Bot Error:', err);
    }
});

// ==================== HANDLERS ====================

// Check subscription helper
async function isSubscribed(ctx: any, userId: number): Promise<boolean> {
    try {
        const member = await ctx.telegram.getChatMember(CHANNEL_ID, userId);
        return ['member', 'administrator', 'creator'].includes(member.status);
    } catch (e: any) {
        if (e.description === 'Bad Request: chat not found') {
            console.error(`ERROR: Bot cannot find the channel ${CHANNEL_ID}. Make sure the ID/username is correct and the bot is an ADMIN in the channel.`);
        } else {
            console.error('Subscription check error:', e);
        }
        return false;
    }
}

// /start command
bot.start(async (ctx) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const fullName = ctx.from?.first_name + (ctx.from?.last_name ? ` ${ctx.from.last_name}` : '');
    const username = ctx.from?.username;

    const startPayload = (ctx as any).startPayload;
    const referrerId = startPayload ? parseInt(startPayload) : null;

    try {
        let user = await userService.getUserByTelegramId(telegramId);
        const subscribed = await isSubscribed(ctx, telegramId);

        if (!user) {
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

        if (subscribed && user.invited_by && !user.is_point_given) {
            const referrer = await userService.getUserByTelegramId(user.invited_by);
            if (referrer) {
                const updatedReferrer = await userService.addPoint(user.invited_by);
                await userService.markPointAsGiven(telegramId);

                await ctx.telegram.sendMessage(user.invited_by, `Tabriklaymiz! Taklif qilgan do'stingiz kanalga a'zo bo'ldi. Sizga +1 ball berildi.`);

                if (updatedReferrer && updatedReferrer.points >= POINTS_REQUIRED && !updatedReferrer.is_winner) {
                    await userService.setWinner(user.invited_by);
                    const successMessage = `🎉 Tabriklaymiz! Siz ekg baza kanali uchun 1 oylik obuna ga ega boldingiz, ` +
                        `va biz sizni yopiq kanalga qo'shib qo'yamiz`;

                    await ctx.telegram.sendMessage(user.invited_by, successMessage);
                }
            }
        }

        if (!subscribed) {
            return ctx.reply(`Salom ${fullName}! Botdan foydalanish va ball yig'ish uchun avval kanalimizga a'zo bo'ling:`, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '📢 Kanalga a\'zo bo\'lish', url: CHANNEL_URL }],
                        [{ text: '✅ Tekshirish', callback_data: 'check_sub' }]
                    ]
                }
            });
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
});

// check_sub callback
bot.action('check_sub', async (ctx) => {
    await ctx.answerCbQuery().catch(() => { });
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const fullName = ctx.from?.first_name + (ctx.from?.last_name ? ` ${ctx.from.last_name}` : '');
    const subscribed = await isSubscribed(ctx, telegramId);

    if (!subscribed) {
        return ctx.reply(`Salom ${fullName}! Botdan foydalanish va ball yig'ish uchun avval kanalimizga a'zo bo'ling:`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '📢 Kanalga a\'zo bo\'lish', url: CHANNEL_URL }],
                    [{ text: '✅ Tekshirish', callback_data: 'check_sub' }]
                ]
            }
        });
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
});

// Subscription check middleware for other commands
bot.use(async (ctx, next) => {
    if (ctx.from?.id) {
        try {
            const member = await ctx.telegram.getChatMember(CHANNEL_ID, ctx.from.id);
            const statuses = ['member', 'administrator', 'creator'];

            if (statuses.includes(member.status)) {
                return next();
            } else {
                await ctx.reply(`Iltimos, botdan foydalanish uchun kanalimizga a'zo bo'ling:`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '📢 Kanalga a\'zo bo\'lish', url: CHANNEL_URL }],
                            [{ text: '✅ Tekshirish', callback_data: 'check_sub' }]
                        ]
                    }
                });
            }
        } catch (error) {
            console.error('Subscription check error:', error);
            return next();
        }
    }
});

// Menu handlers
bot.hears('📊 Ballarim', async (ctx) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const user = await userService.getUserByTelegramId(telegramId);
    if (!user) return;

    const pointsLeft = Math.max(0, POINTS_REQUIRED - user.points);
    let message = `Sizning joriy ballaringiz: ${user.points}\n`;

    if (user.points >= POINTS_REQUIRED) {
        message += `\n✅ Tabriklaymiz! Siz ekg baza kanali uchun 1 oylik obuna ga ega boldingiz, ` +
            `va biz sizni yopiq kanalga qo'shib qo'yamiz`;
    } else {
        message += `Maqsadga yetish uchun yana ${pointsLeft} ta ball to'plashingiz kerak.`;
    }

    await ctx.reply(message, { parse_mode: 'Markdown' });
});

bot.hears('🔗 Havola olish', async (ctx) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const botInfo = await ctx.telegram.getMe();
    const referralLink = `https://t.me/${botInfo.username}?start=${telegramId}`;

    const escapedLink = referralLink.replace(/_/g, '\\_');
    const text = `🩺 *Bepul EKG darslari*\n\nMalakali kardiolog tomonidan olib boriladi.\n\n1 hafta davomida EKG asoslaridan boshlab murakkab aritmiyalargacha o'rgatiladi.\n\nBepul darslarda qatnashish uchun kamida 5 ta do'stingizni taklif qilishingiz kerak bo'ladi.\n\nRo'yxatdan o'tish: ${escapedLink}`;

    await ctx.reply(`Sizning shaxsiy referal havolangiz:\n\n${referralLink}\n\nUshbu matnni nusxalab do'stlaringizga yuboring:`);
    await ctx.reply(text, { parse_mode: 'Markdown' });
});

bot.hears('ℹ️ Seminar haqida', async (ctx) => {
    await ctx.reply(`ℹ️ *Darslar haqida*\n\nMavzu: EKG asoslari va aritmiyalar\nDavomiyligi: 1 hafta\nFormat: Telegram kanal orqali bepul darslar\n\nUshbu darslar malakali kardiolog tomonidan olib boriladi va EKGni o'qish hamda tahlil qilishni o'rgatadi.`, {
        parse_mode: 'Markdown'
    });
});

// Admin command
bot.command('admin', async (ctx) => {
    const telegramId = ctx.from?.id;
    if (!telegramId || !ADMIN_IDS.includes(telegramId)) {
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
});

// ==================== VERCEL HANDLER ====================
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
