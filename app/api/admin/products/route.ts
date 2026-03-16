import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

function safeRevalidate(slug?: string) {
  try {
    revalidatePath("/")
    revalidatePath("/shop")
    if (slug) revalidatePath(`/shop/${slug}`)
  } catch {}
}

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

export async function GET() {
  try {
    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ products: data || [] })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = getServiceClient()
    const body = await request.json()
    const { data, error } = await supabase.from("products").insert([body]).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    safeRevalidate(data?.slug)
    return NextResponse.json({ product: data })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = getServiceClient()
    const body = await request.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
    const { data, error } = await supabase.from("products").update(updates).eq("id", id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    safeRevalidate(data?.slug)
    return NextResponse.json({ product: data })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = getServiceClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
    const { data: existing } = await supabase.from("products").select("slug").eq("id", id).single()
    const { error } = await supabase.from("products").delete().eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    safeRevalidate(existing?.slug)
    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 })
  }
}
