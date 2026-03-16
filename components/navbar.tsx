"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Menu, ShoppingBag, Search, User, Phone, X, LogOut, Shield, Package, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useCart } from "@/lib/cart-store"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

const navLinks = [
  { label: "Pickles",       href: "/shop?category=Pickles" },
  { label: "Sweets",        href: "/shop?category=Sweets"  },
  { label: "Snacks",        href: "/shop?category=Snacks"  },
  { label: "Podis",         href: "/shop?category=Podis"   },
  { label: "Cloud Kitchen", href: "/cloud-kitchen"          },
  { label: "Catering",      href: "/catering"               },
  { label: "Our Story",     href: "/about"                  },
  { label: "Contact",       href: "/contact"                },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [accountOpen, setAccountOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const accountRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { totalItems } = useCart()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Auth state listener
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null

    const initAuth = async () => {
      try {
        const supabase = createClient()

        const { data: { user: currentUser } } = await supabase.auth.getUser()
        setUser(currentUser)
        if (currentUser) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", currentUser.id)
            .single()
          setIsAdmin(profile?.role === "admin")
        }

        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user ?? null)
          if (session?.user) {
            supabase
              .from("profiles")
              .select("role")
              .eq("id", session.user.id)
              .single()
              .then(({ data: p }) => setIsAdmin(p?.role === "admin"))
          } else {
            setIsAdmin(false)
          }
        })
        subscription = data.subscription
      } catch {
        // Supabase not configured - continue as guest
      }
    }

    initAuth()

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  // Focus search input when overlay opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  // Close account dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {
      // Continue with logout even if Supabase fails
    }
    setUser(null)
    setIsAdmin(false)
    setAccountOpen(false)
    router.push("/")
    router.refresh()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery("")
    }
  }

  return (
    <>
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground text-sm py-2 text-center font-medium tracking-wide">
        <div className="flex items-center justify-center gap-2">
          <Phone className="h-3.5 w-3.5" />
          <span>{"Free Delivery on Orders Above \u20B91500 | Call: +91 78429 24883"}</span>
        </div>
      </div>

      {/* Main navbar */}
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${scrolled
            ? "bg-background/95 backdrop-blur-md shadow-lg border-b border-border"
            : "bg-background"
          }`}
      >
        <nav className="mx-auto max-w-7xl flex items-center justify-between px-4 py-3 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center group transition-transform duration-300 hover:scale-[1.02]">
            <Image
              src="/images/logo.png"
              alt="Chittamma Ruchulu"
              width={180}
              height={56}
              className="w-[180px] h-auto"
              priority
            />
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="relative text-sm font-medium text-foreground/80 hover:text-primary transition-colors duration-300 group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-2">
            {/* Search button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground/70 hover:text-primary hover:bg-primary/10 transition-colors"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>

            {/* Account dropdown */}
            <div ref={accountRef} className="relative hidden sm:block">
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground/70 hover:text-primary hover:bg-primary/10 transition-colors"
                onClick={() => setAccountOpen(!accountOpen)}
              >
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Button>
              {accountOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-card rounded-xl border border-border shadow-xl p-2 z-50">
                  {user ? (
                    <>
                      <div className="px-3 py-2 mb-1">
                        <p className="text-sm font-semibold text-foreground truncate">{user.user_metadata?.full_name || "User"}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <div className="border-t border-border mb-1" />
                      <Link
                        href="/account"
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                        onClick={() => setAccountOpen(false)}
                      >
                        <UserCircle className="h-4 w-4" />
                        {"My Account"}
                      </Link>
                      <Link
                        href="/account?tab=orders"
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                        onClick={() => setAccountOpen(false)}
                      >
                        <Package className="h-4 w-4" />
                        {"My Orders"}
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-primary font-semibold hover:bg-primary/5 rounded-lg transition-colors"
                          onClick={() => setAccountOpen(false)}
                        >
                          <Shield className="h-4 w-4" />
                          {"Admin Dashboard"}
                        </Link>
                      )}
                      <div className="border-t border-border mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/5 rounded-lg transition-colors w-full text-left"
                        >
                          <LogOut className="h-4 w-4" />
                          {"Sign Out"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                        onClick={() => setAccountOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        {"Sign In"}
                      </Link>
                      <Link
                        href="/auth/sign-up"
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                        onClick={() => setAccountOpen(false)}
                      >
                        <UserCircle className="h-4 w-4" />
                        {"Create Account"}
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative text-foreground/70 hover:text-primary hover:bg-primary/10 transition-colors">
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold animate-scale-in">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
                <span className="sr-only">Cart</span>
              </Button>
            </Link>

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button suppressHydrationWarning variant="ghost" size="icon" className="lg:hidden text-foreground/70 hover:text-primary hover:bg-primary/10">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent id="mobile-nav-sheet" side="right" className="w-80 bg-background p-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-6 border-b border-border">
                    <Image
                      src="/images/logo.png"
                      alt="Chittamma Ruchulu"
                      width={140}
                      height={44}
                      className="w-[140px] h-auto"
                    />
                  </div>

                  {/* Mobile search */}
                  <div className="px-6 pt-4">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        const input = e.currentTarget.querySelector("input") as HTMLInputElement
                        if (input.value.trim()) {
                          router.push(`/shop?search=${encodeURIComponent(input.value.trim())}`)
                        }
                      }}
                      className="relative"
                    >
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </form>
                  </div>

                  <nav className="flex flex-col p-6 gap-1">
                    {navLinks.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="flex items-center gap-3 py-3 px-4 text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 text-base font-medium"
                      >
                        {link.label}
                      </Link>
                    ))}
                    <Link href="/cart" className="flex items-center justify-between py-3 px-4 text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 text-base font-medium">
                      <span>{"Cart"}</span>
                      {totalItems > 0 && (
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                          {totalItems}
                        </span>
                      )}
                    </Link>
                  </nav>
                  <div className="mt-auto p-6 border-t border-border space-y-3">
                    {user ? (
                      <>
                        <div className="flex items-center gap-3 px-1 mb-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground truncate">{user.user_metadata?.full_name || "User"}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                        <Link href="/account">
                          <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground font-medium">
                            {"My Account"}
                          </Button>
                        </Link>
                        {isAdmin && (
                          <Link href="/admin">
                            <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground font-medium">
                              <Shield className="h-4 w-4 mr-2" />
                              {"Admin Dashboard"}
                            </Button>
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full text-sm text-destructive text-center py-2 hover:underline"
                        >
                          {"Sign Out"}
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/auth/login">
                          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
                            {"Sign In"}
                          </Button>
                        </Link>
                        <Link href="/auth/sign-up">
                          <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground font-medium">
                            {"Create Account"}
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-charcoal/60 backdrop-blur-sm flex items-start justify-center pt-24">
          <div className="bg-card w-full max-w-2xl mx-4 rounded-2xl shadow-2xl border border-border p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-lg text-foreground">{"Search Products"}</h3>
              <button
                onClick={() => { setSearchOpen(false); setSearchQuery("") }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for pickles, sweets, snacks, podis..."
                  className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-base"
                />
              </div>
            </form>
            <div className="mt-4 flex flex-wrap gap-2">
              <p className="text-xs text-muted-foreground w-full mb-1">{"Popular:"}</p>
              {["Avakaya", "Ariselu", "Murukku", "Palli Karam", "Boondi Laddu"].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    router.push(`/shop?search=${encodeURIComponent(term)}`)
                    setSearchOpen(false)
                    setSearchQuery("")
                  }}
                  className="px-3 py-1.5 bg-secondary text-foreground/70 hover:text-primary hover:bg-primary/10 rounded-full text-sm transition-colors border border-border"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
