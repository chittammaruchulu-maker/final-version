import { NextRequest, NextResponse } from "next/server"
import { createOrder, type ShiprocketOrderItem } from "@/lib/shiprocket"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Check admin role
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()
      if (profile?.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderId } = await req.json()

    // Fetch order from DB
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.shiprocket_order_id) {
      return NextResponse.json({
        error: "Shiprocket order already created",
        shiprocket_order_id: order.shiprocket_order_id,
      }, { status: 400 })
    }

    // Build Shiprocket order items
    const items: ShiprocketOrderItem[] = (order.items || []).map(
      (item: { name: string; quantity: number; pricePerUnit: number }, index: number) => ({
        name: item.name,
        sku: `SKU-${orderId}-${index}`,
        units: item.quantity,
        selling_price: item.pricePerUnit,
      })
    )

    // Split customer name
    const nameParts = (order.customer_name || "").split(" ")
    const firstName = nameParts[0] || ""
    const lastName = nameParts.slice(1).join(" ") || ""

    // Calculate total weight from items (approx 250g per item unit)
    const totalUnits = items.reduce((sum, i) => sum + i.units, 0)
    const weight = Math.max(0.25, totalUnits * 0.25)

    const now = new Date()
    const orderDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`

    const shiprocketResult = await createOrder({
      order_id: orderId,
      order_date: orderDate,
      pickup_location: "Primary",
      billing_customer_name: firstName,
      billing_last_name: lastName,
      billing_address: order.address_line1 || "",
      billing_address_2: order.address_line2 || "",
      billing_city: order.city || "",
      billing_pincode: order.pincode || "",
      billing_state: order.state || "",
      billing_country: order.country || "India",
      billing_email: order.customer_email || "",
      billing_phone: (order.customer_phone || "").replace(/^\+91/, ""),
      shipping_is_billing: true,
      order_items: items,
      payment_method: "Prepaid",
      sub_total: order.total || order.subtotal || 0,
      length: 20,
      breadth: 15,
      height: 10,
      weight,
    })

    // Update order in DB
    await supabase
      .from("orders")
      .update({
        shiprocket_order_id: String(shiprocketResult.order_id),
        shipment_id: String(shiprocketResult.shipment_id),
        shipping_status: "created",
      })
      .eq("id", orderId)

    return NextResponse.json({
      success: true,
      shiprocket_order_id: shiprocketResult.order_id,
      shipment_id: shiprocketResult.shipment_id,
    })
  } catch (error) {
    console.error("Create shipment failed:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create shipment" },
      { status: 500 }
    )
  }
}
