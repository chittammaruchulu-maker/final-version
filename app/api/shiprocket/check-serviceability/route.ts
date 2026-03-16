import { NextRequest, NextResponse } from "next/server"
import { checkServiceability } from "@/lib/shiprocket"

// Pickup pincode - your warehouse/kitchen location
const PICKUP_PINCODE = process.env.SHIPROCKET_PICKUP_PINCODE || "500001"

export async function POST(req: NextRequest) {
  try {
    const { delivery_pincode, weight } = await req.json()

    if (!delivery_pincode || typeof delivery_pincode !== "string") {
      return NextResponse.json(
        { error: "Delivery pincode is required" },
        { status: 400 }
      )
    }

    const result = await checkServiceability({
      pickup_postcode: PICKUP_PINCODE,
      delivery_postcode: delivery_pincode,
      weight: weight || 0.5, // default 500g
      cod: 0, // prepaid only (Razorpay)
    })

    if (!result.available) {
      return NextResponse.json({
        available: false,
        message: "Delivery is not available at this pincode",
        couriers: [],
      })
    }

    // Sort by rate (cheapest first)
    const sorted = result.couriers.sort((a, b) => a.rate - b.rate)

    return NextResponse.json({
      available: true,
      message: `Delivery available! Estimated ${sorted[0]?.estimated_delivery_days || "5-7"} days`,
      couriers: sorted.slice(0, 5), // top 5 cheapest
      cheapest_rate: sorted[0]?.rate || 0,
      estimated_days: sorted[0]?.estimated_delivery_days || "5-7",
    })
  } catch (error) {
    console.error("Serviceability check failed:", error)
    return NextResponse.json(
      { error: "Failed to check serviceability" },
      { status: 500 }
    )
  }
}
