'use client';

import { ColumnDef } from '@tanstack/react-table';
import { LeaveRequest } from '@/lib/types';
import { MoreHorizontal, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

type LeaveColumnHandlers = {
  onView?: (request: LeaveRequest) => void;
  onEdit?: (request: LeaveRequest) => void;
  onDelete?: (request: LeaveRequest) => void;
  onApprove?: (request: LeaveRequest) => void;
  onReject?: (request: LeaveRequest) => void;
};

export const getLeaveColumns = (handlers: LeaveColumnHandlers = {}): ColumnDef<LeaveRequest>[] => [
  {
    accessorKey: 'employeeName',
    header: 'Funcionário',
  },
  {
    accessorKey: 'leaveType',
    header: 'Tipo de Licença',
    cell: ({ row }) => {
        return <span>{row.original.leaveType}</span>
    }
  },
  {
    accessorKey: 'dateRange',
    header: 'Datas',
    cell: ({ row }) => {
        const { startDate, endDate } = row.original;
        const formattedStart = format(parseLocalDate(startDate), 'd MMM, yyyy', { locale: ptBR });
        const formattedEnd = format(parseLocalDate(endDate), 'd MMM, yyyy', { locale: ptBR });
        return <span>{formattedStart} - {formattedEnd}</span>
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
        const status = row.getValue('status') as string;
        let icon;
        let className;
        let translatedStatus: string;
        switch (status) {
            case 'Approved':
                icon = <CheckCircle className="h-4 w-4" />;
                className = 'bg-green-500/20 text-green-400 border-green-500/20 hover:bg-green-500/30';
                translatedStatus = 'Aprovado';
                break;
            case 'Rejected':
                icon = <XCircle className="h-4 w-4" />;
                className = 'bg-red-500/20 text-red-400 border-red-500/20 hover:bg-red-500/30';
                translatedStatus = 'Rejeitado';
                break;
            default:
                icon = <Clock className="h-4 w-4" />;
                className = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/30';
                translatedStatus = 'Pendente';
        }
        return (
            <Badge variant="outline" className={cn("gap-1.5", className)}>
                {icon}
                {translatedStatus}
            </Badge>
        )
    }
  },
  {
    accessorKey: 'requestedAt',
    header: 'Solicitado em',
    cell: ({ row }) => {
        const date = row.getValue('requestedAt') as string;
        return format(new Date(date), 'd MMM, yyyy', { locale: ptBR });
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const request = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handlers.onView?.(request)}>Ver Detalhes</DropdownMenuItem>
            <DropdownMenuSeparator />
            {request.status === 'Pending' && (
              <>
                <DropdownMenuItem className="text-green-500 focus:text-green-500 focus:bg-green-500/10" onClick={() => handlers.onApprove?.(request)}>Aprovar</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-red-500/10" onClick={() => handlers.onReject?.(request)}>Rejeitar</DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handlers.onEdit?.(request)}>Editar</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => handlers.onDelete?.(request)}>Excluir</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
