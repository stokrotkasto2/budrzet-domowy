'use client'

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from '@/components/ui/chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface CategoryChartProps {
  data: { category: string; amount: number; fill: string }[]
}

export function CategoryChart({ data }: CategoryChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Struktura Wydatków</CardTitle>
          <CardDescription>Podział poniesionych kosztów według kategorii</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground border-dashed border rounded-md">
          Brak wydatków.
        </CardContent>
      </Card>
    )
  }

  // Create dynamic config based on categories
  const chartConfig = data.reduce((acc, curr, index) => {
    acc[curr.category] = {
      label: curr.category,
      color: curr.fill || `hsl(var(--chart-${(index % 5) + 1}))`,
    }
    return acc
  }, {} as ChartConfig)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Struktura Wydatków</CardTitle>
        <CardDescription>Podział poniesionych kosztów według kategorii</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={data}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={60}
                strokeWidth={2}
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill || chartConfig[entry.category]?.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
