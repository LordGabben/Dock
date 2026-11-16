-- Run once in Supabase Dashboard -> SQL Editor.
-- Payload stores only dock/whatsapp/<tenantId>; plaintext is available only
-- inside these service_role-only SECURITY DEFINER functions.

create extension if not exists supabase_vault with schema vault;

create or replace function public.dock_vault_upsert_secret(
  p_name text,
  p_secret text
)
returns uuid
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  v_id uuid;
begin
  if p_name !~ '^dock/whatsapp/[A-Za-z0-9_-]{1,128}$' then
    raise exception 'invalid secret name';
  end if;
  if length(p_secret) < 20 or length(p_secret) > 4096 then
    raise exception 'invalid secret value';
  end if;

  select id into v_id
  from vault.secrets
  where name = p_name
  limit 1;

  if v_id is null then
    v_id := vault.create_secret(p_secret, p_name, 'DOCK WhatsApp tenant credential');
  else
    perform vault.update_secret(
      v_id,
      p_secret,
      p_name,
      'DOCK WhatsApp tenant credential'
    );
  end if;

  return v_id;
end;
$$;

create or replace function public.dock_vault_read_secret(p_name text)
returns text
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  v_secret text;
begin
  if p_name !~ '^dock/whatsapp/[A-Za-z0-9_-]{1,128}$' then
    raise exception 'invalid secret name';
  end if;

  select decrypted_secret into v_secret
  from vault.decrypted_secrets
  where name = p_name
  limit 1;

  return v_secret;
end;
$$;

revoke all on function public.dock_vault_upsert_secret(text, text) from public;
revoke all on function public.dock_vault_upsert_secret(text, text) from anon;
revoke all on function public.dock_vault_upsert_secret(text, text) from authenticated;
grant execute on function public.dock_vault_upsert_secret(text, text) to service_role;

revoke all on function public.dock_vault_read_secret(text) from public;
revoke all on function public.dock_vault_read_secret(text) from anon;
revoke all on function public.dock_vault_read_secret(text) from authenticated;
grant execute on function public.dock_vault_read_secret(text) to service_role;
