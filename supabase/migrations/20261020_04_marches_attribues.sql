-- Outil 8 : marchés attribués (DECP) et index des acheteurs.
-- Source : « Données essentielles de la commande publique consolidées (format tabulaire) », data.gouv.fr, Licence Ouverte 2.0.
-- Une ligne par marché et par titulaire, version actuelle uniquement, 3 dernières années.
-- Import initial : node --env-file=.env.local scripts/import-decp.mjs ; mise à jour : /api/cron/decp (quotidien).

create table if not exists marches_attribues (
  id                  text primary key,          -- sha1(uid | titulaire)
  uid                 text not null,
  acheteur_id         text not null,             -- SIRET
  acheteur_nom        text,
  acheteur_categorie  text,
  acheteur_commune    text,
  acheteur_departement text,
  titulaire_id        text,
  titulaire_nom       text,
  titulaire_categorie text,
  objet               text,
  montant             numeric,
  date_notification   date,
  date_publication    date,
  offres_recues       integer,
  procedure           text,
  nature              text,
  type                text,                      -- travaux | services | fournitures
  cpv                 text,
  duree_mois          integer,
  updated_at          timestamptz default now()
);

create index if not exists idx_ma_acheteur on marches_attribues (acheteur_id, date_notification desc);
create index if not exists idx_ma_titulaire on marches_attribues (titulaire_id);
create index if not exists idx_ma_segment on marches_attribues (acheteur_departement, type, date_notification desc);
create index if not exists idx_ma_date on marches_attribues (date_notification desc);
create index if not exists idx_ma_cpv on marches_attribues (cpv text_pattern_ops);

alter table marches_attribues enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'marches_attribues' and policyname = 'Lecture publique') then
    execute 'create policy "Lecture publique" on marches_attribues for select using (true)';
  end if;
end $$;

-- Index des acheteurs (une ligne par SIRET), rafraîchi après chaque import
create materialized view if not exists acheteurs_index as
select
  acheteur_id,
  (array_agg(acheteur_nom order by date_notification desc nulls last) filter (where acheteur_nom is not null))[1] as nom,
  max(acheteur_departement) as departement,
  max(acheteur_commune) as commune,
  max(acheteur_categorie) as categorie,
  count(distinct uid) as nb_marches,
  max(date_notification) as dernier_marche
from marches_attribues
group by acheteur_id;

create unique index if not exists idx_acheteurs_index_id on acheteurs_index (acheteur_id);
create index if not exists idx_acheteurs_index_nb on acheteurs_index (nb_marches desc);
grant select on acheteurs_index to anon, authenticated;

create or replace function refresh_acheteurs_index()
returns void language sql security definer set search_path = public as $$
  refresh materialized view concurrently acheteurs_index;
$$;
revoke all on function refresh_acheteurs_index() from public, anon, authenticated;
