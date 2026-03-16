"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, ShoppingBag, Heart, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useInView } from "@/hooks/use-in-view"
import { useCart } from "@/lib/cart-store"
import type { Product } from "@/lib/products"

const filters = ["All", "Sweets", "Pickles", "Snacks", "Podis"]

interface FeaturedProductsProps {
  products: Product[]
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const [activeFilter, setActiveFilter] = useState("All")
  const { ref, isInView } = useInView()

  const filteredProducts =
    activeFilter === "All"
      ? products.filter((p) => p.isBestseller).slice(0, 8)
      : products.filter((p) => p.category === activeFilter)

  return (
    <section className="py-20 lg:py-28 bg-secondary/30" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <div
              className={`flex items-center gap-3 mb-4 ${
                isInView ? "animate-fade-up" : "opacity-0"
              }`}
            >
              <div className="h-px w-8 bg-primary" />
              <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em]">
                {"Handpicked for You"}
              </span>
            </div>
            <h2
              className={`text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-foreground text-balance ${
                isInView ? "animate-fade-up stagger-1" : "opacity-0"
              }`}
            >
              {"Bestselling Treasures"}
            </h2>
          </div>

          {/* Filters */}
          <div
            className={`flex flex-wrap gap-2 ${
              isInView ? "animate-fade-up stagger-2" : "opacity-0"
            }`}
          >
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeFilter === filter
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "bg-background text-foreground/70 hover:bg-primary/10 hover:text-primary border border-border"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product, i) => (
            <ProductCard key={product.name} product={product} index={i} isInView={isInView} />
          ))}
        </div>

        {/* View all */}
        <div
          className={`text-center mt-14 ${
            isInView ? "animate-fade-up" : "opacity-0"
          }`}
          style={{ animationDelay: "0.5s" }}
        >
          <Link href="/shop">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground px-10 py-6 text-base font-semibold transition-all duration-300"
            >
              {"View All Products"}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

function ProductCard({
  product,
  index,
  isInView,
}: {
  product: Product
  index: number
  isInView: boolean
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [selectedSize, setSelectedSize] = useState(0)
  const [addedFeedback, setAddedFeedback] = useState(false)
  const { add } = useCart()

  const currentVariant = product.sizes[selectedSize]

  const handleAddToCart = () => {
    add(product.id, currentVariant.size, currentVariant.price, 1, {
      name: product.name,
      slug: product.slug,
      image: product.image,
    })
    setAddedFeedback(true)
    setTimeout(() => setAddedFeedback(false), 1200)
  }

  return (
    <div
      className={`group bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1 ${
        isInView ? "animate-fade-up" : "opacity-0"
      }`}
      style={{ animationDelay: `${0.1 * (index + 1)}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground font-semibold text-xs px-3 py-1 rounded-full">
            {product.badge}
          </Badge>
          {currentVariant.originalPrice && (
            <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground font-bold text-xs px-2 py-1 rounded-full">
              {`-${Math.round(((currentVariant.originalPrice - currentVariant.price) / currentVariant.originalPrice) * 100)}%`}
            </Badge>
          )}
          <div
            className={`absolute inset-0 bg-charcoal/20 flex items-center justify-center gap-3 transition-all duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <button
              onClick={(e) => { e.preventDefault(); setIsWishlisted(!isWishlisted) }}
              className="w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-card hover:scale-110"
            >
              <Heart className={`h-4 w-4 transition-colors ${isWishlisted ? "fill-primary text-primary" : "text-foreground"}`} />
            </button>
            <button className="w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-card hover:scale-110">
              <Eye className="h-4 w-4 text-foreground" />
            </button>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="p-5">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1.5 font-semibold">
          {product.category}
        </p>
        <Link href={`/shop/${product.slug}`}>
          <h3 className="font-serif font-bold text-foreground text-lg mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < Math.floor(product.rating) ? "fill-saffron text-saffron" : "text-border"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">{`(${product.reviews})`}</span>
        </div>

        {/* Size selector */}
        <div className="flex gap-1.5 mb-3">
          {product.sizes.map((variant, i) => (
            <button
              key={variant.size}
              onClick={() => setSelectedSize(i)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                selectedSize === i
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-foreground/60 hover:bg-secondary/80 border border-border"
              }`}
            >
              {variant.size}
            </button>
          ))}
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-foreground">{`\u20B9${currentVariant.price}`}</span>
            {currentVariant.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">{`\u20B9${currentVariant.originalPrice}`}</span>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleAddToCart}
            className={`rounded-full h-9 px-3 transition-all duration-300 hover:scale-105 ${
              addedFeedback
                ? "bg-green-600 text-white hover:bg-green-600"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="ml-1.5 text-xs font-semibold">{addedFeedback ? "Added!" : "Add"}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
