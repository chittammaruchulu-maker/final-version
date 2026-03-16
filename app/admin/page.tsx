import { createClient as createServerClient } from "@supabase/supabase-js"
import Link from "next/link"
import {
  ShoppingCart, Package, Users, TrendingUp, TrendingDown,
  Clock, CheckCircle, Truck, XCircle, IndianRupee,
  ArrowUpRight, Plus, RefreshCw, AlertCircle, BarChart2, Star, Mail
} from "lucide-react"

export const dynamic = "force-dynamic"


function fmt(n: number) {
  return new Intl.NumberFormat("en-IN").format(Math.round(n))
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending:   { label: "Pending",   color: "text-amber-700",   bg: "bg-amber-50 border-amber-200",    icon: Clock },
  confirmed: { label: "Confirmed", color: "text-blue-700",    bg: "bg-blue-50 border-blue-200",     icon: CheckCircle },
  shipped:   { label: "Shipped",   color: "text-violet-700",  bg: "bg-violet-50 border-violet-200",  icon: Truck },
  delivered: { label: "Delivered", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200",icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "text-red-700",     bg: "bg-red-50 border-red-200",      icon: XCircle },
}

export default async function AdminDashboard() {
  // Use service role key to bypass RLS — admin page always needs all data
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  // Fetch all data during SSR
  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    { data: orders, error: ordersError },
    { data: products },
    { count: customerCount },
    { count: subscriberCount },
    { count: newSubscriberCount },
  ] = await Promise.all([
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
    supabase.from("products").select("id,name,price,stock_quantity,category,image,is_active"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer"),
    supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("status", "active").gte("subscribed_at", thisMonthStart),
  ])

  const allOrders = orders || []
  const allProducts = products || []

  // Revenue stats
  const paidOrders = allOrders.filter(o => o.payment_status === "paid")
  const totalRevenue = paidOrders.reduce((s, o) => s + Number(o.total || 0), 0)

  const thisMonthOrders = allOrders.filter(o => {
    const d = new Date(o.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const lastMonthOrders = allOrders.filter(o => {
    const d = new Date(o.created_at)
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear()
  })
  const thisMonthRevenue = thisMonthOrders.filter(o => o.payment_status === "paid").reduce((s, o) => s + Number(o.total || 0), 0)
  const lastMonthRevenue = lastMonthOrders.filter(o => o.payment_status === "paid").reduce((s, o) => s + Number(o.total || 0), 0)
  const revenueDelta = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0

  const todayStr = now.toDateString()
  const todayOrders = allOrders.filter(o => new Date(o.created_at).toDateString() === todayStr).length
  const pendingCount = allOrders.filter(o => o.status === "pending").length
  const lowStock = allProducts.filter(p => (p.stock_quantity ?? 0) < 5).length

  // Status counts
  const statusCounts = Object.keys(statusConfig).map(s => ({
    status: s,
    count: allOrders.filter(o => o.status === s).length,
    ...statusConfig[s],
  }))

  // Monthly chart data (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const label = d.toLocaleDateString("en-IN", { month: "short" })
    const mo = allOrders.filter(o => {
      const od = new Date(o.created_at)
      return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear() && o.status !== "cancelled"
    })
    return { label, revenue: mo.reduce((s, o) => s + Number(o.total || 0), 0), count: mo.length }
  })
  const maxRevenue = Math.max(...monthlyData.map(m => m.revenue), 1)

  // Top products from order items
  const productFreq: Record<string, { name: string; count: number; revenue: number }> = {}
  allOrders.filter(o => o.status !== "cancelled").forEach(o => {
    const items = Array.isArray(o.items) ? o.items : []
    items.forEach((item: { name: string; quantity: number; pricePerUnit: number }) => {
      if (!productFreq[item.name]) productFreq[item.name] = { name: item.name, count: 0, revenue: 0 }
      productFreq[item.name].count += item.quantity
      productFreq[item.name].revenue += item.quantity * item.pricePerUnit
    })
  })
  const topProducts = Object.values(productFreq).sort((a, b) => b.count - a.count).slice(0, 5)

  const recentOrders = allOrders.slice(0, 8)

  return (
    <div className="p-4 lg:p-6 space-y-6 overflow-y-auto h-[calc(100vh-64px)]">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {now.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin" className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Link>
          <Link href="/admin/products?new=1" className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <Plus className="h-3.5 w-3.5" /> Add Product
          </Link>
        </div>
      </div>

      {/* Pending alert */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm font-medium">{pendingCount} order{pendingCount > 1 ? "s" : ""} awaiting confirmation</span>
          <Link href="/admin/orders" className="ml-auto text-xs font-semibold underline hover:no-underline">View orders</Link>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Revenue",    value: `₹${fmt(totalRevenue)}`,      sub: `₹${fmt(thisMonthRevenue)} this month`,  icon: IndianRupee, delta: revenueDelta, color: "text-emerald-600", bg: "bg-emerald-50"   },
          { label: "Total Orders",   value: fmt(allOrders.length),         sub: `${todayOrders} today`,                 icon: ShoppingCart,delta: null,          color: "text-blue-600",   bg: "bg-blue-50"     },
          { label: "Products",       value: fmt(allProducts.length),       sub: `${lowStock} low stock`,                icon: Package,     delta: null,          color: "text-violet-600", bg: "bg-violet-50"   },
          { label: "Customers",      value: fmt(customerCount || 0),       sub: `${thisMonthOrders.length} this month`, icon: Users,       delta: null,          color: "text-primary",    bg: "bg-primary/10"  },
          { label: "Subscribers",    value: fmt(subscriberCount || 0),     sub: `+${newSubscriberCount || 0} this month`,icon: Mail,       delta: null,          color: "text-amber-600",  bg: "bg-amber-50"    },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              {stat.delta !== null && (stat.delta >= 0 ? <TrendingUp className="h-3 w-3 text-emerald-600" /> : <TrendingDown className="h-3 w-3 text-red-500" />)}
              <p className="text-xs text-muted-foreground">{stat.sub}</p>
              {stat.delta !== null && stat.delta !== 0 && (
                <span className={`text-xs font-semibold ml-auto ${stat.delta >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {stat.delta > 0 ? "+" : ""}{stat.delta.toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold">Revenue Overview</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Last 6 months</p>
            </div>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-end gap-2" style={{ height: "160px" }}>
            {monthlyData.map(m => (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground">{m.revenue > 0 ? `₹${fmt(m.revenue)}` : ""}</span>
                <div className="w-full flex flex-col justify-end" style={{ height: "120px" }}>
                  <div
                    className="w-full bg-primary rounded-t-md"
                    style={{ height: `${Math.max((m.revenue / maxRevenue) * 100, m.revenue > 0 ? 4 : 0)}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold">Order Status</h2>
            <Link href="/admin/orders" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {statusCounts.map(({ status, label, count, color, bg, icon: Icon }) => (
              <Link key={status} href={`/admin/orders`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg border ${bg}`}>
                  <Icon className={`h-3.5 w-3.5 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-sm font-bold">{count}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: allOrders.length > 0 ? `${(count / allOrders.length) * 100}%` : "0%" }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold">Recent Orders</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{recentOrders.length} most recent</p>
            </div>
            <Link href="/admin/orders" className="flex items-center gap-1 text-xs text-primary hover:underline font-medium">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 text-left">
                  <th className="px-4 py-2.5 text-xs text-muted-foreground font-medium">Order</th>
                  <th className="px-4 py-2.5 text-xs text-muted-foreground font-medium">Customer</th>
                  <th className="px-4 py-2.5 text-xs text-muted-foreground font-medium hidden md:table-cell">Date</th>
                  <th className="px-4 py-2.5 text-xs text-muted-foreground font-medium">Payment</th>
                  <th className="px-4 py-2.5 text-xs text-muted-foreground font-medium">Status</th>
                  <th className="px-4 py-2.5 text-xs text-muted-foreground font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-xs">No orders yet</td></tr>
                )}
                {recentOrders.map(order => {
                  const cfg = statusConfig[order.status] || statusConfig.pending
                  const Icon = cfg.icon
                  return (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">#{String(order.id).slice(0, 8).toUpperCase()}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-xs truncate max-w-[120px]">{order.customer_name}</p>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">{order.customer_email}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${order.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {order.payment_status || "pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.bg} ${cfg.color}`}>
                          <Icon className="h-2.5 w-2.5" />{cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-xs">₹{fmt(Number(order.total || 0))}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold">Top Products</h2>
              <Star className="h-4 w-4 text-amber-500" />
            </div>
            <div className="divide-y divide-border">
              {topProducts.length === 0 ? (
                <p className="px-5 py-6 text-xs text-muted-foreground text-center">No sales data yet</p>
              ) : topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">{p.count} units sold</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600">₹{fmt(p.revenue)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <h2 className="text-sm font-semibold mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "All Orders",   href: "/admin/orders",             icon: ShoppingCart, color: "text-blue-600 bg-blue-50"      },
                { label: "Add Product",  href: "/admin/products?new=1",    icon: Plus,         color: "text-emerald-600 bg-emerald-50" },
                { label: "Customers",    href: "/admin/customers",          icon: Users,        color: "text-primary bg-primary/10"    },
                { label: "Newsletter",   href: "/admin/form-submissions",   icon: Mail,         color: "text-amber-600 bg-amber-50"    },
              ].map(a => (
                <Link key={a.label} href={a.href} className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-center">
                  <div className={`p-2 rounded-lg ${a.color}`}><a.icon className="h-4 w-4" /></div>
                  <span className="text-[10px] font-medium">{a.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
