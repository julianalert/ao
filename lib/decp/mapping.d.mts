// Types du module partagé mapping.mjs
export declare const TABULAR_URL: string
export declare const COLONNES: string
export declare function nettoyerTexte(s: unknown): string | null
export declare function mapperLigne(r: Record<string, unknown>): import('./marches').Marche | null
export declare function pageTabulaire(
  params: Record<string, string>,
  page: number,
  pageSize?: number,
  init?: RequestInit & { next?: { revalidate?: number } },
): Promise<{ rows: Record<string, unknown>[]; total: number }>
