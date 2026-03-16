import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function GET(request: NextRequest) {
  try {
    // 1. Verify the caller is authenticated via session cookie
    const cookieStore = await cookies()
    const sessionClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(c) { c.forEach(({ name, value, options }) => { try { cookieStore.set(name, value, options) } catch {} }) },
        },
      }
    )

    const { data: { user } } = await sessionClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Use service role to bypass RLS — query by both user_id and customer_email
    const supabase = getServiceClient()

    const [byUserId, byEmail] = await Promise.all([
      supabase
        .from("orders")
        .select("id, items, subtotal, delivery_charge, discount, total, status, created_at, city, state, awb_code, courier_name, tracking_url, shipping_status, customer_email, user_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("orders")
        .select("id, items, subtotal, delivery_charge, discount, total, status, created_at, city, state, awb_code, courier_name, tracking_url, shipping_status, customer_email, user_id")
        .eq("customer_email", user.email!)
        .order("created_at", { ascending: false }),
    ])

    // Merge and deduplicate
    const all = [...(byUserId.data || []), ...(byEmail.data || [])]
    const seen = new Set<string>()
    const orders = all.filter(o => {
      if (seen.has(o.id)) return false
      seen.add(o.id)
      return true
    })
    orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // 3. Backfill user_id on any orders that are still missing it
    const toBackfill = orders.filter(o => !o.user_id)
    if (toBackfill.length > 0) {
      await Promise.all(
        toBackfill.map(o =>
          supabase.from("orders").update({ user_id: user.id }).eq("id", o.id)
        )
      )
    }

    return NextResponse.json({ orders })
  } catch (error: any) {
    console.error("[v0] /api/account/orders error:", error?.message)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
