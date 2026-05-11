-- Users table for Telegram Referral Bot
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_id BIGINT UNIQUE NOT NULL,
    full_name TEXT,
    username TEXT,
    points INTEGER DEFAULT 0,
    is_winner BOOLEAN DEFAULT FALSE,
    is_point_given BOOLEAN DEFAULT FALSE,
    invited_by BIGINT REFERENCES users(telegram_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups by telegram_id
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);

-- Optional: Add a constraint to prevent self-invitation at database level
-- (though we will handle this in the bot logic as well)
ALTER TABLE users ADD CONSTRAINT check_not_self_invited CHECK (telegram_id != invited_by);
