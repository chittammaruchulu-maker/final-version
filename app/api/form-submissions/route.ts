import { NextResponse } from "next/server"
import { getServiceClient as createServiceClient } from "@/lib/supabase/service"

const ADMIN_EMAILS = ["orders@chittammaruchulu.com", "sanjeevreddymudela@gmail.com"]
const ADMIN_PHONE = "917842924883"

// ── Email helpers ─────────────────────────────────────────────────────────────
function generateContactAdminEmail(data: Record<string, string>): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <tr><td style="background-color:#6b3a2a;padding:24px 40px;">
          <h1 style="margin:0;color:#ffffff;font-size:18px;font-weight:700;">NEW CONTACT ENQUIRY</h1>
          <p style="margin:6px 0 0;color:#e8c49a;font-size:13px;">Chittamma Ruchulu — Admin Notification</p>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafafa;border:1px solid #eeeeee;border-radius:8px;overflow:hidden;">
            ${[
              ["Name", data.name],
              ["Email", data.email],
              ["Phone", data.phone || "—"],
              ["Subject", data.subject || "—"],
            ].map(([label, value]) => `
            <tr>
              <td style="padding:12px 16px;font-size:13px;color:#666;width:120px;border-bottom:1px solid #eee;">${label}</td>
              <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#111;border-bottom:1px solid #eee;">${value}</td>
            </tr>`).join("")}
            <tr>
              <td style="padding:12px 16px;font-size:13px;color:#666;vertical-align:top;">Message</td>
              <td style="padding:12px 16px;font-size:13px;color:#111;white-space:pre-wrap;line-height:1.6;">${data.message}</td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 40px 32px;text-align:center;">
          <a href="https://chittammaruchulu.com/admin/form-submissions" style="display:inline-block;padding:12px 28px;background-color:#6b3a2a;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:6px;">View in Admin Dashboard</a>
        </td></tr>
        <tr><td style="padding:16px 40px;background-color:#fafafa;border-top:1px solid #eee;text-align:center;">
          <p style="margin:0;font-size:11px;color:#aaa;">&copy; ${new Date().getFullYear()} Chittamma Ruchulu. Admin notification.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

function generateCateringAdminEmail(data: Record<string, string>): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <tr><td style="background-color:#6b3a2a;padding:24px 40px;">
          <h1 style="margin:0;color:#ffffff;font-size:18px;font-weight:700;">NEW CATERING ENQUIRY</h1>
          <p style="margin:6px 0 0;color:#e8c49a;font-size:13px;">Chittamma Ruchulu — Catering Notification</p>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafafa;border:1px solid #eeeeee;border-radius:8px;overflow:hidden;">
            ${[
              ["Name", data.name],
              ["Email", data.email],
              ["Phone", data.phone || "—"],
              ["Event Type", data.event_type || "—"],
              ["Guest Count", data.guest_count || "—"],
              ["Event Date", data.event_date || "—"],
            ].map(([label, value]) => `
            <tr>
              <td style="padding:12px 16px;font-size:13px;color:#666;width:130px;border-bottom:1px solid #eee;">${label}</td>
              <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#111;border-bottom:1px solid #eee;">${value}</td>
            </tr>`).join("")}
            <tr>
              <td style="padding:12px 16px;font-size:13px;color:#666;vertical-align:top;">Message</td>
              <td style="padding:12px 16px;font-size:13px;color:#111;white-space:pre-wrap;line-height:1.6;">${data.message || "—"}</td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 40px 32px;text-align:center;">
          <a href="https://chittammaruchulu.com/admin/form-submissions" style="display:inline-block;padding:12px 28px;background-color:#6b3a2a;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:6px;">View in Admin Dashboard</a>
        </td></tr>
        <tr><td style="padding:16px 40px;background-color:#fafafa;border-top:1px solid #eee;text-align:center;">
          <p style="margin:0;font-size:11px;color:#aaa;">&copy; ${new Date().getFullYear()} Chittamma Ruchulu. Admin notification.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

