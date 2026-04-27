"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ChartData {
  month: string;
  properties: number;
  leads: number;
  calls: number;
}

export function DashboardChart({ data }: { data: ChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="month" className="text-xs text-muted-foreground" tick={{ fontSize: 12 }} />
        <YAxis className="text-xs text-muted-foreground" tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid var(--border)",
            background: "var(--card)",
            fontSize: "13px",
          }}
        />
        <Legend />
        <Bar dataKey="properties" name="Propiedades" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        <Bar dataKey="leads" name="Leads" fill="hsl(var(--chart-2, 142 76% 36%))" radius={[4, 4, 0, 0]} />
        <Bar dataKey="calls" name="Llamadas" fill="hsl(var(--chart-3, 217 91% 60%))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
