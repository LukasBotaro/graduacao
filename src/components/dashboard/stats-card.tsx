import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

type StatsCardProps = {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
};

export default function StatsCard({ title, value, icon: Icon, description, change, changeType }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={cn(
            "text-xs text-muted-foreground",
            changeType === 'increase' && 'text-success',
            changeType === 'decrease' && 'text-destructive',
          )}>
            {change}
          </p>
        )}
        {description && !change && (
            <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
