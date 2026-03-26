-- Add payment type (venmo, zelle) to members
ALTER TABLE members ADD COLUMN payment_type text;

-- Default existing @-prefixed handles to venmo
UPDATE members SET payment_type = 'venmo' WHERE payment_handle IS NOT NULL AND payment_handle LIKE '@%';
