"use client"

const items = [
  "100% Handmade",
  "No Preservatives",
  "Farm Fresh Ingredients",
  "Traditional Recipes",
  "Export Quality",
  "Trusted by 1000+ Families",
  "Pure Ghee",
  "Sun-Dried Pickles",
  "Made with Love",
]

export function MarqueeBanner() {
  return (
    <div className="bg-primary py-3 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="mx-8 text-primary-foreground text-sm font-semibold uppercase tracking-widest inline-flex items-center gap-3"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-saffron flex-shrink-0" />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
