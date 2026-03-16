import Link from "next/link"
import Image from "next/image"
import { Mail, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
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
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Mail className="h-8 w-8 text-primary" />
          </div>

          <h1 className="text-2xl font-bold font-serif text-foreground mb-3">
            {"Check Your Email"}
          </h1>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {"We've sent a confirmation link to your email address. Please click the link to verify your account and start shopping."}
          </p>

          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground">
              {"Didn't receive the email? Check your spam folder or try signing up again."}
            </p>
          </div>

          <Link href="/auth/login">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-6 text-base font-semibold">
              {"Go to Sign In"}
            </Button>
          </Link>
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
