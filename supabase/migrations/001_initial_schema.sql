-- Global Express Delivery Database Schema
-- Migration: 001_initial_schema
-- Created: 2025-12-09

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Livreurs (Delivery Personnel)
CREATE TABLE livreurs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (Authentication & Roles)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'livreur')),
  name TEXT NOT NULL,
  livreur_id UUID REFERENCES livreurs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses (Deliveries)
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('livraison', 'expedition')),
  livreur_id UUID NOT NULL REFERENCES livreurs(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN DEFAULT false,
  
  -- Livraison details (JSON)
  livraison_contact_name TEXT,
  livraison_quartier TEXT,
  livraison_articles JSONB,
  livraison_delivery_fee DECIMAL(10, 2),
  
  -- Expedition details (JSON)
  expedition_destination_city TEXT,
  expedition_fee DECIMAL(10, 2),
  expedition_validated BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  livreur_id UUID NOT NULL REFERENCES livreurs(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  validated BOOLEAN DEFAULT false,
  rejected_reason TEXT,
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Payments
CREATE TABLE daily_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  livreur_id UUID NOT NULL REFERENCES livreurs(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount DECIMAL(10, 2) NOT NULL,
  expected_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(livreur_id, date)
);

-- Manquants (Shortages)
CREATE TABLE manquants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  livreur_id UUID NOT NULL REFERENCES livreurs(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('undelivered_not_returned', 'payment_shortage', 'unvalidated_expense')),
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_users_livreur_id ON users(livreur_id);
CREATE INDEX idx_courses_livreur_id ON courses(livreur_id);
CREATE INDEX idx_courses_date ON courses(date);
CREATE INDEX idx_courses_completed ON courses(completed);
CREATE INDEX idx_expenses_livreur_id ON expenses(livreur_id);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_validated ON expenses(validated);
CREATE INDEX idx_daily_payments_livreur_id ON daily_payments(livreur_id);
CREATE INDEX idx_daily_payments_date ON daily_payments(date);
CREATE INDEX idx_manquants_livreur_id ON manquants(livreur_id);
CREATE INDEX idx_manquants_date ON manquants(date);

-- ============================================================================
-- TRIGGERS (Updated At)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_livreurs_updated_at BEFORE UPDATE ON livreurs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_payments_updated_at BEFORE UPDATE ON daily_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_manquants_updated_at BEFORE UPDATE ON manquants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE livreurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE manquants ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user's livreur_id
CREATE OR REPLACE FUNCTION get_user_livreur_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT livreur_id FROM users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RLS POLICIES - LIVREURS
-- ============================================================================

-- Admins can do everything
CREATE POLICY "Admins have full access to livreurs"
  ON livreurs FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Livreurs can view all livreurs (for UI purposes)
CREATE POLICY "Livreurs can view all livreurs"
  ON livreurs FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- RLS POLICIES - USERS
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (id = auth.uid());

-- Admins can view all users
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (is_admin());

-- Admins can create users
CREATE POLICY "Admins can create users"
  ON users FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update users
CREATE POLICY "Admins can update users"
  ON users FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- RLS POLICIES - COURSES
-- ============================================================================

-- Admins have full access
CREATE POLICY "Admins have full access to courses"
  ON courses FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Livreurs can view their own courses
CREATE POLICY "Livreurs can view their own courses"
  ON courses FOR SELECT
  USING (livreur_id = get_user_livreur_id());

-- Livreurs can update their own courses (mark as completed, update articles)
CREATE POLICY "Livreurs can update their own courses"
  ON courses FOR UPDATE
  USING (livreur_id = get_user_livreur_id())
  WITH CHECK (livreur_id = get_user_livreur_id());

-- ============================================================================
-- RLS POLICIES - EXPENSES
-- ============================================================================

-- Admins have full access
CREATE POLICY "Admins have full access to expenses"
  ON expenses FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Livreurs can view their own expenses
CREATE POLICY "Livreurs can view their own expenses"
  ON expenses FOR SELECT
  USING (livreur_id = get_user_livreur_id());

-- Livreurs can create their own expenses
CREATE POLICY "Livreurs can create their own expenses"
  ON expenses FOR INSERT
  WITH CHECK (livreur_id = get_user_livreur_id());

-- ============================================================================
-- RLS POLICIES - DAILY PAYMENTS
-- ============================================================================

-- Admins have full access
CREATE POLICY "Admins have full access to daily_payments"
  ON daily_payments FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Livreurs can view their own payments
CREATE POLICY "Livreurs can view their own payments"
  ON daily_payments FOR SELECT
  USING (livreur_id = get_user_livreur_id());

-- ============================================================================
-- RLS POLICIES - MANQUANTS
-- ============================================================================

-- Admins have full access
CREATE POLICY "Admins have full access to manquants"
  ON manquants FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Livreurs can view their own manquants
CREATE POLICY "Livreurs can view their own manquants"
  ON manquants FOR SELECT
  USING (livreur_id = get_user_livreur_id());

-- ============================================================================
-- SEED DATA (Optional - for testing)
-- ============================================================================

-- Note: You'll need to create the admin user through Supabase Auth first
-- Then insert the corresponding user record here with their auth.uid()

-- Example:
-- INSERT INTO users (id, role, name) VALUES 
--   ('your-auth-uid-here', 'admin', 'Admin');
