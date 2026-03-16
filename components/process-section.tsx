"use client"

import { useInView } from "@/hooks/use-in-view"
import { Sprout, Flame, Package, Truck } from "lucide-react"

const steps = [
  {
    icon: Sprout,
    number: "01",
    title: "Handpicking Ingredients",
    description:
      "We select the finest farm-fresh vegetables, pure oils, hand-ground spices, and premium raw materials from trusted local farmers.",
  },
  {
    icon: Flame,
    number: "02",
    title: "Traditional Preparation",
    description:
      "Each batch is slow-cooked and sun-dried using age-old methods. No machines, no shortcuts \u2014 just Chittamma\u2019s time-tested techniques.",
  },
  {
    icon: Package,
    number: "03",
    title: "Premium Packaging",
    description:
      "Carefully packed in hygienic, export-quality containers to preserve freshness, flavor, and the warmth of homemade love.",
  },
  {
    icon: Truck,
    number: "04",
    title: "Delivered with Care",
    description:
      "From our kitchen to your doorstep \u2014 tracked shipping with temperature-safe packaging ensures your food arrives perfect.",
  },
]

export function ProcessSection() {
  const { ref, isInView } = useInView()

  return (
    <section className="py-20 lg:py-28 bg-primary text-primary-foreground" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div
            className={`flex items-center justify-center gap-3 mb-4 ${
              isInView ? "animate-fade-up" : "opacity-0"
            }`}
          >
            <div className="h-px w-8 bg-saffron" />
            <span className="text-saffron text-sm font-semibold uppercase tracking-[0.2em]">
              {"Our Process"}
            </span>
            <div className="h-px w-8 bg-saffron" />
          </div>
          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-bold font-serif mb-4 text-balance ${
              isInView ? "animate-fade-up stagger-1" : "opacity-0"
            }`}
          >
            {"Crafted the Traditional Way"}
          </h2>
          <p
            className={`text-primary-foreground/70 text-lg max-w-2xl mx-auto text-pretty ${
              isInView ? "animate-fade-up stagger-2" : "opacity-0"
            }`}
          >
            {"Where heritage meets hygiene. From selecting the finest ingredients to slow-cooking and sun-drying, our process preserves purity and tradition."}
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className={`relative group h-full ${
                isInView ? "animate-fade-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${0.15 * (i + 1)}s` }}
            >
              <div className="relative h-full flex flex-col bg-primary-foreground/5 border border-primary-foreground/10 rounded-2xl p-8 hover:bg-primary-foreground/10 transition-all duration-300 hover:-translate-y-1">
                {/* Number */}
                <span className="text-5xl font-bold font-serif text-primary-foreground/10 absolute top-4 right-6">
                  {step.number}
                </span>

                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-saffron/20 flex items-center justify-center mb-6">
                  <step.icon className="h-7 w-7 text-saffron" />
                </div>

                <h3 className="text-xl font-bold font-serif mb-3">{step.title}</h3>
                <p className="text-primary-foreground/70 leading-relaxed text-sm flex-1">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
