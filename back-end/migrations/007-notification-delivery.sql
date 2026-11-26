ALTER TABLE notifications ADD COLUMN title TEXT NOT NULL DEFAULT 'IndAI notification';
ALTER TABLE notifications ADD COLUMN source TEXT NOT NULL DEFAULT 'IndAI';
CREATE INDEX notifications_unread ON notifications(user_id) WHERE read=0;
CREATE INDEX subscriptions_reminder_due ON subscriptions(ends) WHERE state IN ('active','canceled');

CREATE TABLE subscription_reminders(
  subscription INTEGER NOT NULL REFERENCES subscriptions(id),
  ends INTEGER NOT NULL,
  lead_days INTEGER NOT NULL,
  notification INTEGER NOT NULL REFERENCES notifications(id),
  PRIMARY KEY(subscription,ends,lead_days)
);
