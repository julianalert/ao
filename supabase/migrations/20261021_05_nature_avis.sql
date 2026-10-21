-- Type d'avis BOAMP de chaque fiche : APPEL_OFFRE (avis de marché), ATTRIBUTION,
-- RECTIFICATIF, ANNULATION… Sert à n'indexer et à ne mettre dans le sitemap que les
-- appels d'offres encore ouverts (lib/fiche-utile.ts).
--
-- Une colonne générée réécrirait toute la table (raw_data est volumineux) et dépasse le délai
-- du SQL Editor. Ici tout est instantané : colonne simple et trigger pour les nouveaux imports.
-- Les lignes existantes se remplissent ensuite avec
--   node --env-file=.env.local scripts/backfill-nature-avis.mjs

alter table appels_offre add column if not exists nature text;

-- Nouveaux imports et mises à jour de raw_data
create or replace function appels_offre_nature() returns trigger
language plpgsql as $$
begin
  new.nature := new.raw_data->>'nature';
  return new;
end $$;

drop trigger if exists appels_offre_nature on appels_offre;
create trigger appels_offre_nature
  before insert or update of raw_data on appels_offre
  for each row execute function appels_offre_nature();

create index if not exists idx_ao_nature_date_limite on appels_offre (nature, date_limite);
create index if not exists idx_ao_nature_date_publication on appels_offre (nature, date_publication);
