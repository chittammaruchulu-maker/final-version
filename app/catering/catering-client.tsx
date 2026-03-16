"use client"

import { useState, useEffect } from "react" // useEffect kept for EnquirySection form state
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Phone,
  Users,
  Star,
  CheckCircle2,
  Utensils,
  CalendarDays,
  Gift,
  Building2,
  PartyPopper,
  Home,
  Send,
  MessageSquare,
  Award,
  Leaf,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { useInView } from "@/hooks/use-in-view"

const cateringTypes = [
  {
    icon: PartyPopper,
    title: "Weddings & Engagements",
    image: "/images/catering-wedding.jpg",
    description:
      "Grand Telugu-style feasts for your most special occasions. Traditional banana leaf meals, elaborate buffets, and live cooking counters.",
    capacity: "100 - 5000+ guests",
    popular: true,
  },
  {
    icon: Building2,
    title: "Corporate Events",
    image: "/images/catering-corporate.jpg",
    description:
      "Professional catering for office parties, team lunches, seminars, and corporate celebrations. Packed meals or buffet style.",
    capacity: "20 - 500 guests",
    popular: false,
  },
  {
    icon: Home,
    title: "House Parties & Poojas",
    image: "/images/catering-house.jpg",
    description:
      "Intimate home gatherings, housewarming ceremonies, birthday celebrations, and religious functions with authentic homestyle cooking.",
    capacity: "10 - 100 guests",
    popular: false,
  },
  {
    icon: Gift,
    title: "Festivals & Gifting",
    image: "/images/catering-hero.jpg",
    description:
      "Festive sweet boxes, customized food hampers, and bulk orders for Diwali, Sankranti, Dasara, and other celebrations.",
    capacity: "Customizable",
    popular: false,
  },
]

// menuHighlights is now fetched from the database — see MenuHighlightsSection below

const stats = [
  { value: "500+", label: "Events Catered" },
  { value: "50K+", label: "Happy Guests" },
  { value: "4.9", label: "Customer Rating" },
  { value: "100%", label: "Hygienic & Fresh" },
]

const whyChoose = [
  {
    icon: Utensils,
    title: "Authentic Telugu Cuisine",
    description: "Traditional recipes from Andhra-Telangana prepared by experienced cooks who understand the nuances of regional flavors.",
  },
  {
    icon: Award,
    title: "FSSAI Certified",
    description: "Our kitchen meets the highest food safety standards. Every ingredient is sourced fresh and handled with utmost care.",
  },
  {
    icon: Leaf,
    title: "No Preservatives",
    description: "All food is freshly prepared on the day of your event. No frozen items, no artificial additives, no shortcuts.",
  },
  {
    icon: Shield,
    title: "End-to-End Service",
    description: "From menu planning and cooking to serving staff, crockery, and cleanup. We handle everything so you can enjoy your event.",
  },
  {
    icon: Users,
    title: "Scalable for Any Size",
    description: "Whether it is an intimate family gathering of 10 or a grand wedding of 5000+, we scale seamlessly without compromising quality.",
  },
  {
    icon: CalendarDays,
    title: "Flexible Scheduling",
    description: "Book us for a single meal, a full-day event, or multi-day celebrations. We adapt to your schedule and preferences.",
  },
]

