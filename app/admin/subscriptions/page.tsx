import { getServiceClient } from "@/lib/supabase/service"
import AdminSubscriptionsPage from "./subscriptions-client"

export default async function SubscriptionsPage() {
  let initialSubscriptions = []
  try {
    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from("cloud_kitchen_subscriptions")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) console.error("[v0] server subscriptions fetch error:", error.message)
    initialSubscriptions = data || []
  } catch (e) {
    console.error("[v0] server subscriptions exception:", e)
  }
  return <AdminSubscriptionsPage initialSubscriptions={initialSubscriptions} />
}
