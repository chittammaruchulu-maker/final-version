"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import {
  X, Send, Loader2, Trash2,
  TrendingUp, Package, Users, ShoppingCart, ChevronDown,
  LayoutDashboard, MessageSquare, Bell,
} from "lucide-react"

const QUICK_PROMPTS = [
  { icon: ShoppingCart,    label: "Pending orders",      text: "How many orders are pending confirmation today? Show me the list." },
  { icon: Package,         label: "Low stock alert",     text: "Which products are running low on stock? Show details." },
  { icon: Users,           label: "Customer growth",     text: "How many customers registered this month? And newsletter subscribers?" },
  { icon: TrendingUp,      label: "Revenue overview",    text: "What is the total revenue and this month's performance?" },
  { icon: MessageSquare,   label: "New enquiries",       text: "Are there any new unread form submissions or enquiries?" },
  { icon: LayoutDashboard, label: "Full dashboard",      text: "Give me a complete business summary: orders, revenue, products, customers." },
]

export default function AdminChatWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/admin/chat" }),
  })

  const isLoading = status === "streaming" || status === "submitted"

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  const handleSend = () => {
    const text = input.trim()
    if (!text || isLoading) return
    setInput("")
    sendMessage({ text })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleQuickPrompt = (text: string) => {
    if (isLoading) return
    sendMessage({ text })
  }

  const getMessageText = (msg: typeof messages[0]) => {
    if (!msg.parts) return ""
    return msg.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map(p => p.text)
      .join("")
  }

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Admin AI assistant"
        className={`fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full shadow-xl transition-all duration-300 ${
          open
            ? "bg-foreground text-background scale-95"
            : "bg-primary text-primary-foreground hover:scale-110 hover:shadow-primary/30"
        }`}
        style={{ width: 52, height: 52 }}
      >
        {open ? <X className="h-5 w-5" /> : <LayoutDashboard className="h-5 w-5" />}
        {!open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shadow">
            <Bell className="h-2.5 w-2.5 text-white" />
          </span>
        )}
      </button>

      {/* Chat panel */}
      <div className={`fixed bottom-[76px] right-6 z-50 w-[380px] max-w-[calc(100vw-1.5rem)] bg-card rounded-2xl shadow-2xl border border-border flex flex-col transition-all duration-300 origin-bottom-right ${
        open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
      }`}
        style={{ maxHeight: "calc(100vh - 120px)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border rounded-t-2xl bg-foreground text-background">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-background/10 flex items-center justify-center">
              <LayoutDashboard className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">Admin AI Assistant</p>
              <p className="text-[10px] text-background/60 mt-0.5">Live business data</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                title="Clear chat"
                className="p-1.5 rounded-lg hover:bg-primary-foreground/10 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-primary-foreground/10 transition-colors"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0" style={{ maxHeight: 380 }}>
          {/* Welcome state */}
          {messages.length === 0 && (
            <div className="space-y-3">
              <div className="rounded-xl bg-primary/5 border border-primary/10 p-3">
                <p className="text-xs font-semibold text-foreground mb-0.5">{"Admin AI Assistant"}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {"Ask me anything about your business — orders, revenue, inventory, customers, or enquiries. I fetch live data from your database."}
                </p>
              </div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide px-0.5">{"Quick actions"}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {QUICK_PROMPTS.map((qp) => (
                  <button
                    key={qp.label}
                    onClick={() => handleQuickPrompt(qp.text)}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-background hover:bg-muted hover:border-primary/30 transition-all text-left"
                  >
                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <qp.icon className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-foreground leading-tight">{qp.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => {
            const text = getMessageText(msg)
            if (!text && msg.role !== "assistant") return null
            return (
              <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-foreground flex items-center justify-center flex-shrink-0 mt-0.5">
                    <LayoutDashboard className="h-3 w-3 text-background" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                }`}>
                  {text ? (
                    <span className="whitespace-pre-wrap">{text}</span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      {"Thinking..."}
                    </span>
                  )}
                </div>
              </div>
            )
          })}

          {/* Typing indicator */}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-2 justify-start">
              <div className="w-6 h-6 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
                <LayoutDashboard className="h-3 w-3 text-background" />
              </div>
              <div className="bg-muted rounded-2xl rounded-bl-sm px-3 py-2.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2 bg-muted/60 rounded-xl px-3 py-2 border border-border focus-within:border-primary/50 transition-colors">
            <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about orders, revenue, stock..."
              disabled={isLoading}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex-shrink-0"
            >
              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            </button>
          </div>
          <p className="text-center text-[10px] text-muted-foreground mt-2">{"Admin-only assistant. All data is live."}</p>
        </div>
      </div>
    </>
  )
}
