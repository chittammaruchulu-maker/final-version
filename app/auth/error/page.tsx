import Link from "next/link"
import Image from "next/image"
import { AlertTriangle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AuthErrorPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-block mb-6">
          <Image
            src="/images/logo.png"
            alt="Chittamma Ruchulu"
            width={160}
            height={50}
            className="mx-auto w-[160px] h-auto"
          />
        </Link>

        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>

          <h1 className="text-2xl font-bold font-serif text-foreground mb-3">
            {"Authentication Error"}
          </h1>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {"Something went wrong during authentication. This could be due to an expired link or an invalid request. Please try again."}
          </p>

          <div className="flex flex-col gap-3">
            <Link href="/auth/login">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-6 text-base font-semibold">
                {"Try Sign In Again"}
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-full py-6 text-base font-semibold">
                {"Create New Account"}
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            {"Back to Home"}
          </Link>
        </div>
      </div>
    </main>
  )
}
