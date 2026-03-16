import { streamText, convertToModelMessages, UIMessage, tool } from "ai"
import { createClient } from "@supabase/supabase-js"
import { z } from "zod"

export const maxDuration = 30

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()
  const supabase = getServiceClient()

  const result = streamText({
    model: "google/gemini-2.0-flash",
    system: `You are an intelligent admin assistant for Chittamma Ruchulu, a South Indian food brand.
You have access to real-time business data via tools. Use the tools proactively to answer questions.
You can help with: orders by status, revenue, product inventory, customer stats, newsletter subscribers, and enquiries.
Always be concise and business-focused. Format currency as ₹ (Indian Rupees).
When asked about pending orders or orders by status, always use the getOrdersByStatus tool.
When asked for a revenue/performance overview, use getRevenueStats.
Only answer questions related to admin/business operations.`,

    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,

    tools: {
      getOrdersByStatus: tool({
        description: "Fetch orders filtered by status (pending, confirmed, shipped, delivered, cancelled) and/or date range. Use this for any question about order counts or lists by status.",
        inputSchema: z.object({
          status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled", "all"])
            .describe("Order status to filter by. Use 'all' for all orders."),
          limit: z.number().optional().describe("Max number of orders to return (default 20)"),
          dateFrom: z.string().optional().describe("ISO date string to filter from (e.g. today's date for today's orders)"),
        }),
        execute: async ({ status, limit = 20, dateFrom }) => {
          let query = supabase
            .from("orders")
            .select("id, status, payment_status, total, created_at, customer_name, customer_email, customer_phone")
            .order("created_at", { ascending: false })
            .limit(limit)

          if (status !== "all") query = query.eq("status", status)
          if (dateFrom) query = query.gte("created_at", dateFrom)

          const { data, error } = await query
          if (error) return { error: error.message }

          const orders = data || []
          const totalValue = orders.reduce((s, o) => s + Number(o.total || 0), 0)

          return {
            status,
            count: orders.length,
            totalValue,
            orders: orders.map(o => ({
              id: o.id.slice(0, 8),
              customer: o.customer_name || o.customer_email,
              phone: o.customer_phone,
              status: o.status,
              payment: o.payment_status,
              total: `₹${o.total}`,
              date: new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
            })),
          }
        },
      }),

      getRevenueStats: tool({
        description: "Get revenue overview: total revenue, this month, last month, order counts, and status breakdown",
        inputSchema: z.object({}),
        execute: async () => {
          const { data: orders } = await supabase
            .from("orders")
            .select("id, status, payment_status, total, created_at")
            .order("created_at", { ascending: false })

          const all = orders || []
          const now = new Date()
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
          const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

          const paid = all.filter(o => o.payment_status === "paid")
          const totalRevenue = paid.reduce((s, o) => s + Number(o.total || 0), 0)
          const thisMonth = paid.filter(o => new Date(o.created_at) >= monthStart)
          const lastMonth = paid.filter(o => {
            const d = new Date(o.created_at)
            return d >= lastMonthStart && d < monthStart
          })
          const thisMonthRevenue = thisMonth.reduce((s, o) => s + Number(o.total || 0), 0)
          const lastMonthRevenue = lastMonth.reduce((s, o) => s + Number(o.total || 0), 0)

          const statusCounts = all.reduce((acc: Record<string, number>, o) => {
            acc[o.status] = (acc[o.status] || 0) + 1
            return acc
          }, {})

          return {
            totalRevenue: `₹${totalRevenue}`,
            thisMonthRevenue: `₹${thisMonthRevenue}`,
            lastMonthRevenue: `₹${lastMonthRevenue}`,
            totalOrders: all.length,
            paidOrders: paid.length,
            statusBreakdown: statusCounts,
            thisMonthOrders: thisMonth.length,
          }
        },
      }),

      getProductStats: tool({
        description: "Fetch product inventory stats: stock levels, low stock items, out of stock, categories",
        inputSchema: z.object({
          lowStockThreshold: z.number().optional().describe("Threshold to flag low stock (default 5)"),
        }),
        execute: async ({ lowStockThreshold = 5 }) => {
          const { data: products } = await supabase
            .from("products")
            .select("id, name, category, price, stock_quantity, is_active")
            .order("stock_quantity", { ascending: true })

          const all = products || []
          const active = all.filter(p => p.is_active)
          const lowStock = all.filter(p => (p.stock_quantity ?? 999) <= lowStockThreshold)
          const outOfStock = all.filter(p => p.stock_quantity === 0)
          const categories = [...new Set(all.map(p => p.category).filter(Boolean))]

          return {
            totalProducts: all.length,
            activeProducts: active.length,
            outOfStockCount: outOfStock.length,
            lowStockItems: lowStock.map(p => ({
              name: p.name,
              category: p.category,
              stock: p.stock_quantity,
              price: `₹${p.price}`,
            })),
            categories,
          }
        },
      }),

      getCustomerStats: tool({
        description: "Fetch customer registration counts and newsletter subscriber stats",
        inputSchema: z.object({}),
        execute: async () => {
          const now = new Date()
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

          const [
            { count: totalCustomers },
            { count: newCustomers },
            { count: totalSubscribers },
            { count: newSubscribers },
          ] = await Promise.all([
            supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer"),
            supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer").gte("created_at", monthStart),
            supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("status", "active"),
            supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("status", "active").gte("subscribed_at", monthStart),
          ])

          return {
            totalCustomers: totalCustomers || 0,
            newCustomersThisMonth: newCustomers || 0,
            activeNewsletterSubscribers: totalSubscribers || 0,
            newSubscribersThisMonth: newSubscribers || 0,
          }
        },
      }),

      getFormSubmissions: tool({
        description: "Fetch recent contact/catering enquiries and form submissions",
        inputSchema: z.object({
          limit: z.number().optional().describe("Number of submissions (default 10)"),
          status: z.enum(["new", "read", "replied", "archived", "all"]).optional(),
        }),
        execute: async ({ limit = 10, status = "all" }) => {
          let query = supabase
            .from("form_submissions")
            .select("id, form_type, status, name, email, subject, created_at")
            .order("created_at", { ascending: false })
            .limit(limit)

          if (status !== "all") query = query.eq("status", status)

          const { data } = await query
          const all = data || []
          const newCount = all.filter(s => s.status === "new").length

          return {
            total: all.length,
            newUnread: newCount,
            submissions: all.map(s => ({
              name: s.name,
              email: s.email,
              type: s.form_type,
              status: s.status,
              subject: s.subject,
              date: new Date(s.created_at).toLocaleDateString("en-IN"),
            })),
          }
        },
      }),
    },

    maxSteps: 5,
  })

  return result.toUIMessageStreamResponse()
}
