import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { createOrder, getPickupLocation, type ShiprocketOrderItem } from "@/lib/shiprocket"

const ADMIN_EMAILS = ["orders@chittammaruchulu.com", "sanjeevreddymudela@gmail.com"]

// ── Supabase helpers ─────────────────────────────────────────────────────────
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

function createSessionClient(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(c) { c.forEach(({ name, value, options }) => { try { cookieStore.set(name, value, options) } catch {} }) },
      },
    }
  )
}

// ── Email helpers ─────────────────────────────────────────────────────────────
interface OrderItem { name: string; size: string; quantity: number; pricePerUnit: number; total: number }

function itemRowsHtml(items: OrderItem[]) {
  return items.map(item => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #f0e6d9;font-size:13px;color:#3d2c1e;">${item.name}${item.size ? ` (${item.size})` : ""}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0e6d9;text-align:center;font-size:13px;">${item.quantity}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0e6d9;text-align:right;font-size:13px;font-weight:600;color:#3d2c1e;">&#8377;${item.total}</td>
    </tr>`).join("")
}

function customerEmailHtml(o: { customer: any; items: OrderItem[]; subtotal: number; delivery: number; discount: number; total: number; orderId: string; paymentId?: string }) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#faf6f1;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;background:#faf6f1;"><tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.08);">
    <tr><td style="background:#6b3a2a;padding:28px 36px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:22px;letter-spacing:1px;">CHITTAMMA RUCHULU</h1>
      <p style="margin:6px 0 0;color:#e8c49a;font-family:sans-serif;font-size:11px;letter-spacing:2px;">AUTHENTIC TELUGU HOME FOODS</p>
    </td></tr>
    <tr><td style="padding:32px 36px 20px;text-align:center;">
      <p style="margin:0;font-size:32px;">&#10003;</p>
      <h2 style="margin:8px 0;color:#3d2c1e;font-size:20px;">Order Confirmed!</h2>
      <p style="margin:0;font-family:sans-serif;font-size:13px;color:#8b7355;">Order ID: <strong style="color:#6b3a2a;">${o.orderId}</strong>${o.paymentId ? ` &nbsp;|&nbsp; Payment: <strong>${o.paymentId}</strong>` : ""}</p>
      <p style="margin:8px 0 0;font-family:sans-serif;font-size:13px;color:#5c4733;">Hi ${o.customer.name}, your order is confirmed and will be packed soon.</p>
    </td></tr>
    <tr><td style="padding:0 36px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0e6d9;border-radius:8px;overflow:hidden;">
        <thead><tr style="background:#faf6f1;">
          <th style="padding:10px 14px;text-align:left;font-family:sans-serif;font-size:11px;color:#8b7355;text-transform:uppercase;letter-spacing:1px;">Item</th>
          <th style="padding:10px 14px;text-align:center;font-family:sans-serif;font-size:11px;color:#8b7355;text-transform:uppercase;letter-spacing:1px;">Qty</th>
          <th style="padding:10px 14px;text-align:right;font-family:sans-serif;font-size:11px;color:#8b7355;text-transform:uppercase;letter-spacing:1px;">Total</th>
        </tr></thead>
        <tbody>${itemRowsHtml(o.items)}</tbody>
      </table>
    </td></tr>
    <tr><td style="padding:0 36px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="font-family:sans-serif;">
        ${o.discount > 0 ? `<tr><td style="padding:6px 0;font-size:13px;color:#8b7355;">Discount</td><td style="padding:6px 0;font-size:13px;color:#16a34a;text-align:right;">-&#8377;${o.discount}</td></tr>` : ""}
        <tr><td style="padding:6px 0;font-size:13px;color:#8b7355;">Delivery</td><td style="padding:6px 0;font-size:13px;text-align:right;">${o.delivery === 0 ? "FREE" : "&#8377;" + o.delivery}</td></tr>
        <tr><td colspan="2"><hr style="border:none;border-top:1px solid #f0e6d9;margin:8px 0;"/></td></tr>
        <tr><td style="padding:6px 0;font-size:17px;font-weight:700;font-family:Georgia,serif;color:#3d2c1e;">Total</td>
            <td style="padding:6px 0;font-size:17px;font-weight:700;color:#6b3a2a;text-align:right;">&#8377;${o.total}</td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:0 36px 28px;">
      <div style="background:#faf6f1;border-radius:8px;padding:16px 20px;">
        <p style="margin:0 0 8px;font-family:sans-serif;font-size:12px;font-weight:700;color:#3d2c1e;text-transform:uppercase;letter-spacing:1px;">Delivery Address</p>
        <p style="margin:0;font-family:sans-serif;font-size:13px;color:#5c4733;line-height:1.8;">
          ${o.customer.address}${o.customer.address2 ? ", " + o.customer.address2 : ""}<br/>
          ${o.customer.city}, ${o.customer.state} - ${o.customer.pincode}<br/>
          Ph: ${o.customer.countryCode} ${o.customer.phone}
        </p>
      </div>
    </td></tr>
    <tr><td style="padding:20px 36px;background:#faf6f1;text-align:center;border-top:1px solid #f0e6d9;">
      <p style="margin:0;font-family:sans-serif;font-size:12px;color:#8b7355;">Questions? Email us at <a href="mailto:contact@chittammaruchulu.com" style="color:#6b3a2a;font-weight:600;">contact@chittammaruchulu.com</a></p>
    </td></tr>
  </table></td></tr></table>
</body></html>`
}

function adminEmailHtml(o: { customer: any; items: OrderItem[]; subtotal: number; delivery: number; discount: number; total: number; orderId: string; paymentId?: string }) {
  const time = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f5f5f5;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;background:#f5f5f5;"><tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.08);">
    <tr><td style="background:#1a1a1a;padding:24px 36px;">
      <h1 style="margin:0;color:#fff;font-size:16px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">New Order Received</h1>
      <p style="margin:4px 0 0;color:#999;font-size:12px;">Chittamma Ruchulu — Admin Notification &nbsp;|&nbsp; ${time} IST</p>
    </td></tr>
    <tr><td style="padding:28px 36px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border:1px solid #eee;border-radius:8px;">
        <tr><td style="padding:10px 16px;font-size:12px;color:#666;width:130px;">Order ID</td><td style="padding:10px 16px;font-size:13px;font-weight:700;color:#111;">${o.orderId}</td></tr>
        ${o.paymentId ? `<tr><td style="padding:10px 16px;font-size:12px;color:#666;">Payment ID</td><td style="padding:10px 16px;font-size:13px;color:#111;">${o.paymentId}</td></tr>` : ""}
        <tr><td style="padding:10px 16px;font-size:12px;color:#666;">Customer</td><td style="padding:10px 16px;font-size:13px;font-weight:700;color:#111;">${o.customer.name}</td></tr>
        <tr><td style="padding:10px 16px;font-size:12px;color:#666;">Email</td><td style="padding:10px 16px;font-size:13px;color:#111;">${o.customer.email}</td></tr>
        <tr><td style="padding:10px 16px;font-size:12px;color:#666;">Phone</td><td style="padding:10px 16px;font-size:13px;color:#111;">${o.customer.countryCode} ${o.customer.phone}</td></tr>
        <tr><td style="padding:10px 16px;font-size:12px;color:#666;">Address</td><td style="padding:10px 16px;font-size:13px;color:#111;">${o.customer.address}${o.customer.address2 ? ", " + o.customer.address2 : ""}, ${o.customer.city}, ${o.customer.state} ${o.customer.pincode}</td></tr>
        <tr><td style="padding:10px 16px;font-size:12px;color:#666;">Order Total</td><td style="padding:10px 16px;font-size:18px;font-weight:700;color:#6b3a2a;">&#8377;${o.total}</td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:0 36px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:8px;overflow:hidden;">
        <thead><tr style="background:#f5f5f5;">
          <th style="padding:10px 14px;text-align:left;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:1px;">Item</th>
          <th style="padding:10px 14px;text-align:center;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:1px;">Qty</th>
          <th style="padding:10px 14px;text-align:right;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:1px;">Amount</th>
        </tr></thead>
        <tbody>${itemRowsHtml(o.items)}</tbody>
      </table>
    </td></tr>
    <tr><td style="padding:0 36px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${o.discount > 0 ? `<tr><td style="padding:5px 0;font-size:13px;color:#666;">Discount</td><td style="padding:5px 0;font-size:13px;color:#16a34a;text-align:right;">-&#8377;${o.discount}</td></tr>` : ""}
        <tr><td style="padding:5px 0;font-size:13px;color:#666;">Delivery</td><td style="padding:5px 0;font-size:13px;text-align:right;">${o.delivery === 0 ? "FREE" : "&#8377;" + o.delivery}</td></tr>
        <tr><td colspan="2"><hr style="border:none;border-top:1px solid #eee;margin:6px 0;"/></td></tr>
        <tr><td style="padding:5px 0;font-size:16px;font-weight:700;color:#111;">Total Paid</td><td style="padding:5px 0;font-size:16px;font-weight:700;color:#6b3a2a;text-align:right;">&#8377;${o.total}</td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:20px 36px;background:#fafafa;text-align:center;border-top:1px solid #eee;">
      <a href="https://chittammaruchulu.com/admin/orders" style="display:inline-block;padding:12px 28px;background:#6b3a2a;color:#fff;font-size:13px;font-weight:600;text-decoration:none;border-radius:6px;">View in Admin Dashboard</a>
    </td></tr>
  </table></td></tr></table>
</body></html>`
}

async function sendViaResend(to: string[], subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY not set" }

  // Use verified domain address if set, otherwise fall back to Resend sandbox (only delivers to account owner)
  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"
  const from = `Chittamma Ruchulu <${fromEmail}>`

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, html }),
  })
  const body = await res.json().catch(() => ({}))
  console.log("[v0] Resend response:", res.status, JSON.stringify(body))
  if (!res.ok) return { ok: false, error: JSON.stringify(body) }
  return { ok: true }
}

// ── Main handler ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = await request.json()

    // 1. Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex")

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
    }

    // 2. Get user session — try cookie first, fall back to email lookup
    const cookieStore = await cookies()
    const sessionClient = createSessionClient(cookieStore)
    const { data: { user: sessionUser } } = await sessionClient.auth.getUser()

    // If no session cookie, look up the user by email using the admin API
    const supabase = getServiceClient()
    let resolvedUserId: string | null = sessionUser?.id || null
    if (!resolvedUserId && orderData.customer?.email) {
      const { data: { users } } = await supabase.auth.admin.listUsers()
      const match = users?.find((u: { email?: string }) =>
        u.email?.toLowerCase().trim() === orderData.customer.email.toLowerCase().trim()
      )
      if (match) resolvedUserId = match.id
    }

    // 3. Save order to DB using service role key (bypasses RLS)
    const { error: dbError } = await supabase.from("orders").insert({
      id: orderData.orderId,
      user_id: resolvedUserId,
      customer_name: orderData.customer.name,
      customer_email: orderData.customer.email,
      customer_phone: orderData.customer.countryCode + orderData.customer.phone,
      address_line1: orderData.customer.address,
      address_line2: orderData.customer.address2 || null,
      city: orderData.customer.city,
      state: orderData.customer.state,
      pincode: orderData.customer.pincode,
      country: orderData.customer.country,
      items: orderData.items,
      subtotal: orderData.subtotal,
      delivery_charge: orderData.deliveryFee,
      discount: orderData.discount,
      total: orderData.total,
      status: "confirmed",
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      payment_status: "paid",
    })

    if (dbError) console.error("[v0] DB insert error:", dbError.message)

    // 3b. Record coupon usage (one-time per email enforcement)
    if (orderData.couponId && orderData.customer?.email) {
      const { error: couponErr } = await supabase.from("coupon_usages").insert({
        coupon_id: orderData.couponId,
        user_id: resolvedUserId,
        email: orderData.customer.email.trim().toLowerCase(),
        order_id: orderData.orderId,
      })
      if (couponErr) console.error("[v0] Coupon usage insert error:", couponErr.message)
    }

    // 4. Create Shiprocket order
    try {
      const items: ShiprocketOrderItem[] = (orderData.items || []).map(
        (item: { name: string; quantity: number; pricePerUnit: number }, i: number) => ({
          name: item.name,
          sku: `SKU-${i + 1}`,
          units: item.quantity,
          selling_price: item.pricePerUnit,
        })
      )
      const [firstName, ...rest] = (orderData.customer.name || "Customer").split(" ")
      const lastName = rest.join(" ") || firstName
      // Shiprocket requires exactly 10-digit Indian phone number
      const rawPhone = String(orderData.customer.phone || "").replace(/\D/g, "")
      const phone10 = rawPhone.length > 10 ? rawPhone.slice(-10) : rawPhone.padStart(10, "0")
      const weight = Math.max(0.5, items.reduce((s, i) => s + i.units, 0) * 0.25)
      const now = new Date()
      const orderDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`

      // Get actual pickup location name from account (avoids hardcoded "Primary" mismatch)
      const pickupLocation = await getPickupLocation()
      console.log("[v0] Using pickup location:", pickupLocation)

      const shiprocketPayload = {
        order_id: orderData.orderId,
        order_date: orderDate,
        pickup_location: pickupLocation,
        billing_customer_name: firstName,
        billing_last_name: lastName,
        billing_address: orderData.customer.address || "",
        billing_address_2: orderData.customer.address2 || "",
        billing_city: orderData.customer.city || "",
        billing_pincode: String(orderData.customer.pincode || ""),
        billing_state: orderData.customer.state || "",
        billing_country: "India",
        billing_email: orderData.customer.email || "",
        billing_phone: phone10,
        shipping_is_billing: true,
        order_items: items,
        payment_method: "Prepaid",
        sub_total: orderData.total,
        length: 20, breadth: 15, height: 10, weight,
      }

      console.log("[v0] Shiprocket payload:", JSON.stringify(shiprocketPayload))
      const shiprocketResult = await createOrder(shiprocketPayload)
      console.log("[v0] Shiprocket result:", JSON.stringify(shiprocketResult))

      if (shiprocketResult.order_id) {
        await supabase.from("orders").update({
          shiprocket_order_id: String(shiprocketResult.order_id),
          shipment_id: String(shiprocketResult.shipment_id),
          shipping_status: "created",
        }).eq("id", orderData.orderId)
        console.log("[v0] Shiprocket order created successfully:", shiprocketResult.order_id)
      }
    } catch (srError: any) {
      console.error("[v0] Shiprocket error:", srError?.message || srError)
    }

    // 5. Send emails directly (no internal HTTP fetch needed)
    const emailPayload = {
      customer: orderData.customer,
      items: orderData.items,
      subtotal: orderData.subtotal,
      delivery: orderData.deliveryFee,
      discount: orderData.discount,
      total: orderData.total,
      orderId: orderData.orderId,
      paymentId: razorpay_payment_id,
    }

    // Customer confirmation
    const customerResult = await sendViaResend(
      [orderData.customer.email],
      `Order Confirmed - ${orderData.orderId} | Chittamma Ruchulu`,
      customerEmailHtml(emailPayload)
    )
    if (!customerResult.ok) console.error("[v0] Customer email failed:", customerResult.error)

    // Admin notification to both addresses
    const adminResult = await sendViaResend(
      ADMIN_EMAILS,
      `New Order #${orderData.orderId} — ₹${orderData.total} | ${orderData.customer.name}`,
      adminEmailHtml(emailPayload)
    )
    if (!adminResult.ok) console.error("[v0] Admin email failed:", adminResult.error)

    return NextResponse.json({
      success: true,
      orderId: orderData.orderId,
      paymentId: razorpay_payment_id,
      emailSent: customerResult.ok,
      adminEmailSent: adminResult.ok,
    })
  } catch (error) {
    console.error("[v0] Payment verification error:", error)
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 })
  }
}
