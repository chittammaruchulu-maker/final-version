import { NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase/service"

function safeRevalidate() {
  try {
    const { revalidatePath } = require("next/cache")
    revalidatePath("/admin/subscriptions")
  } catch {}
}

export async function GET() {
  try {
    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from("cloud_kitchen_subscriptions")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ subscriptions: data || [] })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = getServiceClient()
    const { id, status } = await request.json()
    if (!id || !status) return NextResponse.json({ error: "Missing id or status" }, { status: 400 })
    const { data, error } = await supabase
      .from("cloud_kitchen_subscriptions")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    safeRevalidate()
    return NextResponse.json({ subscription: data })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 })
  }
}
