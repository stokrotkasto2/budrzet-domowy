"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface ChartData {
  name: string
  value: number
  color: string
}

export default function AnalysisChart({ data, title }: { data: ChartData[], title: string }) {
  return (
    <div className="flex flex-col items-center w-full">
      <h3 className="text-lg font-semibold mb-4 text-primary tracking-tight">{title}</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              animationBegin={0}
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(255,255,255,0.1)" />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(15, 15, 15, 0.9)', 
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '12px' 
              }}
              itemStyle={{ color: '#fff' }}
              formatter={(value: any) => [`${parseFloat(value).toFixed(2)} PLN`, 'Kwota']}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry: any) => {
                const total = data.reduce((acc, curr) => acc + curr.value, 0);
                const percent = ((entry.payload.value / total) * 100).toFixed(1);
                return <span className="text-sm font-medium text-muted-foreground">{value} ({percent}%)</span>;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
