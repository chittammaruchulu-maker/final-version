import { getServiceClient } from "@/lib/supabase/service"
import CateringPage from "./catering-client"

export default async function Page() {
  let menuData: Record<string, string[]> = {}

  try {
    const supabase = getServiceClient()
    const { data } = await supabase
      .from("catering_menu")
      .select("category, item_name, sort_order, is_active")
      .eq("is_active", true)
      .order("category", { ascending: true })
      .order("sort_order", { ascending: true })

    if (data) {
      data.forEach((item: { category: string; item_name: string }) => {
        if (!menuData[item.category]) menuData[item.category] = []
        menuData[item.category].push(item.item_name)
      })
    }
  } catch (e) {
    console.error("[v0] catering page menu fetch error:", e)
  }

  return <CateringPage menuData={menuData} />
}
