"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  MessageCircle, X, Send, Loader2, ShoppingCart,
  ChefHat, ArrowRight,
} from "lucide-react"
import { addToCart } from "@/lib/cart-store"

// ---- Types ----
interface Product {
  id: string
  name: string
  slug: string
  price: number
  originalPrice?: number
  image: string
  category: string
  badge: string
  isVeg: boolean
  sizes: Array<{ size: string; price: number }>
  url: string
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  text: string
  products: Product[]
}

// ---- Product Card ----
function ProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false)
  const defaultSize = product.sizes?.[0]

  const handleAdd = () => {
    if (!defaultSize) return
    addToCart(product.id, defaultSize.size, defaultSize.price, 1, {
      name: product.name,
      slug: product.slug,
      image: product.image,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="flex gap-3 p-3 bg-background rounded-xl border border-border hover:border-primary/30 transition-colors">
      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
        {product.image ? (
          <Image src={product.image} alt={product.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
        {product.badge && (
          <span className="absolute top-0.5 left-0.5 text-[8px] font-bold bg-primary text-primary-foreground px-1 rounded">
            {product.badge}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground leading-tight truncate">{product.name}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{product.category}</p>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs font-bold text-foreground">
            {"\u20B9"}{defaultSize?.price ?? product.price}
          </span>
          {product.originalPrice && (
            <span className="text-[10px] text-muted-foreground line-through">
              {"\u20B9"}{product.originalPrice}
            </span>
          )}
          {defaultSize && (
            <span className="text-[10px] text-muted-foreground">/ {defaultSize.size}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <button
            onClick={handleAdd}
            disabled={!defaultSize || added}
            className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full transition-all ${
              added ? "bg-green-500 text-white" : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            <ShoppingCart className="w-2.5 h-2.5" />
            {added ? "Added!" : "Add to Cart"}
          </button>
          <Link href={product.url} className="flex items-center gap-0.5 text-[10px] text-primary hover:underline">
            View <ArrowRight className="w-2.5 h-2.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}

// ---- Simple Markdown Renderer ----
function renderMarkdown(text: string, isUser: boolean): React.ReactNode[] {
  const lines = text.split("\n")
  const nodes: React.ReactNode[] = []

  const parseInline = (str: string, key: string): React.ReactNode => {
    // Remove image markdown entirely — images don't render well in chat bubbles
    str = str.replace(/!\[([^\]]*)\]\([^)]*\)/g, "")
    // Split on bold, links
    const parts = str.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g)
    return (
      <span key={key}>
        {parts.map((part, i) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={i}>{part.slice(2, -2)}</strong>
          }
          const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
          if (linkMatch) {
            return (
              <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer"
                className={`underline underline-offset-2 ${isUser ? "text-primary-foreground/90" : "text-primary"}`}>
                {linkMatch[1]}
              </a>
            )
          }
          return part
        })}
      </span>
    )
  }

  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    // Bullet list item
    if (/^[\-\*] /.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[\-\*] /.test(lines[i])) {
        items.push(lines[i].replace(/^[\-\*] /, ""))
        i++
      }
      nodes.push(
        <ul key={`ul-${i}`} className="list-disc pl-4 space-y-0.5">
          {items.map((item, j) => (
            <li key={j}>{parseInline(item, `li-${j}`)}</li>
          ))}
        </ul>
      )
      continue
    }
    // Numbered list
    if (/^\d+\. /.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ""))
        i++
      }
      nodes.push(
        <ol key={`ol-${i}`} className="list-decimal pl-4 space-y-0.5">
          {items.map((item, j) => (
            <li key={j}>{parseInline(item, `oli-${j}`)}</li>
          ))}
        </ol>
      )
      continue
    }
    // Empty line — spacing
    if (line.trim() === "") {
      nodes.push(<div key={`sp-${i}`} className="h-1" />)
    } else {
      nodes.push(<p key={`p-${i}`}>{parseInline(line, `inline-${i}`)}</p>)
    }
    i++
  }
  return nodes
}

// ---- Message Renderer ----
function MessageContent({ message }: { message: ChatMessage }) {
  return (
    <div className="space-y-2">
      {message.text && (
        <div className={`text-sm leading-relaxed space-y-1 ${
          message.role === "user" ? "text-primary-foreground" : "text-foreground"
        }`}>
          {renderMarkdown(message.text, message.role === "user")}
        </div>
      )}
      {message.products.length > 0 && (
        <div className="space-y-2 mt-2">
          {message.products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}

const SUGGESTIONS = [
  "Show me bestsellers",
  "What sweets do you have?",
  "Recommend a gift pack",
  "Tell me about your pickles",
]

// ---- Main Chatbot Widget ----
export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, open])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: text.trim(),
      products: [],
    }
    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)

    const history = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.text,
    }))

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      })

      if (!response.ok) {
        const errText = await response.text()
        console.error("[v0] chat response not ok:", response.status, errText)
        throw new Error(`API error ${response.status}`)
      }

      const data = await response.json()

      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: data.reply || "",
        products: data.products || [],
      }])
    } catch (err) {
      console.error("[v0] chatbot fetch error:", err)
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: "Sorry, I ran into an issue. Please try again.",
        products: [],
      }])
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading])

  const handleSend = () => {
    const text = inputValue.trim()
    if (!text) return
    setInputValue("")
    sendMessage(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        aria-label="Open chat assistant"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-1.5rem)] h-[520px] max-h-[calc(100vh-7rem)] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <ChefHat className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-none">Chittamma</p>
              <p className="text-[11px] opacity-75 mt-0.5">Your food assistant</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg hover:bg-primary-foreground/20 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="space-y-4">
                <div className="bg-secondary rounded-2xl rounded-tl-sm p-3">
                  <p className="text-sm text-foreground leading-relaxed">
                    Namaste! I am Chittamma, your guide to authentic Andhra-Telangana flavours. How can I help you today?
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setInputValue(""); sendMessage(s) }}
                      className="text-xs text-left px-3 py-2 bg-secondary hover:bg-primary hover:text-primary-foreground rounded-xl border border-border transition-colors leading-snug"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[90%] rounded-2xl px-3 py-2.5 ${
                    msg.role === "user" ? "bg-primary rounded-tr-sm" : "bg-secondary rounded-tl-sm"
                  }`}>
                    <MessageContent message={msg} />
                  </div>
                </div>
              ))
            )}

            {/* Typing indicator */}
            {isLoading && messages[messages.length - 1]?.text === "" && (
              <div className="flex justify-start">
                <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 border-t border-border p-3 flex items-end gap-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about our products..."
              rows={1}
              className="flex-1 resize-none text-sm px-3 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary max-h-24 leading-snug"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="w-9 h-9 flex-shrink-0 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              aria-label="Send message"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
