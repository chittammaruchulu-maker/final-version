"use client"

import { useState } from "react"
import {
  Search, RefreshCw, X, CheckCircle, XCircle, Clock,
  Phone, Mail, MapPin, Calendar, Utensils, CreditCard,
  ChefHat, IndianRupee, Eye
} from "lucide-react"
import { updateSubscriptionStatus, getSubscriptions } from "./actions"

interface Subscription {
  id: string
  plan_name: string
  plan_price: number
  plan_duration: string
  full_name: string
  phone: string
  email: string | null
  address: string
  delivery_time: string
  meal_preference: string
  start_date: string
  payment_method: string
  payment_status: string
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  status: string
  notes: string | null
  created_at: string
}

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  active:    { label: "Active",    color: "text-emerald-700", bg: "bg-emerald-50",  border: "border-emerald-200", icon: CheckCircle },
  paused:    { label: "Paused",    color: "text-amber-700",   bg: "bg-amber-50",    border: "border-amber-200",   icon: Clock },
  cancelled: { label: "Cancelled", color: "text-red-700",     bg: "bg-red-50",      border: "border-red-200",     icon: XCircle },
  pending:   { label: "Pending",   color: "text-blue-700",    bg: "bg-blue-50",     border: "border-blue-200",    icon: Clock },
}

const paymentStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  paid:    { label: "Paid",    color: "text-emerald-700", bg: "bg-emerald-50" },
  pending: { label: "Pending", color: "text-amber-700",   bg: "bg-amber-50"   },
  failed:  { label: "Failed",  color: "text-red-700",     bg: "bg-red-50"     },
}

const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(n)
const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })

