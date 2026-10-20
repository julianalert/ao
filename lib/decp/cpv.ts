// Corps d'état du BTP exprimés en préfixes de codes CPV, pour interroger les marchés attribués (DECP).
// Approximation : un marché est classé selon son code CPV principal.

export const CPV_CORPS_ETAT: { slug: string; label: string; prefixes: string[] }[] = [
  { slug: 'gros-oeuvre', label: 'Gros œuvre, maçonnerie', prefixes: ['45262', '45223'] },
  { slug: 'tce', label: 'Tous corps d\'état, bâtiment', prefixes: ['45210', '45211', '45212', '45213', '45214', '45215', '45216', '45453', '45454'] },
  { slug: 'vrd', label: 'VRD, voirie, terrassement', prefixes: ['45233', '45112', '45231', '45234'] },
  { slug: 'eau-assainissement', label: 'Eau, assainissement, canalisations', prefixes: ['45232', '45252'] },
  { slug: 'genie-civil', label: 'Ouvrages d\'art, génie civil', prefixes: ['45221', '45240', '45241', '45243', '45244', '45246'] },
  { slug: 'electricite', label: 'Électricité, éclairage', prefixes: ['4531', '45316'] },
  { slug: 'cvc-plomberie', label: 'Plomberie, chauffage, ventilation', prefixes: ['4533'] },
  { slug: 'menuiserie', label: 'Menuiserie, charpente, serrurerie', prefixes: ['45421', '45422', '45420', '45441', '45342'] },
  { slug: 'couverture', label: 'Couverture, étanchéité, isolation', prefixes: ['45261', '4532'] },
  { slug: 'finitions', label: 'Peinture, plâtrerie, sols', prefixes: ['45410', '4543', '45442', '45443', '45450'] },
  { slug: 'demolition', label: 'Démolition, désamiantage', prefixes: ['45111', '45262660'] },
  { slug: 'espaces-verts', label: 'Espaces verts, paysage', prefixes: ['77310', '77300', '45112710', '45236'] },
  { slug: 'ascenseurs-securite', label: 'Ascenseurs, sécurité incendie', prefixes: ['45313', '45343', '45312'] },
  { slug: 'maitrise-oeuvre', label: 'Maîtrise d\'œuvre, études', prefixes: ['71'] },
  { slug: 'maintenance', label: 'Maintenance de bâtiments', prefixes: ['50700', '50710', '50720', '50730'] },
]

export function corpsEtatDuCpv(cpv: string | null): string | null {
  if (!cpv) return null
  let meilleur: { label: string; n: number } | null = null
  for (const c of CPV_CORPS_ETAT) {
    for (const p of c.prefixes) {
      if (cpv.startsWith(p) && (!meilleur || p.length > meilleur.n)) meilleur = { label: c.label, n: p.length }
    }
  }
  return meilleur?.label ?? null
}
