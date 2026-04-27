import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { normalizeBoampRecord } from '@/lib/boampNormalize'

const BOAMP_API = 'https://boamp-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/boamp/records'
const PAGE_SIZE = 100

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const daysBack = parseInt(searchParams.get('days') ?? '1', 10)
  const offset = parseInt(searchParams.get('offset') ?? '0', 10)

  const sinceDate = new Date()
  sinceDate.setDate(sinceDate.getDate() - daysBack)
  const sinceDateStr = sinceDate.toISOString().slice(0, 10)

  const supabase = getSupabaseAdmin()

  // Fetch a single page from BOAMP
  const url = new URL(BOAMP_API)
  url.searchParams.set('where', `dateparution>='${sinceDateStr}'`)
  url.searchParams.set('order_by', 'dateparution desc')
  url.searchParams.set('limit', PAGE_SIZE.toString())
  url.searchParams.set('offset', offset.toString())

  let res: Response
  try {
    res = await fetch(url.toString(), { cache: 'no-store' })
  } catch (err) {
    return NextResponse.json(
      { error: `BOAMP fetch failed: ${err instanceof Error ? err.message : err}` },
      { status: 502 },
    )
  }

  if (!res.ok) {
    return NextResponse.json(
      { error: `BOAMP API error: ${res.status} ${res.statusText}` },
      { status: 502 },
    )
  }

  const json = await res.json()
  const records: BoampRecord[] = (json.results ?? []).map((r: Record<string, unknown>) => r as BoampRecord)
  const totalCount: number = json.total_count ?? 0

  if (records.length === 0) {
    return NextResponse.json({ success: true, since: sinceDateStr, offset, inserted: 0, total_count: totalCount, done: true })
  }

  const normalized = records.map(normalizeBoampRecord)

  const { error, data } = await supabase
    .from('appels_offre')
    .upsert(normalized, { onConflict: 'reference', ignoreDuplicates: false })
    .select('id')

  if (error) {
    return NextResponse.json({ error: `Supabase error: ${error.message}` }, { status: 500 })
  }

  const nextOffset = offset + records.length
  const done = records.length < PAGE_SIZE || nextOffset >= totalCount

  return NextResponse.json({
    success: true,
    since: sinceDateStr,
    offset,
    next_offset: done ? null : nextOffset,
    inserted: data?.length ?? 0,
    page_size: records.length,
    total_count: totalCount,
    done,
    // Convenience: next URL to call if not done
    next_url: done ? null : `/api/cron/boamp?days=${daysBack}&offset=${nextOffset}`,
  })
}
