ALTER TABLE orders ADD COLUMN feed_mode TEXT NOT NULL DEFAULT 'live' CHECK(feed_mode IN ('live','replay'));
ALTER TABLE orders ADD COLUMN replay_day TEXT;
