-- ================================================================
-- ESEFTWO Market - Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Products ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  price      NUMERIC NOT NULL DEFAULT 0,
  image_url  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Orders ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  class         TEXT NOT NULL,
  total         NUMERIC NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Order Items ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  price        NUMERIC NOT NULL DEFAULT 0,
  quantity     INTEGER NOT NULL DEFAULT 1,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Row Level Security ───────────────────────────────────────────
-- Enable RLS
ALTER TABLE products   ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders     ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Allow all operations via anon key (for school POS use case)
-- In production you'd want proper auth policies
CREATE POLICY "Allow all on products"    ON products    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on orders"      ON orders      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on order_items" ON order_items FOR ALL USING (true) WITH CHECK (true);

-- ── Storage (for product images) ─────────────────────────────────
-- Run this AFTER creating the bucket from Supabase Dashboard:
--   Dashboard → Storage → New Bucket → Name: "product-images" → Public: ON
-- Then run this storage policy:
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Public read product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Anon upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Anon delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');

-- ── Sample Products ──────────────────────────────────────────────
INSERT INTO products (name, price) VALUES
  ('Mie Goreng',       5000),
  ('Nasi Goreng',      8000),
  ('Es Teh Manis',     3000),
  ('Bakso Kuah',       7000),
  ('Tempe Goreng',     2000),
  ('Sate Ayam',        10000),
  ('Jus Jeruk',        5000),
  ('Pisang Goreng',    3000)
ON CONFLICT DO NOTHING;
