"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react"

export default function SignUpPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${window.location.origin}/auth/callback`,
        data: {
          full_name: fullName,
          role: "customer",
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Auto-confirmed: if session exists, user is ready to go
    if (data.session) {
      router.push("/account")
      router.refresh()
      return
    }

    // Fallback: try to sign in immediately (auto-confirm trigger may have run)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (!signInError) {
      router.push("/account")
      router.refresh()
      return
    }

    // If neither worked, show the check email page
    router.push("/auth/sign-up-success")
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
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
            {"Create Account"}
          </h1>
          <p className="text-muted-foreground">
            {"Join us for authentic homemade flavors"}
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <form onSubmit={handleSignUp} className="space-y-5">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="fullName" className="text-sm font-semibold text-foreground mb-2 block">
                {"Full Name"}
              </Label>
              <Input
                id="fullName"
                type="text"
                required
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-background border-border"
              />
            </div>

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
                  placeholder="At least 6 characters"
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

            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground mb-2 block">
                {"Confirm Password"}
              </Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-background border-border"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-6 text-base font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  {"Creating Account..."}
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {"Already have an account? "}
              <Link href="/auth/login" className="text-primary font-semibold hover:underline">
                {"Sign In"}
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
