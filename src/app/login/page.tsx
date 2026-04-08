import { login, loginWithGoogle } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import Link from 'next/link'

interface Props {
  searchParams: { error?: string, message?: string }
}

export default function LoginPage({ searchParams }: Props) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4">
      <Card className="w-full max-w-md bg-card shadow-xl border-border/50 backdrop-blur-sm bg-card/90">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Zaloguj się</CardTitle>
          <CardDescription>
            Wpisz swój email i hasło aby zalogować się do budżetu.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {searchParams?.error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-md text-sm text-red-500 font-medium text-center">
              {searchParams.error}
            </div>
          )}
          {searchParams?.message && (
            <div className="p-3 bg-green-500/10 border border-green-500/50 rounded-md text-sm text-green-500 font-medium text-center">
              {searchParams.message}
            </div>
          )}
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Hasło</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button formAction={login} className="w-full font-semibold">
              Zaloguj
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Lub kontynuuj z
              </span>
            </div>
          </div>

          <form>
            <Button formAction={loginWithGoogle} variant="outline" className="w-full">
              Google
            </Button>
          </form>

        </CardContent>
        <CardFooter className="flex justify-center border-t border-border/20 pt-4">
          <p className="text-sm text-muted-foreground">
            Nie masz konta? <Link href="/register" className="font-medium text-primary hover:underline">Zarejestruj się</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
