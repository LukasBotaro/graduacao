"use client";

import * as React from "react";
import Header from "@/components/header";
import { DemographicsChart } from "@/components/reports/demographics-chart";
import { TurnoverChart } from "@/components/reports/turnover-chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { employees as seedEmployees } from "@/lib/data";
import type { Employee } from "@/lib/types";
import { Activity, Users } from "lucide-react";
import { subMonths } from "date-fns";

function loadEmployees(): Employee[] {
  if (typeof window === 'undefined') return seedEmployees;
  try {
    const raw = localStorage.getItem('nh_employees');
    return raw ? JSON.parse(raw) : seedEmployees;
  } catch {
    return seedEmployees;
  }
}

function calculateStats(employees: Employee[]) {
  const totalEmployees = employees.filter(e => e.status !== 'Terminated').length;
  const terminatedLastYear = employees.filter(e => e.status === 'Terminated' && new Date(e.startDate) > subMonths(new Date(), 12)).length;
  const avgEmployees = totalEmployees;
  const turnoverRate = avgEmployees > 0 ? parseFloat(((terminatedLastYear / avgEmployees) * 100).toFixed(1)) : 0;
  return { totalEmployees, turnoverRate };
}

export default function ReportsPage() {
  const [employees, setEmployees] = React.useState<Employee[]>(seedEmployees);

  React.useEffect(() => {
    setEmployees(loadEmployees());
    const interval = setInterval(() => {
      setEmployees(loadEmployees());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const { totalEmployees, turnoverRate } = calculateStats(employees);

  return (
    <div className="flex flex-col h-screen">
      <Header title="Relatórios e Análises" />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Análise de RH</h2>
            <p className="text-muted-foreground">
              Insights baseados em dados para uma melhor tomada de decisão.
            </p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 mb-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Funcionários Ativos</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalEmployees}</div>
                    <p className="text-xs text-muted-foreground">Força de trabalho ativa total</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Taxa Anual de Rotatividade</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{turnoverRate}%</div>
                    <p className="text-xs text-muted-foreground">Baseado nos últimos 12 meses</p>
                </CardContent>
            </Card>
        </div>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          <DemographicsChart employees={employees} />
          <TurnoverChart employees={employees} />
        </div>
      </main>
    </div>
  );
}
