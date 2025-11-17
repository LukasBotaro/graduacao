'use client';

import * as React from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import type { Employee } from '@/lib/types';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';

function getDepartmentData(employees: Employee[]) {
  const departmentCounts = employees.reduce((acc, employee) => {
    if (employee.status === 'Active') {
      acc[employee.department] = (acc[employee.department] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(departmentCounts).map(([name, value]) => ({
    name,
    value,
  }));
}

type DemographicsChartProps = {
  employees: Employee[];
};

const chartConfig = {
  value: {
    label: 'Funcionários',
  },
  Engineering: { label: 'Engenharia', color: 'hsl(var(--chart-1))' },
  Marketing: { label: 'Marketing', color: 'hsl(var(--chart-2))' },
  Design: { label: 'Design', color: 'hsl(var(--chart-3))' },
  Sales: { label: 'Vendas', color: 'hsl(var(--chart-4))' },
  HR: { label: 'RH', color: 'hsl(var(--chart-5))' },
} satisfies ChartConfig;

export function DemographicsChart({ employees }: DemographicsChartProps) {
  const data = React.useMemo(() => getDepartmentData(employees), [employees]);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Demografia dos Funcionários</CardTitle>
        <CardDescription>
          Distribuição de funcionários por departamento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[300px]"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              innerRadius={60}
              paddingAngle={2}
            >
              {data.map((entry) => (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={`var(--color-${entry.name})`}
                />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              className="mt-4"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
