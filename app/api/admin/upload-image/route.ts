import { put } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
    const filename = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const blob = await put(filename, file, { access: "public" })
    return NextResponse.json({ url: blob.url })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upload failed" }, { status: 500 })
  }
}
