"use client"

import { useState } from "react"
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Instagram,
  Facebook,
  Youtube,
  MessageSquare,
  ShoppingBag,
  HelpCircle,
  Package,
  ChevronDown,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { useInView } from "@/hooks/use-in-view"

const countryCodes = [
  { code: "+91", country: "India", flag: "IN" },
  { code: "+1", country: "USA", flag: "US" },
  { code: "+44", country: "UK", flag: "GB" },
  { code: "+971", country: "UAE", flag: "AE" },
  { code: "+65", country: "Singapore", flag: "SG" },
  { code: "+61", country: "Australia", flag: "AU" },
  { code: "+49", country: "Germany", flag: "DE" },
  { code: "+81", country: "Japan", flag: "JP" },
  { code: "+60", country: "Malaysia", flag: "MY" },
  { code: "+966", country: "Saudi Arabia", flag: "SA" },
  { code: "+974", country: "Qatar", flag: "QA" },
  { code: "+968", country: "Oman", flag: "OM" },
  { code: "+64", country: "New Zealand", flag: "NZ" },
  { code: "+33", country: "France", flag: "FR" },
]

const contactInfo = [
  {
    icon: Phone,
    title: "Phone",
    details: ["+91 78429 24883"],
    subtext: "Mon-Sat, 9AM - 7PM IST",
  },
  {
    icon: Mail,
    title: "Email",
    details: ["contact@chittammaruchulu.com"],
    subtext: "We reply within 24 hours",
  },
  {
    icon: MapPin,
    title: "Address",
    details: ["Hyderabad, Telangana", "India - 501505"],
    subtext: "Corporate & kitchen office",
  },
  {
    icon: Clock,
    title: "Business Hours",
    details: ["Mon - Sat: 9AM - 7PM IST"],
    subtext: "Sunday: Closed",
  },
]

const faqItems = [
  {
    icon: ShoppingBag,
    question: "How do I place a bulk order?",
    answer:
      "For bulk or corporate orders, reach out to us via email or phone. We offer special pricing for orders above 50 units and custom packaging for corporate gifting.",
  },
  {
    icon: Package,
    question: "What are the shipping charges?",
    answer:
      "We offer free delivery on orders above \u20B91,500 across India. For international shipping (NRI orders), charges vary based on destination. Contact us for exact rates.",
  },
  {
    icon: HelpCircle,
    question: "How long do the products stay fresh?",
    answer:
      "Shelf life varies by product: Pickles last 6-12 months, Podis 3 months, Sweets 5-30 days. Each product label has exact expiry details. We recommend refrigeration for sweets.",
  },
  {
    icon: MessageSquare,
    question: "Can I customize a gift hamper?",
    answer:
      "Yes! We offer fully customizable gift hampers. Choose your products, quantities, and we will package them beautifully. Contact us for custom gifting requirements.",
  },
]

