"use client";

import * as React from "react";
import Header from "@/components/header";
import StatsCard from "@/components/dashboard/stats-card";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { Activity, Users, Briefcase, CalendarOff } from "lucide-react";
import {
  employees as seedEmployees,
  leaveRequests as seedLeave,
} from "@/lib/data";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { IntelligentInsights } from "@/components/dashboard/intelligent-insights";
import type { Employee, LeaveRequest } from "@/lib/types";
import { subMonths } from "date-fns";

function loadEmployees(): Employee[] {
  if (typeof window === "undefined") return seedEmployees;
  try {
    const raw = localStorage.getItem("nh_employees");
    return raw ? JSON.parse(raw) : seedEmployees;
  } catch {
    return seedEmployees;
  }
}

function loadLeaveRequests(): LeaveRequest[] {
  if (typeof window === "undefined") return seedLeave;
  try {
    const raw = localStorage.getItem("nh_leave");
    return raw ? JSON.parse(raw) : seedLeave;
  } catch {
    return seedLeave;
  }
}

function calculateStats(employees: Employee[], leaveRequests: LeaveRequest[]) {
  const now = new Date();
  const oneMonthAgo = subMonths(now, 1);
  const twoMonthsAgo = subMonths(now, 2);

  const activeLastMonth = employees.filter(
    (e) => new Date(e.startDate) < oneMonthAgo && e.status !== "Terminated"
  ).length;
  const terminatedLastMonth = employees.filter(
    (e) =>
      e.status === "Terminated" &&
      new Date(e.startDate) >= twoMonthsAgo &&
      new Date(e.startDate) < oneMonthAgo
  ).length;
  const turnoverLastMonth =
    activeLastMonth > 0 ? (terminatedLastMonth / activeLastMonth) * 100 : 0;

  const totalEmployees = employees.filter(
    (e) => e.status !== "Terminated"
  ).length;
  const newHires = employees.filter(
    (e) => new Date(e.startDate) > oneMonthAgo
  ).length;
  const terminatedLastYear = employees.filter(
    (e) =>
      e.status === "Terminated" && new Date(e.startDate) > subMonths(now, 12)
  ).length;
  const turnoverRate =
    totalEmployees > 0
      ? parseFloat(((terminatedLastYear / totalEmployees) * 100).toFixed(1))
      : 0;

  const turnoverChange =
    turnoverLastMonth > 0
      ? parseFloat(
          (
            ((turnoverRate - turnoverLastMonth) / turnoverLastMonth) *
            100
          ).toFixed(1)
        )
      : turnoverRate > 0
      ? 100
      : 0;

  const today = new Date();
  const onLeave = leaveRequests.filter(
    (l) =>
      l.status === "Approved" &&
      new Date(l.startDate) <= today &&
      new Date(l.endDate) >= today
  ).length;
  const pendingRequests = leaveRequests.filter(
    (l) => l.status === "Pending"
  ).length;

  return {
    totalEmployees,
    newHires,
    turnoverRate,
    onLeave,
    pendingRequests,
    turnoverChange,
  };
}

export default function Dashboard() {
  const [employees, setEmployees] = React.useState<Employee[]>(seedEmployees);
  const [leaveRequests, setLeaveRequests] =
    React.useState<LeaveRequest[]>(seedLeave);

  React.useEffect(() => {
    setEmployees(loadEmployees());
    setLeaveRequests(loadLeaveRequests());
    const interval = setInterval(() => {
      setEmployees(loadEmployees());
      setLeaveRequests(loadLeaveRequests());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const stats = calculateStats(employees, leaveRequests);

  return (
    <div className="flex flex-col h-screen">
      <Header title="Painel" />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total de Funcionários"
            value={stats.totalEmployees.toString()}
            icon={Users}
            change={`+${stats.newHires} este mês`}
            changeType="increase"
          />
          <StatsCard
            title="De Licença Hoje"
            value={stats.onLeave.toString()}
            icon={CalendarOff}
            description="Funcionários atualmente em licença aprovada"
          />
          <StatsCard
            title="Pedidos Pendentes"
            value={stats.pendingRequests.toString()}
            icon={Briefcase}
            description="Pedidos de licença aguardando aprovação"
          />
          <StatsCard
            title="Taxa de Rotatividade"
            value={`${stats.turnoverRate}%`}
            icon={Activity}
            change={`${stats.turnoverChange > 0 ? "+" : ""}${
              stats.turnoverChange
            }% do último mês`}
            changeType={stats.turnoverChange > 0 ? "increase" : "decrease"}
          />
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <OverviewChart employees={employees} />
            <IntelligentInsights
              employees={employees}
              leaveRequests={leaveRequests}
            />
          </div>
          <div className="lg:col-span-1">
            <RecentActivity />
          </div>
        </div>
      </main>
    </div>
  );
}
