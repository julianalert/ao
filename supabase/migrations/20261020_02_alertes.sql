-- Outil 6 : alertes AO personnalisées (double opt-in, lien magique, favoris, rappels).
-- Outil 7 : rappels d'expiration des attestations.
-- Accès uniquement côté serveur (service role) : RLS activé, aucune policy publique.

create extension if not exists pgcrypto;

create table if not exists abonnes (
  id              uuid primary key default gen_random_uuid(),
  email           text unique not null,
  token           text unique not null,            -- lien magique de gestion
  confirm_token   text unique,
  confirmed_at    timestamptz,
  unsubscribed_at timestamptz,
  source          text,                            -- page d'inscription
  -- Segmentation CRM, recalculée à chaque création d'alerte
  corps_etat      text[] default '{}',
  departements    text[] default '{}',
  created_at      timestamptz default now()
);

create table if not exists alertes (
  id            uuid primary key default gen_random_uuid(),
  abonne_id     uuid not null references abonnes (id) on delete cascade,
  nom           text,
  criteres      jsonb not null,
  frequence     text not null default 'quotidienne' check (frequence in ('quotidienne', 'hebdomadaire')),
  actif         boolean not null default true,
  last_sent_at  timestamptz,
  created_at    timestamptz default now()
);
create index if not exists idx_alertes_abonne on alertes (abonne_id);

create table if not exists favoris (
  abonne_id     uuid not null references abonnes (id) on delete cascade,
  ao_id         bigint not null references appels_offre (id) on delete cascade,
  rappel_j7_at  timestamptz,
  rappel_j2_at  timestamptz,
  created_at    timestamptz default now(),
  primary key (abonne_id, ao_id)
);

create table if not exists rappels_attestation (
  id               uuid primary key default gen_random_uuid(),
  abonne_id        uuid not null references abonnes (id) on delete cascade,
  piece            text not null,
  delivree_le      date not null,
  expire_le        date not null,
  rappel_envoye_at timestamptz,
  created_at       timestamptz default now()
);
create index if not exists idx_rappels_expire on rappels_attestation (expire_le) where rappel_envoye_at is null;

create table if not exists emails_envoyes (
  id          bigint primary key generated always as identity,
  abonne_id   uuid references abonnes (id) on delete set null,
  type        text not null,                       -- confirmation | lien | digest | favori | attestation
  sujet       text,
  nb_ao       integer,
  provider_id text,
  created_at  timestamptz default now()
);

-- Accélère le matching quotidien sur les nouveaux avis
create index if not exists idx_ao_created_at on appels_offre (created_at desc);

alter table abonnes enable row level security;
alter table alertes enable row level security;
alter table favoris enable row level security;
alter table rappels_attestation enable row level security;
alter table emails_envoyes enable row level security;