const socialLinks = [
  {
    icon: Instagram,
    label: "Instagram",
    href: "https://instagram.com/chittammaruchulu",
    color: "hover:bg-pink-500",
    handle: "@chittammaruchulu",
  },
  {
    icon: Facebook,
    label: "Facebook",
    href: "https://facebook.com/ChittammaRuchulu",
    color: "hover:bg-blue-600",
    handle: "ChittammaRuchulu",
  },
  {
    icon: Youtube,
    label: "YouTube",
    href: "https://www.youtube.com/@ChittammaRuchulu",
    color: "hover:bg-red-600",
    handle: "@ChittammaRuchulu",
  },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    countryCode: "+91",
    phone: "",
    subject: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false)

  const { ref: faqRef, isInView: faqInView } = useInView()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError("")
    try {
      const res = await fetch("/api/form-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form_type: "contact",
          name: formData.name,
          email: formData.email,
          phone: `${formData.countryCode} ${formData.phone}`,
          subject: formData.subject,
          message: formData.message,
        }),
      })
      if (!res.ok) throw new Error("Failed to send")
      setSubmitted(true)
    } catch {
      setSubmitError("Something went wrong. Please try again or contact us directly.")
    } finally {
      setSubmitting(false)
    }
  }

  const selectedCountry = countryCodes.find((c) => c.code === formData.countryCode)

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <PageHeader
        title="Get in Touch"
        subtitle="Have a question, feedback, or want to place a bulk order? We would love to hear from you."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Contact Us" },
        ]}
      />

      {/* Contact info cards */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 lg:mb-24">
            {contactInfo.map((item) => (
              <div
                key={item.title}
                className="bg-card p-6 rounded-2xl border border-border hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-serif font-bold text-foreground mb-2">{item.title}</h3>
                {item.details.map((detail) => (
                  <p key={detail} className="text-foreground text-sm font-medium">{detail}</p>
                ))}
                <p className="text-xs text-muted-foreground mt-1">{item.subtext}</p>
              </div>
            ))}
          </div>

          {/* Contact form & info grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
            {/* Form */}
            <div className="lg:col-span-3">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-primary" />
                <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em]">{"Send a Message"}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold font-serif text-foreground mb-8">{"We Would Love to Hear From You"}</h2>

              {submitted ? (
                <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <Send className="h-7 w-7 text-green-600" />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-foreground mb-2">{"Message Sent!"}</h3>
                  <p className="text-muted-foreground mb-6">{"Thank you for reaching out. We will get back to you within 24 hours."}</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSubmitted(false)
                      setFormData({ name: "", email: "", countryCode: "+91", phone: "", subject: "", message: "" })
                    }}
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    {"Send Another Message"}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="name" className="text-sm font-semibold text-foreground mb-2 block">
                        {"Full Name"}<span className="text-destructive ml-0.5">{"*"}</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="bg-background border-border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm font-semibold text-foreground mb-2 block">
                        {"Email Address"}<span className="text-destructive ml-0.5">{"*"}</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="bg-background border-border"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="phone" className="text-sm font-semibold text-foreground mb-2 block">
                        {"Phone Number"}<span className="text-destructive ml-0.5">{"*"}</span>
                      </Label>
                      <div className="flex gap-2">
                        {/* Country code selector */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                            className="flex items-center gap-1.5 h-9 px-3 rounded-md border border-border bg-background text-sm font-medium text-foreground hover:bg-secondary transition-colors whitespace-nowrap"
                          >
                            <span>{selectedCountry?.code}</span>
                            <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${countryDropdownOpen ? "rotate-180" : ""}`} />
                          </button>
                          {countryDropdownOpen && (
                            <div className="absolute top-full left-0 mt-1 w-56 bg-card border border-border rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                              {countryCodes.map((cc) => (
                                <button
                                  key={cc.code}
                                  type="button"
                                  onClick={() => {
                                    setFormData({ ...formData, countryCode: cc.code })
                                    setCountryDropdownOpen(false)
                                  }}
                                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-primary/5 transition-colors flex items-center justify-between ${
                                    formData.countryCode === cc.code ? "bg-primary/10 text-primary font-semibold" : "text-foreground"
                                  }`}
                                >
                                  <span>{`${cc.country}`}</span>
                                  <span className="text-muted-foreground text-xs">{cc.code}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="XXXXX XXXXX"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                          className="bg-background border-border flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="subject" className="text-sm font-semibold text-foreground mb-2 block">{"Subject"}</Label>
                      <Input
                        id="subject"
                        placeholder="How can we help?"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="bg-background border-border"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-sm font-semibold text-foreground mb-2 block">{"Message"}</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about your inquiry, order, or feedback..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={6}
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
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-10 py-6 text-base font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 disabled:opacity-70"
                  >
                    {submitting ? (
                      <><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent inline-block" />{"Sending..."}</>
                    ) : (
                      <><Send className="h-4 w-4 mr-2" />{"Send Message"}</>
                    )}
                  </Button>
                </form>
              )}
            </div>

            {/* Side info */}
            <div className="lg:col-span-2">
              <div className="sticky top-28 space-y-8">
                {/* Map */}
                <div className="bg-secondary/50 rounded-2xl border border-border overflow-hidden">
                  <div className="aspect-[4/3] bg-secondary relative">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3807.5!2d78.62673545661187!3d17.34575797787672!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMTfCsDIwJzQ0LjciTiA3OMKwMzcnMzYuMiJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Chittamma Ruchulu Location - Hyderabad"
                      className="absolute inset-0"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold text-foreground">{"Hyderabad, Telangana"}</p>
                    <p className="text-xs text-muted-foreground">{"India - 501505 | Kitchen & Office"}</p>
                  </div>
                </div>

                {/* Social links */}
                <div className="bg-card p-6 rounded-2xl border border-border">
                  <h4 className="font-serif font-bold text-foreground mb-2">{"Follow Us"}</h4>
                  <p className="text-sm text-muted-foreground mb-5">
                    {"Stay updated with new products, recipes, and behind-the-scenes stories."}
                  </p>
                  <div className="space-y-3">
                    {socialLinks.map(({ icon: Icon, label, href, color, handle }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 group"
                      >
                        <span className={`w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center text-foreground/60 ${color} group-hover:text-white group-hover:border-transparent transition-all duration-300`}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{label}</p>
                          <p className="text-xs text-muted-foreground">{handle}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* WhatsApp CTA */}
                <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6">
                  <h4 className="font-serif font-bold text-foreground mb-2">{"Quick Order via WhatsApp"}</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {"Prefer ordering on WhatsApp? Send us a message and we will help you right away."}
                  </p>
                  <Button asChild className="bg-green-600 text-white hover:bg-green-700 rounded-full w-full font-semibold">
                    <a href="https://wa.me/917842924883" target="_blank" rel="noopener noreferrer">
                      <MessageSquare className="h-4 w-4 mr-2" />{"Chat on WhatsApp"}
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-28 bg-secondary/30" ref={faqRef}>
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-8 bg-primary" />
              <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em]">{"Common Questions"}</span>
              <div className="h-px w-8 bg-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-foreground text-balance">{"Frequently Asked Questions"}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {faqItems.map((faq, i) => (
              <div
                key={faq.question}
                className={`bg-card p-6 rounded-2xl border border-border hover:shadow-md transition-all duration-300 ${faqInView ? "animate-fade-up" : "opacity-0"}`}
                style={{ animationDelay: `${0.1 * i}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <faq.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-foreground mb-2">{faq.question}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
