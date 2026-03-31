
-- Revert bucket to public for backward compatibility with stored URLs
-- The RLS policy change (authenticated-only) still applies for API access
UPDATE storage.buckets SET public = true WHERE id = 'profile-photos';
