-- Allow public read access to livreurs table so they can be listed on the login screen
CREATE POLICY "Public can view livreurs"
ON livreurs FOR SELECT
USING (true);
