"use client"

import { useState, useEffect, useCallback } from "react"
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useInView } from "@/hooks/use-in-view"

const testimonials = [
  {
    quote:
      "The taste reminds me of my grandmother's cooking. Absolutely authentic! Every jar of pickle takes me back to my childhood summers in Vijayawada.",
    author: "Priya Sharma",
    location: "Hyderabad",
    rating: 5,
    initials: "PS",
  },
  {
    quote:
      "Best Avakaya pickle I've had outside of Andhra Pradesh. The spice level, the tang, the mustard oil \u2014 everything is perfect. Highly recommended!",
    author: "Rajesh Kumar",
    location: "Bangalore",
    rating: 5,
    initials: "RK",
  },
  {
    quote:
      "Perfect for our family gatherings. Everyone loves the traditional flavors. The Sunnundalu and Ariselu were gone in minutes!",
    author: "Meera Reddy",
    location: "Chennai",
    rating: 5,
    initials: "MR",
  },
  {
    quote:
      "As an NRI living in the US, these products are a lifeline to home. The freshness and flavor are so real \u2014 feels like something my mother just made.",
    author: "Sagar Rao",
    location: "San Francisco, USA",
    rating: 5,
    initials: "SR",
  },
  {
    quote:
      "These pickles are not just food, they're memories bottled up. I ordered the gift pack for Diwali and my entire family was thrilled!",
    author: "Sneha Reddy",
    location: "Mumbai",
    rating: 5,
    initials: "SR",
  },
]

export function Testimonials() {
  const [current, setCurrent] = useState(0)
  const { ref, isInView } = useInView()

  const next = useCallback(
    () => setCurrent((prev) => (prev + 1) % testimonials.length),
    []
  )
  const prev = useCallback(
    () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length),
    []
  )

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  return (
    <section className="py-20 lg:py-28 bg-secondary/30" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div
            className={`flex items-center justify-center gap-3 mb-4 ${
              isInView ? "animate-fade-up" : "opacity-0"
            }`}
          >
            <div className="h-px w-8 bg-primary" />
            <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em]">
              {"Testimonials"}
            </span>
            <div className="h-px w-8 bg-primary" />
          </div>
          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-foreground text-balance ${
              isInView ? "animate-fade-up stagger-1" : "opacity-0"
            }`}
          >
            {"Loved by Thousands"}
          </h2>
        </div>

        {/* Testimonial card */}
        <div
          className={`max-w-3xl mx-auto ${
            isInView ? "animate-fade-up stagger-2" : "opacity-0"
          }`}
        >
          <div className="relative bg-card rounded-3xl p-8 md:p-12 shadow-xl border border-border">
            {/* Quote icon */}
            <div className="absolute -top-5 left-8 md:left-12">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Quote className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>

            {/* Content */}
            <div className="min-h-[180px] flex flex-col justify-center">
              <div className="flex items-center gap-1 mb-6">
                {[...Array(testimonials[current].rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-saffron text-saffron" />
                ))}
              </div>

              <p className="text-lg md:text-xl text-foreground leading-relaxed mb-8 font-serif italic">
                {`"${testimonials[current].quote}"`}
              </p>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">
                    {testimonials[current].initials}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-foreground">{testimonials[current].author}</p>
                  <p className="text-sm text-muted-foreground">{testimonials[current].location}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <div className="flex items-center gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`transition-all duration-300 rounded-full ${
                      i === current
                        ? "w-8 h-2 bg-primary"
                        : "w-2 h-2 bg-border hover:bg-primary/40"
                    }`}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prev}
                  className="rounded-full border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 h-10 w-10"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous testimonial</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={next}
                  className="rounded-full border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 h-10 w-10"
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next testimonial</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
