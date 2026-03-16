"use client"

import { usePathname } from "next/navigation"
import Chatbot from "@/components/chatbot"

export default function ConditionalChatbot() {
  const pathname = usePathname()
  // Never show the public customer chatbot on admin pages
  if (pathname?.startsWith("/admin")) return null
  return <Chatbot />
}
