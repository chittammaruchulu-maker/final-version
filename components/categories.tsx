"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useInView } from "@/hooks/use-in-view"

const categories = [
  {
    title: "Sweets",
    count: "30 items",
    description: "Traditional handcrafted sweets made with pure ghee and jaggery",
    image: "/images/category-sweets.jpg",
    color: "from-amber-900/80 to-amber-900/40",
  },
  {
    title: "Pickles",
    count: "22 items",
    description: "Sun-dried, spice-packed authentic Andhra pickles including non-veg",
    image: "/images/category-pickles.jpg",
    color: "from-red-900/80 to-red-900/40",
  },
  {
    title: "Snacks",
    count: "13 items",
    description: "Crispy traditional namkeens and savory delights",
    image: "/images/category-snacks.jpg",
    color: "from-orange-900/80 to-orange-900/40",
  },
  {
    title: "Podis",
    count: "10 items",
    description: "Freshly ground aromatic spice powders",
    image: "/images/category-podis.jpg",
    color: "from-red-950/80 to-red-950/40",
  },
  {
    title: "Gift Packs",
    count: "8 sets",
    description: "Beautifully packed festive hampers for every occasion",
    image: "/images/category-gifts.jpg",
    color: "from-yellow-900/80 to-yellow-900/40",
  },
]

export function Categories() {
  const { ref, isInView } = useInView()

  return (
    <section id="categories" className="py-20 lg:py-28 bg-background" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div
            className={`flex items-center justify-center gap-3 mb-4 ${
              isInView ? "animate-fade-up" : "opacity-0"
            }`}
          >
            <div className="h-px w-8 bg-primary" />
            <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em]">
              {"Collections"}
            </span>
            <div className="h-px w-8 bg-primary" />
          </div>
          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-foreground mb-4 text-balance ${
              isInView ? "animate-fade-up stagger-1" : "opacity-0"
            }`}
          >
            {"Shop by Category"}
          </h2>
          <p
            className={`text-muted-foreground text-lg max-w-2xl mx-auto text-pretty ${
              isInView ? "animate-fade-up stagger-2" : "opacity-0"
            }`}
          >
            {"Explore our authentic product collections, each crafted with traditional recipes and premium ingredients sourced directly from trusted farmers."}
          </p>
        </div>

        {/* Category grid - bento style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <Link
              href={`/shop?category=${encodeURIComponent(cat.title)}`}
              key={cat.title}
              className={`group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 ${
                i === 0 ? "md:col-span-2 lg:col-span-2 md:row-span-2 flex flex-col" : ""
              } ${isInView ? "animate-scale-in" : "opacity-0"}`}
              style={{ animationDelay: `${0.1 * (i + 1)}s` }}
            >
              <div className={`relative ${i === 0 ? "h-full min-h-[320px]" : "aspect-[4/3]"} overflow-hidden`}>
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes={i === 0 ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} transition-opacity duration-300`} />

                {/* Content overlay */}
                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                  <span className="text-white/70 text-xs uppercase tracking-widest mb-2 font-semibold">
                    {cat.count}
                  </span>
                  <h3 className={`font-serif font-bold text-white mb-2 ${i === 0 ? "text-3xl md:text-4xl" : "text-2xl"}`}>
                    {cat.title}
                  </h3>
                  <p className="text-white/80 text-sm mb-4 max-w-sm leading-relaxed">
                    {cat.description}
                  </p>
                  <div className="flex items-center gap-2 text-white font-semibold text-sm group/link">
                    <span>{"Explore"}</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
