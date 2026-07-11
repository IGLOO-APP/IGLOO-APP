-- Migration 013: Storage RLS policies for inspection-photos bucket

-- Ensure RLS is enabled on storage.objects
-- (This is enabled by default on Supabase projects, but we ensure it here)

-- Policy: Authenticated users can upload inspection photos
drop policy if exists "Users can upload inspection photos" on storage.objects;
create policy "Users can upload inspection photos" on storage.objects
  for insert
  with check (
    bucket_id = 'inspection-photos'
    and auth.role() = 'authenticated'
  );

-- Policy: Authenticated users can view inspection photos
drop policy if exists "Users can view inspection photos" on storage.objects;
create policy "Users can view inspection photos" on storage.objects
  for select
  using (
    bucket_id = 'inspection-photos'
    and auth.role() = 'authenticated'
  );

-- Policy: Authenticated users can update inspection photos
drop policy if exists "Users can update inspection photos" on storage.objects;
create policy "Users can update inspection photos" on storage.objects
  for update
  with check (
    bucket_id = 'inspection-photos'
    and auth.role() = 'authenticated'
  );

-- Policy: Only admins can delete inspection photos
drop policy if exists "Admins can delete inspection photos" on storage.objects;
create policy "Admins can delete inspection photos" on storage.objects
  for delete
  using (
    bucket_id = 'inspection-photos'
    and exists (
      select 1 from public.profiles
      where id = (auth.jwt() ->> 'sub')::text
      and role = 'admin'
    )
  );
