const { createClient } = require("@supabase/supabase-js")

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

async function backfill() {
  // 1. Fetch all orders where user_id is null
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id, order_id, customer_email")
    .is("user_id", null)

  if (ordersError) {
    console.error("Failed to fetch orders:", ordersError.message)
    process.exit(1)
  }

  console.log(`Found ${orders.length} orders with no user_id`)
  if (orders.length === 0) { console.log("Nothing to backfill."); return }

  // 2. Get unique emails from unlinked orders
  const emails = [...new Set(orders.map(o => (o.customer_email || "").toLowerCase().trim()).filter(Boolean))]
  console.log("Unique emails to resolve:", emails)

  // 3. For each email, look up the user via Supabase Admin REST API
  const emailToId = {}
  for (const email of emails) {
    const res = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
      { headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY } }
    )
    const json = await res.json()
    const user = Array.isArray(json?.users) ? json.users[0] : json?.user || null
    if (user?.id) {
      emailToId[email] = user.id
      console.log(`Resolved ${email} → ${user.id}`)
    } else {
      console.log(`No auth user found for email: ${email}`, JSON.stringify(json))
    }
  }

  // 4. Update each order
  let updated = 0, skipped = 0
  for (const order of orders) {
    const email = (order.customer_email || "").toLowerCase().trim()
    const userId = emailToId[email]
    if (!userId) { console.log(`Skipping ${order.order_id} — no user for ${email}`); skipped++; continue }

    const { error } = await supabase.from("orders").update({ user_id: userId }).eq("id", order.id)
    if (error) { console.error(`Failed ${order.order_id}:`, error.message); skipped++ }
    else { console.log(`Updated ${order.order_id} → ${userId}`); updated++ }
  }

  console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}`)
}

backfill().catch(err => { console.error("Unexpected error:", err.message); process.exit(1) })
