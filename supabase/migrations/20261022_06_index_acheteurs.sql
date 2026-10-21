-- Le rafraîchissement de l'index des acheteurs (≈ 270 000 marchés attribués sur 12 mois)
-- dépasse le délai par défaut des appels API faits avec service_role : l'import et le cron
-- /api/cron/decp échouaient sur cette étape. On allonge le délai pour ce rôle, réservé au
-- serveur (les rôles anon et authenticated gardent le leur).

alter role service_role set statement_timeout = '5min';
notify pgrst, 'reload config';

-- Premier remplissage de l'index après l'import initial
refresh materialized view acheteurs_index;
