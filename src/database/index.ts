import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

if (!config.SUPABASE_URL || !config.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('Supabase credentials missing. Database functionality will be limited.');
}

export const supabase = createClient(
    config.SUPABASE_URL,
    config.SUPABASE_SERVICE_ROLE_KEY
);
