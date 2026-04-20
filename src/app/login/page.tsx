"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [isRegistering, setIsRegistering] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordRepeat, setPasswordRepeat] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (isRegistering) {
        if (password !== passwordRepeat) {
          setError("Podane hasła nie są identyczne!")
          setLoading(false)
          return
        }

        if (password.length <= 6) {
          setError("Hasło musi mieć więcej niż 6 znaków!")
          setLoading(false)
          return
        }
        
        if (!/[A-Z]/.test(password)) {
          setError("Hasło musi zawierać co najmniej 1 dużą literę!")
          setLoading(false)
          return
        }
        
        if (!/[^A-Za-z0-9]/.test(password)) {
          setError("Hasło musi zawierać co najmniej 1 znak specjalny!")
          setLoading(false)
          return
        }

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        })
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Wystąpił błąd przy rejestracji.")
        }
        
        // Zaloguj od razu po rejestracji
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        })

        if (result?.error) throw new Error(result.error)
        router.push("/")
        router.refresh()
      } else {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        })

        if (result?.error) throw new Error("Nieprawidłowe dane logowania.")
        router.push("/")
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" })
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/90 backdrop-blur-sm border-border/50 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">
            {isRegistering ? "Zarejestruj się" : "Zaloguj się"}
          </CardTitle>
          <CardDescription>
            {isRegistering 
              ? "Załóż nowe konto, aby zarządzać swoim budżetem" 
              : "Wprowadź swój email i hasło aby wejść do budżetu"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="twoj@email.com" 
                required 
                className="bg-background/50" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Hasło</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  className="bg-background/50 pr-10" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            {isRegistering && (
              <>
                <div className="space-y-1 mt-2 mb-4 bg-muted/30 p-3 rounded-md border border-border/50">
                  <p className="text-sm font-medium mb-2 text-foreground/80">Wymagania hasła:</p>
                  <ul className="text-xs space-y-1.5 list-none">
                    <li className={`flex items-center gap-2 ${password.length > 6 ? "text-green-500" : "text-muted-foreground"}`}>
                      <span className="w-4 flex justify-center">{password.length > 6 ? "✓" : "○"}</span> Więcej niż 6 znaków
                    </li>
                    <li className={`flex items-center gap-2 ${/[A-Z]/.test(password) ? "text-green-500" : "text-muted-foreground"}`}>
                      <span className="w-4 flex justify-center">{/[A-Z]/.test(password) ? "✓" : "○"}</span> Co najmniej 1 duża litera
                    </li>
                    <li className={`flex items-center gap-2 ${/[^A-Za-z0-9]/.test(password) ? "text-green-500" : "text-muted-foreground"}`}>
                      <span className="w-4 flex justify-center">{/[^A-Za-z0-9]/.test(password) ? "✓" : "○"}</span> Co najmniej 1 znak specjalny
                    </li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordRepeat">Powtórz hasło</Label>
                  <div className="relative">
                    <Input 
                      id="passwordRepeat" 
                      type={showPassword ? "text" : "password"} 
                      required 
                      className={`bg-background/50 pr-10 ${passwordRepeat && password !== passwordRepeat ? "border-destructive focus-visible:ring-destructive" : ""}`} 
                      value={passwordRepeat}
                      onChange={(e) => setPasswordRepeat(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordRepeat && password !== passwordRepeat && (
                    <p className="text-xs text-destructive mt-1 font-medium">Hasło jest niepoprawnie powtórzone!</p>
                  )}
                </div>
              </>
            )}
            
            {error && <p className="text-sm text-destructive font-medium text-center">{error}</p>}
            
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" disabled={loading}>
              {loading ? "Przetwarzanie..." : isRegistering ? "Zarejestruj" : "Zaloguj"}
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted-foreground/30" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Lub kontynuuj z</span>
            </div>
          </div>
          
          <Button variant="outline" type="button" className="w-full bg-background/50" onClick={handleGoogleSignIn}>
            <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <p className="mt-2 text-sm text-muted-foreground">
            {isRegistering ? "Masz już konto?" : "Nie masz konta?"}{" "}
            <button 
              type="button" 
              className="underline text-primary hover:text-primary/80"
              onClick={() => {
                setIsRegistering(!isRegistering)
                setError("")
                setPasswordRepeat("")
              }}
            >
              {isRegistering ? "Zaloguj się" : "Zarejestruj się"}
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
