// Catalogue des index BT, TP et divers de la construction (INSEE, base 2010).
// Module sans dépendance serveur : importable côté client (listes déroulantes).

export type FamilleIndice = 'BT' | 'TP' | 'Divers'

export type IndiceDef = {
  code: string
  idbank: string
  famille: FamilleIndice
  label: string
  arretee?: boolean
}

export const FAMILLE_LABELS: Record<FamilleIndice, string> = {
  BT: 'Index bâtiment (BT)',
  TP: 'Index travaux publics (TP)',
  Divers: 'Index divers de la construction',
}

export const INDICES: IndiceDef[] = [
  { code: 'BT01', idbank: '001710986', famille: 'BT', label: 'Tous corps d\'état' },
  { code: 'BT02', idbank: '001710950', famille: 'BT', label: 'Terrassements' },
  { code: 'BT03', idbank: '001710951', famille: 'BT', label: 'Maçonnerie et canalisations en béton (sauf ossature, béton armé, carrelage, revêtements et plâtrerie)' },
  { code: 'BT06', idbank: '001710952', famille: 'BT', label: 'Ossature, ouvrages en béton armé' },
  { code: 'BT07', idbank: '001710953', famille: 'BT', label: 'Ossature et charpentes métalliques' },
  { code: 'BT08', idbank: '001710954', famille: 'BT', label: 'Plâtre et préfabriqués' },
  { code: 'BT09', idbank: '001710955', famille: 'BT', label: 'Carrelage et revêtement céramique' },
  { code: 'BT10', idbank: '001710956', famille: 'BT', label: 'Revêtements en plastiques' },
  { code: 'BT11', idbank: '001710957', famille: 'BT', label: 'Revêtements en textiles' },
  { code: 'BT12', idbank: '001710958', famille: 'BT', label: 'Revêtements en textiles naturels', arretee: true },
  { code: 'BT14', idbank: '001710959', famille: 'BT', label: 'Revêtements en plaque de pierre naturelle sciée et produits assimilés' },
  { code: 'BT16b', idbank: '001710960', famille: 'BT', label: 'Charpente bois' },
  { code: 'BT18a', idbank: '001710962', famille: 'BT', label: 'Menuiserie intérieure en bois' },
  { code: 'BT19b', idbank: '001710963', famille: 'BT', label: 'Menuiserie extérieure en bois' },
  { code: 'BT26', idbank: '001710965', famille: 'BT', label: 'Fermeture de baies en plastique y compris fenêtre PVC' },
  { code: 'BT27', idbank: '001710966', famille: 'BT', label: 'Fermeture de baies en aluminium' },
  { code: 'BT28', idbank: '001710967', famille: 'BT', label: 'Fermeture de baies en métal ferreux' },
  { code: 'BT30', idbank: '001710968', famille: 'BT', label: 'Couverture en ardoises de schiste' },
  { code: 'BT32', idbank: '001710969', famille: 'BT', label: 'Couverture en tuiles en terre cuite' },
  { code: 'BT33', idbank: '001710970', famille: 'BT', label: 'Couverture en tuiles en béton' },
  { code: 'BT34', idbank: '001710971', famille: 'BT', label: 'Couverture en zinc et en métal (sauf cuivre)' },
  { code: 'BT35', idbank: '001710940', famille: 'BT', label: 'Couverture en bardeaux bitumés' },
  { code: 'BT38', idbank: '001710972', famille: 'BT', label: 'Plomberie sanitaire (y compris appareils)' },
  { code: 'BT40', idbank: '001710973', famille: 'BT', label: 'Chauffage central (à l\'exclusion du chauffage électrique)' },
  { code: 'BT41', idbank: '001710974', famille: 'BT', label: 'Ventilation et conditionnement d\'air' },
  { code: 'BT42', idbank: '001710975', famille: 'BT', label: 'Menuiserie en acier et serrurerie' },
  { code: 'BT43', idbank: '001710976', famille: 'BT', label: 'Menuiserie en alliage d\'aluminium' },
  { code: 'BT45', idbank: '001710977', famille: 'BT', label: 'Vitrerie - Miroiterie' },
  { code: 'BT46', idbank: '001710978', famille: 'BT', label: 'Peinture, tenture, revêtements muraux' },
  { code: 'BT47', idbank: '001710979', famille: 'BT', label: 'Électricité' },
  { code: 'BT48', idbank: '001710980', famille: 'BT', label: 'Ascenseurs' },
  { code: 'BT49', idbank: '001710981', famille: 'BT', label: 'Couverture et bardage en tôles d\'acier nervurés avec revêtement étanchéité' },
  { code: 'BT50', idbank: '001710982', famille: 'BT', label: 'Rénovation - Entretien tous corps d\'état' },
  { code: 'BT51', idbank: '001710983', famille: 'BT', label: 'Menuiseries PVC' },
  { code: 'BT52', idbank: '001710984', famille: 'BT', label: 'Imperméabilité de façades' },
  { code: 'BT53', idbank: '001710985', famille: 'BT', label: 'Étanchéité' },
  { code: 'BT54', idbank: '001711942', famille: 'BT', label: 'Ossature bois' },
  { code: 'BT55', idbank: '011818304', famille: 'BT', label: 'Isolation thermique par l\'extérieur - Enduit sur isolant' },
  { code: 'TP01', idbank: '001711007', famille: 'TP', label: 'Index général tous travaux' },
  { code: 'TP02', idbank: '001710987', famille: 'TP', label: 'Travaux de génie civil et d\'ouvrages d\'art neufs ou rénovation' },
  { code: 'TP03a', idbank: '001710988', famille: 'TP', label: 'Grands terrassements' },
  { code: 'TP03b', idbank: '001710989', famille: 'TP', label: 'Travaux à l\'explosif' },
  { code: 'TP04', idbank: '001710990', famille: 'TP', label: 'Fondations et travaux géotechniques' },
  { code: 'TP05a', idbank: '001710991', famille: 'TP', label: 'Travaux en souterrains traditionnels' },
  { code: 'TP05b', idbank: '001710992', famille: 'TP', label: 'Travaux en souterrains avec tunnelier' },
  { code: 'TP06a', idbank: '001710993', famille: 'TP', label: 'Grands dragages maritimes' },
  { code: 'TP06b', idbank: '001710994', famille: 'TP', label: 'Dragages fluviaux et petits dragages maritimes' },
  { code: 'TP07b', idbank: '001710995', famille: 'TP', label: 'Travaux de génie civil, béton et acier pour ouvrages maritimes et fluviaux' },
  { code: 'TP08', idbank: '001710996', famille: 'TP', label: 'Travaux d\'aménagement et entretien de voirie en zones rurale et urbaine' },
  { code: 'TP09', idbank: '001710997', famille: 'TP', label: 'Fabrication et mise en œuvre d\'enrobés' },
  { code: 'TP10a', idbank: '001710998', famille: 'TP', label: 'Canalisations, assainissement et adduction d\'eau avec fourniture de tuyaux', arretee: true },
  { code: 'TP10b', idbank: '001710999', famille: 'TP', label: 'Canalisations sans fourniture de tuyaux' },
  { code: 'TP10c', idbank: '001711000', famille: 'TP', label: 'Réhabilitation de canalisations non visitables' },
  { code: 'TP10d', idbank: '010605983', famille: 'TP', label: 'Réseaux de chauffage et de froid avec fourniture de tuyaux' },
  { code: 'TP10e', idbank: '010777525', famille: 'TP', label: 'Canalisations, assainissement et adduction d\'eau avec fourniture de tuyaux en fonte majoritaire' },
  { code: 'TP10f', idbank: '010777582', famille: 'TP', label: 'Canalisations, assainissement et adduction d\'eau avec fourniture de tuyaux multi-matériaux' },
  { code: 'TP11', idbank: '001711001', famille: 'TP', label: 'Canalisations grandes distances de transport / transfert avec fourniture de tuyaux' },
  { code: 'TP12a', idbank: '001711002', famille: 'TP', label: 'Réseaux d\'énergie et de communication hors fibre optique' },
  { code: 'TP12b', idbank: '001711003', famille: 'TP', label: 'Éclairage public - Travaux d\'installation' },
  { code: 'TP12c', idbank: '001711004', famille: 'TP', label: 'Éclairage public - Travaux de maintenance' },
  { code: 'TP12d', idbank: '001796841', famille: 'TP', label: 'Réseaux de communication en fibre optique' },
  { code: 'TP13', idbank: '001711005', famille: 'TP', label: 'Charpentes et ouvrages d\'art métalliques', arretee: true },
  { code: 'TP13a', idbank: '010777583', famille: 'TP', label: 'Charpentes et ouvrages d\'art métalliques' },
  { code: 'TP13b', idbank: '010777526', famille: 'TP', label: 'Charpentes et ouvrages d\'art métalliques hors fourniture des aciers' },
  { code: 'TP14', idbank: '001711006', famille: 'TP', label: 'Travaux immergés par scaphandriers', arretee: true },
  { code: 'DRR01', idbank: '010607767', famille: 'Divers', label: 'Fourniture de dispositifs de retenue de route' },
  { code: 'DRR02', idbank: '010607768', famille: 'Divers', label: 'Fourniture et pose de dispositifs de retenue de route' },
  { code: 'EV1', idbank: '001711014', famille: 'Divers', label: 'Travaux de végétalisation' },
  { code: 'EV2', idbank: '001711015', famille: 'Divers', label: 'Application de produits phytosanitaires' },
  { code: 'EV3', idbank: '001711016', famille: 'Divers', label: 'Travaux de création d\'espaces verts' },
  { code: 'EV4', idbank: '001711017', famille: 'Divers', label: 'Travaux d\'entretien d\'espaces verts' },
  { code: 'FD', idbank: '001711011', famille: 'Divers', label: 'Poste frais divers des index bâtiment et travaux publics' },
  { code: 'FG', idbank: '001711018', famille: 'Divers', label: 'Fournitures de graines' },
  { code: 'FSV', idbank: '011818763', famille: 'Divers', label: 'Fourniture de signalisation verticale' },
  { code: 'FV', idbank: '001711019', famille: 'Divers', label: 'Fournitures de végétaux' },
  { code: 'ING', idbank: '001711010', famille: 'Divers', label: 'Ingénierie' },
  { code: 'MABTGO', idbank: '001711008', famille: 'Divers', label: 'Poste matériel des index bâtiment gros œuvre' },
  { code: 'MABTSO', idbank: '001711534', famille: 'Divers', label: 'Poste matériel des index bâtiment second œuvre' },
  { code: 'MATP', idbank: '001711009', famille: 'Divers', label: 'Poste matériel des index travaux publics' },
  { code: 'PMR', idbank: '001711013', famille: 'Divers', label: 'Produits de marquage routier' },
  { code: 'TRBT', idbank: '001711012', famille: 'Divers', label: 'Poste transports routiers des index bâtiment' },
  { code: 'TRTP', idbank: '001711943', famille: 'Divers', label: 'Poste transports routiers des index travaux publics' },
  { code: 'TSH', idbank: '001738995', famille: 'Divers', label: 'Travaux de signalisation horizontale' },
]

export function indiceSlug(code: string): string {
  return code.toLowerCase()
}

export function getIndiceByCode(codeOrSlug: string): IndiceDef | undefined {
  const needle = codeOrSlug.toLowerCase()
  return INDICES.find((i) => i.code.toLowerCase() === needle)
}

export function indiceHref(code: string): string {
  return `/indices/${indiceSlug(code)}`
}

export function inseeSerieUrl(idbank: string): string {
  return `https://www.insee.fr/fr/statistiques/serie/${idbank}`
}
