"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Leaf, Award, Heart } from "lucide-react"
import { useInView } from "@/hooks/use-in-view"

const features = [
  {
    icon: Leaf,
    title: "100% Authentic Recipes",
    description: "Traditional methods preserved for generations, no shortcuts or modern substitutes",
  },
  {
    icon: Award,
    title: "Premium Ingredients",
    description: "Sourced directly from trusted local farmers. Pure ghee, cold-pressed oils, farm-fresh spices",
  },
  {
    icon: Heart,
    title: "Handcrafted with Love",
    description: "Every product made with care and attention to detail, just like Chittamma would",
  },
]

export function StorySection() {
  const { ref, isInView } = useInView()

  return (
    <section id="story" className="py-20 lg:py-28 bg-background overflow-hidden" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image side */}
          <div
            className={`relative ${
              isInView ? "animate-slide-in-left" : "opacity-0"
            }`}
          >
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden">
              <Image
                src="/images/chittamma-kitchen.jpg"
                alt="Chittamma in her traditional kitchen"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {/* Floating card */}
            <div className="absolute -bottom-6 -right-4 md:right-8 bg-card rounded-2xl p-6 shadow-2xl border border-border max-w-xs">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold font-serif text-primary">{"30+"}</span>
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">{"Years of Heritage"}</p>
                  <p className="text-xs text-muted-foreground">{"Recipes passed through generations"}</p>
                </div>
              </div>
            </div>
            {/* Decorative dot pattern */}
            <div className="absolute -top-4 -left-4 w-24 h-24 opacity-20">
              <div className="grid grid-cols-4 gap-2">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-primary" />
                ))}
              </div>
            </div>
          </div>

          {/* Text side */}
          <div className={isInView ? "animate-slide-in-right" : "opacity-0"}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-primary" />
              <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em]">
                {"Our Story"}
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-foreground mb-6 leading-tight text-balance">
              {"Every Flavour Begins with Her"}
            </h2>

            <div className="space-y-4 text-muted-foreground leading-relaxed text-base mb-10">
              <p>
                {"In every family, there's that one person whose food becomes the very essence of celebrations and home. For us, that person is "}
                <em className="text-primary font-semibold not-italic">{"Chittamma"}</em>
                {"."}
              </p>
              <p>
                {"Her kitchen was small, her tools simple, yet the magic lived in her hands. Crackling mustard seeds, simmering gongura, jaggery melting into ariselu \u2014 each sound and aroma told a story of togetherness."}
              </p>
              <p>
                {"Today, her recipes travel from our stove to tables across the world, shared as blessings rather than secrets. We began not as a business but as a humble attempt to bring back those forgotten flavours."}
              </p>
            </div>

            {/* Feature cards */}
            <div className="space-y-4 mb-10">
              {features.map((feature, i) => (
                <div
                  key={feature.title}
                  className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50 border border-border hover:bg-secondary hover:shadow-md transition-all duration-300"
                  style={{ animationDelay: `${0.2 * (i + 1)}s` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm mb-1">{feature.title}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/about">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-6 text-base font-semibold group transition-all duration-300 hover:shadow-xl hover:shadow-primary/20"
              >
                {"Meet Chittamma"}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
