import { NextResponse } from "next/server"

interface OrderItem {
  name: string
  size: string
  quantity: number
  pricePerUnit: number
  total: number
}

interface OrderPayload {
  customer: {
    name: string
    email: string
    phone: string
    countryCode: string
    address: string
    address2: string
    city: string
    state: string
    pincode: string
    country: string
  }
  items: OrderItem[]
  subtotal: number
  delivery: number
  discount: number
  total: number
  orderId: string
  paymentId?: string
}

const ADMIN_EMAILS = ["orders@chittammaruchulu.com", "sanjeevreddymudela@gmail.com"]

function itemRows(items: OrderItem[]): string {
  return items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #f0e6d9;font-family:sans-serif;font-size:14px;color:#3d2c1e;">
          ${item.name}${item.size ? ` <span style="color:#8b7355;font-size:12px;">(${item.size})</span>` : ""}
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0e6d9;text-align:center;font-family:sans-serif;font-size:14px;color:#3d2c1e;">${item.quantity}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0e6d9;text-align:right;font-family:sans-serif;font-size:14px;color:#3d2c1e;">&#8377;${item.pricePerUnit}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0e6d9;text-align:right;font-family:sans-serif;font-size:14px;font-weight:600;color:#3d2c1e;">&#8377;${item.total}</td>
      </tr>`
    )
    .join("")
}

function totalsSection(order: OrderPayload): string {
  return `
    <tr><td style="padding:8px 0;font-family:sans-serif;font-size:14px;color:#8b7355;">Subtotal</td><td style="padding:8px 0;font-family:sans-serif;font-size:14px;color:#3d2c1e;text-align:right;">&#8377;${order.subtotal}</td></tr>
    ${order.discount > 0 ? `<tr><td style="padding:8px 0;font-family:sans-serif;font-size:14px;color:#16a34a;">Discount</td><td style="padding:8px 0;font-family:sans-serif;font-size:14px;color:#16a34a;text-align:right;">-&#8377;${order.discount}</td></tr>` : ""}
    <tr><td style="padding:8px 0;font-family:sans-serif;font-size:14px;color:#8b7355;">Delivery</td><td style="padding:8px 0;font-family:sans-serif;font-size:14px;color:${order.delivery === 0 ? "#16a34a" : "#3d2c1e"};text-align:right;">${order.delivery === 0 ? "FREE" : "&#8377;" + order.delivery}</td></tr>
    <tr><td colspan="2" style="padding:0;"><hr style="border:none;border-top:2px solid #f0e6d9;margin:8px 0;" /></td></tr>
    <tr><td style="padding:8px 0;font-family:Georgia,serif;font-size:18px;font-weight:700;color:#3d2c1e;">Total</td><td style="padding:8px 0;font-family:Georgia,serif;font-size:18px;font-weight:700;color:#6b3a2a;text-align:right;">&#8377;${order.total}</td></tr>`
}

