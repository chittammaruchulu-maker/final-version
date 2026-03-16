import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Use service role key to bypass RLS for all admin order operations
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function GET() {
  const supabase = getServiceClient()
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ orders })
}

export async function PATCH(request: Request) {
  const supabase = getServiceClient()
  const body = await request.json()
  const { orderId, status } = body
  if (!orderId || !status) return NextResponse.json({ error: "Missing orderId or status" }, { status: 400 })

  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
