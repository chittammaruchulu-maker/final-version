import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  try {
    const { code, email } = await req.json()

    if (!code || !email) {
      return NextResponse.json({ valid: false, error: "Coupon code and email are required." }, { status: 400 })
    }

    const supabase = getServiceClient()

    // 1. Look up coupon
    const { data: coupon, error: couponErr } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .eq("active", true)
      .single()

    if (couponErr || !coupon) {
      return NextResponse.json({ valid: false, error: "Invalid or expired coupon code." })
    }

    // 2. Check expiry
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: "This coupon has expired." })
    }

    // 3. Check one-time usage per email
    const { data: existing } = await supabase
      .from("coupon_usages")
      .select("id")
      .eq("coupon_id", coupon.id)
      .eq("email", email.trim().toLowerCase())
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ valid: false, error: "You have already used this coupon." })
    }

    // 4. Check global max_uses if set
    if (coupon.max_uses !== null) {
      const { count } = await supabase
        .from("coupon_usages")
        .select("id", { count: "exact", head: true })
        .eq("coupon_id", coupon.id)

      if ((count ?? 0) >= coupon.max_uses) {
        return NextResponse.json({ valid: false, error: "This coupon has reached its usage limit." })
      }
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        discount: coupon.discount,
        min_order: coupon.min_order,
      },
    })
  } catch (e) {
    console.error("[coupon/validate]", e)
    return NextResponse.json({ valid: false, error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
