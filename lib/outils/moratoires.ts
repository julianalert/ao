import type { SemesterRate } from '@/lib/ecb'
import { addDays, diffDays } from '@/lib/format'

export const INDEMNITE_FORFAITAIRE = 40

/** Valeurs pré-remplies du calculateur, reprises dans l'exemple chiffré de la page. */
export const EXEMPLE_MORATOIRES = { montant: 48000, dateReception: '2026-06-02', datePaiement: '2026-08-14' }

export type TypeAcheteur = 'pouvoir-adjudicateur' | 'sante' | 'entreprise-publique'

export const TYPES_ACHETEUR: { value: TypeAcheteur; label: string; hint: string; delai: number }[] = [
  { value: 'pouvoir-adjudicateur', label: 'État, collectivité', hint: 'ministères, communes, départements, régions, EPCI…', delai: 30 },
  { value: 'sante', label: 'Établissement de santé', hint: 'hôpitaux publics, service de santé des armées', delai: 50 },
  { value: 'entreprise-publique', label: 'Entreprise publique', hint: 'entité adjudicatrice à caractère industriel ou commercial', delai: 60 },
]

export type MoratoiresInput = {
  delai: number
  /** Montant TTC de la demande de paiement, retenue de garantie déduite */
  montant: number
  dateReception: string
  /** Date de mise en paiement, ou date du jour si pas encore payé */
  datePaiement: string
  partiel?: { montant: number; date: string } | null
}

export type Periode = { du: string; au: string; jours: number; base: number; interets: number }

export type MoratoiresResult = {
  dateLimite: string
  /** 1er jour où les intérêts courent */
  departInterets: string
  joursRetard: number
  enRetard: boolean
  semestre: SemesterRate | null
  /** Le semestre de départ est postérieur au dernier taux connu */
  tauxProvisoire: boolean
  periodes: Periode[]
  interets: number
  indemnite: number
  total: number
}

const round2 = (n: number) => Math.round(n * 100) / 100

/** Taux applicable : celui du semestre au cours duquel les intérêts ont commencé à courir. */
export function rateForDate(rates: SemesterRate[], isoDate: string): { semestre: SemesterRate | null; provisoire: boolean } {
  const start = `${isoDate.slice(0, 4)}-${Number(isoDate.slice(5, 7)) <= 6 ? '01' : '07'}-01`
  const exact = rates.find((r) => r.start === start)
  if (exact) return { semestre: exact, provisoire: false }
  const last = rates[rates.length - 1]
  if (last && start > last.start) return { semestre: last, provisoire: true }
  return { semestre: null, provisoire: false }
}

export function calculerMoratoires(input: MoratoiresInput, rates: SemesterRate[]): MoratoiresResult {
  const dateLimite = addDays(input.dateReception, input.delai)
  const departInterets = addDays(dateLimite, 1)
  const joursRetard = Math.max(0, diffDays(dateLimite, input.datePaiement))
  const enRetard = joursRetard > 0
  const { semestre, provisoire } = rateForDate(rates, departInterets)
  const taux = semestre ? semestre.taux / 100 : 0

  const periodes: Periode[] = []
  const periode = (du: string, au: string, base: number): Periode => {
    const jours = diffDays(du, au) + 1
    return { du, au, jours, base, interets: round2((base * taux * jours) / 365) }
  }

  if (enRetard) {
    const partiel = input.partiel
    const partielValide =
      partiel && partiel.montant > 0 && partiel.montant < input.montant && partiel.date < input.datePaiement
    if (partielValide && partiel.date > dateLimite) {
      periodes.push(periode(departInterets, partiel.date, input.montant))
      periodes.push(periode(addDays(partiel.date, 1), input.datePaiement, input.montant - partiel.montant))
    } else if (partielValide) {
      periodes.push(periode(departInterets, input.datePaiement, input.montant - partiel.montant))
    } else {
      periodes.push(periode(departInterets, input.datePaiement, input.montant))
    }
  }

  const interets = round2(periodes.reduce((s, p) => s + p.interets, 0))
  const indemnite = enRetard ? INDEMNITE_FORFAITAIRE : 0
  return {
    dateLimite,
    departInterets,
    joursRetard,
    enRetard,
    semestre,
    tauxProvisoire: provisoire,
    periodes,
    interets,
    indemnite,
    total: round2(interets + indemnite),
  }
}
