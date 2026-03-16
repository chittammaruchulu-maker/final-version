import { NextRequest, NextResponse } from "next/server"
import { trackByAWB } from "@/lib/shiprocket"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get("orderId")
    const awb = searchParams.get("awb")

    if (!orderId && !awb) {
      return NextResponse.json(
        { error: "orderId or awb is required" },
        { status: 400 }
      )
    }

    let awbCode = awb

    // If orderId provided, look up AWB from DB
    if (orderId && !awbCode) {
      const supabase = await createClient()
      const { data: order } = await supabase
        .from("orders")
        .select("awb_code, courier_name, tracking_url, shipping_status")
        .eq("id", orderId)
        .single()

      if (!order?.awb_code) {
        return NextResponse.json({
          tracking: null,
          message: "Order has not been shipped yet",
          shipping_status: order?.shipping_status || "pending",
        })
      }

      awbCode = order.awb_code
    }

    if (!awbCode) {
      return NextResponse.json({
        tracking: null,
        message: "No tracking information available",
      })
    }

    const trackingData = await trackByAWB(awbCode)

    const trackInfo = trackingData.tracking_data
    const currentStatus =
      trackInfo?.shipment_track?.[0]?.current_status || "Unknown"
    const activities = trackInfo?.shipment_track_activities || []
    const trackUrl = trackInfo?.track_url || ""

    return NextResponse.json({
      tracking: {
        awb_code: awbCode,
        current_status: currentStatus,
        track_url: trackUrl,
        activities: activities.map((a) => ({
          date: a.date,
          activity: a.activity,
          location: a.location,
          status: a.status,
        })),
      },
    })
  } catch (error) {
    console.error("Tracking failed:", error)
    return NextResponse.json(
      { error: "Failed to fetch tracking info" },
      { status: 500 }
    )
  }
}
