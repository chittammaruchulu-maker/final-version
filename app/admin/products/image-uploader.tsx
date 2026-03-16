"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Upload, X, Loader2, ImageIcon } from "lucide-react"

interface ImageUploaderProps {
  value: string | null
  onChange: (url: string | null) => void
}

export default function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [dragging, setDragging] = useState(false)

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB.")
      return
    }
    setError("")
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")
      onChange(data.url)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
    e.target.value = ""
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }

  return (
    <div className="space-y-3">
      {/* Drop zone / upload button */}
      {!value && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-2 w-full h-32 rounded-xl border-2 border-dashed cursor-pointer transition-colors
            ${dragging ? "border-primary bg-primary/5" : "border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/5"}`}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          ) : (
            <>
              <div className="p-2 rounded-lg bg-primary/10">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                <span className="font-semibold text-foreground">Click to upload</span> or drag & drop
              </p>
              <p className="text-[11px] text-muted-foreground">PNG, JPG, WEBP up to 5 MB</p>
            </>
          )}
        </div>
      )}

      {/* Preview with remove */}
      {value && (
        <div className="relative group w-full">
          <div className="relative w-full h-40 rounded-xl border border-border overflow-hidden bg-muted">
            <Image
              src={value}
              alt="Product image"
              fill
              className="object-cover"
              unoptimized={value.startsWith("http")}
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-foreground text-xs font-semibold rounded-lg hover:bg-white/90 transition-colors"
              >
                <ImageIcon className="h-3.5 w-3.5" />
                Replace
              </button>
              <button
                type="button"
                onClick={() => onChange(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Remove
              </button>
            </div>
          </div>
          {uploading && (
            <div className="absolute inset-0 rounded-xl bg-background/70 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
