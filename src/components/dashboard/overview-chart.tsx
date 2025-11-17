'use client';

import * as React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Employee } from '@/lib/types';
import { subMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function getHeadcountData(employees: Employee[]) {
  const data = [];
  for (let i = 11; i >= 0; i--) {
    const month = subMonths(new Date(), i);
    const monthKey = format(month, 'MMM', { locale: ptBR });
    const activeThisMonth = employees.filter(e => new Date(e.startDate) <= month && (e.status !== 'Terminated')).length;
    data.push({ name: monthKey, total: activeThisMonth });
  }
  return data;
}

type OverviewChartProps = {
  employees: Employee[];
};

export function OverviewChart({ employees }: OverviewChartProps) {
  const data = React.useMemo(() => getHeadcountData(employees), [employees]);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visão Geral</CardTitle>
        <CardDescription>Número de funcionários nos últimos 12 meses.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
                contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                }}
            />
            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
