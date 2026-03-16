import { getServiceClient } from "@/lib/supabase/service"
import AdminOrdersPage from "./orders-client"

export default async function OrdersPage() {
  let initialOrders = []
  try {
    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) console.error("[v0] server orders fetch error:", error.message)
    initialOrders = data || []
  } catch (e) {
    console.error("[v0] server orders exception:", e)
  }
  return <AdminOrdersPage initialOrders={initialOrders} />
}
