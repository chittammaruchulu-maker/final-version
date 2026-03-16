"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Leaf, Award, Heart, Users, Clock, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { useInView } from "@/hooks/use-in-view"

const values = [
  {
    icon: Leaf,
    title: "100% Natural",
    description:
      "No preservatives, no artificial colors, no shortcuts. Every ingredient is natural and sourced with care.",
  },
  {
    icon: Award,
    title: "Premium Quality",
    description:
      "We source the finest ingredients from trusted local farmers. Pure ghee, cold-pressed oils, and farm-fresh spices.",
  },
  {
    icon: Heart,
    title: "Made with Love",
    description:
      "Each product is handcrafted by skilled artisans who pour their heart into preserving authentic recipes.",
  },
  {
    icon: Users,
    title: "Community First",
    description:
      "We support local communities and families by sourcing directly from farmers and employing local artisans.",
  },
]

const milestones = [
  {
    year: "The Origins",
    title: "Chittamma's Kitchen",
    description:
      "It all began in a small village kitchen in Andhra Pradesh, where Chittamma would spend hours crafting traditional recipes for her family and neighbors.",
  },
  {
    year: "The Dream",
    title: "Sharing with the World",
    description:
      "Family members and friends who tasted Chittamma's food kept asking for more. The idea was born to share these authentic flavors beyond the village.",
  },
  {
    year: "The Beginning",
    title: "Chittamma Ruchulu is Born",
    description:
      "With traditional recipes in hand and a passion for authenticity, Chittamma Ruchulu was established to bring forgotten Telugu flavors to every home.",
  },
  {
    year: "Today",
    title: "Growing Heritage",
    description:
      "From a small kitchen to serving customers across India and abroad, we continue Chittamma's legacy of pure, handmade, traditional food.",
  },
]

const stats = [
  { value: "30+", label: "Traditional Recipes" },
  { value: "10K+", label: "Happy Customers" },
  { value: "50+", label: "Products" },
  { value: "100%", label: "Handmade" },
]

