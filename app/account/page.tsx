"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserCircle, Package, LogOut, Loader2, Shield, Truck, ExternalLink } from "lucide-react"
import type { User } from "@supabase/supabase-js"

interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  role: string
}

interface Order {
  id: string
  items: Array<{ name: string; size: string; quantity: number; pricePerUnit: number; total: number }>
  subtotal: number
  delivery_charge: number
  discount: number
  total: number
  status: string
  created_at: string
  city: string
  state: string
  awb_code: string | null
  courier_name: string | null
  tracking_url: string | null
  shipping_status: string | null
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </main>
    }>
      <AccountContent />
    </Suspense>
  )
}

function AccountContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab") === "orders" ? "orders" : "profile"
  const [activeTab, setActiveTab] = useState(initialTab)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editName, setEditName] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  useEffect(() => {
    const supabase = createClient()

    const loadData = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        router.push("/auth/login?redirect=/account")
        return
      }
      setUser(currentUser)

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        setEditName(profileData.full_name || "")
        setEditPhone(profileData.phone || "")
      }

      // Fetch orders via server-side API route (uses service role key, bypasses RLS)
      // This reliably returns all orders matching user_id OR customer_email
      const ordersRes = await fetch("/api/account/orders")
      if (ordersRes.ok) {
        const { orders: fetchedOrders } = await ordersRes.json()
        setOrders(fetchedOrders || [])
      }
      setLoading(false)
    }

    loadData()
  }, [router])

  const handleSaveProfile = async () => {
    if (!user) return
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from("profiles")
      .update({ full_name: editName, phone: editPhone })
      .eq("id", user.id)

    setProfile((prev) => prev ? { ...prev, full_name: editName, phone: editPhone } : prev)
    setSuccessMsg("Profile updated successfully!")
    setTimeout(() => setSuccessMsg(""), 3000)
    setSaving(false)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="py-10 lg:py-16">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <h1 className="text-3xl font-bold font-serif text-foreground mb-8">{"My Account"}</h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-xl p-4 space-y-1">
                <div className="px-3 py-3 mb-2">
                  <p className="font-semibold text-foreground truncate">{profile?.full_name || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  {profile?.role === "admin" && (
                    <span className="inline-flex items-center gap-1 mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                      <Shield className="h-3 w-3" />
                      {"Admin"}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-lg transition-colors ${activeTab === "profile" ? "bg-primary/10 text-primary font-semibold" : "text-foreground/70 hover:text-primary hover:bg-primary/5"}`}
                >
                  <UserCircle className="h-4 w-4" />
                  {"Profile"}
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-lg transition-colors ${activeTab === "orders" ? "bg-primary/10 text-primary font-semibold" : "text-foreground/70 hover:text-primary hover:bg-primary/5"}`}
                >
                  <Package className="h-4 w-4" />
                  {"Orders"}
                </button>
                {profile?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-lg text-primary font-semibold hover:bg-primary/5 transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    {"Admin Dashboard"}
                  </Link>
                )}
                <div className="border-t border-border mt-2 pt-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-destructive hover:bg-destructive/5 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    {"Sign Out"}
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              {activeTab === "profile" && (
                <div className="bg-card border border-border rounded-xl p-6 lg:p-8">
                  <h2 className="text-xl font-bold font-serif text-foreground mb-6">{"Profile Information"}</h2>

                  {successMsg && (
                    <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg mb-6">
                      {successMsg}
                    </div>
                  )}

                  <div className="space-y-5 max-w-lg">
                    <div>
                      <Label className="text-sm font-semibold text-foreground mb-2 block">{"Email"}</Label>
                      <Input disabled value={user?.email || ""} className="bg-muted/50 border-border" />
                      <p className="text-xs text-muted-foreground mt-1">{"Email cannot be changed"}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-foreground mb-2 block">{"Full Name"}</Label>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Your full name"
                        className="bg-background border-border"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-foreground mb-2 block">{"Phone Number"}</Label>
                      <Input
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="10-digit phone number"
                        maxLength={10}
                        className="bg-background border-border"
                      />
                    </div>

                    <Button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-5 font-semibold"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {"Saving..."}
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === "orders" && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold font-serif text-foreground mb-4">{"Order History"}</h2>

                  {orders.length === 0 ? (
                    <div className="bg-card border border-border rounded-xl p-12 text-center">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">{"No orders yet"}</h3>
                      <p className="text-muted-foreground mb-6">{"Start shopping to see your orders here."}</p>
                      <Link href="/shop">
                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 font-semibold">
                          {"Browse Products"}
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div key={order.id} className="bg-card border border-border rounded-xl p-5 lg:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                          <div>
                            <p className="text-sm font-mono text-muted-foreground">{"Order #"}{order.id}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString("en-IN", {
                                day: "numeric", month: "long", year: "numeric",
                              })}
                            </p>
                          </div>
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[order.status] || "bg-muted text-muted-foreground"}`}>
                            {order.status}
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-foreground">
                                {item.name}{" "}
                                <span className="text-muted-foreground">{"("}{item.size}{")"}{" x "}{item.quantity}</span>
                              </span>
                              <span className="font-medium text-foreground">{"\u20B9"}{item.total}</span>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-border pt-3 flex justify-between text-sm font-semibold">
                          <span className="text-foreground">{"Total"}</span>
                          <span className="text-primary">{"\u20B9"}{order.total}</span>
                        </div>

                        {/* Shipping tracking info */}
                        {order.awb_code && (
                          <div className="mt-3 pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Truck className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                              <span>
                                {order.courier_name ? `${order.courier_name} · ` : ""}
                                {"AWB: "}<span className="font-mono text-foreground">{order.awb_code}</span>
                              </span>
                            </div>
                            {order.tracking_url && (
                              <a
                                href={order.tracking_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" />{"Track Order"}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
