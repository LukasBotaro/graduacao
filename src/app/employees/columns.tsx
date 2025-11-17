'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Employee } from '@/lib/types';
import { MoreHorizontal } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';


type EmployeeColumnHandlers = {
  onView?: (employee: Employee) => void;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
};

export const getEmployeeColumns = (handlers: EmployeeColumnHandlers = {}): ColumnDef<Employee>[] => [
  {
    id: 'name',
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    header: 'Nome',
    cell: ({ row }) => {
        const employee = row.original;
        const name = `${employee.firstName} ${employee.lastName}`;
        const fallback = `${employee.firstName[0]}${employee.lastName[0]}`;
        return (
            <div className="flex items-center gap-3">
                <Avatar>
                    <AvatarImage src={`https://picsum.photos/seed/${employee.id}/40/40`} alt={name} data-ai-hint="person face" />
                    <AvatarFallback>{fallback}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="font-medium">{name}</span>
                    <span className="text-sm text-muted-foreground">{employee.email}</span>
                </div>
            </div>
        )
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
        const status = row.getValue('status') as string;
        let translatedStatus: string;
        switch (status) {
            case 'Active':
                translatedStatus = 'Ativo';
                break;
            case 'On Leave':
                translatedStatus = 'De Licença';
                break;
            case 'Terminated':
                translatedStatus = 'Demitido';
                break;
            default:
                translatedStatus = status;
        }

        return (
            <Badge variant={status === 'Active' ? 'default' : status === 'On Leave' ? 'secondary' : 'destructive'} 
                   className={cn(
                       status === 'Active' && 'bg-green-500/20 text-green-400 border-green-500/20 hover:bg-green-500/30',
                       status === 'On Leave' && 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/30',
                       status === 'Terminated' && 'bg-red-500/20 text-red-400 border-red-500/20 hover:bg-red-500/30'
                   )}>
                {translatedStatus}
            </Badge>
        )
    }
  },
  {
    accessorKey: 'department',
    header: 'Departamento',
  },
  {
    accessorKey: 'jobTitle',
    header: 'Cargo',
  },
  {
    accessorKey: 'salary',
    header: () => <div className="text-right">Salário</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('salary'));
      const formatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const employee = row.original;

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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(employee.id)}>
              Copiar ID do funcionário
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handlers.onView?.(employee)}>Ver detalhes</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlers.onEdit?.(employee)}>Editar registro</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => handlers.onDelete?.(employee)}>
              Excluir registro
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
