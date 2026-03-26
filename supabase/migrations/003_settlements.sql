-- Settlements: track when someone confirms they paid a debt
CREATE TABLE settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  paid_by uuid NOT NULL REFERENCES members(id),
  paid_to uuid NOT NULL REFERENCES members(id),
  amount numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_settlements_group_id ON settlements(group_id);

ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on settlements" ON settlements FOR ALL USING (true) WITH CHECK (true);
