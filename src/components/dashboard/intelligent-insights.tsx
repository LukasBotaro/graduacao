"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import type { Employee, LeaveRequest } from "@/lib/types";

interface Props {
  employees: Employee[];
  leaveRequests: LeaveRequest[];
}

export function IntelligentInsights({ employees, leaveRequests }: Props) {
  const insights = React.useMemo(() => {
    const now = new Date();
    const insights = [];

    const onLeave = leaveRequests.filter(
      (l) =>
        l.status === "Approved" &&
        new Date(l.startDate) <= now &&
        new Date(l.endDate) >= now
    ).length;
    if (onLeave > 5) {
      insights.push(
        "High number of employees on leave. Consider redistributing tasks."
      );
    }

    const pending = leaveRequests.filter((l) => l.status === "Pending").length;
    if (pending > 10) {
      insights.push("High number of pending leave requests. Review them soon.");
    }

    return insights;
  }, [employees, leaveRequests]);

  if (insights.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3">
        <Lightbulb className="text-yellow-500" />
        <CardTitle>Intelligent Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {insights.map((insight, i) => (
            <li key={i}>{insight}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
