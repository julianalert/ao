import seed from '@/data/seuils.json'
import { getSupabase } from './supabase'
import type { Seuil } from './outils/procedure'

export type SeuilsSource = 'base' | 'fichier'

/**
 * Seuils des marchés publics, depuis la table Supabase `seuils`.
 * Repli sur data/seuils.json tant que la migration n'est pas appliquée.
 */
export async function getSeuils(): Promise<{ seuils: Seuil[]; source: SeuilsSource }> {
  const sb = getSupabase()
  if (sb) {
    const { data, error } = await sb.from('seuils').select('*').order('valid_from')
    if (!error && data && data.length > 0) {
      return { seuils: data.map((s) => ({ ...s, montant: Number(s.montant) })) as Seuil[], source: 'base' }
    }
    console.warn(`seuils : table indisponible (${error?.message ?? 'vide'}), repli sur data/seuils.json`)
  }
  return { seuils: seed as Seuil[], source: 'fichier' }
}

/** Date de la dernière révision des seuils de procédure (hors seuils temporaires ou annexes). */
export function derniereRevision(seuils: Seuil[], today: string): string | null {
  const dates = seuils
    .filter((s) => s.code === 'formalise' || s.code === 'dispense')
    .map((s) => s.valid_from)
    .filter((d) => d <= today)
    .sort()
  return dates[dates.length - 1] ?? null
}
