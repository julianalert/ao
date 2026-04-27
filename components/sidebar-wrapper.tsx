import { getTopCategories } from '@/lib/getAppelsOffre'
import Sidebar from './sidebar'

export default async function SidebarWrapper() {
  const topCategories = await getTopCategories(24)
  return <Sidebar topCategories={topCategories} />
}
