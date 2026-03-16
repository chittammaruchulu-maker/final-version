"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react"

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    }>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Check if user is admin and redirect accordingly
    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single()

      if (profile?.role === "admin") {
        // Use hard navigation so session cookies are fully set before middleware runs
        window.location.href = "/admin"
        return
      }
    }

    window.location.href = redirect === "/" ? "/" : redirect
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block mb-6">
            <Image
              src="/images/logo.png"
              alt="Chittamma Ruchulu"
              width={160}
              height={50}
              className="mx-auto w-[160px] h-auto"
            />
          </Link>
          <h1 className="text-3xl font-bold font-serif text-foreground mb-2">
            {"Welcome Back"}
          </h1>
          <p className="text-muted-foreground">
            {"Sign in to your account to continue"}
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-sm font-semibold text-foreground mb-2 block">
                {"Email Address"}
              </Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background border-border"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-semibold text-foreground mb-2 block">
                {"Password"}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background border-border pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-6 text-base font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  {"Signing In..."}
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {"Don't have an account? "}
              <Link href="/auth/sign-up" className="text-primary font-semibold hover:underline">
                {"Create one"}
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            {"Back to Home"}
          </Link>
        </div>
      </div>
    </main>
  )
}
