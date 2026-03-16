import { getServiceClient } from "@/lib/supabase/service"
import AdminProductsPage from "./products-client"

export default async function ProductsPage() {
  let initialProducts = []
  try {
    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) console.error("[v0] server products fetch error:", error.message)
    initialProducts = data || []
  } catch (e) {
    console.error("[v0] server products exception:", e)
  }
  return <AdminProductsPage initialProducts={initialProducts} />
}
