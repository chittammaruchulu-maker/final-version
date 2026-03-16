const SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1/external"

let cachedToken: string | null = null
let tokenExpiry: number = 0
let cachedPickupLocation: string | null = null

// ── Auth ──────────────────────────────────────────────
async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken

  // Reset cache before attempting login
  cachedToken = null
  tokenExpiry = 0

  const res = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: (process.env.SHIPROCKET_EMAIL || "").trim(),
      password: (process.env.SHIPROCKET_PASSWORD || "").trim(),
    }),
  })

  const data = await res.json()

  if (!res.ok || !data.token) {
    throw new Error(`Shiprocket auth failed [${res.status}]: ${JSON.stringify(data)}`)
  }

  cachedToken = data.token
  tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000
  return cachedToken!
}

// ── Get first pickup location name from account ───────
export async function getPickupLocation(): Promise<string> {
  if (cachedPickupLocation) return cachedPickupLocation
  try {
    const token = await getToken()
    const res = await fetch(`${SHIPROCKET_BASE_URL}/settings/company/pickup`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    })
    const data = await res.json()
    const locations: string[] = data?.data?.shipping_address?.map((a: any) => a.pickup_location) || []
    cachedPickupLocation = locations[0] || "Primary"
  } catch {
    cachedPickupLocation = "Primary"
  }
  return cachedPickupLocation!
}

async function shiprocketFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getToken()
  return fetch(`${SHIPROCKET_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })
}

// ── Serviceability ────────────────────────────────────
export interface ServiceabilityParams {
  pickup_postcode: string
  delivery_postcode: string
  weight: number // in kg
  cod: 0 | 1
}

export interface CourierOption {
  courier_company_id: number
  courier_name: string
  rate: number
  estimated_delivery_days: string
  etd: string
  min_weight: number
}

export async function checkServiceability(
  params: ServiceabilityParams
): Promise<{ available: boolean; couriers: CourierOption[] }> {
  const query = new URLSearchParams({
    pickup_postcode: params.pickup_postcode,
    delivery_postcode: params.delivery_postcode,
    weight: params.weight.toString(),
    cod: params.cod.toString(),
  })

  const res = await shiprocketFetch(
    `/courier/serviceability/?${query.toString()}`
  )

  if (!res.ok) {
    return { available: false, couriers: [] }
  }

  const data = await res.json()
  const couriers: CourierOption[] =
    data?.data?.available_courier_companies?.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (c: any) => ({
        courier_company_id: c.courier_company_id,
        courier_name: c.courier_name,
        rate: c.rate,
        estimated_delivery_days: c.estimated_delivery_days,
        etd: c.etd,
        min_weight: c.min_weight,
      })
    ) || []

  return { available: couriers.length > 0, couriers }
}

// ── Create Order ──────────────────────────────────────
export interface ShiprocketOrderItem {
  name: string
  sku: string
  units: number
  selling_price: number
  discount?: number
  tax?: number
  hsn?: string
}

export interface CreateOrderParams {
  order_id: string
  order_date: string // YYYY-MM-DD HH:mm
  pickup_location: string
  billing_customer_name: string
  billing_last_name?: string
  billing_address: string
  billing_address_2?: string
  billing_city: string
  billing_pincode: string
  billing_state: string
  billing_country: string
  billing_email: string
  billing_phone: string
  shipping_is_billing: boolean
  shipping_customer_name?: string
  shipping_address?: string
  shipping_address_2?: string
  shipping_city?: string
  shipping_pincode?: string
  shipping_state?: string
  shipping_country?: string
  shipping_phone?: string
  order_items: ShiprocketOrderItem[]
  payment_method: "Prepaid" | "COD"
  sub_total: number
  length: number // cm
  breadth: number // cm
  height: number // cm
  weight: number // kg
}

export interface ShiprocketOrderResponse {
  order_id: number
  shipment_id: number
  status: string
  status_code: number
  onboarding_completed_now: number
}

export async function createOrder(
  params: CreateOrderParams
): Promise<ShiprocketOrderResponse> {
  const res = await shiprocketFetch("/orders/create/adhoc", {
    method: "POST",
    body: JSON.stringify(params),
  })

  const body = await res.json().catch(async () => ({ raw: await res.text() }))

  if (!res.ok) {
    throw new Error(`Shiprocket create order failed [${res.status}]: ${JSON.stringify(body)}`)
  }

  return body
}

// ── Generate AWB (assign courier) ─────────────────────
export interface GenerateAWBParams {
  shipment_id: number
  courier_id?: number // optional, Shiprocket auto-picks cheapest if omitted
}

export interface AWBResponse {
  awb_assign_status: number
  response: {
    data: {
      awb_code: string
      courier_company_id: number
      courier_name: string
    }
  }
}

export async function generateAWB(
  params: GenerateAWBParams
): Promise<AWBResponse> {
  const res = await shiprocketFetch("/courier/assign/awb", {
    method: "POST",
    body: JSON.stringify({
      shipment_id: params.shipment_id,
      ...(params.courier_id ? { courier_id: params.courier_id } : {}),
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Shiprocket AWB generation failed: ${err}`)
  }

  return res.json()
}

// ── Schedule Pickup ───────────────────────────────────
export async function schedulePickup(shipmentId: number): Promise<{
  pickup_status: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: any
}> {
  const res = await shiprocketFetch("/courier/generate/pickup", {
    method: "POST",
    body: JSON.stringify({
      shipment_id: [shipmentId],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Shiprocket pickup scheduling failed: ${err}`)
  }

  return res.json()
}

// ── Tracking ──────────────────────────────────────────
export interface TrackingActivity {
  date: string
  activity: string
  location: string
  status: string
}

export interface TrackingData {
  tracking_data: {
    track_status: number
    shipment_status: number
    shipment_track: {
      current_status: string
      delivered_date: string | null
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any
    }[]
    shipment_track_activities: TrackingActivity[]
    track_url: string
  }
}

export async function trackByAWB(awbCode: string): Promise<TrackingData> {
  const res = await shiprocketFetch(
    `/courier/track/awb/${awbCode}`
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Shiprocket tracking failed: ${err}`)
  }

  return res.json()
}

export async function trackByShipmentId(
  shipmentId: string
): Promise<TrackingData> {
  const res = await shiprocketFetch(
    `/courier/track/shipment/${shipmentId}`
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Shiprocket tracking failed: ${err}`)
  }

  return res.json()
}

// ── Cancel Order ──────────────────────────────────────
export async function cancelOrder(orderIds: number[]): Promise<void> {
  const res = await shiprocketFetch("/orders/cancel", {
    method: "POST",
    body: JSON.stringify({ ids: orderIds }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Shiprocket cancel failed: ${err}`)
  }
}
