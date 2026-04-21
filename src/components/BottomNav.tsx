"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BarChart3, PlusCircle, CreditCard, Award } from "lucide-react"

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/analytics", icon: BarChart3, label: "Analiza" },
    { href: "/transactions/new/expense", icon: PlusCircle, label: "Dodaj", primary: true },
    { href: "/subscriptions", icon: CreditCard, label: "Suby" },
    { href: "/achievements", icon: Award, label: "Odznaki" },
  ]

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border/50 pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                item.primary
                  ? "text-primary scale-110"
                  : isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon size={item.primary ? 28 : 20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
