"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Star } from "lucide-react"
import { useInView } from "@/hooks/use-in-view"

export function Hero() {
  const { ref, isInView } = useInView()

  return (
    <section ref={ref} className="relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-spread.jpg"
          alt="Traditional Andhra-Telangana food spread"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/70 to-charcoal/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-charcoal/30" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8 py-24 md:py-32 lg:py-40">
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <div
            className={`flex items-center gap-2 mb-6 ${
              isInView ? "animate-fade-up" : "opacity-0"
            }`}
          >
            <div className="h-px w-12 bg-saffron" />
            <span className="text-saffron-light text-sm font-semibold uppercase tracking-[0.2em]">
              {"Authentic Andhra-Telangana Foods"}
            </span>
          </div>

          {/* Heading */}
          <h1
            className={`text-4xl md:text-5xl lg:text-7xl font-bold font-serif leading-[1.1] tracking-tight text-white mb-6 ${
              isInView ? "animate-fade-up stagger-1" : "opacity-0"
            }`}
          >
            <span className="block">{"Taste the"}</span>
            <span className="block text-saffron">{"Heritage"}</span>
            <span className="block text-3xl md:text-4xl lg:text-5xl mt-2 font-light text-white/90">
              {"of Every Bite"}
            </span>
          </h1>

          {/* Description */}
          <p
            className={`text-lg md:text-xl text-white/80 leading-relaxed mb-8 max-w-lg ${
              isInView ? "animate-fade-up stagger-2" : "opacity-0"
            }`}
          >
            {"From Chittamma's kitchen to yours. Handcrafted pickles, sweets, and snacks made with love, tradition, and the finest ingredients."}
          </p>

          {/* CTA */}
          <div
            className={`flex flex-col sm:flex-row items-start gap-4 ${
              isInView ? "animate-fade-up stagger-3" : "opacity-0"
            }`}
          >
            <Link href="/shop">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base font-semibold rounded-full group transition-all duration-300 hover:shadow-xl hover:shadow-primary/20"
              >
                {"Shop Now"}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/about">
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 hover:text-white px-8 py-6 text-base font-semibold rounded-full backdrop-blur-sm"
              >
                {"Our Story"}
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <div
            className={`flex items-center gap-6 mt-12 ${
              isInView ? "animate-fade-up stagger-4" : "opacity-0"
            }`}
          >
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-saffron text-saffron" />
              ))}
            </div>
            <div className="text-white/70 text-sm">
              <span className="text-white font-semibold">{"4.9/5"}</span>{" "}
              {"from 1,200+ happy customers"}
            </div>
          </div>
        </div>
      </div>

      {/* Decorative bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path
            d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z"
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  )
}
