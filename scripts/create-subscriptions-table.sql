-- Cloud Kitchen Subscriptions table
CREATE TABLE IF NOT EXISTS cloud_kitchen_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_name TEXT NOT NULL,
  plan_price INTEGER NOT NULL,
  plan_duration TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  delivery_time TEXT NOT NULL,
  meal_preference TEXT NOT NULL DEFAULT 'veg',
  start_date DATE NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'upi',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE cloud_kitchen_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY ck_sub_insert_all ON cloud_kitchen_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY ck_sub_read_all ON cloud_kitchen_subscriptions FOR SELECT USING (true);
CREATE POLICY ck_sub_update_all ON cloud_kitchen_subscriptions FOR UPDATE USING (true);
