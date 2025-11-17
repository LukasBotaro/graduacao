"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { recentActivities as seedRecent } from "@/lib/data";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { ScrollArea } from "../ui/scroll-area";
import type { RecentActivityItem } from "@/lib/types";

function loadActivities(): RecentActivityItem[] {
  if (typeof window === 'undefined') return seedRecent;
  try {
    const raw = localStorage.getItem('nh_activity');
    const extra = raw ? (JSON.parse(raw) as RecentActivityItem[]) : [];
    return [...extra, ...seedRecent].slice(0, 50);
  } catch {
    return seedRecent;
  }
}

export function RecentActivity() {
  const [items, setItems] = React.useState<RecentActivityItem[]>([]);
  React.useEffect(() => {
    setItems(loadActivities());
    const onStorage = () => setItems(loadActivities());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
        <CardDescription>
          Atualizações recentes de sua equipe e do sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          <div className="space-y-6">
            {items.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <Avatar>
                  <AvatarFallback>{activity.userAvatar}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-sm">
                  <div>
                    <span className="font-medium">{activity.userName}</span>{" "}
                    <span className="text-muted-foreground">{activity.action}</span>{" "}
                    <span className="font-medium text-primary">{activity.target}</span>.
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
