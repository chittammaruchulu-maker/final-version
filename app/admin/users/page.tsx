import { getServiceClient } from "@/lib/supabase/service"
import AdminUsersClient from "./users-client"

export const dynamic = "force-dynamic"

export default async function AdminUsersPage() {
  let initialProfiles = []
  try {
    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) console.error("[v0] admin users fetch:", error.message)
    initialProfiles = data || []
  } catch (e) {
    console.error("[v0] admin users page exception:", e)
  }
  return <AdminUsersClient initialProfiles={initialProfiles} />
}
