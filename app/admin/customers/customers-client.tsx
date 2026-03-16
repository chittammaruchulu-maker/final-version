"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Search, Loader2, Users, X, Mail, Phone, ShoppingBag,
  IndianRupee, Calendar, ChevronRight, RefreshCw, Shield
} from "lucide-react"

interface Profile {
  id: string; full_name: string | null; email: string | null
  phone: string | null; role: string; created_at: string
}

interface Order {
  id: string; user_id: string | null; customer_email: string
  total: number; status: string; created_at: string
  items: Array<{ name: string; quantity: number; pricePerUnit: number }>
}

const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(Math.round(n))

export default function AdminCustomersPage({ initialProfiles = [], initialOrders = [] }: { initialProfiles?: Profile[]; initialOrders?: Order[] }) {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles)
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [loading, setLoading] = useState(initialProfiles.length === 0)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("customer")
  const [selected, setSelected] = useState<Profile | null>(null)

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/customers")
    if (res.ok) {
      const data = await res.json()
      setProfiles(data.profiles || [])
      setOrders(data.orders || [])
    }
    setLoading(false)
    setRefreshing(false)
  }, [])

  // Only fetch on mount if no server-side data was provided
  useEffect(() => { if (initialProfiles.length === 0) load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = () => { setRefreshing(true); load() }

  const filtered = profiles.filter(p => {
    const matchSearch = !search ||
      (p.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.phone || "").includes(search)
    const matchRole = roleFilter === "all" || p.role === roleFilter
    return matchSearch && matchRole
  })

  const getCustomerOrders = (profile: Profile) =>
    orders.filter(o => o.user_id === profile.id || o.customer_email === profile.email)

  const getCustomerRevenue = (profile: Profile) =>
    getCustomerOrders(profile).filter(o => o.status !== "cancelled").reduce((s, o) => s + Number(o.total), 0)

  const totalCustomers = profiles.filter(p => p.role === "customer").length
  const totalAdmins = profiles.filter(p => p.role === "admin").length

  if (loading) return (
    <div className="flex items-center justify-center h-[calc(100vh-64px)]">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">

      {/* ── Left: Customer List ── */}
      <div className={`flex flex-col border-r border-border ${selected ? "hidden lg:flex lg:w-[55%]" : "w-full"}`}>

        {/* Toolbar */}
        <div className="flex-shrink-0 bg-card border-b border-border">
          <div className="flex items-center gap-2 p-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, phone..."
                className="w-full pl-9 pr-8 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
              {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>}
            </div>
            <button onClick={handleRefresh} disabled={refreshing} className="p-2 border border-border rounded-lg bg-card hover:bg-muted text-muted-foreground disabled:opacity-50 transition-colors">
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Role tabs */}
          <div className="flex gap-1 px-3 pb-3">
            {[
              { key: "all", label: "All", count: profiles.length },
              { key: "customer", label: "Customers", count: totalCustomers },
              { key: "admin", label: "Admins", count: totalAdmins },
            ].map(tab => (
              <button key={tab.key} onClick={() => setRoleFilter(tab.key)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  roleFilter === tab.key ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground hover:bg-muted"
                }`}>
                {tab.label}
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${roleFilter === tab.key ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 px-4 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
            <span><strong className="text-foreground">{filtered.length}</strong> users</span>
            <span><strong className="text-foreground">
              ₹{fmt(filtered.reduce((s, p) => s + getCustomerRevenue(p), 0))}
            </strong> total spent</span>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <Users className="h-10 w-10 opacity-20" />
              <p className="text-sm font-medium">No customers found</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map(profile => {
                const customerOrders = getCustomerOrders(profile)
                const revenue = getCustomerRevenue(profile)
                const isSelected = selected?.id === profile.id
                return (
                  <button key={profile.id} onClick={() => setSelected(isSelected ? null : profile)}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 text-left transition-colors ${isSelected ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-muted/40"}`}>
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">
                        {(profile.full_name || profile.email || "?").charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {profile.full_name || "Unnamed User"}
                        </p>
                        {profile.role === "admin" && (
                          <span className="flex-shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-violet-50 text-violet-700 border border-violet-200">
                            <Shield className="h-2 w-2" />Admin
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{profile.email || "No email"}</p>
                    </div>

                    {/* Stats */}
                    <div className="text-right flex-shrink-0 hidden sm:block">
                      <p className="text-xs font-bold text-foreground">{customerOrders.length} orders</p>
                      {revenue > 0 && <p className="text-[10px] text-emerald-600">₹{fmt(revenue)}</p>}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Customer Detail ── */}
      {selected && (
        <div className="w-full lg:w-[45%] flex flex-col overflow-hidden bg-background border-l border-border">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-card flex-shrink-0">
            <p className="text-sm font-bold text-foreground">Customer Profile</p>
            <button onClick={() => setSelected(null)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"><X className="h-4 w-4" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Profile Card */}
            <div className="bg-card border border-border rounded-xl p-5 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-primary">
                  {(selected.full_name || selected.email || "?").charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="text-base font-bold text-foreground">{selected.full_name || "Unnamed User"}</p>
              {selected.role === "admin" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200 mt-1.5">
                  <Shield className="h-3 w-3" />Administrator
                </span>
              )}
              <p className="text-[10px] text-muted-foreground mt-2">
                Member since {new Date(selected.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </p>
            </div>

            {/* Contact */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border bg-muted/30">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Contact</p>
              </div>
              <div className="p-4 space-y-2.5 text-xs">
                {selected.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                    <a href={`mailto:${selected.email}`} className="text-primary hover:underline">{selected.email}</a>
                  </div>
                )}
                {selected.phone ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 flex-shrink-0" /><span>{selected.phone}</span>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No phone number</p>
                )}
              </div>
            </div>

            {/* Order Summary */}
            {(() => {
              const customerOrders = getCustomerOrders(selected)
              const revenue = getCustomerRevenue(selected)
              const avgOrder = customerOrders.length > 0 ? revenue / customerOrders.filter(o => o.status !== "cancelled").length || 0 : 0
              return (
                <>
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Total Orders", value: String(customerOrders.length), icon: ShoppingBag, color: "text-blue-600 bg-blue-50" },
                      { label: "Total Spent", value: `₹${fmt(revenue)}`, icon: IndianRupee, color: "text-emerald-600 bg-emerald-50" },
                      { label: "Avg Order", value: `₹${fmt(avgOrder)}`, icon: Calendar, color: "text-primary bg-primary/10" },
                    ].map(stat => (
                      <div key={stat.label} className="bg-card border border-border rounded-xl p-3 text-center">
                        <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center mx-auto mb-2`}>
                          <stat.icon className="h-4 w-4" />
                        </div>
                        <p className="text-sm font-bold text-foreground">{stat.value}</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Order History */}
                  <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-border bg-muted/30">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Order History ({customerOrders.length})</p>
                    </div>
                    {customerOrders.length === 0 ? (
                      <p className="px-4 py-6 text-xs text-muted-foreground text-center">No orders yet</p>
                    ) : (
                      <div className="divide-y divide-border max-h-64 overflow-y-auto">
                        {customerOrders.map(o => (
                          <div key={o.id} className="flex items-center justify-between px-4 py-3">
                            <div>
                              <p className="text-xs font-mono font-semibold text-foreground">#{o.id.slice(0, 8).toUpperCase()}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-foreground">₹{fmt(Number(o.total))}</p>
                              <span className={`text-[9px] font-semibold capitalize ${
                                o.status === "delivered" ? "text-emerald-600" :
                                o.status === "cancelled" ? "text-red-600" :
                                o.status === "shipped" ? "text-violet-600" : "text-amber-600"
                              }`}>{o.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
