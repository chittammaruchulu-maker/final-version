"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Gift, Truck, ShieldCheck, Headphones, CheckCircle2, Loader2 } from "lucide-react"
import { useInView } from "@/hooks/use-in-view"

const promises = [
  { icon: Truck, label: "Free Delivery", sublabel: "Orders above \u20B91500" },
  { icon: ShieldCheck, label: "100% Fresh", sublabel: "No preservatives" },
  { icon: Gift, label: "Gift Packing", sublabel: "Available for all orders" },
  { icon: Headphones, label: "24/7 Support", sublabel: "+91 78429 24883" },
]

export function CTASection() {
  const { ref, isInView } = useInView()
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubscribe = async () => {
    if (!email.trim()) {
      setErrorMsg("Please enter your email address.")
      setStatus("error")
      return
    }
    setStatus("loading")
    setErrorMsg("")
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "cta_section" }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong. Please try again.")
        setStatus("error")
      } else {
        setStatus("success")
        setEmail("")
      }
    } catch {
      setErrorMsg("Network error. Please try again.")
      setStatus("error")
    }
  }

  return (
    <section ref={ref}>
      {/* Promises bar */}
      <div className="bg-secondary border-y border-border">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {promises.map((promise, i) => (
              <div
                key={promise.label}
                className={`flex items-center gap-4 ${isInView ? "animate-fade-up" : "opacity-0"}`}
                style={{ animationDelay: `${0.1 * (i + 1)}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <promise.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">{promise.label}</p>
                  <p className="text-xs text-muted-foreground">{promise.sublabel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter CTA */}
      <div className="bg-primary">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-16 lg:py-20">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold font-serif text-primary-foreground mb-3 text-balance">
                {"Ready to Taste the Heritage?"}
              </h2>
              <p className="text-primary-foreground/70 text-lg max-w-md">
                {"Sign up for 10% off your first order and get exclusive access to seasonal specials."}
              </p>
            </div>

            <div className="w-full lg:w-auto max-w-md">
              {status === "success" ? (
                <div className="flex items-center gap-3 bg-primary-foreground/10 border border-primary-foreground/20 rounded-full px-6 py-4">
                  <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <p className="text-primary-foreground font-medium text-sm">
                    {"You're subscribed! Check your email for your 10% off coupon."}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (status === "error") setStatus("idle")
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                      disabled={status === "loading"}
                      className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 rounded-full px-6 h-12 focus-visible:ring-saffron"
                    />
                    <Button
                      size="lg"
                      onClick={handleSubscribe}
                      disabled={status === "loading"}
                      className="bg-saffron text-charcoal hover:bg-saffron-light rounded-full px-8 h-12 font-semibold transition-all duration-300 group whitespace-nowrap disabled:opacity-70"
                    >
                      {status === "loading" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          {"Subscribe"}
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </>
                      )}
                    </Button>
                  </div>
                  {status === "error" && errorMsg && (
                    <p className="text-red-300 text-xs px-2">{errorMsg}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
