"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import {
  LayoutDashboard, Package, ShoppingCart, Users, LogOut,
  ChevronLeft, Menu, Loader2, Bell, ChevronRight, Store, X, ChefHat, MessageSquare, UtensilsCrossed, ShieldCheck
} from "lucide-react"
import AdminChatWidget from "@/components/admin/admin-chat-widget"

const sidebarLinks = [
  { label: "Dashboard",        href: "/admin",                  icon: LayoutDashboard, description: "Overview & analytics"        },
  { label: "Orders",           href: "/admin/orders",           icon: ShoppingCart,    description: "Manage customer orders"      },
  { label: "Products",         href: "/admin/products",         icon: Package,         description: "Manage your catalogue"       },
  { label: "Customers",        href: "/admin/customers",        icon: Users,           description: "View customer accounts"      },
  { label: "User Management",  href: "/admin/users",            icon: ShieldCheck,     description: "Add admins & customers"      },
  { label: "Subscriptions",    href: "/admin/subscriptions",    icon: UtensilsCrossed, description: "Cloud kitchen plans"         },
  { label: "Catering Menu",    href: "/admin/catering-menu",    icon: ChefHat,         description: "Manage catering items"       },
  { label: "Form Submissions", href: "/admin/form-submissions", icon: MessageSquare,   description: "Enquiries, contact & newsletter" },
]

function getBreadcrumbs(pathname: string) {
  const crumbs: { label: string; href: string }[] = [{ label: "Admin", href: "/admin" }]
  if (pathname === "/admin") return crumbs
  const link = sidebarLinks.find((l) => pathname.startsWith(l.href) && l.href !== "/admin")
  if (link) crumbs.push({ label: link.label, href: link.href })
  return crumbs
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [adminName, setAdminName] = useState("")
  const [adminEmail, setAdminEmail] = useState("")

  useEffect(() => {
    const supabase = createClient()
    const checkAdmin = async () => {
      // Get user — if no session, go to login
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login?redirect=/admin")
        return
      }

      // Fetch profile — retry once if it fails
      let profile = null
      for (let attempt = 0; attempt < 2; attempt++) {
        const { data, error } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", user.id)
          .single()
        if (!error && data) { profile = data; break }
        if (attempt === 0) await new Promise(r => setTimeout(r, 800))
      }

      // If profile missing entirely, allow authenticated user through (don't redirect away)
      if (!profile) {
        setAdminName(user.email || "Admin")
        setAdminEmail(user.email || "")
        setLoading(false)
        return
      }

      // Non-admin: redirect to home
      if (profile.role !== "admin") {
        router.push("/")
        return
      }

      setAdminName(profile.full_name || user.email || "Admin")
      setAdminEmail(user.email || "")
      setLoading(false)
    }
    checkAdmin()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const breadcrumbs = getBreadcrumbs(pathname)
  const currentPage = sidebarLinks.find((l) => l.href === pathname || (l.href !== "/admin" && pathname.startsWith(l.href)))

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{"Loading admin panel..."}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/20 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen bg-card border-r border-border z-50 flex flex-col
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"}
        ${sidebarCollapsed ? "lg:w-[68px]" : "lg:w-64"}
      `}>

        {/* Sidebar Header */}
        <div className={`flex items-center border-b border-border h-16 px-4 ${sidebarCollapsed ? "justify-center" : "justify-between"}`}>
          {!sidebarCollapsed && (
            <Link href="/admin" className="flex items-center gap-2 min-w-0">
              <Image
                src="/images/logo.png"
                alt="Chittamma Ruchulu"
                width={120}
                height={38}
                className="w-[120px] h-auto"
                priority
                unoptimized
              />
            </Link>
          )}
          {sidebarCollapsed && (
            <Link href="/admin">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold text-sm">{"CR"}</span>
              </div>
            </Link>
          )}
          {/* Collapse toggle — desktop only */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${sidebarCollapsed ? "rotate-180" : ""}`} />
          </button>
          {/* Mobile close */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {!sidebarCollapsed && (
            <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2">
              {"Navigation"}
            </p>
          )}
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href))
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                title={sidebarCollapsed ? link.label : undefined}
                className={`
                  flex items-center gap-3 rounded-lg transition-all duration-150 group
                  ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"}
                  ${isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  }
                `}
              >
                <link.icon className={`flex-shrink-0 ${sidebarCollapsed ? "h-5 w-5" : "h-4 w-4"}`} />
                {!sidebarCollapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-none">{link.label}</p>
                    <p className={`text-xs mt-0.5 truncate ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {link.description}
                    </p>
                  </div>
                )}
                {!sidebarCollapsed && isActive && (
                  <ChevronRight className="h-3.5 w-3.5 text-primary-foreground/70 flex-shrink-0" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-border p-2 space-y-1">
          {/* User info */}
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50 mb-1">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary uppercase">{adminName.charAt(0)}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground truncate">{adminName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{adminEmail}</p>
              </div>
            </div>
          )}
          <Link
            href="/"
            title={sidebarCollapsed ? "Back to Store" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-muted transition-colors ${sidebarCollapsed ? "justify-center" : ""}`}
          >
            <Store className="h-4 w-4 flex-shrink-0" />
            {!sidebarCollapsed && "Back to Store"}
          </Link>
          <button
            onClick={handleLogout}
            title={sidebarCollapsed ? "Sign Out" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors w-full ${sidebarCollapsed ? "justify-center" : ""}`}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!sidebarCollapsed && "Sign Out"}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">

        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-sm border-b border-border h-16 px-4 lg:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center justify-center w-8 h-8 rounded-md text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1.5 min-w-0" aria-label="Breadcrumb">
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.href} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
                  {i === breadcrumbs.length - 1 ? (
                    <span className="text-sm font-semibold text-foreground truncate">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors truncate">
                      {crumb.label}
                    </Link>
                  )}
                </span>
              ))}
            </nav>
          </div>

          {/* Right side — page icon + notification bell + user avatar */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {currentPage && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/20">
                <currentPage.icon className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">{currentPage.label}</span>
              </div>
            )}
            <button className="relative flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <Bell className="h-4 w-4" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-bold text-primary uppercase">{adminName.charAt(0)}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>

      {/* Admin AI Chat Widget — hidden for now */}
      {/* <AdminChatWidget /> */}
    </div>
  )
}
