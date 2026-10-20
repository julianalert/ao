-- Outil 4 : seuils des marchés publics, avec dates de validité.
-- À exécuter dans le SQL Editor de Supabase, puis : node scripts/seed-seuils.mjs
-- Les seuils se modifient ensuite directement dans la table (Table Editor), sans redéploiement.

create table if not exists seuils (
  id          text primary key,
  code        text not null,          -- formalise | dispense | dispense-pac | publicite-mapa | ecrit | dce-en-ligne | petit-lot-mapa | petit-lot-dispense
  type_marche text,                   -- travaux | fournitures-services | null (tous)
  acheteur    text,                   -- etat | collectivite | entite-adjudicatrice | null (tous)
  montant     numeric not null,       -- € HT
  valid_from  date not null,
  valid_to    date,                   -- null : en vigueur sans date de fin
  libelle     text not null,
  reference   text not null,
  source_url  text,
  note        text,
  updated_at  timestamptz default now()
);

create index if not exists idx_seuils_code on seuils (code, valid_from);

alter table seuils enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'seuils' and policyname = 'Lecture publique') then
    execute 'create policy "Lecture publique" on seuils for select using (true)';
  end if;
end $$;
