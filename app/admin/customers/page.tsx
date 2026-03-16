import { getServiceClient } from "@/lib/supabase/service"
import AdminCustomersPage from "./customers-client"

export default async function CustomersPage() {
  let initialProfiles = []
  let initialOrders = []
  try {
    const supabase = getServiceClient()
    const [profilesRes, ordersRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("id,user_id,customer_email,total,status,created_at,items").order("created_at", { ascending: false }),
    ])
    if (profilesRes.error) console.error("[v0] server profiles fetch error:", profilesRes.error.message)
    if (ordersRes.error) console.error("[v0] server orders fetch error:", ordersRes.error.message)
    initialProfiles = profilesRes.data || []
    initialOrders = ordersRes.data || []
  } catch (e) {
    console.error("[v0] server customers exception:", e)
  }
  return <AdminCustomersPage initialProfiles={initialProfiles} initialOrders={initialOrders} />
}
