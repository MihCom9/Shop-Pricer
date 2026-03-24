-- Remove the array column from profiles
ALTER TABLE profiles DROP COLUMN IF EXISTS preferred_store_ids;

-- Create the junction table with proper FK to both profiles and stores
CREATE TABLE IF NOT EXISTS profile_stores (
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  store_id   int2 REFERENCES stores(id)  ON DELETE CASCADE,
  PRIMARY KEY (profile_id, store_id)
);

ALTER TABLE profile_stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own preferred stores" ON profile_stores
  FOR ALL USING (auth.uid() = profile_id);
