"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import SubscriptionModal from "./subscription-modal"
import {
  Clock,
  MapPin,
  Leaf,
  Flame,
  UtensilsCrossed,
  Truck,
  Star,
  Phone,
  ArrowRight,
  CheckCircle2,
  Users,
  CalendarDays,
  X,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { useInView } from "@/hooks/use-in-view"

const menuCategories = [
  {
    title: "Daily Meals (Thali)",
    image: "/images/cloud-kitchen-meals.jpg",
    description:
      "Authentic Telugu home-style meals with rice, sambar, rasam, curry, dal, pickle, podi & papad. Just like Chittamma would serve.",
    items: [
      { name: "Veg Thali", price: 149, tag: "Bestseller" },
      { name: "Non-Veg Thali", price: 199, tag: null },
      { name: "Special Thali (with sweet)", price: 229, tag: "Weekend Special" },
      { name: "Mini Meals", price: 99, tag: null },
    ],
  },
  {
    title: "Breakfast / Tiffins",
    image: "/images/cloud-kitchen-tiffin.jpg",
    description:
      "Start your morning the Telugu way. Fresh idli, crispy dosa, fluffy pesarattu, and piping hot upma prepared fresh every day.",
    items: [
      { name: "Idli (4 pcs) + Chutney + Sambar", price: 69, tag: null },
      { name: "Masala Dosa", price: 89, tag: "Popular" },
      { name: "Pesarattu + Ginger Chutney", price: 79, tag: null },
      { name: "Breakfast Combo (Idli + Vada + Coffee)", price: 119, tag: "Value Pack" },
    ],
  },
  {
    title: "Biryanis & Specials",
    image: "/images/cloud-kitchen-biryani.jpg",
    description:
      "Fragrant, slow-cooked biryanis and special dishes made with premium ingredients and traditional dum technique.",
    items: [
      { name: "Veg Dum Biryani", price: 179, tag: null },
      { name: "Chicken Dum Biryani", price: 249, tag: "Bestseller" },
      { name: "Mutton Biryani", price: 349, tag: "Premium" },
      { name: "Pulihora (Tamarind Rice)", price: 99, tag: null },
    ],
  },
]

const features = [
  {
    icon: Leaf,
    title: "No Preservatives",
    description: "Fresh ingredients, cooked to order. No frozen or pre-packaged food.",
  },
  {
    icon: Flame,
    title: "Traditional Recipes",
    description: "Authentic Andhra-Telangana flavors passed down through generations.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Hot meals delivered in 45-60 minutes within our delivery zone.",
  },
  {
    icon: UtensilsCrossed,
    title: "Hygienic Kitchen",
    description: "FSSAI certified kitchen with world-class hygiene and safety standards.",
  },
]

const howItWorks = [
  {
    step: "01",
    title: "Browse the Menu",
    description: "Choose from our daily thalis, tiffins, biryanis, and specials.",
  },
  {
    step: "02",
    title: "Place Your Order",
    description: "Call us, WhatsApp, or order through our delivery partners.",
  },
  {
    step: "03",
    title: "We Cook Fresh",
    description: "Your meal is cooked fresh after you order. No reheating, no shortcuts.",
  },
  {
    step: "04",
    title: "Delivered Hot",
    description: "Packed with care and delivered to your door while still steaming.",
  },
]

const testimonials = [
  {
    quote: "The veg thali reminds me of my mother's cooking. Authentic Andhra flavors right at my office desk!",
    name: "Priyanka S.",
    location: "Gachibowli, Hyderabad",
    rating: 5,
  },
  {
    quote: "Best biryani I have had from a cloud kitchen. Fragrant, flavorful, and generous portions.",
    name: "Rajesh K.",
    location: "Madhapur, Hyderabad",
    rating: 5,
  },
  {
    quote: "We order the weekly meal plan for our entire team. Saves time and everyone loves it!",
    name: "Divya M.",
    location: "HITEC City",
    rating: 5,
  },
]

const deliveryPartners = [
  {
    name: "Swiggy",
    color: "bg-orange-500",
    textColor: "text-orange-600",
    bgLight: "bg-orange-50",
    borderColor: "border-orange-200",
    url: "https://www.swiggy.com",
  },
  {
    name: "Zomato",
    color: "bg-red-500",
    textColor: "text-red-600",
    bgLight: "bg-red-50",
    borderColor: "border-red-200",
    url: "https://www.zomato.com",
  },
  {
    name: "Rapido",
    color: "bg-yellow-500",
    textColor: "text-yellow-700",
    bgLight: "bg-yellow-50",
    borderColor: "border-yellow-200",
    url: "https://www.rapido.bike",
  },
  {
    name: "Uber Eats",
    color: "bg-green-600",
    textColor: "text-green-700",
    bgLight: "bg-green-50",
    borderColor: "border-green-200",
    url: "https://www.ubereats.com",
  },
  {
    name: "Blinkit",
    color: "bg-yellow-400",
    textColor: "text-yellow-700",
    bgLight: "bg-yellow-50",
    borderColor: "border-yellow-200",
    url: "https://blinkit.com",
  },
]

function OrderAppsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Modal */}
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-serif font-bold text-foreground text-xl">
              {"Order via Delivery App"}
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              {"Choose your preferred delivery partner"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-foreground" />
          </button>
        </div>

        <div className="space-y-3">
          {deliveryPartners.map((partner) => (
            <a
              key={partner.name}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between p-4 rounded-xl border ${partner.borderColor} ${partner.bgLight} hover:shadow-md transition-all duration-300 group`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${partner.color} flex items-center justify-center`}>
                  <span className="text-white font-bold text-sm">
                    {partner.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className={`font-semibold ${partner.textColor}`}>
                    {partner.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {"Order on "}{partner.name}
                  </p>
                </div>
              </div>
              <ExternalLink className={`h-4 w-4 ${partner.textColor} opacity-50 group-hover:opacity-100 transition-opacity`} />
            </a>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-5">
          {"You will be redirected to the selected app to place your order."}
        </p>
      </div>
    </div>
  )
}

function HeroSection() {
  const { ref, isInView } = useInView()
  const [showAppsModal, setShowAppsModal] = useState(false)

  return (
    <section className="relative overflow-hidden bg-charcoal" ref={ref}>
      <div className="absolute inset-0">
        <Image
          src="/images/cloud-kitchen-hero.jpg"
          alt="Chittamma Ruchulu Cloud Kitchen"
          fill
          className="object-cover opacity-30"
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
              {"Cloud Kitchen"}
            </span>
          </div>

          <h2
            className={`text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-white mb-6 leading-tight ${
              isInView ? "animate-fade-up stagger-1" : "opacity-0"
            }`}
          >
            {"Home-Style Telugu Meals, Delivered Fresh"}
          </h2>

          <p
            className={`text-white/70 text-lg md:text-xl leading-relaxed mb-8 max-w-lg ${
              isInView ? "animate-fade-up stagger-2" : "opacity-0"
            }`}
          >
            {"Authentic Andhra-Telangana food cooked fresh every day in our FSSAI-certified kitchen. Daily thalis, tiffins, biryanis & more."}
          </p>

          <div
            className={`flex flex-wrap items-center gap-4 mb-10 ${
              isInView ? "animate-fade-up stagger-3" : "opacity-0"
            }`}
          >
            <Link href="#menu">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 text-base font-semibold group"
              >
                {"View Today's Menu"}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <a href="https://wa.me/917842924883" target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                className="bg-green-500 text-white hover:bg-green-600 rounded-full px-8 py-6 text-base font-semibold"
              >
                <Phone className="mr-2 h-4 w-4" />
                {"Order on WhatsApp"}
              </Button>
            </a>
          </div>

          <div
            className={`flex flex-wrap items-center gap-6 text-white/60 text-sm ${
              isInView ? "animate-fade-up stagger-4" : "opacity-0"
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-saffron" />
              <span>{"Delivery: 45-60 min"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-saffron" />
              <span>{"Hyderabad"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-saffron fill-saffron" />
              <span>{"4.8 Rating (500+ orders)"}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturesGrid() {
  const { ref, isInView } = useInView()

  return (
    <section className="py-16 lg:py-20 bg-background" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`bg-card p-6 rounded-2xl border border-border text-center hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1 ${
                isInView ? "animate-fade-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${0.1 * i}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-serif font-bold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function MenuSection() {
  const { ref, isInView } = useInView()

  return (
    <section id="menu" className="py-20 lg:py-28 bg-secondary/30 scroll-mt-24" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center mb-16">
          <div
            className={`flex items-center justify-center gap-3 mb-4 ${
              isInView ? "animate-fade-up" : "opacity-0"
            }`}
          >
            <div className="h-px w-8 bg-primary" />
            <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em]">
              {"Our Menu"}
            </span>
            <div className="h-px w-8 bg-primary" />
          </div>
          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-foreground text-balance mb-4 ${
              isInView ? "animate-fade-up stagger-1" : "opacity-0"
            }`}
          >
            {"Fresh Meals, Cooked Daily"}
          </h2>
          <p
            className={`text-muted-foreground text-lg max-w-2xl mx-auto ${
              isInView ? "animate-fade-up stagger-2" : "opacity-0"
            }`}
          >
            {"Every dish is prepared fresh using traditional methods. Menu changes daily with seasonal specialties."}
          </p>
        </div>

        <div className="space-y-16">
          {menuCategories.map((category, catIdx) => (
            <div
              key={category.title}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
                catIdx % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Image */}
              <div className={catIdx % 2 === 1 ? "lg:order-2" : ""}>
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden group">
                  <Image
                    src={category.image}
                    alt={category.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent" />
                </div>
              </div>

              {/* Menu items */}
              <div className={catIdx % 2 === 1 ? "lg:order-1" : ""}>
                <h3 className="text-2xl md:text-3xl font-bold font-serif text-foreground mb-3">
                  {category.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  {category.description}
                </p>

                <div className="space-y-4">
                  {category.items.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between py-3 border-b border-border/60 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-foreground">
                          {item.name}
                        </span>
                        {item.tag && (
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
                            {item.tag}
                          </span>
                        )}
                      </div>
                      <span className="font-serif font-bold text-primary text-lg">
                        {"\u20B9"}{item.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  const { ref, isInView } = useInView()

  return (
    <section className="py-20 lg:py-28 bg-charcoal" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center mb-16">
          <div
            className={`flex items-center justify-center gap-3 mb-4 ${
              isInView ? "animate-fade-up" : "opacity-0"
            }`}
          >
            <div className="h-px w-8 bg-saffron" />
            <span className="text-saffron text-sm font-semibold uppercase tracking-[0.2em]">
              {"How It Works"}
            </span>
            <div className="h-px w-8 bg-saffron" />
          </div>
          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-white text-balance ${
              isInView ? "animate-fade-up stagger-1" : "opacity-0"
            }`}
          >
            {"From Our Kitchen to Your Table"}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {howItWorks.map((step, i) => (
            <div
              key={step.step}
              className={`text-center relative ${
                isInView ? "animate-fade-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${0.15 * i}s` }}
            >
              {i < howItWorks.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-px border-t border-dashed border-white/20" />
              )}
              <div className="w-16 h-16 rounded-full bg-saffron/20 flex items-center justify-center mx-auto mb-5">
                <span className="text-saffron font-serif font-bold text-xl">{step.step}</span>
              </div>
              <h3 className="font-serif font-bold text-white text-lg mb-2">
                {step.title}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  const { ref, isInView } = useInView()

  return (
    <section className="py-20 lg:py-28 bg-background" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-primary" />
            <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em]">
              {"What People Say"}
            </span>
            <div className="h-px w-8 bg-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-foreground">
            {"Loved by Hyderabad"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className={`bg-card p-8 rounded-2xl border border-border hover:shadow-lg transition-all duration-300 ${
                isInView ? "animate-fade-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${0.1 * i}s` }}
            >
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 text-saffron fill-saffron" />
                ))}
              </div>
              <p className="text-foreground leading-relaxed mb-6 italic">
                {`"${t.quote}"`}
              </p>
              <div>
                <p className="font-semibold text-foreground text-sm">{t.name}</p>
                <p className="text-muted-foreground text-xs">{t.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const PLANS = [
  {
    name: "Daily",
    meals: "1 meal/day",
    price: 3499,
    perMeal: 140,
    duration: "Monthly",
    features: [
      "Lunch or Dinner (your choice)",
      "Rotating daily menu",
      "Free delivery",
      "Skip any day",
    ],
    popular: false,
  },
  {
    name: "Full Day",
    meals: "2 meals/day",
    price: 5999,
    perMeal: 120,
    duration: "Monthly",
    features: [
      "Breakfast + Lunch or Dinner",
      "Weekend specials included",
      "Free delivery",
      "Priority kitchen queue",
      "Skip any day",
    ],
    popular: true,
  },
  {
    name: "Weekly",
    meals: "5 meals",
    price: 699,
    perMeal: 140,
    duration: "Weekly",
    features: [
      "5 lunches (Mon-Fri)",
      "Ideal for office goers",
      "Free delivery",
      "Cancel anytime",
    ],
    popular: false,
  },
]

function SubscriptionSection() {
  const { ref, isInView } = useInView()
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null)

  return (
    <>
      <section className="py-20 lg:py-28 bg-secondary/30" ref={ref}>
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-8 bg-primary" />
              <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em]">
                {"Meal Plans"}
              </span>
              <div className="h-px w-8 bg-primary" />
            </div>
            <h2
              className={`text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-foreground text-balance mb-4 ${
                isInView ? "animate-fade-up" : "opacity-0"
              }`}
            >
              {"Subscribe & Save"}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {"Enjoy homestyle meals every day without the hassle. Choose a plan that suits your schedule."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map((plan, i) => (
              <div
                key={plan.name}
                className={`relative bg-card rounded-2xl border ${
                  plan.popular ? "border-primary shadow-xl shadow-primary/10" : "border-border"
                } p-8 hover:shadow-lg transition-all duration-300 ${
                  isInView ? "animate-fade-up" : "opacity-0"
                }`}
                style={{ animationDelay: `${0.1 * i}s` }}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-full">
                      {"Most Popular"}
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="font-serif font-bold text-xl text-foreground mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-muted-foreground text-sm">{plan.meals}</p>
                </div>

                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold font-serif text-foreground">
                      {"\u20B9"}{plan.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-muted-foreground text-sm">{"/"}{plan.duration}</span>
                  </div>
                  <p className="text-primary text-xs font-semibold mt-1">
                    {"\u20B9"}{plan.perMeal}{"/meal"}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => setSelectedPlan(plan)}
                  className={`w-full rounded-full font-semibold py-5 ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {"Subscribe Now"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedPlan && (
        <SubscriptionModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </>
  )
}

function CTASection() {
  const { ref, isInView } = useInView()

  return (
    <section className="py-20 lg:py-28 bg-background" ref={ref}>
      <div className="mx-auto max-w-3xl px-4 lg:px-8 text-center">
        <h2
          className={`text-3xl md:text-4xl font-bold font-serif text-foreground mb-6 text-balance ${
            isInView ? "animate-fade-up" : "opacity-0"
          }`}
        >
          {"Hungry? Let Us Cook for You"}
        </h2>
        <p
          className={`text-muted-foreground text-lg mb-8 text-pretty ${
            isInView ? "animate-fade-up stagger-1" : "opacity-0"
          }`}
        >
          {"Skip the cooking, not the flavor. Order authentic Telugu meals prepared fresh in our cloud kitchen and delivered to your doorstep."}
        </p>
        <div
          className={`flex items-center justify-center gap-4 flex-wrap ${
            isInView ? "animate-fade-up stagger-2" : "opacity-0"
          }`}
        >
          <a href="tel:+917842924883">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-10 py-6 text-base font-semibold"
            >
              <Phone className="h-4 w-4 mr-2" />
              {"Call to Order"}
            </Button>
          </a>
          <a href="https://wa.me/917842924883" target="_blank" rel="noopener noreferrer">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground px-10 py-6 text-base font-semibold"
            >
              {"WhatsApp Order"}
            </Button>
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span>{"500+ Daily Orders"}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span>{"Mon-Sat Delivery"}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{"Hyderabad & Secunderabad"}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function CloudKitchenPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <PageHeader
        title="Cloud Kitchen"
        subtitle="Authentic Andhra-Telangana home-style meals, freshly cooked and delivered to your doorstep."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Cloud Kitchen" },
        ]}
      />

      <HeroSection />
      <FeaturesGrid />
      <MenuSection />
      <HowItWorksSection />
      <SubscriptionSection />
      <TestimonialsSection />
      <CTASection />

      <Footer />
    </main>
  )
}
