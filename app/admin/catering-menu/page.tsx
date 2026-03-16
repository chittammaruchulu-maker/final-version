import { getServiceClient } from "@/lib/supabase/service"
import AdminCateringMenuPage from "./catering-menu-client"

export default async function CateringMenuPage() {
  let initialItems = []
  try {
    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from("catering_menu")
      .select("*")
      .order("category", { ascending: true })
      .order("sort_order", { ascending: true })
    if (error) console.error("[v0] server catering_menu fetch error:", error.message)
    initialItems = data || []
  } catch (e) {
    console.error("[v0] server catering_menu exception:", e)
  }
  return <AdminCateringMenuPage initialItems={initialItems} />
}
