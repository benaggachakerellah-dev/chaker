CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id),
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status payout_status NOT NULL DEFAULT 'pending',
  CONSTRAINT chk_payout_period CHECK (period_end >= period_start)
);

CREATE INDEX idx_payouts_farm_id ON payouts(farm_id);
CREATE INDEX idx_payouts_status ON payouts(status);
