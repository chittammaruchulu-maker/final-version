import { NextResponse } from "next/server"

const SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1/external"

export async function GET() {
  try {
    // Step 1: Test auth
    const authRes = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }),
    })
    const authBody = await authRes.json()
    if (!authRes.ok || !authBody.token) {
      return NextResponse.json({ step: "auth", ok: false, status: authRes.status, body: authBody })
    }
    const token = authBody.token

    // Step 2: Fetch actual pickup locations from account
    const pickupRes = await fetch(`${SHIPROCKET_BASE_URL}/settings/company/pickup`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    })
    const pickupBody = await pickupRes.json()
    const pickupNames: string[] = pickupBody?.data?.shipping_address?.map((a: any) => a.pickup_location) || []
    const pickupLocation = pickupNames[0] || "Primary"

    // Step 3: Test creating a minimal order using real pickup location
    const now = new Date()
    const orderDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
    const testOrderId = `TEST-${Date.now()}`

    const orderPayload = {
        order_id: testOrderId,
        order_date: orderDate,
        pickup_location: pickupLocation,
        billing_customer_name: "Test",
        billing_last_name: "Customer",
        billing_address: "123 Test Street",
        billing_city: "Hyderabad",
        billing_pincode: "500001",
        billing_state: "Telangana",
        billing_country: "India",
        billing_email: "test@example.com",
        billing_phone: "9000000000",
        shipping_is_billing: true,
        order_items: [{ name: "Test Pickle", sku: "SKU-TEST-1", units: 1, selling_price: 150 }],
        payment_method: "Prepaid",
        sub_total: 150,
        length: 20,
        breadth: 15,
        height: 10,
        weight: 0.5,
    }

    const orderRes = await fetch(`${SHIPROCKET_BASE_URL}/orders/create/adhoc`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(orderPayload),
    })
    const orderBody = await orderRes.json()

    return NextResponse.json({
      auth: "OK",
      credentials_email: process.env.SHIPROCKET_EMAIL,
      pickup_locations_in_account: pickupNames,
      pickup_location_used: pickupLocation,
      create_order_status: orderRes.status,
      create_order_ok: orderRes.ok,
      shiprocket_response: orderBody,
    })
  } catch (err: any) {
    return NextResponse.json({ step: "exception", ok: false, error: err.message })
  }
}
