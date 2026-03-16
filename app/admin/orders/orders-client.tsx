"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Search, Loader2, X, Truck, ExternalLink, Package,
  Clock, CheckCircle, XCircle, MapPin, Phone, Mail,
  CreditCard, Hash, RefreshCw, Printer, ShoppingBag,
  ChevronDown, IndianRupee, Filter, Upload
} from "lucide-react"

interface OrderItem { name: string; size: string; quantity: number; pricePerUnit: number; total: number }
interface Order {
  id: string; customer_name: string; customer_email: string; customer_phone: string | null
  address_line1: string | null; address_line2: string | null; city: string | null
  state: string | null; pincode: string | null; country: string | null
  items: OrderItem[]; subtotal: number; delivery_charge: number; discount: number; total: number
  status: string; payment_status: string | null; razorpay_payment_id: string | null
  shiprocket_order_id: string | null; shipment_id: string | null; awb_code: string | null
  courier_name: string | null; tracking_url: string | null; shipping_status: string | null
  created_at: string
}

const statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"]
const statusConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  pending:   { label: "Pending",   color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200",  icon: Clock },
  confirmed: { label: "Confirmed", color: "text-blue-700",    bg: "bg-blue-50",    border: "border-blue-200",   icon: CheckCircle },
  shipped:   { label: "Shipped",   color: "text-violet-700",  bg: "bg-violet-50",  border: "border-violet-200", icon: Truck },
  delivered: { label: "Delivered", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200",icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "text-red-700",     bg: "bg-red-50",     border: "border-red-200",    icon: XCircle },
}
const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(Math.round(n))

export default function AdminOrdersPage({ initialOrders = [] }: { initialOrders?: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [loading, setLoading] = useState(initialOrders.length === 0)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [shippingOrder, setShippingOrder] = useState<string | null>(null)
  const [shipError, setShipError] = useState("")
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<{ synced: number; failed: number } | null>(null)

  const loadOrders = useCallback(async () => {
    const res = await fetch("/api/admin/orders")
    if (res.ok) {
      const data = await res.json()
      setOrders(data.orders || [])
    }
    setLoading(false)
    setRefreshing(false)
  }, [])

  // Only fetch on mount if no server-side data was provided
  useEffect(() => { if (initialOrders.length === 0) loadOrders() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = () => { setRefreshing(true); loadOrders() }

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId)
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status: newStatus }),
    })
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    if (selectedOrder?.id === orderId) setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null)
    setUpdatingStatus(null)
  }

  const handleSyncShiprocket = async () => {
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await fetch("/api/admin/sync-shiprocket", { method: "POST" })
      const data = await res.json()
      setSyncResult({ synced: data.synced ?? 0, failed: data.failed ?? 0 })
      if (data.synced > 0) await loadOrders()
    } catch {
      setSyncResult({ synced: 0, failed: -1 })
    } finally {
      setSyncing(false)
    }
  }

  const handleShipOrder = async (orderId: string) => {
    setShippingOrder(orderId); setShipError("")
    try {
      const res = await fetch("/api/shiprocket/ship-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId }) })
      const data = await res.json()
      if (!res.ok) { setShipError(data.error || "Failed to ship order") }
      else {
        await loadOrders()
        setSelectedOrder(prev => prev?.id === orderId ? { ...prev, awb_code: data.awb_code, courier_name: data.courier_name, tracking_url: data.tracking_url, shipping_status: "shipped" } : prev)
      }
    } catch { setShipError("Network error — please try again.") }
    finally { setShippingOrder(null) }
  }

  const filtered = orders.filter(o => {
    const q = search.toLowerCase()
    const matchSearch = !search || o.customer_name.toLowerCase().includes(q) || o.id.toLowerCase().includes(q) ||
      o.customer_email.toLowerCase().includes(q) || (o.razorpay_payment_id || "").toLowerCase().includes(q)
    const matchStatus = statusFilter === "all" || o.status === statusFilter
    const now = new Date(); const d = new Date(o.created_at)
    const matchDate = dateFilter === "all" ||
      (dateFilter === "today" && d.toDateString() === now.toDateString()) ||
      (dateFilter === "week" && now.getTime() - d.getTime() < 7 * 86400000) ||
      (dateFilter === "month" && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear())
    return matchSearch && matchStatus && matchDate
  })

  const statusCounts = statuses.reduce((a, s) => ({ ...a, [s]: orders.filter(o => o.status === s).length }), {} as Record<string, number>)
  const totalRevenue = filtered.filter(o => o.status !== "cancelled").reduce((s, o) => s + Number(o.total), 0)

  if (loading) return (
    <div className="flex items-center justify-center h-[calc(100vh-64px)]">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background">

      {/* ── Left Panel: Orders List ── */}
      <div className={`flex flex-col border-r border-border ${selectedOrder ? "hidden lg:flex lg:w-[56%]" : "w-full"}`}>

        {/* Toolbar */}
        <div className="flex-shrink-0 bg-card border-b border-border">
          {/* Top bar */}
          <div className="flex items-center gap-2 p-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, email, order ID, payment ID..."
                className="w-full pl-9 pr-8 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
              {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>}
            </div>
            <select value={dateFilter} onChange={e => setDateFilter(e.target.value)}
              className="h-9 px-2 rounded-lg border border-border bg-background text-xs text-foreground">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <button onClick={handleRefresh} disabled={refreshing}
              className="p-2 border border-border rounded-lg bg-card hover:bg-muted text-muted-foreground disabled:opacity-50 transition-colors">
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={handleSyncShiprocket}
              disabled={syncing}
              title="Push all unsynced orders to Shiprocket"
              className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg bg-card hover:bg-muted text-xs font-medium text-muted-foreground disabled:opacity-50 transition-colors whitespace-nowrap">
              {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              {syncing ? "Syncing..." : "Sync Shiprocket"}
            </button>
          </div>
          {syncResult && (
            <div className={`mx-3 mb-2 px-3 py-2 rounded-lg text-xs font-medium ${syncResult.failed === -1 ? "bg-red-50 text-red-700 border border-red-200" : syncResult.failed > 0 ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
              {syncResult.failed === -1
                ? "Sync failed — network error. Check server logs."
                : syncResult.synced === 0 && syncResult.failed === 0
                  ? "All orders are already synced to Shiprocket."
                  : `Synced ${syncResult.synced} order${syncResult.synced !== 1 ? "s" : ""} to Shiprocket${syncResult.failed > 0 ? ` · ${syncResult.failed} failed` : ""}.`
              }
              <button onClick={() => setSyncResult(null)} className="ml-2 opacity-60 hover:opacity-100">✕</button>
            </div>
          )}

          {/* Status filter tabs */}
          <div className="flex gap-1 px-3 pb-3 overflow-x-auto">
            {[{ key: "all", label: "All", count: orders.length }, ...statuses.map(s => ({ key: s, label: statusConfig[s].label, count: statusCounts[s] || 0 }))].map(tab => {
              const cfg = tab.key !== "all" ? statusConfig[tab.key] : null
              const isActive = statusFilter === tab.key
              return (
                <button key={tab.key} onClick={() => setStatusFilter(tab.key)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    isActive
                      ? cfg ? `${cfg.bg} ${cfg.color} ${cfg.border}` : "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}>
                  {cfg && isActive && <cfg.icon className="h-3 w-3" />}
                  {tab.label}
                  <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isActive && !cfg ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Summary strip */}
          <div className="flex items-center gap-4 px-4 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
            <span><strong className="text-foreground">{filtered.length}</strong> orders</span>
            <span><strong className="text-foreground">₹{fmt(totalRevenue)}</strong> revenue</span>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <ShoppingBag className="h-10 w-10 opacity-20" />
              <p className="text-sm font-medium">No orders found</p>
              {(search || statusFilter !== "all") && <button onClick={() => { setSearch(""); setStatusFilter("all") }} className="text-xs text-primary hover:underline">Clear filters</button>}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-muted/60 backdrop-blur-sm border-b border-border">
                <tr>
                  {["Order", "Customer", "Date", "Status", "Total"].map((h, i) => (
                    <th key={h} className={`px-4 py-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider ${i === 1 ? "hidden md:table-cell" : ""} ${i === 2 ? "hidden lg:table-cell" : ""} ${i === 4 ? "text-right" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(order => {
                  const cfg = statusConfig[order.status] || statusConfig.pending
                  const Icon = cfg.icon
                  const isSelected = selectedOrder?.id === order.id
                  return (
                    <tr key={order.id} onClick={() => { setSelectedOrder(isSelected ? null : order); setShipError("") }}
                      className={`cursor-pointer transition-colors ${isSelected ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-muted/40"}`}>
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs font-bold text-foreground">#{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{(order.items || []).reduce((s, i) => s + i.quantity, 0)} items</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-xs font-semibold text-foreground truncate max-w-[140px]">{order.customer_name}</p>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">{order.customer_email}</p>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                          <Icon className="h-2.5 w-2.5" />{cfg.label}
                        </span>
                        {order.awb_code && <p className="text-[9px] text-violet-600 mt-0.5">Shipped</p>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="text-sm font-bold text-foreground">₹{fmt(order.total)}</p>
                        {order.payment_status === "paid" && <p className="text-[9px] text-emerald-600">Paid</p>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Right Panel: Order Details ── */}
      {selectedOrder && (
        <div className="w-full lg:w-[44%] flex flex-col overflow-hidden bg-background border-l border-border">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-card flex-shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-foreground">#{selectedOrder.id.slice(0, 8).toUpperCase()}</p>
                {(() => { const cfg = statusConfig[selectedOrder.status] || statusConfig.pending; return (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                    <cfg.icon className="h-2.5 w-2.5" />{cfg.label}
                  </span>
                )})()}
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {new Date(selectedOrder.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                {" · "}
                {new Date(selectedOrder.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"><Printer className="h-4 w-4" /></button>
              <button onClick={() => setSelectedOrder(null)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"><X className="h-4 w-4" /></button>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto">

            {/* Update Status */}
            <div className="px-5 py-4 border-b border-border bg-muted/20">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">Update Status</p>
              <div className="flex flex-wrap gap-1.5">
                {statuses.map(s => {
                  const cfg = statusConfig[s]
                  const isActive = selectedOrder.status === s
                  return (
                    <button key={s} onClick={() => !isActive && updateStatus(selectedOrder.id, s)}
                      disabled={updatingStatus === selectedOrder.id}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        isActive ? `${cfg.bg} ${cfg.color} ${cfg.border}` : "bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                      } disabled:opacity-50`}>
                      <cfg.icon className="h-3 w-3" />{cfg.label}
                      {isActive && updatingStatus === selectedOrder.id && <Loader2 className="h-3 w-3 animate-spin ml-0.5" />}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="p-5 space-y-4">

              {/* Customer & Address */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border bg-muted/30">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Customer</p>
                </div>
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">{selectedOrder.customer_name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{selectedOrder.customer_name}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <a href={`mailto:${selectedOrder.customer_email}`} className="text-primary hover:underline truncate">{selectedOrder.customer_email}</a>
                    </div>
                    {selectedOrder.customer_phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3 w-3 flex-shrink-0" />
                        <span>{selectedOrder.customer_phone}</span>
                      </div>
                    )}
                    {selectedOrder.address_line1 && (
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed">
                          {[selectedOrder.address_line1, selectedOrder.address_line2, selectedOrder.city, selectedOrder.state, selectedOrder.pincode]
                            .filter(Boolean).join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-center justify-between">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Items</p>
                  <span className="text-[10px] text-muted-foreground">{(selectedOrder.items || []).reduce((s, i) => s + i.quantity, 0)} units</span>
                </div>
                <div className="divide-y divide-border">
                  {(selectedOrder.items || []).map((item, i) => (
                    <div key={i} className="flex items-start justify-between px-4 py-3 gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{item.size && `${item.size} · `}Qty: {item.quantity} × ₹{fmt(item.pricePerUnit)}</p>
                      </div>
                      <p className="text-sm font-bold text-foreground flex-shrink-0">₹{fmt(item.total || item.quantity * item.pricePerUnit)}</p>
                    </div>
                  ))}
                </div>
                {/* Totals */}
                <div className="px-4 py-3 border-t border-border bg-muted/20 space-y-1.5">
                  {[
                    { label: "Subtotal", value: `₹${fmt(selectedOrder.subtotal)}`, cls: "text-muted-foreground text-xs" },
                    { label: "Delivery", value: `₹${fmt(selectedOrder.delivery_charge)}`, cls: "text-muted-foreground text-xs" },
                    ...(selectedOrder.discount > 0 ? [{ label: "Discount", value: `-₹${fmt(selectedOrder.discount)}`, cls: "text-emerald-600 text-xs" }] : []),
                  ].map(r => (
                    <div key={r.label} className={`flex justify-between ${r.cls}`}><span>{r.label}</span><span>{r.value}</span></div>
                  ))}
                  <div className="flex justify-between text-sm font-bold text-foreground pt-2 border-t border-border">
                    <span>Total</span><span className="text-primary">₹{fmt(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border bg-muted/30">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Payment</p>
                </div>
                <div className="p-4 flex flex-wrap items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${selectedOrder.payment_status === "paid" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                    <CreditCard className="h-3 w-3" />
                    {selectedOrder.payment_status === "paid" ? "Paid" : "Payment Pending"}
                  </span>
                  {selectedOrder.razorpay_payment_id && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Hash className="h-3 w-3" />
                      <span className="font-mono text-[10px]">{selectedOrder.razorpay_payment_id}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-center gap-2">
                  <Truck className="h-3 w-3 text-muted-foreground" />
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Shipping</p>
                </div>
                <div className="p-4 space-y-3">
                  {!selectedOrder.shiprocket_order_id && (
                    <div className="pb-2">
                      <button
                        onClick={async () => {
                          setSyncing(true)
                          try {
                            const res = await fetch("/api/admin/sync-shiprocket", { method: "POST" })
                            const data = await res.json()
                            if (data.synced > 0) { await loadOrders(); setSyncResult({ synced: data.synced, failed: data.failed }) }
                            else setSyncResult({ synced: 0, failed: 1 })
                          } catch { setSyncResult({ synced: 0, failed: -1 }) }
                          finally { setSyncing(false) }
                        }}
                        disabled={syncing}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors">
                        {syncing ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Pushing...</> : <><Upload className="h-3.5 w-3.5" />Push to Shiprocket</>}
                      </button>
                    </div>
                  )}
                  {selectedOrder.shiprocket_order_id ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between"><span className="text-muted-foreground">Shiprocket ID</span><span className="font-mono text-foreground">{selectedOrder.shiprocket_order_id}</span></div>
                      {selectedOrder.awb_code && <div className="flex justify-between"><span className="text-muted-foreground">AWB Code</span><span className="font-mono text-foreground">{selectedOrder.awb_code}</span></div>}
                      {selectedOrder.courier_name && <div className="flex justify-between"><span className="text-muted-foreground">Courier</span><span className="text-foreground">{selectedOrder.courier_name}</span></div>}
                      {selectedOrder.tracking_url && (
                        <a href={selectedOrder.tracking_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline font-medium">
                          <ExternalLink className="h-3 w-3" />Track Shipment
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Shiprocket order created automatically after payment.</p>
                  )}
                  {selectedOrder.shiprocket_order_id && !selectedOrder.awb_code && (
                    <div className="pt-1 space-y-2">
                      {shipError && <p className="text-xs text-red-600">{shipError}</p>}
                      <button onClick={() => handleShipOrder(selectedOrder.id)} disabled={shippingOrder === selectedOrder.id}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors">
                        {shippingOrder === selectedOrder.id ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Scheduling...</> : <><Package className="h-3.5 w-3.5" />Generate AWB & Schedule Pickup</>}
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}
