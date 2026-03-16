"use server"

import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Missing Supabase env vars")
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

function safeRevalidate() {
  try { revalidatePath("/catering") } catch {}
  try { revalidatePath("/admin/catering-menu") } catch {}
}

export async function addCateringItem(category: string, itemName: string, sortOrder: number) {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from("catering_menu")
    .insert([{ category: category.trim(), item_name: itemName.trim(), sort_order: sortOrder, is_active: true }])
    .select()
    .single()
  if (error) throw new Error(error.message)
  safeRevalidate()
  return data
}

export async function updateCateringItem(id: string, updates: Record<string, unknown>) {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from("catering_menu")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  safeRevalidate()
  return data
}

export async function deleteCateringItem(id: string) {
  const supabase = getServiceClient()
  const { error } = await supabase.from("catering_menu").delete().eq("id", id)
  if (error) throw new Error(error.message)
  safeRevalidate()
}
