import { NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase/service"

export async function POST(request: Request) {
  try {
    const { email, source } = await request.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 })
    }

    const supabase = getServiceClient()

    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert(
        { email: email.toLowerCase().trim(), source: source || "website", status: "active" },
        { onConflict: "email", ignoreDuplicates: false }
      )

    if (error) {
      console.error("[newsletter] DB error:", error)
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
    }

    // Send welcome email via Resend if key available
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Chittamma Ruchulu <onboarding@resend.dev>",
          to: [email],
          subject: "Welcome! Here's your 10% off — Chittamma Ruchulu",
          html: `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background-color:#faf6f1;font-family:Georgia,serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf6f1;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(61,44,30,0.08);">
        <tr><td style="background-color:#6b3a2a;padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-family:Georgia,serif;font-size:24px;">CHITTAMMA RUCHULU</h1>
          <p style="margin:8px 0 0;color:#e8c49a;font-family:sans-serif;font-size:12px;letter-spacing:2px;">AUTHENTIC TELUGU HOME FOODS</p>
        </td></tr>
        <tr><td style="padding:40px;text-align:center;">
          <h2 style="margin:0 0 12px;color:#3d2c1e;font-family:Georgia,serif;font-size:26px;">Welcome to the Family!</h2>
          <p style="margin:0 0 24px;color:#8b7355;font-family:sans-serif;font-size:15px;line-height:1.7;">
            Thank you for subscribing! As promised, here is your exclusive <strong style="color:#6b3a2a;">10% OFF</strong> coupon for your first order.
          </p>
          <div style="background-color:#fef9ef;border:2px dashed #d4a847;border-radius:10px;padding:20px 32px;display:inline-block;margin:0 auto 28px;">
            <p style="margin:0 0 4px;font-family:sans-serif;font-size:12px;color:#8b7355;letter-spacing:2px;text-transform:uppercase;">Your coupon code</p>
            <p style="margin:0;font-family:monospace;font-size:28px;font-weight:700;color:#6b3a2a;letter-spacing:4px;">WELCOME10</p>
          </div>
          <a href="https://chittammaruchulu.com/products" style="display:inline-block;padding:14px 36px;background-color:#6b3a2a;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:30px;font-family:sans-serif;">Shop Now</a>
        </td></tr>
        <tr><td style="padding:20px 40px 32px;text-align:center;border-top:1px solid #f0ebe4;">
          <p style="margin:0;font-family:sans-serif;font-size:11px;color:#b8a890;">&copy; ${new Date().getFullYear()} Chittamma Ruchulu. You are receiving this because you subscribed at chittammaruchulu.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
        }),
      }).catch(() => {}) // fire and forget
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[newsletter] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
