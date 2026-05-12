import dotenv from 'dotenv';
dotenv.config();

export const config = {
    BOT_TOKEN: process.env.BOT_TOKEN || '',
    SUPABASE_URL: process.env.SUPABASE_URL || '',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    CHANNEL_ID: process.env.CHANNEL_ID || '@your_channel',
    CHANNEL_URL: 'https://t.me/Ulugbek_Zaylobidinov',
    POINTS_REQUIRED: 5,
    PRIVATE_GROUP_LINK: process.env.PRIVATE_GROUP_LINK || '',
    ADMIN_IDS: (process.env.ADMIN_IDS || '').split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)),
};
