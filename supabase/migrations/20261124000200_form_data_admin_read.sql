-- Admins need to open applicants' private uploads (documents, LOR) from /admin/reg-list.
-- The existing policy only lets the owner (2nd folder = their uid) access their files.
create policy "form_data: admins can read all files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'form_data'
    and exists (select 1 from public.user_info u where u.id = auth.uid() and u.is_admin)
  );