// ── Customer confirmation email ──────────────────────────────────────────────
function generateCustomerEmailHTML(order: OrderPayload): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background-color:#faf6f1;font-family:Georgia,serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf6f1;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(61,44,30,0.08);">
        <tr><td style="background-color:#6b3a2a;padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-family:Georgia,serif;font-size:24px;font-weight:700;letter-spacing:1px;">CHITTAMMA RUCHULU</h1>
          <p style="margin:8px 0 0;color:#e8c49a;font-family:sans-serif;font-size:12px;letter-spacing:2px;">AUTHENTIC TELUGU HOME FOODS</p>
        </td></tr>
        <tr><td style="padding:40px 40px 20px;">
          <div style="text-align:center;margin-bottom:20px;">
            <div style="display:inline-block;width:56px;height:56px;border-radius:50%;background-color:#dcfce7;line-height:56px;text-align:center;font-size:28px;">&#10003;</div>
          </div>
          <h2 style="margin:0 0 8px;text-align:center;color:#3d2c1e;font-family:Georgia,serif;font-size:22px;">Order Confirmed!</h2>
          <p style="margin:0 0 4px;text-align:center;color:#8b7355;font-family:sans-serif;font-size:14px;">Order ID: <strong style="color:#6b3a2a;">${order.orderId}</strong>${order.paymentId ? ` &nbsp;|&nbsp; Payment: <strong style="color:#6b3a2a;">${order.paymentId}</strong>` : ""}</p>
          <p style="margin:8px 0 0;text-align:center;color:#8b7355;font-family:sans-serif;font-size:13px;">Thank you, ${order.customer.name}! Your order has been received and is being processed.</p>
        </td></tr>
        <tr><td style="padding:20px 40px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0e6d9;border-radius:8px;overflow:hidden;">
            <thead><tr style="background-color:#faf6f1;">
              <th style="padding:12px 16px;text-align:left;font-family:sans-serif;font-size:12px;color:#8b7355;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Item</th>
              <th style="padding:12px 16px;text-align:center;font-family:sans-serif;font-size:12px;color:#8b7355;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Qty</th>
              <th style="padding:12px 16px;text-align:right;font-family:sans-serif;font-size:12px;color:#8b7355;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Price</th>
              <th style="padding:12px 16px;text-align:right;font-family:sans-serif;font-size:12px;color:#8b7355;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Total</th>
            </tr></thead>
            <tbody>${itemRows(order.items)}</tbody>
          </table>
        </td></tr>
        <tr><td style="padding:0 40px 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${totalsSection(order)}</table>
        </td></tr>
        <tr><td style="padding:20px 40px;">
          <div style="background-color:#faf6f1;border-radius:8px;padding:20px;">
            <h3 style="margin:0 0 12px;font-family:Georgia,serif;font-size:15px;color:#3d2c1e;">Delivery Address</h3>
            <p style="margin:0;font-family:sans-serif;font-size:13px;color:#5c4733;line-height:1.8;">
              ${order.customer.name}<br/>
              ${order.customer.address}${order.customer.address2 ? "<br/>" + order.customer.address2 : ""}<br/>
              ${order.customer.city}, ${order.customer.state} ${order.customer.pincode}<br/>
              ${order.customer.country}<br/>
              Phone: ${order.customer.countryCode} ${order.customer.phone}
            </p>
          </div>
        </td></tr>
        <tr><td style="padding:30px 40px;background-color:#faf6f1;text-align:center;">
          <p style="margin:0 0 8px;font-family:sans-serif;font-size:13px;color:#8b7355;">For queries, reach us at</p>
          <a href="mailto:contact@chittammaruchulu.com" style="font-family:sans-serif;font-size:13px;color:#6b3a2a;font-weight:600;text-decoration:none;">contact@chittammaruchulu.com</a>
          <p style="margin:16px 0 0;font-family:sans-serif;font-size:11px;color:#b8a890;">&copy; ${new Date().getFullYear()} Chittamma Ruchulu. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

