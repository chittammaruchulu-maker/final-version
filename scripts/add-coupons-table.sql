-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code         TEXT NOT NULL UNIQUE,
  type         TEXT NOT NULL CHECK (type IN ('percent', 'flat')),
  discount     NUMERIC NOT NULL,
  min_order    NUMERIC NOT NULL DEFAULT 0,
  max_uses     INTEGER,
  expires_at   TIMESTAMPTZ,
  active       BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tracks which user/email used which coupon (one-time-per-email enforcement)
CREATE TABLE IF NOT EXISTS coupon_usages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id   UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id     UUID,
  email       TEXT NOT NULL,
  order_id    TEXT NOT NULL,
  used_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (coupon_id, email)
);

-- Seed initial coupons (skip if already exist)
INSERT INTO coupons (code, type, discount, min_order, active)
VALUES
  ('CHITTAMMA10', 'percent', 0.10, 0, true),
  ('WELCOME50',   'flat',    50,   0, true),
  ('FESTIVE15',   'percent', 0.15, 0, true)
ON CONFLICT (code) DO NOTHING;

-- RLS
ALTER TABLE coupons       ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'coupons' AND policyname = 'allow all for service role on coupons'
  ) THEN
    EXECUTE 'CREATE POLICY "allow all for service role on coupons"
      ON coupons FOR ALL
      TO service_role
      USING (true) WITH CHECK (true)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'coupon_usages' AND policyname = 'allow all for service role on coupon_usages'
  ) THEN
    EXECUTE 'CREATE POLICY "allow all for service role on coupon_usages"
      ON coupon_usages FOR ALL
      TO service_role
      USING (true) WITH CHECK (true)';
  END IF;
END $$;
