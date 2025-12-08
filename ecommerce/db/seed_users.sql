-- db/seed_users.sql
-- SQL for creating `users` table and seeding an admin user for Supabase.
-- NOTE: Supabase Auth stores hashed passwords in the auth schema. Do not insert password hashes into this `users` table.
-- Instead: create the auth user first (via Supabase Dashboard or CLI), then insert a matching row into this table linking by `id`.

-- Create users table (if not exists)
create table if not exists public.users (
  id uuid primary key,
  email text unique,
  role text not null default 'customer',
  created_at timestamptz default now()
);

-- Example: how to seed an admin user
-- 1) Create the user in Supabase Auth (Dashboard -> Authentication -> Users -> Invite or Sign Up)
--    Note the user's `id` (uuid) and `email` shown in the dashboard.
-- 2) Insert the row below using that exact uuid and email. Replace <ADMIN_UUID> and <ADMIN_EMAIL>.

-- INSERT INTO public.users (id, email, role) VALUES ('<ADMIN_UUID>', '<ADMIN_EMAIL>', 'admin');

-- Example placeholder (do NOT use these values in production):
-- INSERT INTO public.users (id, email, role) VALUES ('11111111-1111-1111-1111-111111111111', 'admin@example.com', 'admin');

-- For registering customers via your app, the application should:
-- - Create the user with Supabase Auth (supabase.auth.signUp)
-- - On success, insert/upsert into public.users with id=user.id, email=user.email, role='customer'

-- End of file
