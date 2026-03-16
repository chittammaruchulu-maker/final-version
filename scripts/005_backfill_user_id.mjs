import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function backfill() {
  // 1. Fetch all orders where user_id is null
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id, email")
    .is("user_id", null)

  if (ordersError) {
    console.error("Failed to fetch orders:", ordersError.message)
    process.exit(1)
  }

  console.log(`Found ${orders.length} orders with no user_id`)

  if (orders.length === 0) {
    console.log("Nothing to backfill.")
    return
  }

  // 2. Get unique emails
  const emails = [...new Set(orders.map(o => o.email?.toLowerCase().trim()).filter(Boolean))]
  console.log("Unique emails:", emails)

  // 3. Look up each email in auth.users via admin API
  const emailToUserId = {}
  for (const email of emails) {
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
    if (error) {
      console.error("Failed to list users:", error.message)
      continue
    }
    const match = data.users.find(u => u.email?.toLowerCase().trim() === email)
    if (match) {
      emailToUserId[email] = match.id
      console.log(`Matched ${email} → ${match.id}`)
    } else {
      console.log(`No user found for email: ${email}`)
    }
    break // Only need to call listUsers once for all emails
  }

  // Re-do the lookup properly — get all users once then match
  const { data: allUsersData, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (listError) {
    console.error("Failed to list users:", listError.message)
    process.exit(1)
  }

  const emailToId = {}
  for (const user of allUsersData.users) {
    if (user.email) emailToId[user.email.toLowerCase().trim()] = user.id
  }

  console.log(`Total auth users: ${allUsersData.users.length}`)

  // 4. Update each order with the matching user_id
  let updated = 0
  let skipped = 0

  for (const order of orders) {
    const email = order.email?.toLowerCase().trim()
    const userId = emailToId[email]

    if (!userId) {
      console.log(`Skipping order ${order.id} — no user found for ${email}`)
      skipped++
      continue
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({ user_id: userId })
      .eq("id", order.id)

    if (updateError) {
      console.error(`Failed to update order ${order.id}:`, updateError.message)
      skipped++
    } else {
      console.log(`Updated order ${order.id} → user_id ${userId}`)
      updated++
    }
  }

  console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}`)
}

backfill()