export default function AdminSubscriptionsPage({ initialSubscriptions = [] }: { initialSubscriptions?: Subscription[] }) {
  const [subs, setSubs] = useState<Subscription[]>(initialSubscriptions)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [planFilter, setPlanFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [selected, setSelected] = useState<Subscription | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const handleRefresh = async () => {
    setLoading(true)
    try {
      const data = await getSubscriptions()
      setSubs(data)
    } catch {}
    setLoading(false)
  }

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdatingStatus(id)
    try {
      await updateSubscriptionStatus(id, newStatus)
      setSubs(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s))
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: newStatus } : null)
    } catch {}
    setUpdatingStatus(null)
  }

  const plans = [...new Set(subs.map(s => s.plan_name))]

  const filtered = subs.filter(s => {
    const q = search.toLowerCase()
    const matchesSearch = !q || s.full_name.toLowerCase().includes(q) || s.phone.includes(q) || (s.email || "").toLowerCase().includes(q)
    const matchesPlan = planFilter === "all" || s.plan_name === planFilter
    const matchesStatus = statusFilter === "all" || s.status === statusFilter
    const matchesPayment = paymentFilter === "all" || s.payment_status === paymentFilter
    return matchesSearch && matchesPlan && matchesStatus && matchesPayment
  })

  const totalRevenue = subs.filter(s => s.payment_status === "paid").reduce((sum, s) => sum + s.plan_price, 0)
  const activeCount = subs.filter(s => s.status === "active").length
  const pendingPayment = subs.filter(s => s.payment_status === "pending").length

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-foreground">Cloud Kitchen Subscriptions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{subs.length} total subscriptions</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted text-sm font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Subscriptions", value: subs.length, icon: ChefHat, color: "text-primary", bg: "bg-primary/10" },
          { label: "Active", value: activeCount, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Pending Payment", value: pendingPayment, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Total Revenue", value: `₹${fmt(totalRevenue)}`, icon: IndianRupee, color: "text-blue-600", bg: "bg-blue-50" },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center flex-shrink-0`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, phone, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        <select
          value={planFilter}
          onChange={e => setPlanFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Plans</option>
          {plans.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="cancelled">Cancelled</option>
          <option value="pending">Pending</option>
        </select>

        <select
          value={paymentFilter}
          onChange={e => setPaymentFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Payments</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-semibold text-foreground/70 text-xs uppercase tracking-wide">Customer</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground/70 text-xs uppercase tracking-wide">Plan</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground/70 text-xs uppercase tracking-wide">Amount</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground/70 text-xs uppercase tracking-wide">Start Date</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground/70 text-xs uppercase tracking-wide">Payment</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground/70 text-xs uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground/70 text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                    <ChefHat className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No subscriptions found</p>
                    <p className="text-xs mt-1">Subscriptions will appear here once customers subscribe.</p>
                  </td>
                </tr>
              ) : (
                filtered.map(sub => {
                  const sc = statusConfig[sub.status] || statusConfig.pending
                  const pc = paymentStatusConfig[sub.payment_status] || paymentStatusConfig.pending
                  const StatusIcon = sc.icon
                  return (
                    <tr key={sub.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{sub.full_name}</p>
                        <p className="text-xs text-muted-foreground">{sub.phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-foreground">{sub.plan_name}</span>
                        <p className="text-xs text-muted-foreground capitalize">{sub.meal_preference}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-foreground">₹{fmt(sub.plan_price)}</span>
                        <p className="text-xs text-muted-foreground">/{sub.plan_duration}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{fmtDate(sub.start_date)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${pc.bg} ${pc.color}`}>
                          {pc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${sc.bg} ${sc.color} ${sc.border}`}>
                          <StatusIcon className="h-3 w-3" />
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelected(sub)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-xs font-medium transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
            Showing {filtered.length} of {subs.length} subscriptions
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative ml-auto w-full max-w-lg bg-card h-full overflow-y-auto shadow-2xl flex flex-col">
            {/* Drawer header */}
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-lg font-bold font-serif text-foreground">Subscription Details</h2>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{selected.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              {/* Plan summary */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold font-serif text-lg text-foreground">{selected.plan_name} Plan</span>
                  <span className="text-xl font-bold text-primary">₹{fmt(selected.plan_price)}<span className="text-sm font-normal text-muted-foreground">/{selected.plan_duration}</span></span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const sc = statusConfig[selected.status] || statusConfig.pending
                    const StatusIcon = sc.icon
                    return (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${sc.bg} ${sc.color} ${sc.border}`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {sc.label}
                      </span>
                    )
                  })()}
                  {(() => {
                    const pc = paymentStatusConfig[selected.payment_status] || paymentStatusConfig.pending
                    return (
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${pc.bg} ${pc.color}`}>
                        <CreditCard className="h-3.5 w-3.5 mr-1" />
                        Payment {pc.label}
                      </span>
                    )
                  })()}
                </div>
              </div>

              {/* Customer info */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Customer</h3>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">{selected.full_name.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="font-medium text-foreground">{selected.full_name}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-foreground/80">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    {selected.phone}
                  </div>
                  {selected.email && (
                    <div className="flex items-center gap-2.5 text-sm text-foreground/80">
                      <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      {selected.email}
                    </div>
                  )}
                  <div className="flex items-start gap-2.5 text-sm text-foreground/80">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    {selected.address}
                  </div>
                </div>
              </div>

              {/* Delivery preferences */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Delivery Preferences</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Delivery Time", value: selected.delivery_time, icon: Clock },
                    { label: "Meal Type", value: selected.meal_preference.charAt(0).toUpperCase() + selected.meal_preference.slice(1), icon: Utensils },
                    { label: "Start Date", value: fmtDate(selected.start_date), icon: Calendar },
                    { label: "Subscribed On", value: fmtDate(selected.created_at), icon: Calendar },
                  ].map(item => (
                    <div key={item.label} className="bg-muted/40 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                        <item.icon className="h-3.5 w-3.5" />
                        {item.label}
                      </div>
                      <p className="text-sm font-medium text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment info */}
              {(selected.razorpay_order_id || selected.razorpay_payment_id) && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Payment Details</h3>
                  <div className="bg-muted/40 rounded-lg p-3 space-y-2 text-xs font-mono">
                    {selected.razorpay_order_id && (
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Order ID</span>
                        <span className="text-foreground truncate">{selected.razorpay_order_id}</span>
                      </div>
                    )}
                    {selected.razorpay_payment_id && (
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Payment ID</span>
                        <span className="text-foreground truncate">{selected.razorpay_payment_id}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selected.notes && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Notes</h3>
                  <p className="text-sm text-foreground/80 bg-muted/40 rounded-lg p-3">{selected.notes}</p>
                </div>
              )}

              {/* Change status */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {(["active", "paused", "cancelled"] as const).map(s => {
                    const cfg = statusConfig[s]
                    const isCurrentStatus = selected.status === s
                    const isUpdating = updatingStatus === selected.id
                    return (
                      <button
                        key={s}
                        disabled={isCurrentStatus || isUpdating}
                        onClick={() => updateStatus(selected.id, s)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors
                          ${isCurrentStatus
                            ? `${cfg.bg} ${cfg.color} ${cfg.border} cursor-default`
                            : "bg-card border-border hover:bg-muted text-foreground/70 hover:text-foreground"
                          } disabled:opacity-60`}
                      >
                        {isUpdating && !isCurrentStatus ? "Updating..." : cfg.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