function StoryTimeline() {
  const { ref, isInView } = useInView()

  return (
    <section className="py-20 lg:py-28 bg-background" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-primary" />
            <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em]">
              {"Our Journey"}
            </span>
            <div className="h-px w-8 bg-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-foreground text-balance">
            {"From Village Kitchen to Your Doorstep"}
          </h2>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-px" />

          <div className="space-y-12 md:space-y-16">
            {milestones.map((milestone, i) => (
              <div
                key={milestone.year}
                className={`relative flex items-start gap-8 md:gap-16 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                } ${isInView ? "animate-fade-up" : "opacity-0"}`}
                style={{ animationDelay: `${0.15 * i}s` }}
              >
                {/* Dot */}
                <div className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background -translate-x-1/2 mt-1.5 z-10" />

                {/* Content */}
                <div
                  className={`ml-16 md:ml-0 md:w-[calc(50%-2rem)] ${
                    i % 2 === 0 ? "md:text-right md:pr-8" : "md:text-left md:pl-8"
                  }`}
                >
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest rounded-full mb-3">
                    {milestone.year}
                  </span>
                  <h3 className="font-serif font-bold text-xl text-foreground mb-2">
                    {milestone.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {milestone.description}
                  </p>
                </div>

                {/* Spacer for opposite side */}
                <div className="hidden md:block md:w-[calc(50%-2rem)]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ValuesSection() {
  const { ref, isInView } = useInView()

  return (
    <section className="py-20 lg:py-28 bg-secondary/30" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center mb-16">
          <div
            className={`flex items-center justify-center gap-3 mb-4 ${
              isInView ? "animate-fade-up" : "opacity-0"
            }`}
          >
            <div className="h-px w-8 bg-primary" />
            <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em]">
              {"What We Stand For"}
            </span>
            <div className="h-px w-8 bg-primary" />
          </div>
          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-foreground text-balance ${
              isInView ? "animate-fade-up stagger-1" : "opacity-0"
            }`}
          >
            {"Our Values"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, i) => (
            <div
              key={value.title}
              className={`bg-card p-8 rounded-2xl border border-border hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1 text-center ${
                isInView ? "animate-fade-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${0.1 * (i + 1)}s` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <value.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-serif font-bold text-foreground text-lg mb-3">
                {value.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {value.description}
              </p>
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
              className={`text-center ${
                isInView ? "animate-fade-up" : "opacity-0"
              }`}
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

export default function AboutPage() {
  const { ref: heroRef, isInView: heroInView } = useInView()

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <PageHeader
        title="Our Story"
        subtitle="Every flavour begins with love, tradition, and the magic of Chittamma's hands."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "About Us" },
        ]}
      />

      {/* Hero section */}
      <section className="py-20 lg:py-28 bg-background overflow-hidden" ref={heroRef}>
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image side */}
            <div className={heroInView ? "animate-slide-in-left" : "opacity-0"}>
              <div className="relative">
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden">
                  <Image
                    src="/images/chittamma-kitchen.jpg"
                    alt="Chittamma in her traditional kitchen"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                </div>
                {/* Floating stats card */}
                <div className="absolute -bottom-6 -right-4 md:right-8 bg-card rounded-2xl p-6 shadow-2xl border border-border max-w-xs">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">
                        {"30+ Years of Heritage"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {"Recipes passed through generations"}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Decorative dots */}
                <div className="absolute -top-4 -left-4 w-24 h-24 opacity-20">
                  <div className="grid grid-cols-4 gap-2">
                    {[...Array(16)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-primary"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Text side */}
            <div className={heroInView ? "animate-slide-in-right" : "opacity-0"}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-primary" />
                <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em]">
                  {"Meet Chittamma"}
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-foreground mb-6 leading-tight text-balance">
                {"The Heart Behind Every Recipe"}
              </h2>

              <div className="space-y-4 text-muted-foreground leading-relaxed text-base mb-8">
                <p>
                  {"In every Telugu family, there is that one person whose food defines celebrations, comfort, and home. For our family, that person is "}
                  <span className="text-primary font-semibold">
                    {"Chittamma"}
                  </span>
                  {" \u2014 a grandmother whose culinary wisdom transcended her small kitchen."}
                </p>
                <p>
                  {"Her tools were simple: a stone mortar, clay pots, and brass ladles. But the magic lived in her hands. Crackling mustard seeds in sesame oil, sun-drying mangoes on the terrace, stirring jaggery into bubbling ariselu batter \u2014 each ritual carried the weight of generations."}
                </p>
                <p>
                  {"When families began migrating to cities and abroad, the flavors of home became distant memories. We started Chittamma Ruchulu not as a business, but as a promise \u2014 to keep these recipes alive, to share them beyond our village, and to carry her legacy forward."}
                </p>
                <p>
                  {"Today, every product we make is a tribute to her. We use the same recipes, the same methods, and the same love. No artificial preservatives, no modern shortcuts. Just pure, handcrafted, traditional Andhra-Telangana food."}
                </p>
              </div>

              <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                <p className="text-sm text-foreground">
                  <span className="font-semibold">{"Based in Hyderabad,"}</span>
                  {" Telangana \u2014 delivering authentic flavors across India and the world."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Second image section */}
      <section className="py-0">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="max-w-4xl mx-auto -mt-4 mb-8">
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
              <Image
                src="/images/about-spices.jpg"
                alt="Our team preparing traditional food together in the kitchen"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 896px"
              />
            </div>
          </div>
        </div>
      </section>

      <StoryTimeline />
      <StatsSection />
      <ValuesSection />

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="mx-auto max-w-3xl px-4 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-6 text-balance">
            {"Ready to Taste the Heritage?"}
          </h2>
          <p className="text-muted-foreground text-lg mb-8 text-pretty">
            {"Every order supports our mission to preserve traditional recipes and empower local communities. Bring Chittamma's kitchen to your home today."}
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/shop">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-10 py-6 text-base font-semibold group transition-all duration-300 hover:shadow-xl hover:shadow-primary/20"
              >
                {"Explore Products"}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground px-10 py-6 text-base font-semibold"
              >
                {"Contact Us"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
