"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { requestPasswordReset, verifyAndResetPassword } from "@/app/actions/password-reset"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react"

export default function ResetPasswordPage() {
  const [step, setStep] = useState(1) // 1: Email, 2: Code & New Password, 3: Success
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await requestPasswordReset(email)
    if (result.error) {
      setError(result.error)
    } else {
      setStep(2)
    }
    setLoading(false)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await verifyAndResetPassword(email, code, newPassword)
    if (result.error) {
      setError(result.error)
    } else {
      setStep(3)
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/40 backdrop-blur-md border-border/50 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        {step === 1 && (
          <>
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-3xl font-bold tracking-tight">Zresetuj hasło</CardTitle>
              <CardDescription>
                Wprowadź swój adres email, aby otrzymać kod do zmiany hasła.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRequestCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="twoj@email.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
                {error && <p className="text-sm text-destructive font-medium text-center">{error}</p>}
                <Button type="submit" className="w-full font-semibold" disabled={loading}>
                  {loading ? "Wysyłanie..." : "Wyślij kod"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="justify-center">
              <Link href="/login" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2">
                <ArrowLeft size={14} /> Wróć do logowania
              </Link>
            </CardFooter>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-3xl font-bold tracking-tight">Wprowadź kod</CardTitle>
              <CardDescription>
                Wysłaliśmy 6-cyfrowy kod na adres {email}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Kod potwierdzający</Label>
                  <Input 
                    id="code" 
                    type="text" 
                    placeholder="123456" 
                    required 
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="bg-background/50 text-center text-2xl tracking-widest"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nowe hasło</Label>
                  <div className="relative">
                    <Input 
                      id="newPassword" 
                      type={showPassword ? "text" : "password"} 
                      required 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-background/50 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-sm text-destructive font-medium text-center">{error}</p>}
                <Button type="submit" className="w-full font-semibold" disabled={loading}>
                  {loading ? "Zmiana hasła..." : "Zmień hasło"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="justify-center">
              <button 
                onClick={() => setStep(1)} 
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2"
              >
                <ArrowLeft size={14} /> Zmień email
              </button>
            </CardFooter>
          </>
        )}

        {step === 3 && (
          <>
            <CardHeader className="text-center py-10">
              <div className="mx-auto w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={32} />
              </div>
              <CardTitle className="text-2xl font-bold">Hasło zmienione!</CardTitle>
              <CardDescription>
                Twoje hasło zostało pomyślnie zaktualizowane. Możesz się teraz zalogować.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login">
                <Button className="w-full font-semibold">Zaloguj się</Button>
              </Link>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}
