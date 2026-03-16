"use client"

import { useState } from "react"
import { X, CheckCircle2, Loader2, ChefHat, CreditCard, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { saveSubscription, type SubscriptionFormData } from "./actions"

interface Plan {
  name: string
  price: number
  duration: string
  meals: string
}

interface Props {
  plan: Plan
  onClose: () => void
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void }
  }
}

const DELIVERY_TIMES = ["7:00 AM – 8:00 AM", "12:00 PM – 1:00 PM", "7:00 PM – 8:00 PM"]

export default function SubscriptionModal({ plan, onClose }: Props) {
  const [step, setStep] = useState<"details" | "payment" | "success">("details")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    deliveryTime: DELIVERY_TIMES[0],
    mealPreference: "veg",
    startDate: "",
  })

  const today = new Date().toISOString().split("T")[0]

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function validate() {
    if (!form.fullName.trim()) return "Full name is required"
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) return "Enter a valid 10-digit Indian mobile number"
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) return "Enter a valid email address"
    if (!form.address.trim()) return "Delivery address is required"
    if (!form.startDate) return "Start date is required"
    return ""
  }

  async function handleProceed() {
    const err = validate()
    if (err) { setError(err); return }
    setError("")
    setStep("payment")
  }

  async function handleRazorpay() {
    setLoading(true)
    setError("")
    try {
      // Create Razorpay order via existing API
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: plan.price,
          currency: "INR",
          receipt: `ck_sub_${Date.now()}`,
          notes: { plan: plan.name, customer: form.fullName },
        }),
      })
      if (!orderRes.ok) throw new Error("Failed to create payment order")
      const { orderId } = await orderRes.json()

      // Load Razorpay SDK if not already loaded
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script")
          s.src = "https://checkout.razorpay.com/v1/checkout.js"
          s.onload = () => resolve()
          s.onerror = () => reject(new Error("Failed to load Razorpay"))
          document.head.appendChild(s)
        })
      }

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: plan.price * 100, // displayed only; actual amount is set server-side in paise
        currency: "INR",
        name: "Chittamma Ruchulu",
        description: `${plan.name} Plan — Cloud Kitchen Subscription`,
        order_id: orderId,
        prefill: {
          name: form.fullName,
          contact: form.phone,
          email: form.email,
        },
        theme: { color: "#7c2d12" },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string }) => {
          await completeSubscription(response.razorpay_order_id, response.razorpay_payment_id)
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      })
      rzp.open()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Payment failed. Please try again.")
      setLoading(false)
    }
  }

  async function completeSubscription(rzOrderId: string, rzPaymentId: string) {
    try {
      const payload: SubscriptionFormData = {
        planName: plan.name,
        planPrice: plan.price,
        planDuration: plan.duration,
        ...form,
        razorpayOrderId: rzOrderId,
        razorpayPaymentId: rzPaymentId,
        paymentStatus: "paid",
      }
      await saveSubscription(payload)
      setStep("success")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save subscription. Please contact us.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <ChefHat className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-foreground text-base leading-tight">
                {plan.name} Plan
              </h2>
              <p className="text-xs text-muted-foreground">
                ₹{plan.price.toLocaleString("en-IN")}/{plan.duration} · {plan.meals}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Step indicator */}
        {step !== "success" && (
          <div className="flex gap-0 px-6 py-3 border-b border-border bg-background">
            {["details", "payment"].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                {i > 0 && <div className="w-8 h-px bg-border mx-1" />}
                <div className="flex items-center gap-1.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === s ? "bg-primary text-primary-foreground"
                    : (step === "payment" && s === "details") ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                  }`}>
                    {step === "payment" && s === "details" ? "✓" : i + 1}
                  </div>
                  <span className={`text-xs font-medium capitalize ${step === s ? "text-foreground" : "text-muted-foreground"}`}>
                    {s === "details" ? "Your Details" : "Payment"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {/* ── Step 1: Details ── */}
          {step === "details" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">
                    Full Name <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={e => set("fullName", e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">
                    Mobile Number <span className="text-primary">*</span>
                  </label>
                  <div className="flex">
                    <span className="flex items-center px-3 bg-muted border border-r-0 border-border rounded-l-lg text-sm text-muted-foreground">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={form.phone}
                      onChange={e => set("phone", e.target.value.replace(/\D/g, ""))}
                      placeholder="9876543210"
                      className="flex-1 px-3 py-2.5 rounded-r-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">
                    Email <span className="text-muted-foreground font-normal normal-case">(optional)</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => set("email", e.target.value)}
                    placeholder="ramesh@example.com"
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">
                    Delivery Address <span className="text-primary">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={form.address}
                    onChange={e => set("address", e.target.value)}
                    placeholder="Flat/House No., Street, Area, City — Hyderabad/Secunderabad only"
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">
                    Preferred Delivery Time <span className="text-primary">*</span>
                  </label>
                  <select
                    value={form.deliveryTime}
                    onChange={e => set("deliveryTime", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  >
                    {DELIVERY_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">
                    Meal Preference <span className="text-primary">*</span>
                  </label>
                  <div className="flex gap-2 mt-0.5">
                    {["veg", "non-veg"].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => set("mealPreference", p)}
                        className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                          form.mealPreference === p
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-foreground border-border hover:border-primary/50"
                        }`}
                      >
                        {p === "veg" ? "🌿 Veg" : "Non-Veg"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">
                    Start Date <span className="text-primary">*</span>
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={form.startDate}
                    onChange={e => set("startDate", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
            </div>
          )}

          {/* ── Step 2: Payment ── */}
          {step === "payment" && (
            <div className="space-y-5">
              {/* Order summary */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Order Summary</p>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-serif font-bold text-foreground text-base">{plan.name} Plan</p>
                    <p className="text-sm text-muted-foreground">{plan.meals} · {plan.duration} subscription</p>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Delivering to: <span className="text-foreground font-medium">{form.address.slice(0, 50)}{form.address.length > 50 ? "…" : ""}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Starts: <span className="text-foreground font-medium">{new Date(form.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-serif font-bold text-2xl text-foreground">
                      ₹{plan.price.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-muted-foreground">/{plan.duration}</p>
                  </div>
                </div>
              </div>

              {/* Customer summary */}
              <div className="bg-muted/40 rounded-xl p-4 space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Customer Details</p>
                <p className="text-sm text-foreground"><span className="text-muted-foreground w-20 inline-block">Name</span>{form.fullName}</p>
                <p className="text-sm text-foreground"><span className="text-muted-foreground w-20 inline-block">Phone</span>+91 {form.phone}</p>
                {form.email && <p className="text-sm text-foreground"><span className="text-muted-foreground w-20 inline-block">Email</span>{form.email}</p>}
                <p className="text-sm text-foreground"><span className="text-muted-foreground w-20 inline-block">Time</span>{form.deliveryTime}</p>
                <p className="text-sm text-foreground"><span className="text-muted-foreground w-20 inline-block">Meals</span><span className="capitalize">{form.mealPreference}</span></p>
              </div>

              {/* Payment options */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Pay Securely</p>
                <Button
                  onClick={handleRazorpay}
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl py-5 text-sm font-semibold gap-2"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Processing...</>
                  ) : (
                    <><CreditCard className="h-4 w-4" />Pay ₹{plan.price.toLocaleString("en-IN")} via Razorpay</>
                  )}
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1.5">
                  <Smartphone className="h-3 w-3" />
                  UPI · Cards · Net Banking · Wallets — all supported
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
            </div>
          )}

          {/* ── Step 3: Success ── */}
          {step === "success" && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-foreground mb-1">Subscription Confirmed!</h3>
                <p className="text-muted-foreground text-sm">
                  Your <strong>{plan.name} Plan</strong> starts on{" "}
                  <strong>{new Date(form.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong>.
                </p>
              </div>
              <div className="bg-muted/40 rounded-xl p-4 text-left space-y-1.5 text-sm">
                <p className="text-foreground"><span className="text-muted-foreground w-24 inline-block">Name</span>{form.fullName}</p>
                <p className="text-foreground"><span className="text-muted-foreground w-24 inline-block">Phone</span>+91 {form.phone}</p>
                <p className="text-foreground"><span className="text-muted-foreground w-24 inline-block">Delivery</span>{form.deliveryTime}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Our team will contact you on <strong>+91 {form.phone}</strong> to confirm your slot. Questions? Call{" "}
                <a href="tel:+917842924883" className="text-primary font-semibold">+91 78429 24883</a>
              </p>
              <Button onClick={onClose} className="w-full bg-primary text-primary-foreground rounded-xl py-5 font-semibold">
                Done
              </Button>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        {step === "details" && (
          <div className="px-6 py-4 border-t border-border bg-background">
            <Button
              onClick={handleProceed}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl py-5 font-semibold"
            >
              Proceed to Payment →
            </Button>
          </div>
        )}

        {step === "payment" && (
          <div className="px-6 py-4 border-t border-border bg-background flex gap-2">
            <Button
              variant="outline"
              onClick={() => { setStep("details"); setError("") }}
              className="flex-1 rounded-xl py-5 font-medium"
              disabled={loading}
            >
              ← Back
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
