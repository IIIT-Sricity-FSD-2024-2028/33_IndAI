UPDATE users SET role='provider' WHERE role='coordinator';
UPDATE guidance SET kind='provider' WHERE kind='coordinator';
UPDATE users SET status='archived' WHERE role='admin' AND division IN ('courses','support');
UPDATE users SET division='users' WHERE role='admin' AND division IN ('courses','support');
DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE status='archived');
