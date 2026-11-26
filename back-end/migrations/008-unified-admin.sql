UPDATE users SET division=NULL WHERE role='admin' AND division IS NOT NULL;
