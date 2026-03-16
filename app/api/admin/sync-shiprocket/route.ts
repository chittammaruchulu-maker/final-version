import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createOrder, getPickupLocation, type ShiprocketOrderItem } from "@/lib/shiprocket"

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function POST() {
  const supabase = getServiceClient()

  // Fetch all orders that have NOT been synced to Shiprocket yet
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .is("shiprocket_order_id", null)
    .neq("status", "cancelled")
    .order("created_at", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!orders || orders.length === 0) {
    return NextResponse.json({ synced: 0, failed: 0, results: [], message: "All orders are already synced to Shiprocket." })
  }

  const pickupLocation = await getPickupLocation()
  const results: { orderId: string; success: boolean; shiprocketOrderId?: string; error?: string }[] = []

  for (const order of orders) {
    try {
      const items: ShiprocketOrderItem[] = (order.items || []).map(
        (item: { name: string; quantity: number; pricePerUnit: number }, i: number) => ({
          name: item.name || "Product",
          sku: `SKU-${i + 1}`,
          units: item.quantity || 1,
          selling_price: item.pricePerUnit || 0,
        })
      )

      if (items.length === 0) {
        results.push({ orderId: order.id, success: false, error: "No items in order" })
        continue
      }

      const [firstName, ...rest] = (order.customer_name || "Customer").split(" ")
      const lastName = rest.join(" ") || firstName
      const rawPhone = String(order.customer_phone || "9000000000").replace(/\D/g, "")
      const phone10 = rawPhone.length > 10 ? rawPhone.slice(-10) : rawPhone.padEnd(10, "0")
      const weight = Math.max(0.5, items.reduce((s, i) => s + i.units, 0) * 0.25)

      const createdAt = new Date(order.created_at)
      const orderDate = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}-${String(createdAt.getDate()).padStart(2, "0")} ${String(createdAt.getHours()).padStart(2, "0")}:${String(createdAt.getMinutes()).padStart(2, "0")}`

      const result = await createOrder({
        order_id: order.id,
        order_date: orderDate,
        pickup_location: pickupLocation,
        billing_customer_name: firstName,
        billing_last_name: lastName,
        billing_address: order.address_line1 || "",
        billing_address_2: order.address_line2 || "",
        billing_city: order.city || "",
        billing_pincode: String(order.pincode || ""),
        billing_state: order.state || "",
        billing_country: "India",
        billing_email: order.customer_email || "",
        billing_phone: phone10,
        shipping_is_billing: true,
        order_items: items,
        payment_method: "Prepaid",
        sub_total: order.total || 0,
        length: 20,
        breadth: 15,
        height: 10,
        weight,
      })

      if (result.order_id) {
        await supabase
          .from("orders")
          .update({
            shiprocket_order_id: String(result.order_id),
            shipment_id: String(result.shipment_id),
            shipping_status: "created",
          })
          .eq("id", order.id)

        results.push({ orderId: order.id, success: true, shiprocketOrderId: String(result.order_id) })
      } else {
        results.push({ orderId: order.id, success: false, error: "No order_id in response" })
      }
    } catch (err: any) {
      results.push({ orderId: order.id, success: false, error: err.message })
    }
  }

  const synced = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length

  return NextResponse.json({ synced, failed, results, pickup_location_used: pickupLocation })
}
