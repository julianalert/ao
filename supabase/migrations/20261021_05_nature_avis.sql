-- Type d'avis BOAMP de chaque fiche : APPEL_OFFRE (avis de marché), ATTRIBUTION,
-- RECTIFICATIF, ANNULATION…
--
-- Colonne générée à partir de raw_data : elle se remplit pour les lignes existantes et pour
-- chaque nouvel import, sans changer le code d'import. Elle sert à n'indexer et à ne mettre
-- dans le sitemap que les appels d'offres encore ouverts (lib/fiche-utile.ts).
-- Ajouter la colonne réécrit la table : quelques dizaines de secondes.

alter table appels_offre
  add column if not exists nature text generated always as (raw_data->>'nature') stored;

create index if not exists idx_ao_nature_date_limite on appels_offre (nature, date_limite);
create index if not exists idx_ao_nature_date_publication on appels_offre (nature, date_publication);