// ── Admin notification email ─────────────────────────────────────────────────
function generateAdminEmailHTML(order: OrderPayload): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <tr><td style="background-color:#1a1a1a;padding:24px 40px;">
          <h1 style="margin:0;color:#ffffff;font-size:18px;font-weight:700;">NEW ORDER RECEIVED</h1>
          <p style="margin:6px 0 0;color:#aaaaaa;font-size:13px;">Chittamma Ruchulu &mdash; Admin Notification</p>
        </td></tr>
        <tr><td style="padding:32px 40px 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafafa;border:1px solid #eeeeee;border-radius:8px;padding:20px;">
            <tr>
              <td style="padding:8px 16px;font-size:13px;color:#666;width:140px;">Order ID</td>
              <td style="padding:8px 16px;font-size:13px;font-weight:700;color:#111;">${order.orderId}</td>
            </tr>
            ${order.paymentId ? `<tr><td style="padding:8px 16px;font-size:13px;color:#666;">Payment ID</td><td style="padding:8px 16px;font-size:13px;font-weight:700;color:#111;">${order.paymentId}</td></tr>` : ""}
            <tr>
              <td style="padding:8px 16px;font-size:13px;color:#666;">Customer</td>
              <td style="padding:8px 16px;font-size:13px;font-weight:700;color:#111;">${order.customer.name}</td>
            </tr>
            <tr>
              <td style="padding:8px 16px;font-size:13px;color:#666;">Email</td>
              <td style="padding:8px 16px;font-size:13px;color:#111;"><a href="mailto:${order.customer.email}" style="color:#6b3a2a;">${order.customer.email}</a></td>
            </tr>
            <tr>
              <td style="padding:8px 16px;font-size:13px;color:#666;">Phone</td>
              <td style="padding:8px 16px;font-size:13px;color:#111;">${order.customer.countryCode} ${order.customer.phone}</td>
            </tr>
            <tr>
              <td style="padding:8px 16px;font-size:13px;color:#666;">Address</td>
              <td style="padding:8px 16px;font-size:13px;color:#111;">${order.customer.address}${order.customer.address2 ? ", " + order.customer.address2 : ""}, ${order.customer.city}, ${order.customer.state} ${order.customer.pincode}</td>
            </tr>
            <tr>
              <td style="padding:8px 16px;font-size:13px;color:#666;">Order Total</td>
              <td style="padding:8px 16px;font-size:16px;font-weight:700;color:#6b3a2a;">&#8377;${order.total}</td>
            </tr>
            <tr>
              <td style="padding:8px 16px;font-size:13px;color:#666;">Order Time</td>
              <td style="padding:8px 16px;font-size:13px;color:#111;">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 40px 20px;">
          <h3 style="margin:0 0 12px;font-size:15px;color:#111;font-weight:700;">Items Ordered</h3>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eeeeee;border-radius:8px;overflow:hidden;">
            <thead><tr style="background-color:#f5f5f5;">
              <th style="padding:10px 16px;text-align:left;font-size:12px;color:#666;font-weight:600;text-transform:uppercase;">Item</th>
              <th style="padding:10px 16px;text-align:center;font-size:12px;color:#666;font-weight:600;text-transform:uppercase;">Qty</th>
              <th style="padding:10px 16px;text-align:right;font-size:12px;color:#666;font-weight:600;text-transform:uppercase;">Amount</th>
            </tr></thead>
            <tbody>
              ${order.items.map(item => `
              <tr>
                <td style="padding:12px 16px;border-bottom:1px solid #f5f5f5;font-size:14px;color:#111;">${item.name}${item.size ? ` (${item.size})` : ""}</td>
                <td style="padding:12px 16px;border-bottom:1px solid #f5f5f5;text-align:center;font-size:14px;color:#111;">${item.quantity}</td>
                <td style="padding:12px 16px;border-bottom:1px solid #f5f5f5;text-align:right;font-size:14px;font-weight:600;color:#111;">&#8377;${item.total}</td>
              </tr>`).join("")}
            </tbody>
          </table>
        </td></tr>
        <tr><td style="padding:0 40px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${order.discount > 0 ? `<tr><td style="padding:6px 0;font-size:13px;color:#666;">Discount</td><td style="padding:6px 0;font-size:13px;color:#16a34a;text-align:right;">-&#8377;${order.discount}</td></tr>` : ""}
            <tr><td style="padding:6px 0;font-size:13px;color:#666;">Delivery</td><td style="padding:6px 0;font-size:13px;color:#111;text-align:right;">${order.delivery === 0 ? "FREE" : "&#8377;" + order.delivery}</td></tr>
            <tr><td colspan="2"><hr style="border:none;border-top:1px solid #eee;margin:8px 0;"/></td></tr>
            <tr><td style="padding:6px 0;font-size:16px;font-weight:700;color:#111;">Total Paid</td><td style="padding:6px 0;font-size:16px;font-weight:700;color:#6b3a2a;text-align:right;">&#8377;${order.total}</td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:20px 40px;background-color:#fafafa;text-align:center;border-top:1px solid #eee;">
          <a href="https://chittammaruchulu.com/admin/orders" style="display:inline-block;padding:12px 28px;background-color:#6b3a2a;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:6px;">View in Admin Dashboard</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

async function sendEmail(apiKey: string, to: string[], subject: string, html: string): Promise<boolean> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Chittamma Ruchulu <onboarding@resend.dev>",
      to,
      subject,
      html,
    }),
  })
  if (!res.ok) {
    const err = await res.json()
    console.error("[v0] Resend error:", err)
    return false
  }
  return true
}

export async function POST(request: Request) {
  try {
    const order: OrderPayload = await request.json()

    if (!order.customer?.email || !order.items?.length) {
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 })
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.log("[v0] RESEND_API_KEY not set, skipping email send")
      return NextResponse.json({ success: true, emailSent: false, message: "Email not configured" })
    }

    // 1. Customer confirmation email
    const customerSent = await sendEmail(
      apiKey,
      [order.customer.email],
      `Order Confirmed - ${order.orderId} | Chittamma Ruchulu`,
      generateCustomerEmailHTML(order)
    )

    // 2. Admin notification email to both admin addresses
    const adminSent = await sendEmail(
      apiKey,
      ADMIN_EMAILS,
      `New Order #${order.orderId} — ₹${order.total} | ${order.customer.name}`,
      generateAdminEmailHTML(order)
    )

    return NextResponse.json({
      success: true,
      emailSent: customerSent,
      adminEmailSent: adminSent,
    })
  } catch (error) {
    console.error("[v0] Order confirmation error:", error)
    return NextResponse.json({ success: true, emailSent: false, message: "Email failed" })
  }
}
