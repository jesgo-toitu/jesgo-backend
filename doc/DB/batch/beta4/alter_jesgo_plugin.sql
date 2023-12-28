ALTER TABLE jesgo_plugin ADD disabled boolean default false;
UPDATE jesgo_plugin SET disabled = false;
