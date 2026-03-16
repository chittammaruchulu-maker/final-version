-- Backfill user_id for orders where user_id is null
-- Matches orders to auth.users by email address
update public.orders o
set user_id = u.id
from auth.users u
where o.user_id is null
  and lower(trim(o.email)) = lower(trim(u.email));
