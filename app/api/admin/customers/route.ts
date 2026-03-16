import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function GET() {
  const supabase = getServiceClient()
  const [{ data: profiles, error: pErr }, { data: orders, error: oErr }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("orders").select("id,user_id,customer_email,total,status,created_at,items").order("created_at", { ascending: false }),
  ])
  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 })
  return NextResponse.json({ profiles: profiles || [], orders: orders || [] })
}
