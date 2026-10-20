-- Outil 5 : analyseur de RC / DCE.
-- Journal des analyses (quota gratuit, suivi des coûts) et stockage temporaire des fichiers déposés.
-- Les fichiers sont supprimés juste après l'analyse ; seules ces métadonnées sont conservées.

create table if not exists analyses_rc (
  id             bigint primary key generated always as identity,
  visiteur_id    text,
  ip_hash        text,
  email          text,
  abonne_id      uuid references abonnes (id) on delete set null,
  ao_id          bigint,
  nb_documents   integer,
  tokens_entree  integer,
  tokens_sortie  integer,
  statut         text not null,               -- ok | erreur
  duree_ms       integer,
  created_at     timestamptz default now()
);
create index if not exists idx_analyses_visiteur on analyses_rc (visiteur_id, created_at desc);
create index if not exists idx_analyses_ip on analyses_rc (ip_hash, created_at desc);
alter table analyses_rc enable row level security;

-- Bucket privé, 60 Mo max par fichier ; accès par URL signée générée côté serveur
insert into storage.buckets (id, name, public, file_size_limit)
values ('dce-temp', 'dce-temp', false, 62914560)
on conflict (id) do nothing;
