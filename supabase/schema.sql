-- Annuaire des Appels d'Offre Publics France
-- Exécuter dans le SQL Editor de ton projet Supabase

create table if not exists appels_offre (
  id              bigint primary key generated always as identity,
  reference       text unique not null,
  titre           text not null,
  slug            text not null,
  objet           text,
  acheteur        text,
  acheteur_siret  text,
  categorie       text,           -- slug: "nettoyage", "travaux-publics"
  categorie_label text,
  cpv_code        text,
  region          text,           -- slug: "ile-de-france"
  region_label    text,
  departement     text,
  type_marche     text,           -- "travaux" | "fournitures" | "services"
  procedure       text,           -- "ouvert" | "restreint" | "mapa"
  montant_estime  numeric,
  date_publication timestamptz,
  date_limite     timestamptz,
  url_document    text,
  raw_data        jsonb,
  created_at      timestamptz default now()
);

-- RLS — les données sont publiques en lecture, écriture réservée au service role
alter table appels_offre enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'appels_offre' and policyname = 'Lecture publique'
  ) then
    execute 'create policy "Lecture publique" on appels_offre for select using (true)';
  end if;
end $$;

-- Indexes pour les requêtes fréquentes
create index if not exists idx_ao_categorie on appels_offre (categorie);
create index if not exists idx_ao_region on appels_offre (region);
create index if not exists idx_ao_categorie_region on appels_offre (categorie, region);
create index if not exists idx_ao_date_publication on appels_offre (date_publication desc);
create index if not exists idx_ao_date_limite on appels_offre (date_limite);
create index if not exists idx_ao_type_marche on appels_offre (type_marche);

-- RPC pour les top catégories avec COUNT réel (pas de scan JS)
-- À exécuter dans le SQL Editor de Supabase
create or replace function get_top_categories(lim integer default 40)
returns table(categorie text, categorie_label text, cnt bigint)
language sql stable as $$
  select categorie, categorie_label, count(*) as cnt
  from appels_offre
  where categorie is not null
    and categorie not in ('travaux', 'services', 'fournitures')
  group by categorie, categorie_label
  order by cnt desc
  limit lim;
$$;

-- RPC pour les régions par catégorie avec COUNT
create or replace function get_regions_by_categorie(cat text)
returns table(region text, region_label text, cnt bigint)
language sql stable as $$
  select region, region_label, count(*) as cnt
  from appels_offre
  where region is not null
    and (categorie = cat or type_marche = cat)
  group by region, region_label
  order by cnt desc;
$$;
