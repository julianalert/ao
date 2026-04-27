import { getAppelOffreById } from '@/lib/getAppelsOffre'
import { notFound, redirect } from 'next/navigation'

export default async function LegacyPostPage(
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params
  const ao = await getAppelOffreById(Number(id))
  if (!ao) notFound()

  // Redirect to the canonical SEO URL
  const categorie = ao.categorie ?? 'autre'
  redirect(`/${categorie}/${ao.id}-${ao.slug}`)
}
