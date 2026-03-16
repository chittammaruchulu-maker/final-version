"use server"

import { getServiceClient } from "@/lib/supabase/service"
import { revalidatePath } from "next/cache"

export async function updateSubscriptionStatus(id: string, status: string) {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from("cloud_kitchen_subscriptions")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  try { revalidatePath("/admin/subscriptions") } catch {}
  return data
}

export async function getSubscriptions() {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from("cloud_kitchen_subscriptions")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)
  return data || []
}
