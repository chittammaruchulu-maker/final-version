"use server"

import { getServiceClient } from "@/lib/supabase/service"

export interface SubscriptionFormData {
  planName: string
  planPrice: number
  planDuration: string
  fullName: string
  phone: string
  email: string
  address: string
  deliveryTime: string
  mealPreference: string
  startDate: string
  razorpayOrderId?: string
  razorpayPaymentId?: string
  paymentStatus?: string
}

export async function saveSubscription(data: SubscriptionFormData) {
  const supabase = getServiceClient()
  const { data: row, error } = await supabase
    .from("cloud_kitchen_subscriptions")
    .insert({
      plan_name: data.planName,
      plan_price: data.planPrice,
      plan_duration: data.planDuration,
      full_name: data.fullName,
      phone: data.phone,
      email: data.email || null,
      address: data.address,
      delivery_time: data.deliveryTime,
      meal_preference: data.mealPreference,
      start_date: data.startDate,
      payment_method: data.razorpayOrderId ? "razorpay" : "cod",
      payment_status: data.paymentStatus || "pending",
      razorpay_order_id: data.razorpayOrderId || null,
      razorpay_payment_id: data.razorpayPaymentId || null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return row
}
