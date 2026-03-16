"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Script from "next/script"
import Image from "next/image"
import Link from "next/link"
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  Truck,
  Shield,
  Tag,
  ChevronDown,
  Check,
  CreditCard,
  MapPin,
  Navigation,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { useCart } from "@/lib/cart-store"
import { createClient } from "@/lib/supabase/client"

type ValidatedCoupon = {
  id: string
  code: string
  type: "percent" | "flat"
  discount: number
  min_order: number
}

// Suggestions shown in the dropdown (no discount info exposed client-side)
const couponSuggestions = [
  { code: "CHITTAMMA10", label: "CHITTAMMA10 - 10% off your order" },
  { code: "WELCOME50",   label: "WELCOME50 - Flat ₹50 off" },
  { code: "FESTIVE15",   label: "FESTIVE15 - 15% off on Gift Packs" },
]

export default function CartPage() {
  const { items, totalItems, subtotal, update, remove, clear, mounted } = useCart()
  const [couponCode, setCouponCode] = useState("")
  const [couponApplied, setCouponApplied] = useState<ValidatedCoupon | null>(null)
  const [couponError, setCouponError] = useState("")
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponDropdownOpen, setCouponDropdownOpen] = useState(false)
  const [checkoutMode, setCheckoutMode] = useState(false)
  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    email: "",
    countryCode: "+91",
    phone: "",
    address: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  })
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderLoading, setOrderLoading] = useState(false)
  const [orderId, setOrderId] = useState("")
  const [paymentId, setPaymentId] = useState("")
  const [paymentError, setPaymentError] = useState("")
  const [emailSent, setEmailSent] = useState(false)
  const [pincodeLoading, setPincodeLoading] = useState(false)
  const [shippingRate, setShippingRate] = useState<number | null>(null)
  const [shippingLoading, setShippingLoading] = useState(false)
  const [serviceability, setServiceability] = useState<{
    serviceable: boolean | null
    estimatedDays: string
    courierName: string
    error: string
  }>({ serviceable: null, estimatedDays: "", courierName: "", error: "" })

  // Address autocomplete
  interface AddressSuggestion {
    displayName: string
    street: string
    city: string
    state: string
    postcode: string
    country: string
    countryCode: string
  }
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [addressLoading, setAddressLoading] = useState(false)
  const addressDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const addressWrapperRef = useRef<HTMLDivElement>(null)

  // Pre-fill checkout form for logged-in users
  useEffect(() => {
    const prefill = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, phone")
            .eq("id", user.id)
            .single()
          setCheckoutForm((prev) => ({
            ...prev,
            name: profile?.full_name || prev.name,
            email: user.email || prev.email,
            phone: profile?.phone || prev.phone,
          }))
        }
      } catch {
        // Supabase not configured or user not logged in - continue without prefill
      }
    }
    prefill()
  }, [])

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addressWrapperRef.current && !addressWrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const isoToCountryName: Record<string, string> = {
    IN: "India", US: "United States", GB: "United Kingdom", AE: "United Arab Emirates",
    SG: "Singapore", AU: "Australia", DE: "Germany", FR: "France", JP: "Japan",
    CN: "China", SA: "Saudi Arabia", QA: "Qatar", OM: "Oman", MY: "Malaysia", CA: "Canada",
  }

  const searchAddress = useCallback(async (query: string) => {
    if (query.length < 2) {
      setAddressSuggestions([])
      setShowSuggestions(false)
      return
    }
    setAddressLoading(true)
    try {
      const isoCode = countryData[checkoutForm.country]?.isoCode?.toLowerCase() || "in"
      const params = new URLSearchParams({
        q: query,
        countryCode: isoCode,
        ...(checkoutForm.city && { city: checkoutForm.city }),
        ...(checkoutForm.state && { state: checkoutForm.state }),
        ...(checkoutForm.pincode && { pincode: checkoutForm.pincode }),
      })
      const res = await fetch(`/api/address-autocomplete?${params}`)
      if (!res.ok) throw new Error("autocomplete failed")
      const data = await res.json()
      const results: AddressSuggestion[] = data.results || []
      setAddressSuggestions(results)
      setShowSuggestions(results.length > 0)
    } catch {
      setAddressSuggestions([])
    } finally {
      setAddressLoading(false)
    }
  }, [checkoutForm.city, checkoutForm.state, checkoutForm.country, checkoutForm.pincode])

  const handleAddressInput = (value: string) => {
    setCheckoutForm((prev) => ({ ...prev, address: value }))
    if (addressDebounceRef.current) clearTimeout(addressDebounceRef.current)
    addressDebounceRef.current = setTimeout(() => searchAddress(value), 300)
  }

  const selectAddressSuggestion = (suggestion: AddressSuggestion) => {
    const matchedCountry = isoToCountryName[suggestion.countryCode] || suggestion.country
    const cd = countryData[matchedCountry]
    setCheckoutForm((prev) => ({
      ...prev,
      address: suggestion.street || suggestion.displayName.split(",").slice(0, 2).join(",").trim(),
      address2: "",
      city: suggestion.city,
      state: suggestion.state,
      pincode: suggestion.postcode,
      country: cd ? matchedCountry : prev.country,
      countryCode: cd?.phoneCode || prev.countryCode,
    }))
    setShowSuggestions(false)
    setAddressSuggestions([])
  }

  const countryData: Record<string, { phoneCode: string; isoCode: string; postalLength: number; alphanumeric: boolean; phoneLength: number }> = {
    "India": { phoneCode: "+91", isoCode: "IN", postalLength: 6, alphanumeric: false, phoneLength: 10 },
    "United States": { phoneCode: "+1", isoCode: "US", postalLength: 5, alphanumeric: false, phoneLength: 10 },
    "United Kingdom": { phoneCode: "+44", isoCode: "GB", postalLength: 7, alphanumeric: true, phoneLength: 10 },
    "United Arab Emirates": { phoneCode: "+971", isoCode: "AE", postalLength: 0, alphanumeric: false, phoneLength: 9 },
    "Singapore": { phoneCode: "+65", isoCode: "SG", postalLength: 6, alphanumeric: false, phoneLength: 8 },
    "Australia": { phoneCode: "+61", isoCode: "AU", postalLength: 4, alphanumeric: false, phoneLength: 9 },
    "Germany": { phoneCode: "+49", isoCode: "DE", postalLength: 5, alphanumeric: false, phoneLength: 11 },
    "France": { phoneCode: "+33", isoCode: "FR", postalLength: 5, alphanumeric: false, phoneLength: 9 },
    "Japan": { phoneCode: "+81", isoCode: "JP", postalLength: 7, alphanumeric: false, phoneLength: 10 },
    "China": { phoneCode: "+86", isoCode: "CN", postalLength: 6, alphanumeric: false, phoneLength: 11 },
    "Saudi Arabia": { phoneCode: "+966", isoCode: "SA", postalLength: 5, alphanumeric: false, phoneLength: 9 },
    "Qatar": { phoneCode: "+974", isoCode: "QA", postalLength: 0, alphanumeric: false, phoneLength: 8 },
    "Oman": { phoneCode: "+968", isoCode: "OM", postalLength: 3, alphanumeric: false, phoneLength: 8 },
    "Malaysia": { phoneCode: "+60", isoCode: "MY", postalLength: 5, alphanumeric: false, phoneLength: 10 },
    "Canada": { phoneCode: "+1", isoCode: "CA", postalLength: 6, alphanumeric: true, phoneLength: 10 },
  }

  const countryCodes = Object.entries(countryData).map(([name, d]) => ({
    code: d.phoneCode,
    key: name, // use country name as unique key since multiple countries share phone codes (e.g. +1)
    label: `${d.isoCode} ${d.phoneCode}`,
    country: name,
  }))

  const fetchAreaSuggestions = useCallback(async (city: string, state: string, country: string, pincode: string) => {
    setAddressLoading(true)
    try {
      const isoCode = countryData[country]?.isoCode?.toLowerCase() || "in"
      const q = [city, state].filter(Boolean).join(", ") || pincode
      const params = new URLSearchParams({ q, countryCode: isoCode, pincode, city, state })
      const res = await fetch(`/api/address-autocomplete?${params}`)
      if (!res.ok) return
      const data = await res.json()
      const suggestions: AddressSuggestion[] = data.results || []
      setAddressSuggestions(suggestions)
      if (suggestions.length > 0) setShowSuggestions(true)
    } catch {
      // ignore
    } finally {
      setAddressLoading(false)
    }
  }, [])

  const handlePincodeChange = async (value: string) => {
    const selectedCountry = checkoutForm.country
    const cd = countryData[selectedCountry]
    const isAlpha = cd?.alphanumeric
    const cleanValue = isAlpha
      ? value.replace(/[^a-zA-Z0-9 -]/g, "").toUpperCase().slice(0, 10)
      : value.replace(/\D/g, "").slice(0, cd?.postalLength || 10)

    setCheckoutForm((prev) => ({ ...prev, pincode: cleanValue }))

    const expectedLength = cd?.postalLength || 0
    if (expectedLength === 0 || cleanValue.replace(/[\s-]/g, "").length < expectedLength) return

    setPincodeLoading(true)
    try {
      let found = false
      let resolvedCity = ""
      let resolvedState = ""
      let resolvedCountry = selectedCountry
      let resolvedPhoneCode = checkoutForm.countryCode

      if (selectedCountry === "India") {
        const numericPin = cleanValue.replace(/\D/g, "")
        const res = await fetch(`https://api.postalpincode.in/pincode/${numericPin}`)
        const data = await res.json()
        if (data?.[0]?.Status === "Success" && data[0].PostOffice?.length > 0) {
          const po = data[0].PostOffice[0]
          resolvedCity = po.District || po.Division || ""
          resolvedState = po.State || ""
          found = true
        }
      }

      if (!found) {
        const isoCode = cd?.isoCode || "US"
        const encoded = encodeURIComponent(cleanValue.replace(/\s/g, ""))
        const res = await fetch(`https://api.zippopotam.us/${isoCode}/${encoded}`)
        if (res.ok) {
          const data = await res.json()
          if (data?.places?.length > 0) {
            const place = data.places[0]
            resolvedCity = place["place name"] || ""
            resolvedState = place["state"] || place["state abbreviation"] || ""
            found = true
          }
        }

        if (!found) {
          for (const [countryName, cData] of Object.entries(countryData)) {
            if (countryName === selectedCountry || cData.postalLength === 0) continue
            const stripped = cleanValue.replace(/[\s-]/g, "")
            if (stripped.length < cData.postalLength) continue
            try {
              const tryRes = await fetch(`https://api.zippopotam.us/${cData.isoCode}/${encodeURIComponent(cleanValue.replace(/\s/g, ""))}`)
              if (tryRes.ok) {
                const tryData = await tryRes.json()
                if (tryData?.places?.length > 0) {
                  const place = tryData.places[0]
                  resolvedCity = place["place name"] || ""
                  resolvedState = place["state"] || place["state abbreviation"] || ""
                  resolvedCountry = countryName
                  resolvedPhoneCode = cData.phoneCode
                  found = true
                  break
                }
              }
            } catch {
              continue
            }
          }
        }
      }

      if (found) {
        setCheckoutForm((prev) => ({
          ...prev,
          pincode: cleanValue,
          city: resolvedCity,
          state: resolvedState,
          country: resolvedCountry,
          countryCode: resolvedPhoneCode,
        }))
        // Auto-fetch address suggestions for this area
        fetchAreaSuggestions(resolvedCity, resolvedState, resolvedCountry, cleanValue)

        // Check Shiprocket serviceability + get live shipping rate for Indian pincodes
        if (resolvedCountry === "India") {
          setServiceability({ serviceable: null, estimatedDays: "", courierName: "", error: "" })
          setShippingRate(null)
          setShippingLoading(true)
          try {
            // Estimate weight: assume avg 0.3 kg per item (300g)
            const totalWeight = Math.max(0.5, items.reduce((sum, item) => sum + item.quantity * 0.3, 0))
            const svcRes = await fetch("/api/shiprocket/check-serviceability", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ delivery_pincode: cleanValue, weight: totalWeight }),
            })
            const svcData = await svcRes.json()
            if (svcRes.ok && svcData.available) {
              const rate = svcData.cheapest_rate ?? 99
              setShippingRate(rate)
              setServiceability({
                serviceable: true,
                estimatedDays: svcData.estimated_days || "3-5",
                courierName: svcData.couriers?.[0]?.courier_name || "",
                error: "",
              })
            } else {
              setShippingRate(99) // fallback if not serviceable data
              setServiceability({ serviceable: false, estimatedDays: "", courierName: "", error: "" })
            }
          } catch {
            setShippingRate(99)
            setServiceability({ serviceable: null, estimatedDays: "", courierName: "", error: "" })
          } finally {
            setShippingLoading(false)
          }
        } else {
          // Outside India - reset serviceability check, use flat rate
          setShippingRate(null)
          setShippingLoading(false)
          setServiceability({ serviceable: null, estimatedDays: "", courierName: "", error: "" })
        }
      }
    } catch {
      // silently fail
    } finally {
      setPincodeLoading(false)
    }
  }

  const handleCountryChange = (country: string) => {
    const cd = countryData[country]
    setCheckoutForm((prev) => ({
      ...prev,
      country,
      countryCode: cd?.phoneCode || prev.countryCode,
      phone: prev.phone.slice(0, cd?.phoneLength || 10),
      pincode: "",
      city: "",
      state: "",
    }))
    setServiceability({ serviceable: null, estimatedDays: "", courierName: "", error: "" })
    setShippingRate(null)
  }

  const cartProducts = items.map((item) => ({
    id: item.productId,
    name: item.name,
    slug: item.slug,
    image: item.image,
    cartSize: item.size,
    cartQuantity: item.quantity,
    cartPrice: item.pricePerUnit,
  }))

  const discount = couponApplied
    ? couponApplied.type === "percent"
      ? Math.round(subtotal * couponApplied.discount)
      : couponApplied.discount
    : 0
  const afterDiscount = subtotal - discount
  // Use Shiprocket's live rate if available, otherwise fixed ₹99
  // Free delivery when order >= ₹1500 (overrides Shiprocket rate)
  const deliveryFee = afterDiscount >= 1500 ? 0 : (shippingRate ?? 99)
  const total = afterDiscount + deliveryFee

  const applyCoupon = async () => {
    const email = checkoutForm.email.trim()
    if (!email) {
      setCouponError("Enter your email in the checkout form first, then apply the coupon.")
      return
    }
    const code = couponCode.trim().toUpperCase()
    if (!code) {
      setCouponError("Please enter a coupon code.")
      return
    }
    setCouponLoading(true)
    setCouponError("")
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, email }),
      })
      const data = await res.json()
      if (data.valid) {
        setCouponApplied(data.coupon)
        setCouponDropdownOpen(false)
      } else {
        setCouponError(data.error || "Invalid coupon code.")
        setCouponApplied(null)
      }
    } catch {
      setCouponError("Could not validate coupon. Please try again.")
    } finally {
      setCouponLoading(false)
    }
  }

  const selectCoupon = (suggestion: { code: string; label: string }) => {
    setCouponCode(suggestion.code)
    setCouponDropdownOpen(false)
  }

  const removeCoupon = () => {
    setCouponApplied(null)
    setCouponCode("")
    setCouponError("")
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setOrderLoading(true)
    setPaymentError("")

    const newOrderId = "CR" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase()

    const orderItems = items.map((item) => ({
      name: item.name || item.productId,
      size: item.size,
      quantity: item.quantity,
      pricePerUnit: item.pricePerUnit,
      total: item.pricePerUnit * item.quantity,
    }))

    try {
      // Step 1: Create Razorpay order on the server
      const createRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          currency: "INR",
          receipt: newOrderId,
          notes: {
            orderId: newOrderId,
            customerEmail: checkoutForm.email,
          },
        }),
      })

      if (!createRes.ok) {
        throw new Error("Failed to create payment order")
      }

      const { orderId: razorpayOrderId } = await createRes.json()

      // Step 2: Open Razorpay checkout modal
      const RazorpayCheckout = (window as unknown as { Razorpay: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, callback: () => void) => void } }).Razorpay

      if (!RazorpayCheckout) {
        throw new Error("Razorpay SDK not loaded. Please refresh and try again.")
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: Math.round(total * 100),
        currency: "INR",
        name: "Chittamma Ruchulu",
        description: `Order ${newOrderId}`,
        order_id: razorpayOrderId,
        prefill: {
          name: checkoutForm.name,
          email: checkoutForm.email,
          contact: checkoutForm.countryCode + checkoutForm.phone,
        },
        notes: {
          address: `${checkoutForm.address}, ${checkoutForm.city}, ${checkoutForm.state} - ${checkoutForm.pincode}`,
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
          emi: true,
          app_pay: true,
        },
        theme: {
          color: "#a0522d",
        },
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          // Step 3: Verify payment on server
          try {
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderData: {
                  orderId: newOrderId,
                  customer: checkoutForm,
                  items: orderItems,
                  subtotal,
                  deliveryFee,
                  discount,
                  total,
                  couponId: couponApplied?.id ?? null,
                  couponCode: couponApplied?.code ?? null,
                },
              }),
            })

            const verifyData = await verifyRes.json()

            if (verifyRes.ok && verifyData.success) {
              setOrderId(newOrderId)
              setPaymentId(response.razorpay_payment_id)
              setEmailSent(verifyData.emailSent === true)
              setOrderPlaced(true)
              clear()
            } else {
              setPaymentError(verifyData.error || "Payment verification failed. Please contact support.")
            }
          } catch {
            setPaymentError("Payment verification failed. If amount was deducted, please contact support with your payment ID.")
          }
          setOrderLoading(false)
        },
        modal: {
          ondismiss: () => {
            setOrderLoading(false)
            setPaymentError("")
          },
        },
      }

      const rzp = new RazorpayCheckout(options)
      rzp.on("payment.failed", () => {
        setPaymentError("Payment failed. Please try again or use a different payment method.")
        setOrderLoading(false)
      })
      rzp.open()
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
      setOrderLoading(false)
    }
  }

  // Show loading while cart is hydrating from sessionStorage
  if (!mounted) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <PageHeader
          title="Your Cart"
          subtitle="Loading..."
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Cart" }]}
        />
        <section className="py-10 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  if (orderPlaced) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <section className="py-20 lg:py-32">
          <div className="mx-auto max-w-lg px-4 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold font-serif text-foreground mb-4">
              {"Order Placed Successfully!"}
            </h1>
            {orderId && (
              <div className="space-y-2 mb-4">
                <p className="text-sm font-mono bg-muted/50 inline-block px-4 py-2 rounded-full text-foreground">
                  {"Order ID: "}<span className="font-bold text-primary">{orderId}</span>
                </p>
                {paymentId && (
                  <p className="text-sm font-mono bg-green-50 inline-block px-4 py-2 rounded-full text-green-800">
                    {"Payment ID: "}<span className="font-bold">{paymentId}</span>
                  </p>
                )}
              </div>
            )}
            <p className="text-muted-foreground mb-3">
              {"Thank you for your order. We have received your request and will process it shortly."}
            </p>
            {emailSent ? (
              <p className="text-sm text-green-700 bg-green-50 inline-block px-4 py-2 rounded-lg mb-8">
                {"A confirmation email has been sent to your email address."}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mb-8">
                {"For any queries about your order, contact us at "}
                <a href="mailto:contact@chittammaruchulu.com" className="text-primary font-semibold">
                  {"contact@chittammaruchulu.com"}
                </a>
                {" with your Order ID."}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/shop">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 font-semibold">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  {"Continue Shopping"}
                </Button>
              </Link>
              <Link href="/">
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-full px-8 py-6 font-semibold">
                  {"Back to Home"}
                </Button>
              </Link>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Script id="razorpay" src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Navbar />

      <PageHeader
        title="Your Cart"
        subtitle={
          totalItems > 0
            ? `${totalItems} item${totalItems > 1 ? "s" : ""} in your cart`
            : "Your cart is empty"
        }
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Cart" }]}
      />

      <section className="py-10 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {cartProducts.length > 0 && !checkoutMode ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Cart items */}
              <div className="lg:col-span-2 space-y-4">
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-secondary/50 rounded-xl text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  <div className="col-span-5">{"Product"}</div>
                  <div className="col-span-2 text-center">{"Size"}</div>
                  <div className="col-span-1 text-center">{"Price"}</div>
                  <div className="col-span-2 text-center">{"Quantity"}</div>
                  <div className="col-span-2 text-right">{"Total"}</div>
                </div>

                {cartProducts.map((item) => (
                  <div
                    key={`${item.id}-${item.cartSize}`}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 md:p-6 bg-card rounded-2xl border border-border hover:shadow-md transition-shadow"
                  >
                    <div className="md:col-span-5 flex items-center gap-4">
                      <Link href={`/shop/${item.slug}`} className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-border">
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                      </Link>
                      <div>
                        <Link href={`/shop/${item.slug}`}>
                          <h3 className="font-serif font-bold text-foreground hover:text-primary transition-colors">{item.name}</h3>
                        </Link>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.cartSize}</p>
                        <button onClick={() => remove(item.id, item.cartSize)} className="flex items-center gap-1.5 text-xs text-destructive hover:text-destructive/80 mt-2 transition-colors md:hidden">
                          <Trash2 className="h-3 w-3" />{"Remove"}
                        </button>
                      </div>
                    </div>
                    <div className="md:col-span-2 text-center">
                      <span className="md:hidden text-xs text-muted-foreground mr-2">{"Size:"}</span>
                      <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">{item.cartSize}</span>
                    </div>
                    <div className="md:col-span-1 text-center">
                      <span className="md:hidden text-xs text-muted-foreground mr-2">{"Price:"}</span>
                      <span className="font-semibold text-foreground">{`\u20B9${item.cartPrice}`}</span>
                    </div>
                    <div className="md:col-span-2 flex items-center justify-center">
                      <div className="flex items-center border border-border rounded-full">
                        <button onClick={() => update(item.id, item.cartSize, item.cartQuantity - 1)} className="w-8 h-8 flex items-center justify-center text-foreground/70 hover:text-primary transition-colors" aria-label="Decrease quantity">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center font-semibold text-sm text-foreground">{item.cartQuantity}</span>
                        <button onClick={() => update(item.id, item.cartSize, item.cartQuantity + 1)} className="w-8 h-8 flex items-center justify-center text-foreground/70 hover:text-primary transition-colors" aria-label="Increase quantity">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-3">
                      <span className="md:hidden text-xs text-muted-foreground">{"Total:"}</span>
                      <span className="font-bold text-foreground">{`\u20B9${item.cartPrice * item.cartQuantity}`}</span>
                      <button onClick={() => remove(item.id, item.cartSize)} className="hidden md:flex w-8 h-8 items-center justify-center text-muted-foreground hover:text-destructive rounded-full hover:bg-destructive/10 transition-all" aria-label={`Remove ${item.name}`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between pt-4">
                  <Link href="/shop">
                    <Button variant="ghost" className="text-primary hover:text-primary/80 hover:bg-primary/5">
                      <ArrowLeft className="h-4 w-4 mr-2" />{"Continue Shopping"}
                    </Button>
                  </Link>
                  <Button variant="ghost" onClick={clear} className="text-destructive hover:text-destructive/80 hover:bg-destructive/5 text-sm">
                    <Trash2 className="h-4 w-4 mr-2" />{"Clear Cart"}
                  </Button>
                </div>
              </div>

              {/* Order summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-28 space-y-6">
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h3 className="font-serif font-bold text-lg text-foreground mb-6">{"Order Summary"}</h3>

                    {/* Coupon section */}
                    <div className="mb-6 pb-6 border-b border-border">
                      <label className="text-sm font-semibold text-foreground mb-2 block">{"Coupon Code"}</label>

                      {couponApplied ? (
                        <div className="flex items-center justify-between bg-green-500/5 border border-green-500/20 rounded-xl p-3">
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-bold text-green-700">{couponApplied.code}</span>
                          </div>
                          <button onClick={removeCoupon} className="text-xs text-destructive hover:underline font-semibold">{"Remove"}</button>
                        </div>
                      ) : (
                        <>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter code"
                              value={couponCode}
                              onChange={(e) => { setCouponCode(e.target.value); setCouponError("") }}
                              className="bg-background border-border"
                            />
                            <Button
                              variant="outline"
                              onClick={applyCoupon}
                              disabled={!couponCode.trim() || couponLoading}
                              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground flex-shrink-0"
                            >
                              {couponLoading ? "Checking..." : "Apply"}
                            </Button>
                          </div>
                          {couponError && <p className="text-xs text-destructive mt-2">{couponError}</p>}
                        </>
                      )}

                      {/* Coupon dropdown */}
                      {!couponApplied && (
                        <div className="mt-3">
                          <button
                            onClick={() => setCouponDropdownOpen(!couponDropdownOpen)}
                            className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
                          >
                            <Tag className="h-3 w-3" />
                            {"View available coupons"}
                            <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${couponDropdownOpen ? "rotate-180" : ""}`} />
                          </button>

                          {couponDropdownOpen && (
                            <div className="mt-2 border border-border rounded-xl overflow-hidden bg-background">
                              {couponSuggestions.map((coupon) => (
                                <button
                                  key={coupon.code}
                                  onClick={() => selectCoupon(coupon)}
                                  className="w-full text-left px-4 py-3 text-sm hover:bg-primary/5 transition-colors border-b border-border last:border-b-0 flex items-start gap-3"
                                >
                                  <Tag className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="font-semibold text-foreground">{coupon.code}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{coupon.label.split(" - ")[1]}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Totals */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{"Subtotal"}</span>
                        <span className="text-foreground font-medium">{`\u20B9${subtotal}`}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-600">{"Coupon Discount"}</span>
                          <span className="text-green-600 font-medium">{`-\u20B9${discount}`}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{"Delivery"}</span>
                        <span className={`font-medium ${deliveryFee === 0 ? "text-green-600" : "text-foreground"}`}>
                          {shippingLoading
                            ? <span className="text-xs text-muted-foreground animate-pulse">Calculating...</span>
                            : deliveryFee === 0 ? "FREE" : `\u20B9${deliveryFee}`}
                        </span>
                      </div>
                      {/* Shiprocket courier info */}
                      {serviceability.serviceable && serviceability.courierName && deliveryFee > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Truck className="h-3 w-3 text-primary flex-shrink-0" />
                          <span>{serviceability.courierName}{serviceability.estimatedDays ? ` · ${serviceability.estimatedDays} days` : ""}</span>
                        </div>
                      )}
                      {!shippingLoading && !serviceability.serviceable && serviceability.serviceable !== null && (
                        <p className="text-xs text-amber-600">{"Delivery may not be available at this pincode. Contact us to confirm."}</p>
                      )}
                      {!shippingLoading && deliveryFee === 0 ? (
                        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mt-1">
                          <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                          <p className="text-xs font-medium text-green-700">You have unlocked free delivery!</p>
                        </div>
                      ) : !shippingLoading && afterDiscount < 1500 ? (
                        <div className="mt-1">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>{`Add \u20B9${1500 - afterDiscount} more for free delivery`}</span>
                            <span>{`\u20B9${afterDiscount} / \u20B91500`}</span>
                          </div>
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${Math.min((afterDiscount / 1500) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="border-t border-border pt-4 mb-6">
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-bold text-lg text-foreground">{"Total"}</span>
                        <span className="font-serif font-bold text-2xl text-foreground">{`\u20B9${total}`}</span>
                      </div>
                    </div>

                    <Button
                      size="lg"
                      onClick={() => setCheckoutMode(true)}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-6 text-base font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-primary/20"
                    >
                      <CreditCard className="h-5 w-5 mr-2" />
                      {"Proceed to Checkout"}
                    </Button>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl border border-border">
                    <Truck className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">{"Free delivery above \u20B91,500"}</p>
                      <p className="text-xs text-muted-foreground">{"Estimated: 3-5 business days"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl border border-border">
                    <Shield className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">{"Secure Payment"}</p>
                      <p className="text-xs text-muted-foreground">{"100% secure processing"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : cartProducts.length > 0 && checkoutMode ? (
            /* Checkout form */
            <div className="max-w-2xl mx-auto">
              <button
                onClick={() => setCheckoutMode(false)}
                className="flex items-center gap-2 text-primary hover:text-primary/80 mb-8 text-sm font-semibold transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />{"Back to Cart"}
              </button>

              <div className="bg-card rounded-2xl border border-border p-6 lg:p-10">
                <h2 className="font-serif font-bold text-2xl text-foreground mb-2">{"Checkout"}</h2>
                <p className="text-muted-foreground text-sm mb-8">{"Fill in your details to complete the order."}</p>

                <form onSubmit={handleCheckout} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="checkout-name" className="text-sm font-semibold text-foreground mb-2 block">
                        {"Full Name"}<span className="text-destructive ml-0.5">{"*"}</span>
                      </Label>
                      <Input id="checkout-name" required placeholder="Your full name" value={checkoutForm.name} onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })} className="bg-background border-border" />
                    </div>
                    <div>
                      <Label htmlFor="checkout-email" className="text-sm font-semibold text-foreground mb-2 block">
                        {"Email"}<span className="text-destructive ml-0.5">{"*"}</span>
                      </Label>
                      <Input id="checkout-email" type="email" required placeholder="your@email.com" value={checkoutForm.email} onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })} className="bg-background border-border" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="checkout-phone" className="text-sm font-semibold text-foreground mb-2 block">
                      {"Phone Number"}<span className="text-destructive ml-0.5">{"*"}</span>
                    </Label>
                    <div className="flex gap-2">
                      <select
                        value={checkoutForm.countryCode}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, countryCode: e.target.value })}
                        className="h-9 rounded-md border border-border bg-background px-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-[100px] flex-shrink-0"
                        aria-label="Country code"
                      >
                          {countryCodes.map((cc) => (
                            <option key={cc.key} value={cc.code}>{cc.label}</option>
                          ))}
                      </select>
                      <Input
                        id="checkout-phone"
                        type="tel"
                        required
                        placeholder={"X".repeat(countryData[checkoutForm.country]?.phoneLength || 10)}
                        maxLength={countryData[checkoutForm.country]?.phoneLength || 10}
                        value={checkoutForm.phone}
                        onChange={(e) => {
                          const maxLen = countryData[checkoutForm.country]?.phoneLength || 10
                          const digits = e.target.value.replace(/\D/g, "").slice(0, maxLen)
                          setCheckoutForm({ ...checkoutForm, phone: digits })
                        }}
                        className="bg-background border-border flex-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="checkout-pincode" className="text-sm font-semibold text-foreground mb-2 block">
                        {"Pincode / Zipcode"}<span className="text-destructive ml-0.5">{"*"}</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="checkout-pincode"
                          required
                          placeholder={countryData[checkoutForm.country]?.alphanumeric ? "Postal Code" : "0".repeat(countryData[checkoutForm.country]?.postalLength || 6)}
                          maxLength={countryData[checkoutForm.country]?.alphanumeric ? 10 : (countryData[checkoutForm.country]?.postalLength || 10)}
                          value={checkoutForm.pincode}
                          onChange={(e) => handlePincodeChange(e.target.value)}
                          className="bg-background border-border"
                        />
                        {pincodeLoading && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                      {/* Serviceability banner */}
                      {!pincodeLoading && serviceability.serviceable === true && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                          <Truck className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>
                            {"Delivery available"}
                            {serviceability.estimatedDays && ` · Est. ${serviceability.estimatedDays} days`}
                            {serviceability.courierName && ` via ${serviceability.courierName}`}
                          </span>
                        </div>
                      )}
                      {!pincodeLoading && serviceability.serviceable === false && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                          <span>{"Delivery coverage for this pincode is being verified. You can still place your order and we will confirm shipment."}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="checkout-country" className="text-sm font-semibold text-foreground mb-2 block">
                        {"Country"}<span className="text-destructive ml-0.5">{"*"}</span>
                      </Label>
                      <select
                        id="checkout-country"
                        required
                        value={checkoutForm.country}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {Object.keys(countryData).map((name) => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="checkout-city" className="text-sm font-semibold text-foreground mb-2 block">
                        {"City"}<span className="text-destructive ml-0.5">{"*"}</span>
                      </Label>
                      <Input id="checkout-city" required placeholder="Auto-filled from pincode" value={checkoutForm.city} onChange={(e) => setCheckoutForm({ ...checkoutForm, city: e.target.value })} className="bg-background border-border" />
                    </div>
                    <div>
                      <Label htmlFor="checkout-state" className="text-sm font-semibold text-foreground mb-2 block">
                        {"State"}<span className="text-destructive ml-0.5">{"*"}</span>
                      </Label>
                      <Input id="checkout-state" required placeholder="Auto-filled from pincode" value={checkoutForm.state} onChange={(e) => setCheckoutForm({ ...checkoutForm, state: e.target.value })} className="bg-background border-border" />
                    </div>
                  </div>
                  <div ref={addressWrapperRef} className="relative">
                    <Label htmlFor="checkout-address" className="text-sm font-semibold text-foreground mb-2 block">
                      {"Delivery Address Line 1"}<span className="text-destructive ml-0.5">{"*"}</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="checkout-address"
                        required
                        placeholder="e.g. GR Residency, Madhapur..."
                        value={checkoutForm.address}
                        onChange={(e) => handleAddressInput(e.target.value)}
                        onFocus={() => { if (addressSuggestions.length > 0) setShowSuggestions(true) }}
                        autoComplete="off"
                        className="bg-background border-border"
                      />
                      {addressLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    {showSuggestions && addressSuggestions.length > 0 && (
                      <div className="absolute z-50 top-full mt-1 w-full bg-card border border-border rounded-xl shadow-xl overflow-hidden">
                        <div className="px-3 py-2 border-b border-border bg-muted/40">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Navigation className="w-3 h-3" />
                            Suggestions
                          </p>
                        </div>
                        <div className="max-h-56 overflow-y-auto">
                          {addressSuggestions.map((s, i) => {
                            const mainLine = s.street || s.displayName.split(",").slice(0, 2).join(",").trim()
                            const subLine = [s.city, s.state, s.postcode].filter(Boolean).join(", ")
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => selectAddressSuggestion(s)}
                                className="w-full text-left px-3 py-3 hover:bg-muted/60 active:bg-muted transition-colors border-b border-border/50 last:border-b-0 flex items-start gap-3"
                              >
                                <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                                  <MapPin className="w-3.5 h-3.5 text-primary" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-foreground leading-snug line-clamp-1">{mainLine}</p>
                                  {subLine && (
                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{subLine}</p>
                                  )}
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="checkout-address2" className="text-sm font-semibold text-foreground mb-2 block">
                      {"Address Line 2"}
                    </Label>
                    <Input id="checkout-address2" placeholder="Landmark, Area, Colony (Optional)" value={checkoutForm.address2} onChange={(e) => setCheckoutForm({ ...checkoutForm, address2: e.target.value })} className="bg-background border-border" />
                  </div>

                  {/* Order summary mini */}
                  <div className="border-t border-border pt-5 mt-5">
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between"><span className="text-muted-foreground">{"Subtotal"}</span><span className="font-medium text-foreground">{`\u20B9${subtotal}`}</span></div>
                      {discount > 0 && <div className="flex justify-between"><span className="text-green-600">{"Discount"}</span><span className="text-green-600 font-medium">{`-\u20B9${discount}`}</span></div>}
                      <div className="flex justify-between"><span className="text-muted-foreground">{"Delivery"}</span><span className={`font-medium ${deliveryFee === 0 ? "text-green-600" : "text-foreground"}`}>{deliveryFee === 0 ? "FREE" : `\u20B9${deliveryFee}`}</span></div>
                    </div>
                    <div className="flex justify-between border-t border-border pt-3 mb-6">
                      <span className="font-serif font-bold text-lg text-foreground">{"Total"}</span>
                      <span className="font-serif font-bold text-2xl text-foreground">{`\u20B9${total}`}</span>
                    </div>
                  </div>

  {paymentError && (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
      {paymentError}
    </div>
  )}

  <Button type="submit" size="lg" disabled={orderLoading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-6 text-base font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 disabled:opacity-70">
  {orderLoading ? (
    <>
      <div className="h-5 w-5 mr-2 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
      {"Processing Payment..."}
    </>
  ) : (
    <>
      <CreditCard className="h-5 w-5 mr-2" />
      {`Pay \u20B9${total}`}
    </>
  )}
  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="font-serif font-bold text-2xl text-foreground mb-3">{"Your cart is empty"}</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {"Looks like you haven't added any items yet. Explore our traditional delicacies and find something you love!"}
              </p>
              <Link href="/shop">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-10 py-6 text-base font-semibold">
                  <ShoppingBag className="h-5 w-5 mr-2" />{"Start Shopping"}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
