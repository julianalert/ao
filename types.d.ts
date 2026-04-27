type AppelOffre = {
  id: number
  reference: string
  titre: string
  slug: string
  objet: string | null
  acheteur: string | null
  acheteur_siret: string | null
  categorie: string | null
  categorie_label: string | null
  cpv_code: string | null
  region: string | null
  region_label: string | null
  departement: string | null
  type_marche: 'travaux' | 'fournitures' | 'services' | null
  procedure: 'ouvert' | 'restreint' | 'mapa' | 'negociee' | null
  montant_estime: number | null
  date_publication: string | null
  date_limite: string | null
  url_document: string | null
  raw_data: Record<string, unknown> | null
  created_at: string
}

type BoampRecord = {
  idweb: string
  objet: string | null
  nomacheteur: string | null
  famille: string | null
  famille_libelle: string | null
  dateparution: string | null
  datelimitereponse: string | null
  code_departement: string[] | null
  descripteur_code: string[] | null
  descripteur_libelle: string[] | null
  type_marche: string[] | null
  type_procedure: string | null
  procedure_libelle: string | null
  url_avis: string | null
  donnees: string | null
  gestion: string | null
}
