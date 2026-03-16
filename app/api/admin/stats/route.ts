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

  const [
    { data: orders },
    { data: products },
    { count: customerCount },
  ] = await Promise.all([
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
    supabase.from("products").select("id,name,price,stock_quantity,category,image_url"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer"),
  ])

  return NextResponse.json({
    orders: orders || [],
    products: products || [],
    customers: customerCount || 0,
  })
}
