import { NextRequest, NextResponse } from "next/server"
import { generateAWB, schedulePickup } from "@/lib/shiprocket"
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

    const { orderId, courierId } = await req.json()

    // Fetch order from DB
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (!order.shipment_id) {
      return NextResponse.json(
        { error: "Shipment not created yet. Create shipment first." },
        { status: 400 }
      )
    }

    if (order.awb_code) {
      return NextResponse.json(
        { error: "AWB already generated", awb_code: order.awb_code },
        { status: 400 }
      )
    }

    // Step 1: Generate AWB (assign courier)
    const awbResult = await generateAWB({
      shipment_id: Number(order.shipment_id),
      courier_id: courierId || undefined,
    })

    if (awbResult.awb_assign_status !== 1) {
      throw new Error("AWB assignment failed. Please try again.")
    }

    const awbCode = awbResult.response?.data?.awb_code
    const courierName = awbResult.response?.data?.courier_name

    // Step 2: Schedule pickup
    try {
      await schedulePickup(Number(order.shipment_id))
    } catch (pickupError) {
      console.error("Pickup scheduling failed (non-blocking):", pickupError)
      // Continue - AWB is generated, pickup can be retried
    }

    // Step 3: Update order in DB
    const trackingUrl = `https://shiprocket.co/tracking/${awbCode}`

    await supabase
      .from("orders")
      .update({
        awb_code: awbCode,
        courier_name: courierName,
        tracking_url: trackingUrl,
        shipping_status: "shipped",
        status: "shipped",
      })
      .eq("id", orderId)

    return NextResponse.json({
      success: true,
      awb_code: awbCode,
      courier_name: courierName,
      tracking_url: trackingUrl,
    })
  } catch (error) {
    console.error("Ship order failed:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to ship order" },
      { status: 500 }
    )
  }
}
