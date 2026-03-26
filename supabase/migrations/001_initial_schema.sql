-- Expense Splitter Schema
-- Run this in the Supabase SQL editor to set up the database

-- Groups table
CREATE TABLE groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Members table
CREATE TABLE members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(group_id, name)
);

-- Expenses table
CREATE TABLE expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  paid_by uuid NOT NULL REFERENCES members(id),
  description text NOT NULL,
  amount numeric(10,2) NOT NULL,
  split_method text NOT NULL CHECK (split_method IN ('equal', 'percentage')),
  created_at timestamptz DEFAULT now()
);

-- Expense splits table
CREATE TABLE expense_splits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id uuid NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES members(id),
  percentage numeric(5,2),
  amount numeric(10,2) NOT NULL
);

-- Indexes for query performance
CREATE INDEX idx_members_group_id ON members(group_id);
CREATE INDEX idx_expenses_group_id ON expenses(group_id);
CREATE INDEX idx_expense_splits_expense_id ON expense_splits(expense_id);

-- Enable RLS (permissive since no auth)
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_splits ENABLE ROW LEVEL SECURITY;

-- Permissive policies (allow all operations)
CREATE POLICY "Allow all on groups" ON groups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on members" ON members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on expense_splits" ON expense_splits FOR ALL USING (true) WITH CHECK (true);
