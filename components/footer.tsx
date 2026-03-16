"use client"

import Link from "next/link"
import Image from "next/image"
import { MapPin, Phone, Mail, Instagram, Facebook, Youtube } from "lucide-react"

const shopLinks = [
  { label: "Sweets", href: "/shop?category=Sweets" },
  { label: "Pickles", href: "/shop?category=Pickles" },
  { label: "Snacks", href: "/shop?category=Snacks" },
  { label: "Podis", href: "/shop?category=Podis" },
  { label: "Gift Packs", href: "/shop?category=Gift+Packs" },
  { label: "All Products", href: "/shop" },
]

const supportLinks = [
  { label: "Track Order", href: "/contact" },
  { label: "Shipping Policy", href: "/contact" },
  { label: "Return & Refund", href: "/contact" },
  { label: "FAQ", href: "/contact" },
  { label: "Contact Us", href: "/contact" },
]

const companyLinks = [
  { label: "Our Story", href: "/about" },
  { label: "Cloud Kitchen", href: "/cloud-kitchen" },
  { label: "Catering Services", href: "/catering" },
  { label: "Bulk Orders", href: "/catering#enquiry" },
  { label: "Corporate Gifting", href: "/shop?category=Gift+Packs" },
]

export function Footer() {
  return (
    <footer id="contact" className="bg-charcoal text-white">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Image
                src="/images/logo.png"
                alt="Chittamma Ruchulu"
                width={180}
                height={56}
                className="w-[180px] h-auto drop-shadow-lg"
              />
            </div>

            <p className="text-white/60 leading-relaxed text-sm mb-6 max-w-sm">
              {"Preserving the authentic flavors of Andhra-Telangana cuisine, one recipe at a time. Every product is handcrafted with love and tradition."}
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-white/60 text-sm">
                <MapPin className="h-4 w-4 flex-shrink-0 text-primary" />
                <span>{"Hyderabad, Telangana, India - 501505"}</span>
              </div>
              <div className="flex items-center gap-3 text-white/60 text-sm">
                <Phone className="h-4 w-4 flex-shrink-0 text-primary" />
                <span>{"+91 78429 24883"}</span>
              </div>
              <div className="flex items-center gap-3 text-white/60 text-sm">
                <Mail className="h-4 w-4 flex-shrink-0 text-primary" />
                <span>{"contact@chittammaruchulu.com"}</span>
              </div>
            </div>

            {/* Socials */}
            <div className="flex items-center gap-3 mt-6">
              {[
                { icon: Instagram, label: "Instagram", href: "https://instagram.com/chittammaruchulu" },
                { icon: Facebook, label: "Facebook", href: "https://facebook.com/ChittammaRuchulu" },
                { icon: Youtube, label: "YouTube", href: "https://www.youtube.com/@ChittammaRuchulu" },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-bold font-serif text-white mb-5 text-sm uppercase tracking-widest">
              {"Shop"}
            </h4>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/60 text-sm hover:text-primary transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold font-serif text-white mb-5 text-sm uppercase tracking-widest">
              {"Support"}
            </h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/60 text-sm hover:text-primary transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold font-serif text-white mb-5 text-sm uppercase tracking-widest">
              {"Company"}
            </h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/60 text-sm hover:text-primary transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            {"\u00A9 2026 Chittamma Ruchulu. All rights reserved."}
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-white/40 text-sm hover:text-white/70 transition-colors">
              {"Privacy Policy"}
            </Link>
            <Link href="#" className="text-white/40 text-sm hover:text-white/70 transition-colors">
              {"Terms of Service"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
