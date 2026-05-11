import dotenv from 'dotenv';
dotenv.config();

export const config = {
    BOT_TOKEN: process.env.BOT_TOKEN || '',
    SUPABASE_URL: process.env.SUPABASE_URL || '',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    CHANNEL_ID: process.env.CHANNEL_ID || '@your_channel', // Replace with your actual channel ID
    POINTS_REQUIRED: 4,
};
