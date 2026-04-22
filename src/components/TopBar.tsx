import Link from "next/link"
import { Button } from "@/components/ui/button"

interface TopBarProps {
  title: string
  backHref?: string
  backLabel?: string
  actionHref?: string
  actionLabel?: string
}

export default function TopBar({ 
  title, 
  backHref = "/", 
  backLabel = "Panel", 
  actionHref, 
  actionLabel 
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center px-4 justify-between">
        <div className="flex items-center gap-2">
          {backHref && (
            <Link href={backHref}>
              <Button variant="ghost" size="sm">{"<"} {backLabel}</Button>
            </Link>
          )}
          <span className="font-bold text-xl tracking-tight text-primary">{title}</span>
        </div>
        {actionHref && actionLabel && (
          <Link href={actionHref}>
            <Button size="sm">{actionLabel}</Button>
          </Link>
        )}
      </div>
    </header>
  )
}
