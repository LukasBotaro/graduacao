'use client';

import * as React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import type { Employee } from '@/lib/types';
import { subMonths, format, getMonth, getYear } from 'date-fns';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { ptBR } from 'date-fns/locale';

function getTurnoverData(employees: Employee[]) {
  const data: { name: string; hires: number; terminations: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(new Date(), i);
    const monthKey = format(monthDate, 'MMM', { locale: ptBR });
    const month = getMonth(monthDate);
    const year = getYear(monthDate);

    const hires = employees.filter((e) => {
      const startDate = new Date(e.startDate);
      return getMonth(startDate) === month && getYear(startDate) === year;
    }).length;

    const terminations = employees.filter((e) => {
      if (e.status !== 'Terminated') return false;
      const startDate = new Date(e.startDate);
      const termMonth = getMonth(startDate);
      const termYear = getYear(startDate);
      return termMonth === month && termYear === year;
    }).length;

    data.push({ name: monthKey, hires, terminations });
  }
  return data;
}

type TurnoverChartProps = {
  employees: Employee[];
};

const chartConfig = {
  hires: {
    label: 'Novas Contratações',
    color: 'hsl(var(--primary))',
  },
  terminations: {
    label: 'Demissões',
    color: 'hsl(var(--destructive))',
  },
} satisfies ChartConfig;

export function TurnoverChart({ employees }: TurnoverChartProps) {
  const data = React.useMemo(() => getTurnoverData(employees), [employees]);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rotatividade Mensal</CardTitle>
        <CardDescription>
          Novas contratações vs. demissões nos últimos 6 meses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              top: 5,
              right: 20,
              left: -10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Legend />
            <Line
              dataKey="hires"
              type="monotone"
              stroke="var(--color-hires)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="terminations"
              type="monotone"
              stroke="var(--color-terminations)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
