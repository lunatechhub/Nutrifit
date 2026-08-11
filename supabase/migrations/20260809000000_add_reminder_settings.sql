alter table profiles
  add column if not exists reminders_enabled boolean default false,
  add column if not exists breakfast_time    text default '08:00',
  add column if not exists lunch_time        text default '12:30',
  add column if not exists dinner_time       text default '19:00',
  add column if not exists evening_nudge     boolean default true;
