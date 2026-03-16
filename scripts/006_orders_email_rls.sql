-- Allow users to read orders that match their email (fallback for orders where user_id was not set)
create policy "orders_select_by_email" on public.orders
  for select using (
    customer_email = (select email from auth.users where id = auth.uid())
  );
