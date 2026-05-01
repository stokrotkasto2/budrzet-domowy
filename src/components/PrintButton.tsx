"use client"

import { Button } from "@/components/ui/button"

export default function PrintButton() {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <Button onClick={handlePrint} className="bg-primary text-primary-foreground">
      Drukuj / Zapisz PDF
    </Button>
  )
}
