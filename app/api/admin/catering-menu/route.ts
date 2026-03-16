import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error(`Missing env vars: url=${!!url} key=${!!key}`)
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

function safeRevalidate(path: string) {
  try { revalidatePath(path) } catch {}
}

// GET — fetch all menu items grouped by category
export async function GET() {
  try {
    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from("catering_menu")
      .select("*")
      .order("category", { ascending: true })
      .order("sort_order", { ascending: true })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ items: data })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 })
  }
}

// POST — create new item
export async function POST(request: Request) {
  try {
    const supabase = getServiceClient()
    const body = await request.json()
    const { category, item_name, sort_order, is_active } = body
    if (!category?.trim() || !item_name?.trim()) {
      return NextResponse.json({ error: "category and item_name are required" }, { status: 400 })
    }
    const { data, error } = await supabase
      .from("catering_menu")
      .insert([{ category: category.trim(), item_name: item_name.trim(), sort_order: sort_order ?? 0, is_active: is_active ?? true }])
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    safeRevalidate("/catering")
    return NextResponse.json({ item: data })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 })
  }
}

// PATCH — update item
export async function PATCH(request: Request) {
  try {
    const supabase = getServiceClient()
    const body = await request.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
    const { data, error } = await supabase
      .from("catering_menu")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    safeRevalidate("/catering")
    return NextResponse.json({ item: data })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 })
  }
}

// DELETE — delete item
export async function DELETE(request: Request) {
  try {
    const supabase = getServiceClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
    const { error } = await supabase.from("catering_menu").delete().eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    safeRevalidate("/catering")
    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 })
  }
}
