import { supabase } from './index';

export interface User {
    telegram_id: number;
    full_name: string;
    username?: string;
    points: number;
    is_winner: boolean;
    is_point_given: boolean;
    invited_by?: number;
}

export const userService = {
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
