import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { normalizeBoampRecord } from '@/lib/boampNormalize'

const BOAMP_API = 'https://boamp-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/boamp/records'
const PAGE_SIZE = 100

async function fetchAndUpsertPage(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  sinceDateStr: string,
  offset: number,
): Promise<{ inserted: number; pageSize: number; totalCount: number; done: boolean }> {
  const url = new URL(BOAMP_API)
  url.searchParams.set('where', `dateparution>='${sinceDateStr}'`)
  url.searchParams.set('order_by', 'dateparution desc')
  url.searchParams.set('limit', PAGE_SIZE.toString())
  url.searchParams.set('offset', offset.toString())

  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) throw new Error(`BOAMP API error: ${res.status} ${res.statusText}`)

  const json = await res.json()
  const records: BoampRecord[] = (json.results ?? []).map((r: Record<string, unknown>) => r as BoampRecord)
  const totalCount: number = json.total_count ?? 0

  if (records.length === 0) return { inserted: 0, pageSize: 0, totalCount, done: true }

  const normalized = records.map(normalizeBoampRecord)

  const { error, data } = await supabase!
    .from('appels_offre')
    .upsert(normalized, { onConflict: 'reference', ignoreDuplicates: false })
    .select('id')

  if (error) throw new Error(`Supabase error: ${error.message}`)

  const nextOffset = offset + records.length
  const done = records.length < PAGE_SIZE || nextOffset >= totalCount

  return { inserted: data?.length ?? 0, pageSize: records.length, totalCount, done }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const daysBack = parseInt(searchParams.get('days') ?? '1', 10)

  const sinceDate = new Date()
  sinceDate.setDate(sinceDate.getDate() - daysBack)
  const sinceDateStr = sinceDate.toISOString().slice(0, 10)

  const supabase = getSupabaseAdmin()
  if (!supabase) return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 500 })

  let offset = 0
  let totalInserted = 0
  let totalCount = 0
  let pages = 0

  try {
    while (true) {
      const { inserted, pageSize, totalCount: tc, done } = await fetchAndUpsertPage(supabase, sinceDateStr, offset)
      totalInserted += inserted
      totalCount = tc
      pages++
      if (done) break
      offset += pageSize
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 502 },
    )
  }

  return NextResponse.json({
    success: true,
    since: sinceDateStr,
    inserted: totalInserted,
    total_count: totalCount,
    pages,
  })
}
