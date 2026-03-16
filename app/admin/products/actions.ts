"use server"

import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Missing Supabase env vars")
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

function safeRevalidate(slug?: string) {
  try { revalidatePath("/shop") } catch {}
  try { revalidatePath("/") } catch {}
  try { revalidatePath("/admin/products") } catch {}
  if (slug) { try { revalidatePath(`/shop/${slug}`) } catch {} }
}

export async function saveProduct(payload: Record<string, unknown>) {
  const supabase = getServiceClient()
  const { id, ...fields } = payload
  if (id) {
    const { data, error } = await supabase.from("products").update(fields).eq("id", id).select().single()
    if (error) throw new Error(error.message)
    safeRevalidate(data?.slug as string)
    return data
  } else {
    const { data, error } = await supabase.from("products").insert([fields]).select().single()
    if (error) throw new Error(error.message)
    safeRevalidate(data?.slug as string)
    return data
  }
}

export async function deleteProduct(id: string) {
  const supabase = getServiceClient()
  const { data: existing } = await supabase.from("products").select("slug").eq("id", id).single()
  const { error } = await supabase.from("products").delete().eq("id", id)
  if (error) throw new Error(error.message)
  safeRevalidate(existing?.slug)
}

export async function toggleProductActive(id: string, isActive: boolean) {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from("products").update({ is_active: isActive }).eq("id", id).select().single()
  if (error) throw new Error(error.message)
  safeRevalidate(data?.slug as string)
  return data
}

export async function getProducts() {
  const supabase = getServiceClient()
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })
  if (error) throw new Error(error.message)
  return data || []
}
