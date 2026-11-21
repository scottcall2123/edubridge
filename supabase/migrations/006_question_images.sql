begin;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('question-images','question-images',false,5242880,array['image/jpeg','image/png'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy edubridge_images_insert on storage.objects for insert to authenticated with check(bucket_id='question-images' and (storage.foldername(name))[1]=auth.uid()::text);
create policy edubridge_images_read on storage.objects for select to authenticated using(bucket_id='question-images' and (storage.foldername(name))[1]=auth.uid()::text);
create policy edubridge_images_delete on storage.objects for delete to authenticated using(bucket_id='question-images' and (storage.foldername(name))[1]=auth.uid()::text);
notify pgrst,'reload schema';
commit;
