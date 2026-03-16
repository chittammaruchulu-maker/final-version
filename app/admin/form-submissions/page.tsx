import { getServiceClient } from "@/lib/supabase/service"
import FormSubmissionsPage from "./form-submissions-client"

export default async function FormSubmissionsServerPage() {
  let initialSubmissions = []
  let initialSubscribers = []
  try {
    const supabase = getServiceClient()
    const [submissionsRes, subscribersRes] = await Promise.all([
      supabase.from("form_submissions").select("*").order("created_at", { ascending: false }),
      supabase.from("newsletter_subscribers").select("*").order("subscribed_at", { ascending: false }),
    ])
    if (submissionsRes.error) console.error("[v0] form_submissions fetch error:", submissionsRes.error.message)
    if (subscribersRes.error) console.error("[v0] newsletter_subscribers fetch error:", subscribersRes.error.message)
    initialSubmissions = submissionsRes.data || []
    initialSubscribers = subscribersRes.data || []
  } catch (e) {
    console.error("[v0] form submissions server exception:", e)
  }
  return <FormSubmissionsPage initialSubmissions={initialSubmissions} initialSubscribers={initialSubscribers} />
}
