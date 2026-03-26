-- Add payment handle (Venmo, Zelle, etc.) to members
ALTER TABLE members ADD COLUMN payment_handle text;
