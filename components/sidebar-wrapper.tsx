import { getTopCategoriesAo } from '@/lib/getAppelsOffre'
import Sidebar from './sidebar'

export default async function SidebarWrapper() {
  const topCategories = await getTopCategoriesAo(24)
  return <Sidebar topCategories={topCategories} />
}
