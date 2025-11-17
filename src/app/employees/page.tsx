"use client";

import * as React from "react";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { getEmployeeColumns } from "./columns";
import { Badge } from "@/components/ui/badge";
import { Download, FileText } from "lucide-react";
import type { Document as EmployeeDocument } from "@/lib/types";
import { employees as initialEmployees } from "@/lib/data";
import type { Employee } from "@/lib/types";
import {
  pushRecentActivity,
  getDepartments,
  parseCurrency,
  formatCurrency,
} from "@/lib/utils";
import { createCache } from "@/lib/cache";

const employeesCache = createCache<Employee[]>("nh_employees");
const documentsCache = createCache<EmployeeDocument[]>("nh_documents");

function getInitialData(): Employee[] {
  if (typeof window === "undefined") {
    return initialEmployees;
  }
  const cached = employeesCache.get();
  return cached || initialEmployees;
}

export default function EmployeesPage() {
  const [data, setData] = React.useState<Employee[]>(getInitialData);
  const [search, setSearch] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Employee | null>(null);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [viewing, setViewing] = React.useState<Employee | null>(null);
  const [viewDocs, setViewDocs] = React.useState<EmployeeDocument[]>([]);

  // Simple local form state
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [jobTitle, setJobTitle] = React.useState("");
  const [departments, setDepartments] = React.useState(() => getDepartments());
  const [department, setDepartment] = React.useState<string>(
    departments[0] || ""
  );

  React.useEffect(() => {
    const updateDepartments = () => {
      const depts = getDepartments();
      setDepartments(depts);
      if (!depts.includes(department) && depts.length > 0) {
        setDepartment(depts[0]);
      }
    };
    updateDepartments();
    window.addEventListener("storage", updateDepartments);
    return () => window.removeEventListener("storage", updateDepartments);
  }, [department]);
  const [salary, setSalary] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [status, setStatus] = React.useState<Employee["status"]>("Active");

  function resetForm() {
    setFirstName("");
    setLastName("");
    setEmail("");
    setJobTitle("");
    setDepartment(departments[0] || "");
    setSalary("");
    setStartDate("");
    setStatus("Active");
  }

  function handleSalaryChange(value: string) {
    // Remove tudo exceto números
    const numbers = value.replace(/\D/g, "");
    if (!numbers) {
      setSalary("");
      return;
    }
    // Converte para número e formata
    const num = parseFloat(numbers) / 100; // Divide por 100 para considerar centavos
    setSalary(formatCurrency(num));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numericSalary = parseCurrency(salary);
    if (
      !firstName ||
      !lastName ||
      !email ||
      !jobTitle ||
      !startDate ||
      numericSalary <= 0
    ) {
      return; // minimal guard; could show a toast in future
    }
    const newEmployee: Employee = {
      id: `emp-${Date.now()}`,
      firstName,
      lastName,
      email,
      jobTitle,
      department,
      salary: numericSalary,
      startDate,
      status,
    };
    setData((prev) => [newEmployee, ...prev]);
    try {
      pushRecentActivity({
        userName: "Admin",
        userAvatar: "AD",
        action: "adicionou",
        target: `${firstName} ${lastName} como novo funcionário`,
      });
    } catch {}
    setOpen(false);
    resetForm();
  }

  // Load persisted data on mount to avoid SSR/client mismatch
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const cachedData = employeesCache.get();
    if (!cachedData) {
      employeesCache.set(initialEmployees);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save data whenever it changes
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    employeesCache.set(data);
  }, [data]);

  function onEdit(employee: Employee) {
    setEditing(employee);
    setFirstName(employee.firstName);
    setLastName(employee.lastName);
    setEmail(employee.email);
    setJobTitle(employee.jobTitle);
    setDepartment(employee.department);
    setSalary(formatCurrency(employee.salary));
    setStartDate(employee.startDate);
    setStatus(employee.status);
    setEditOpen(true);
  }

  function onDelete(employee: Employee) {
    if (typeof window !== "undefined" && !confirm("Excluir este registro?"))
      return;
    setData((prev) => prev.filter((e) => e.id !== employee.id));
    try {
      pushRecentActivity({
        userName: "Admin",
        userAvatar: "AD",
        action: "excluiu",
        target: `registro de ${employee.firstName} ${employee.lastName}`,
      });
    } catch {}
  }

  function onView(employee: Employee) {
    setViewing(employee);
    const docs = documentsCache.get() || [];
    const fullName = `${employee.firstName} ${employee.lastName}`;
    const filtered = docs.filter(
      (d) => d.employeeId === employee.id || d.employeeName === fullName
    );
    setViewDocs(filtered);
    setViewOpen(true);
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const numericSalary = parseCurrency(salary);
    if (
      !firstName ||
      !lastName ||
      !email ||
      !jobTitle ||
      !startDate ||
      numericSalary <= 0
    ) {
      return;
    }
    setData((prev) =>
      prev.map((e) =>
        e.id === editing.id
          ? {
              ...e,
              firstName,
              lastName,
              email,
              jobTitle,
              department,
              salary: numericSalary,
              startDate,
              status,
            }
          : e
      )
    );
    setEditOpen(false);
    setEditing(null);
    resetForm();
    try {
      pushRecentActivity({
        userName: "Admin",
        userAvatar: "AD",
        action: "atualizou",
        target: `registro de ${firstName} ${lastName}`,
      });
    } catch {}
  }

  return (
    <div className="flex flex-col h-screen">
      <Header
        title="Funcionários"
        onSearchSubmit={(q) => setSearch(q)}
        searchPlaceholder="Pesquisar funcionários..."
      />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Registros de Funcionários
            </h2>
            <p className="text-muted-foreground">
              Gerencie as informações e o status de sua equipe.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Funcionário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Funcionário</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Cargo</Label>
                    <Input
                      id="jobTitle"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Departamento</Label>
                    <Select
                      value={department}
                      onValueChange={(v) => setDepartment(v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salary">Salário (BRL)</Label>
                    <Input
                      id="salary"
                      value={salary}
                      onChange={(e) => handleSalaryChange(e.target.value)}
                      placeholder="R$ 0,00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Data de Início</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={status}
                    onValueChange={(v) => setStatus(v as Employee["status"])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Ativo</SelectItem>
                      <SelectItem value="On Leave">De Licença</SelectItem>
                      <SelectItem value="Terminated">Demitido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="submit">Salvar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <DataTable
          columns={getEmployeeColumns({ onView, onEdit, onDelete })}
          data={data}
          filterColumnId="name"
          filterPlaceholder="Filtrar por nome..."
          searchValue={search}
          onSearchChange={setSearch}
        />

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Funcionário</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName-edit">Nome</Label>
                  <Input
                    id="firstName-edit"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName-edit">Sobrenome</Label>
                  <Input
                    id="lastName-edit"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-edit">Email</Label>
                <Input
                  id="email-edit"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle-edit">Cargo</Label>
                  <Input
                    id="jobTitle-edit"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Departamento</Label>
                  <Select
                    value={department}
                    onValueChange={(v) => setDepartment(v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary-edit">Salário (BRL)</Label>
                  <Input
                    id="salary-edit"
                    value={salary}
                    onChange={(e) => handleSalaryChange(e.target.value)}
                    placeholder="R$ 0,00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate-edit">Data de Início</Label>
                  <Input
                    id="startDate-edit"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as Employee["status"])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Ativo</SelectItem>
                    <SelectItem value="On Leave">De Licença</SelectItem>
                    <SelectItem value="Terminated">Demitido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalhes do Funcionário</DialogTitle>
            </DialogHeader>
            {viewing && (
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Nome</div>
                  <div className="font-medium">
                    {viewing.firstName} {viewing.lastName}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Email</div>
                    <div className="font-medium break-all">{viewing.email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Cargo</div>
                    <div className="font-medium">{viewing.jobTitle}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Departamento
                    </div>
                    <div className="font-medium">{viewing.department}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    <div>
                      <Badge variant="outline">{viewing.status}</Badge>
                    </div>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="text-sm text-muted-foreground mb-2">
                    Documentos
                  </div>
                  {viewDocs.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      Nenhum documento encontrado para este funcionário.
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {viewDocs.map((doc) => (
                        <li
                          key={doc.id}
                          className="flex items-center justify-between gap-3 rounded-md border p-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <FileText className="h-4 w-4 text-primary shrink-0" />
                            <div className="min-w-0">
                              <div className="font-medium truncate">
                                {doc.fileName}
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-2">
                                <Badge variant="outline">
                                  {doc.documentType}
                                </Badge>
                                <span>{doc.fileSize}</span>
                              </div>
                            </div>
                          </div>
                          {doc.fileDataUrl ? (
                            <a
                              href={doc.fileDataUrl}
                              download={doc.fileName}
                              className="inline-flex"
                            >
                              <Button
                                asChild
                                variant="ghost"
                                size="sm"
                                className="gap-2"
                              >
                                <span>
                                  <Download className="h-3 w-3" />
                                  Baixar
                                </span>
                              </Button>
                            </a>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2"
                              disabled
                            >
                              <Download className="h-3 w-3" />
                              Baixar
                            </Button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