function generateCustomerAckEmail(data: Record<string, string>, isCarering: boolean): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background-color:#faf6f1;font-family:Georgia,serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf6f1;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(61,44,30,0.08);">
        <tr><td style="background-color:#6b3a2a;padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-family:Georgia,serif;font-size:24px;">CHITTAMMA RUCHULU</h1>
          <p style="margin:8px 0 0;color:#e8c49a;font-family:sans-serif;font-size:12px;letter-spacing:2px;">AUTHENTIC TELUGU HOME FOODS</p>
        </td></tr>
        <tr><td style="padding:40px 40px 20px;text-align:center;">
          <div style="width:56px;height:56px;border-radius:50%;background-color:#dcfce7;line-height:56px;text-align:center;font-size:28px;margin:0 auto 16px;">&#10003;</div>
          <h2 style="margin:0 0 8px;color:#3d2c1e;font-family:Georgia,serif;font-size:22px;">
            ${isCarering ? "Enquiry Received!" : "Message Received!"}
          </h2>
          <p style="margin:8px 0 0;color:#8b7355;font-family:sans-serif;font-size:14px;line-height:1.6;">
            Thank you, ${data.name}!<br/>
            ${isCarering
              ? "Our catering team will get back to you within 2 hours with a customized quote."
              : "We will get back to you within 24 hours."}
          </p>
        </td></tr>
        <tr><td style="padding:20px 40px 40px;text-align:center;">
          <p style="margin:0 0 8px;font-family:sans-serif;font-size:13px;color:#8b7355;">For urgent queries, reach us at</p>
          <a href="https://wa.me/917842924883" style="display:inline-block;padding:10px 24px;background-color:#16a34a;color:#ffffff;font-size:13px;font-weight:600;text-decoration:none;border-radius:20px;font-family:sans-serif;">Chat on WhatsApp</a>
          <p style="margin:16px 0 0;font-family:sans-serif;font-size:11px;color:#b8a890;">&copy; ${new Date().getFullYear()} Chittamma Ruchulu.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

async function sendEmail(apiKey: string, to: string[], subject: string, html: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "Chittamma Ruchulu <onboarding@resend.dev>", to, subject, html }),
    })
    return res.ok
  } catch {
    return false
  }
}

async function sendWhatsApp(apiKey: string, phone: string, message: string): Promise<boolean> {
  try {
    const encoded = encodeURIComponent(message)
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encoded}&apikey=${apiKey}`
    const res = await fetch(url)
    return res.ok
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { form_type, name, email, phone, subject, message, event_type, guest_count, event_date } = body

    if (!form_type || !name || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createServiceClient()

    // 1. Save to database
    const { data: submission, error: dbError } = await supabase
      .from("form_submissions")
      .insert({
        form_type,
        name,
        email,
        phone: phone || null,
        subject: subject || null,
        message: message || null,
        event_type: event_type || null,
        guest_count: guest_count || null,
        event_date: event_date || null,
      })
      .select()
      .single()

    if (dbError) {
      console.error("[form-submissions] DB insert error:", dbError)
      return NextResponse.json({ error: "Failed to save submission" }, { status: 500 })
    }

    const resendKey = process.env.RESEND_API_KEY
    const waKey = process.env.CALLMEBOT_API_KEY
    const isCatering = form_type === "catering"
    const data = { name, email, phone, subject, message, event_type, guest_count, event_date }

    // 2. Send emails (fire and forget — don't block response)
    if (resendKey) {
      const adminEmailHtml = isCatering
        ? generateCateringAdminEmail(data)
        : generateContactAdminEmail(data)

      const adminSubject = isCatering
        ? `New Catering Enquiry — ${name} | ${guest_count || ""} guests`
        : `New Contact Message — ${name}${subject ? ` | ${subject}` : ""}`

      // Admin notification + customer acknowledgement in parallel
      Promise.all([
        sendEmail(resendKey, ADMIN_EMAILS, adminSubject, adminEmailHtml),
        sendEmail(resendKey, [email], isCatering ? "Catering Enquiry Received — Chittamma Ruchulu" : "We received your message — Chittamma Ruchulu", generateCustomerAckEmail(data, isCatering)),
      ])
    }

    // 3. WhatsApp notification to admin (via CallMeBot)
    if (waKey) {
      const waMsg = isCatering
        ? `New Catering Enquiry!\nName: ${name}\nPhone: ${phone || "—"}\nEvent: ${event_type || "—"}\nGuests: ${guest_count || "—"}\nDate: ${event_date || "—"}\nCheck admin: chittammaruchulu.com/admin/form-submissions`
        : `New Contact Message!\nName: ${name}\nEmail: ${email}\nPhone: ${phone || "—"}\nSubject: ${subject || "—"}\nCheck admin: chittammaruchulu.com/admin/form-submissions`
      sendWhatsApp(waKey, ADMIN_PHONE, waMsg)
    }

    return NextResponse.json({ success: true, id: submission.id })
  } catch (error) {
    console.error("[form-submissions] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const form_type = searchParams.get("form_type")
    const status = searchParams.get("status")
    const limit = parseInt(searchParams.get("limit") || "50")

    const supabase = createServiceClient()
    let query = supabase
      .from("form_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (form_type && form_type !== "all") query = query.eq("form_type", form_type)
    if (status && status !== "all") query = query.eq("status", status)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ submissions: data })
  } catch (error) {
    console.error("[form-submissions] GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json()
    if (!id || !status) return NextResponse.json({ error: "Missing id or status" }, { status: 400 })

    const supabase = createServiceClient()
    const { error } = await supabase
      .from("form_submissions")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[form-submissions] PATCH error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
