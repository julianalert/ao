# Mise en service des outils du lot 2

## 1. Base de données (SQL Editor de Supabase, dans l'ordre)

| Fichier | Outil |
| --- | --- |
| `20261020_01_seuils.sql` | 4. Procédure selon le montant (table `seuils`) |
| `20261020_02_alertes.sql` | 6. Alertes AO, 7. rappels d'attestation |
| `20261020_03_analyse_rc.sql` | 5. Analyseur de RC (journal + bucket `dce-temp`) |
| `20261020_04_marches_attribues.sql` | 8. Qui gagne quoi, fiches acheteurs |
| `20261021_05_nature_avis.sql` | Type d'avis BOAMP : sitemap et indexation limités aux appels d'offres ouverts |

Puis, depuis la racine du projet :

```bash
node --env-file=.env.local scripts/seed-seuils.mjs      # charge data/seuils.json dans la table seuils
node --env-file=.env.local scripts/import-decp.mjs      # ≈ 1 million de marchés sur 3 ans, 30 à 60 min
node --env-file=.env.local scripts/backfill-date-limite.mjs  # dates limites manquantes (procédures restreintes et négociées)
node --env-file=.env.local scripts/backfill-nature-avis.mjs  # type d'avis des fiches existantes, après 20261021_05
```

Les seuils se modifient ensuite dans le Table Editor de Supabase (`valid_from` / `valid_to`), sans redéploiement.

## 2. Variables d'environnement (Vercel et `.env.local`)

| Variable | Usage |
| --- | --- |
| `ANTHROPIC_API_KEY` | Analyseur de RC (modèle `claude-opus-5-5`) |
| `RESEND_API_KEY` | Envoi des emails (domaine mon-ao.com vérifié dans Resend) |
| `EMAIL_FROM` | Facultatif, défaut `mon-ao.com <alertes@mon-ao.com>` |
| `ANALYSE_RC_MAX_PAR_JOUR` | Facultatif, plafond quotidien d'analyses (défaut 200) |

Sans `RESEND_API_KEY`, les emails sont écrits dans les logs du serveur (liens de confirmation compris).

## 3. Tâches planifiées (vercel.json)

- `/api/cron/boamp` 6 h UTC : import des avis (existant)
- `/api/cron/alertes` 6 h 30 UTC : alertes, rappels J-7 / J-2, rappels d'attestation, purge des fichiers temporaires
- `/api/cron/decp` 7 h UTC : marchés attribués publiés depuis 3 jours, rafraîchissement de l'index des acheteurs

## Sans migration

Les pages restent fonctionnelles : seuils lus depuis `data/seuils.json`, marchés attribués lus en direct sur l'API
data.gouv.fr (plus lent), alertes et rappels indisponibles (message « service momentanément indisponible »).
