"use client";

import * as React from "react";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { getLeaveColumns } from "./columns";
import { leaveRequests as initialLeaveRequests, employees as seedEmployees } from "@/lib/data";
import type { LeaveRequest } from "@/lib/types";
import { pushRecentActivity, getLeaveTypes } from "@/lib/utils";
import { createCache } from "@/lib/cache";

const leaveCache = createCache<LeaveRequest[]>("nh_leave");

export default function LeavePage() {
  const [data, setData] = React.useState<LeaveRequest[]>(initialLeaveRequests);
  const [search, setSearch] = React.useState("");
  const employees = React.useMemo(() => {
    if (typeof window === 'undefined') return seedEmployees;
    try {
      const raw = localStorage.getItem('nh_employees');
      return raw ? JSON.parse(raw) : seedEmployees;
    } catch {
      return seedEmployees;
    }
  }, []);
  const [open, setOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<LeaveRequest | null>(null);

  // Simple local form state
  const [leaveTypes, setLeaveTypes] = React.useState(() => getLeaveTypes());
  const [employeeName, setEmployeeName] = React.useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState<string | undefined>(undefined);
  const [leaveType, setLeaveType] = React.useState<string>(leaveTypes[0] || "");

  React.useEffect(() => {
    const updateLeaveTypes = () => {
      const types = getLeaveTypes();
      setLeaveTypes(types);
      if (!types.includes(leaveType) && types.length > 0) {
        setLeaveType(types[0]);
      }
    };
    updateLeaveTypes();
    window.addEventListener('storage', updateLeaveTypes);
    return () => window.removeEventListener('storage', updateLeaveTypes);
  }, [leaveType]);
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [status, setStatus] = React.useState<LeaveRequest["status"]>("Pending");

  function resetForm() {
    setEmployeeName("");
    setSelectedEmployeeId(undefined);
    setLeaveType(leaveTypes[0] || "");
    setStartDate("");
    setEndDate("");
    setStatus("Pending");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!employeeName || !startDate || !endDate) {
      return;
    }
    const now = new Date();
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();
    const newRequest: LeaveRequest = {
      id: `leave-${Date.now()}`,
      employeeId: selectedEmployeeId || `emp-${Math.floor(Math.random() * 100000)}`,
      employeeName,
      leaveType,
      startDate,
      endDate,
      status,
      requestedAt: localIso,
    };
    setData((prev) => [newRequest, ...prev]);
    try {
      pushRecentActivity({ userName: 'Admin', userAvatar: 'AD', action: 'criou um pedido de licença para', target: employeeName });
    } catch {}
    setOpen(false);
    resetForm();
  }

  // Load persisted data on mount to avoid SSR/client mismatch
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const cachedData = leaveCache.get();
    if (cachedData) {
      setData(cachedData);
    } else {
      leaveCache.set(initialLeaveRequests);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save data whenever it changes
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    leaveCache.set(data);
  }, [data]);

  function onApprove(request: LeaveRequest) {
    setData((prev) => prev.map(r => r.id === request.id ? { ...r, status: 'Approved' } : r));
    try { pushRecentActivity({ userName: 'Admin', userAvatar: 'AD', action: 'aprovou', target: `pedido de licença de ${request.employeeName}` }); } catch {}
  }

  function onReject(request: LeaveRequest) {
    setData((prev) => prev.map(r => r.id === request.id ? { ...r, status: 'Rejected' } : r));
    try { pushRecentActivity({ userName: 'Admin', userAvatar: 'AD', action: 'rejeitou', target: `pedido de licença de ${request.employeeName}` }); } catch {}
  }

  function onEdit(request: LeaveRequest) {
    setEditing(request);
    setEmployeeName(request.employeeName);
    setLeaveType(request.leaveType);
    setStartDate(request.startDate);
    setEndDate(request.endDate);
    setStatus(request.status);
    if (request.employeeId) {
      setSelectedEmployeeId(request.employeeId);
    } else {
      const match = employees.find((e: any) => `${e.firstName} ${e.lastName}` === request.employeeName);
      setSelectedEmployeeId(match?.id);
    }
    setEditOpen(true);
  }

  function onDelete(request: LeaveRequest) {
    if (typeof window !== 'undefined' && !confirm('Excluir este pedido?')) return;
    setData((prev) => prev.filter((r) => r.id !== request.id));
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    if (!employeeName || !startDate || !endDate) {
      return;
    }
    setData((prev) => prev.map((r) => r.id === editing.id ? {
      ...r,
      employeeName,
      employeeId: selectedEmployeeId || r.employeeId,
      leaveType,
      startDate,
      endDate,
      status,
    } : r));
    setEditOpen(false);
    setEditing(null);
    resetForm();
  }

  return (
    <div className="flex flex-col h-screen">
      <Header title="Gestão de Licenças" onSearchSubmit={(q) => setSearch(q)} searchPlaceholder="Pesquisar licenças..." />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Pedidos de Licença</h2>
            <p className="text-muted-foreground">
              Aprove, rejeite e acompanhe todos os pedidos de licença dos funcionários.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Novo Pedido de Licença
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Pedido de Licença</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Funcionário</Label>
                <Select
                  value={selectedEmployeeId}
                  onValueChange={(v) => {
                    setSelectedEmployeeId(v);
                    const emp = employees.find((e: any) => e.id === v);
                    setEmployeeName(emp ? `${emp.firstName} ${emp.lastName}` : "");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um funcionário" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp: any) => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Licença</Label>
                    <Select value={leaveType} onValueChange={(v) => setLeaveType(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {leaveTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={status} onValueChange={(v) => setStatus(v as LeaveRequest["status"]) }>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pendente</SelectItem>
                        <SelectItem value="Approved">Aprovado</SelectItem>
                        <SelectItem value="Rejected">Rejeitado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Data de Início</Label>
                    <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Data de Término</Label>
                    <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Salvar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <DataTable columns={getLeaveColumns({ onApprove, onReject, onEdit, onDelete })} data={data} filterColumnId="employeeName" filterPlaceholder="Filtrar por funcionário..." searchValue={search} onSearchChange={setSearch} />

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Pedido de Licença</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Funcionário</Label>
                <Select
                  value={selectedEmployeeId}
                  onValueChange={(v) => {
                    setSelectedEmployeeId(v);
                    const emp = employees.find((e: any) => e.id === v);
                    setEmployeeName(emp ? `${emp.firstName} ${emp.lastName}` : "");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um funcionário" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp: any) => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Licença</Label>
                  <Select value={leaveType} onValueChange={(v) => setLeaveType(v as LeaveRequest["leaveType"]) }>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vacation">Férias</SelectItem>
                      <SelectItem value="Sick">Doença</SelectItem>
                      <SelectItem value="Personal">Pessoal</SelectItem>
                      <SelectItem value="Parental">Parental</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as LeaveRequest["status"]) }>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pendente</SelectItem>
                      <SelectItem value="Approved">Aprovado</SelectItem>
                      <SelectItem value="Rejected">Rejeitado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate-edit">Data de Início</Label>
                  <Input id="startDate-edit" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate-edit">Data de Término</Label>
                  <Input id="endDate-edit" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
