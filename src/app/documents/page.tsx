"use client";

import * as React from "react";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { documents as initialDocuments, employees as seedEmployees } from "@/lib/data";
import type { Document as EmployeeDocument } from "@/lib/types";
import { PlusCircle, FileText, Download, User, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { pushRecentActivity, getDocumentTypes } from "@/lib/utils";
import { createCache } from "@/lib/cache";

const documentsCache = createCache<EmployeeDocument[]>("nh_documents");

export default function DocumentsPage() {
  const [data, setData] = React.useState<EmployeeDocument[]>(initialDocuments);
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
  const [editing, setEditing] = React.useState<EmployeeDocument | null>(null);

  // Simple local form state
  const [documentTypes, setDocumentTypes] = React.useState(() => getDocumentTypes());
  const [employeeName, setEmployeeName] = React.useState("");
  const [documentType, setDocumentType] = React.useState<string>(documentTypes[0] || "");

  React.useEffect(() => {
    const updateDocumentTypes = () => {
      const types = getDocumentTypes();
      setDocumentTypes(types);
      if (!types.includes(documentType) && types.length > 0) {
        setDocumentType(types[0]);
      }
    };
    updateDocumentTypes();
    window.addEventListener('storage', updateDocumentTypes);
    return () => window.removeEventListener('storage', updateDocumentTypes);
  }, [documentType]);
  const [fileName, setFileName] = React.useState("");
  const [fileSize, setFileSize] = React.useState("");
  const [fileDataUrl, setFileDataUrl] = React.useState<string | undefined>(undefined);
  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState<string | undefined>(undefined);

  function resetForm() {
    setEmployeeName("");
    setDocumentType(documentTypes[0] || "");
    setFileName("");
    setFileSize("");
    setFileDataUrl(undefined);
    setSelectedEmployeeId(undefined);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!employeeName || !fileName) {
      return;
    }
    const now = new Date();
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();
    const newDoc: EmployeeDocument = {
      id: `doc-${Date.now()}`,
      employeeId: selectedEmployeeId || `emp-${Math.floor(Math.random() * 100000)}`,
      employeeName,
      documentType,
      fileName,
      uploadDate: localIso,
      fileSize: fileSize || "--",
      fileDataUrl,
    };
    setData((prev) => [newDoc, ...prev]);
    try {
      pushRecentActivity({ userName: 'Admin', userAvatar: 'AD', action: 'adicionou', target: `documento ${fileName}` });
    } catch {}
    setOpen(false);
    resetForm();
  }

  function humanFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.round(kb)}KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(2)}MB`;
  }

  function handleCreateFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    setFileSize(humanFileSize(f.size));
    const reader = new FileReader();
    reader.onload = () => {
      setFileDataUrl(typeof reader.result === 'string' ? reader.result : undefined);
    };
    reader.readAsDataURL(f);
  }

  // Load persisted data on mount to avoid SSR/client mismatch
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const cachedData = documentsCache.get();
    if (cachedData) {
      setData(cachedData);
    } else {
      documentsCache.set(initialDocuments);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save data whenever it changes
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    documentsCache.set(data);
  }, [data]);

  function onEdit(doc: EmployeeDocument) {
    setEditing(doc);
    setEmployeeName(doc.employeeName);
    setDocumentType(doc.documentType);
    setFileName(doc.fileName);
    setFileSize(doc.fileSize);
    setFileDataUrl(doc.fileDataUrl);
    if (doc.employeeId) {
      setSelectedEmployeeId(doc.employeeId);
    } else {
      const match = employees.find((e: any) => `${e.firstName} ${e.lastName}` === doc.employeeName);
      setSelectedEmployeeId(match?.id);
    }
    setEditOpen(true);
  }

  function onDelete(doc: EmployeeDocument) {
    if (typeof window !== 'undefined' && !confirm('Excluir este documento?')) return;
    setData((prev) => prev.filter((d) => d.id !== doc.id));
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    if (!employeeName || !fileName) {
      return;
    }
    setData((prev) => prev.map((d) => d.id === editing.id ? {
      ...d,
      employeeName,
      employeeId: selectedEmployeeId || d.employeeId,
      documentType,
      fileName,
      fileSize: fileSize || "--",
      fileDataUrl,
    } : d));
    setEditOpen(false);
    setEditing(null);
    resetForm();
  }

  function handleEditFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    setFileSize(humanFileSize(f.size));
    const reader = new FileReader();
    reader.onload = () => {
      setFileDataUrl(typeof reader.result === 'string' ? reader.result : undefined);
    };
    reader.readAsDataURL(f);
  }

  return (
    <div className="flex flex-col h-screen">
      <Header title="Gestão de Documentos" />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Documentos dos Funcionários</h2>
            <p className="text-muted-foreground">
              Armazene e gerencie com segurança todos os documentos relacionados aos funcionários.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Enviar Documento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Documento</DialogTitle>
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
                <div className="space-y-2">
                  <Label htmlFor="file-upload">Arquivo</Label>
                  <Input id="file-upload" type="file" onChange={handleCreateFileChange} accept="*/*" />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Documento</Label>
                  <Select value={documentType} onValueChange={(v) => setDocumentType(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fileName">Nome do Arquivo</Label>
                  <Input id="fileName" placeholder="ex: Contrato_Joao_Silva.pdf" value={fileName} onChange={(e) => setFileName(e.target.value)} required />
                </div>
                <DialogFooter>
                  <Button type="submit">Salvar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.map((doc) => (
                <Card key={doc.id}>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <FileText className="h-8 w-8 text-primary" />
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{doc.documentType}</Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Abrir menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => onEdit(doc)}>Editar</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive" onClick={() => onDelete(doc)}>Excluir</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="text-base font-medium truncate">{doc.fileName}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                           <User className="h-3 w-3" /> {doc.employeeName}
                        </CardDescription>
                    </CardContent>
                    <CardFooter className="flex justify-between text-xs text-muted-foreground">
                        <span>{format(new Date(doc.uploadDate), 'd MMM, yyyy')}</span>
                    {doc.fileDataUrl ? (
                      <a href={doc.fileDataUrl} download={doc.fileName} className="inline-flex">
                        <Button asChild variant="ghost" size="sm" className="gap-2">
                          <span>
                            <Download className="h-3 w-3" />
                            {doc.fileSize}
                          </span>
                        </Button>
                      </a>
                    ) : (
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Download className="h-3 w-3" />
                        {doc.fileSize}
                      </Button>
                    )}
                    </CardFooter>
                </Card>
            ))}
        </div>
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Documento</DialogTitle>
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
              <div className="space-y-2">
                <Label htmlFor="file-upload-edit">Arquivo</Label>
                <Input id="file-upload-edit" type="file" onChange={handleEditFileChange} accept="*/*" />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Documento</Label>
                <Select value={documentType} onValueChange={(v) => setDocumentType(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fileName-edit">Nome do Arquivo</Label>
                <Input id="fileName-edit" placeholder="ex: Contrato_Joao_Silva.pdf" value={fileName} onChange={(e) => setFileName(e.target.value)} required />
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