function HeroSection() {
  const { ref, isInView } = useInView()

  return (
    <section className="relative overflow-hidden bg-charcoal" ref={ref}>
      <div className="absolute inset-0">
        <Image
          src="/images/catering-hero.jpg"
          alt="Chittamma Ruchulu Catering Services"
          fill
          className="object-cover opacity-25"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/80 to-charcoal/40" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8 py-20 lg:py-32">
        <div className="max-w-2xl">
          <div
            className={`flex items-center gap-3 mb-6 ${isInView ? "animate-fade-up" : "opacity-0"}`}
          >
            <div className="h-px w-8 bg-saffron" />
            <span className="text-saffron text-sm font-semibold uppercase tracking-[0.2em]">
              {"Catering Services"}
            </span>
          </div>

          <h2
            className={`text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-white mb-6 leading-tight ${
              isInView ? "animate-fade-up stagger-1" : "opacity-0"
            }`}
          >
            {"Grand Feasts, Traditional Flavors"}
          </h2>

          <p
            className={`text-white/70 text-lg md:text-xl leading-relaxed mb-8 max-w-lg ${
              isInView ? "animate-fade-up stagger-2" : "opacity-0"
            }`}
          >
            {"Make your special occasions unforgettable with authentic Andhra-Telangana cuisine. Weddings, corporate events, house parties & more."}
          </p>

          <div
            className={`flex flex-wrap items-center gap-4 mb-10 ${
              isInView ? "animate-fade-up stagger-3" : "opacity-0"
            }`}
          >
            <Link href="#enquiry">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 text-base font-semibold group"
              >
                {"Get a Free Quote"}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <a href="tel:+917842924883">
              <Button
                size="lg"
                className="bg-white text-charcoal hover:bg-white/90 rounded-full px-8 py-6 text-base font-semibold"
              >
                <Phone className="mr-2 h-4 w-4" />
                {"Call Us Now"}
              </Button>
            </a>
          </div>

          <div
            className={`flex flex-wrap items-center gap-6 text-white/60 text-sm ${
              isInView ? "animate-fade-up stagger-4" : "opacity-0"
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-saffron" />
              <span>{"10 to 5000+ guests"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-saffron fill-saffron" />
              <span>{"4.9 Rating"}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-saffron" />
              <span>{"FSSAI Certified"}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CateringTypesSection() {
  const { ref, isInView } = useInView()

  return (
    <section className="py-20 lg:py-28 bg-background" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center mb-16">
          <div
            className={`flex items-center justify-center gap-3 mb-4 ${
              isInView ? "animate-fade-up" : "opacity-0"
            }`}
          >
            <div className="h-px w-8 bg-primary" />
            <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em]">
              {"We Cater For"}
            </span>
            <div className="h-px w-8 bg-primary" />
          </div>
          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-foreground text-balance mb-4 ${
              isInView ? "animate-fade-up stagger-1" : "opacity-0"
            }`}
          >
            {"Every Occasion, Perfectly Served"}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {"From intimate gatherings to grand celebrations, we bring the authentic taste of Andhra-Telangana to your event."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cateringTypes.map((type, i) => (
            <div
              key={type.title}
              className={`group relative bg-card rounded-2xl border border-border overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 ${
                isInView ? "animate-fade-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${0.1 * i}s` }}
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={type.image}
                  alt={type.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-charcoal/20 to-transparent" />
                {type.popular && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-full">
                      {"Most Popular"}
                    </span>
                  </div>
                )}
                <div className="absolute bottom-4 left-4">
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <Users className="h-4 w-4" />
                    <span>{type.capacity}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 lg:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <type.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-foreground text-xl mb-2">
                      {type.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {type.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function StatsSection() {
  const { ref, isInView } = useInView()

  return (
    <section className="py-16 bg-charcoal" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`text-center ${isInView ? "animate-fade-up" : "opacity-0"}`}
              style={{ animationDelay: `${0.1 * i}s` }}
            >
              <p className="text-4xl md:text-5xl font-bold font-serif text-white mb-2">
                {stat.value}
              </p>
              <p className="text-white/60 text-sm font-medium uppercase tracking-widest">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function MenuHighlightsSection({ menuData }: { menuData: Record<string, string[]> }) {
  const { ref, isInView } = useInView()

  const categories = Object.keys(menuData)

  return (
    <section className="py-20 lg:py-28 bg-secondary/30" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-primary" />
            <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em]">
              {"Sample Menu"}
            </span>
            <div className="h-px w-8 bg-primary" />
          </div>
          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-foreground text-balance mb-4 ${
              isInView ? "animate-fade-up" : "opacity-0"
            }`}
          >
            {"A Feast for Every Palate"}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {"Our menu is fully customizable. Here is a preview of what we can serve. Tell us your preferences and we will create the perfect menu."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, i) => (
            <div
              key={category}
              className={`bg-card p-6 rounded-2xl border border-border hover:shadow-md transition-all duration-300 ${
                isInView ? "animate-fade-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${0.08 * i}s` }}
            >
              <h3 className="font-serif font-bold text-foreground text-lg mb-4 pb-3 border-b border-border">
                {category}
              </h3>
              <ul className="space-y-2.5">
                {menuData[category].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-foreground/80">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-center text-muted-foreground text-sm mt-8 italic">
          {"This is a sample menu. We customize every order based on your preferences, budget, and guest count."}
        </p>
      </div>
    </section>
  )
}

function WhyChooseSection() {
  const { ref, isInView } = useInView()

  return (
    <section className="py-20 lg:py-28 bg-background" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-primary" />
            <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em]">
              {"Why Choose Us"}
            </span>
            <div className="h-px w-8 bg-primary" />
          </div>
          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-foreground text-balance ${
              isInView ? "animate-fade-up" : "opacity-0"
            }`}
          >
            {"What Sets Us Apart"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {whyChoose.map((item, i) => (
            <div
              key={item.title}
              className={`bg-card p-8 rounded-2xl border border-border hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1 ${
                isInView ? "animate-fade-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${0.08 * i}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-serif font-bold text-foreground text-lg mb-3">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function EnquirySection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "",
    guestCount: "",
    eventDate: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const { ref, isInView } = useInView()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError("")
    try {
      const res = await fetch("/api/form-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form_type: "catering",
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          event_type: formData.eventType,
          guest_count: formData.guestCount,
          event_date: formData.eventDate,
          message: formData.message,
        }),
      })
      if (!res.ok) throw new Error("Failed to submit")
      setSubmitted(true)
    } catch {
      setSubmitError("Something went wrong. Please try again or WhatsApp us directly.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="enquiry" className="py-20 lg:py-28 bg-secondary/30 scroll-mt-24" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left side */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-primary" />
              <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em]">
                {"Book Catering"}
              </span>
            </div>
            <h2
              className={`text-3xl md:text-4xl font-bold font-serif text-foreground mb-6 text-balance ${
                isInView ? "animate-fade-up" : "opacity-0"
              }`}
            >
              {"Tell Us About Your Event"}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              {"Fill in the form and our catering team will get back to you within 2 hours with a customized quote and menu suggestions tailored to your event."}
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{"Prefer calling?"}</p>
                  <p className="text-muted-foreground text-sm">{"Reach us at "}<span className="text-primary font-semibold">{"+91 78429 24883"}</span></p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{"Quick via WhatsApp"}</p>
                  <a
                    href="https://wa.me/917842924883?text=Hi!%20I%20would%20like%20to%20enquire%20about%20catering%20services."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 text-sm font-semibold hover:underline"
                  >
                    {"Chat with us now"}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div>
            {submitted ? (
              <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <Send className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="font-serif font-bold text-xl text-foreground mb-2">
                  {"Enquiry Submitted!"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {"Thank you! Our catering team will reach out to you within 2 hours with a customized quote."}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSubmitted(false)
                    setFormData({
                      name: "",
                      email: "",
                      phone: "",
                      eventType: "",
                      guestCount: "",
                      eventDate: "",
                      message: "",
                    })
                  }}
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  {"Submit Another Enquiry"}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-card p-8 rounded-2xl border border-border shadow-sm space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="cat-name" className="text-sm font-semibold text-foreground mb-2 block">
                      {"Full Name"}<span className="text-red-500 ml-0.5">{"*"}</span>
                    </Label>
                    <Input
                      id="cat-name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-background border-border"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cat-phone" className="text-sm font-semibold text-foreground mb-2 block">
                      {"Phone Number"}<span className="text-red-500 ml-0.5">{"*"}</span>
                    </Label>
                    <Input
                      id="cat-phone"
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="bg-background border-border"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="cat-email" className="text-sm font-semibold text-foreground mb-2 block">
                      {"Email Address"}<span className="text-red-500 ml-0.5">{"*"}</span>
                    </Label>
                    <Input
                      id="cat-email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="bg-background border-border"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cat-type" className="text-sm font-semibold text-foreground mb-2 block">
                      {"Event Type"}
                    </Label>
                    <Input
                      id="cat-type"
                      placeholder="Wedding, Corporate, Party..."
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                      required
                      className="bg-background border-border"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="cat-guests" className="text-sm font-semibold text-foreground mb-2 block">
                      {"Expected Guests"}
                    </Label>
                    <Input
                      id="cat-guests"
                      placeholder="e.g. 200"
                      value={formData.guestCount}
                      onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                      required
                      className="bg-background border-border"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cat-date" className="text-sm font-semibold text-foreground mb-2 block">
                      {"Event Date"}
                    </Label>
                    <Input
                      id="cat-date"
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      required
                      className="bg-background border-border"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="cat-message" className="text-sm font-semibold text-foreground mb-2 block">
                    {"Additional Details"}
                  </Label>
                  <Textarea
                    id="cat-message"
                    placeholder="Tell us more about your event, menu preferences, dietary requirements..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className="bg-background border-border resize-none"
                  />
                </div>

                {submitError && (
                  <p className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-4 py-2.5">{submitError}</p>
                )}
                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-6 text-base font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 disabled:opacity-70"
                >
                  {submitting ? (
                    <><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent inline-block" />{"Submitting..."}</>
                  ) : (
                    <><Send className="h-4 w-4 mr-2" />{"Get Free Quote"}</>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="mx-auto max-w-3xl px-4 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-6 text-balance">
          {"Let Us Make Your Event Unforgettable"}
        </h2>
        <p className="text-muted-foreground text-lg mb-8 text-pretty">
          {"From the first bite to the last sweet, we ensure every guest leaves with a smile and a memory. Trust Chittamma Ruchulu for your next event."}
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="#enquiry">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-10 py-6 text-base font-semibold group"
            >
              {"Request a Quote"}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/shop">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground px-10 py-6 text-base font-semibold"
            >
              {"Shop Products"}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function CateringPage({ menuData }: { menuData: Record<string, string[]> }) {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <PageHeader
        title="Catering Services"
        subtitle="Authentic Telugu feasts for weddings, corporate events, house parties & celebrations."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Catering" },
        ]}
      />

      <HeroSection />
      <CateringTypesSection />
      <StatsSection />
      <MenuHighlightsSection menuData={menuData} />
      <WhyChooseSection />
      <EnquirySection />
      <CTASection />

      <Footer />
    </main>
  )
}
