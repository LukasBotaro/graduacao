"use client";

import * as React from "react";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Trash2 } from "lucide-react";
import { getDepartments, setDepartments, getLeaveTypes, setLeaveTypes, getDocumentTypes, setDocumentTypes } from "@/lib/utils";

export default function SettingsPage() {
  const [departments, setDepartmentsState] = React.useState<string[]>([]);
  const [leaveTypes, setLeaveTypesState] = React.useState<string[]>([]);
  const [documentTypes, setDocumentTypesState] = React.useState<string[]>([]);
  const [newDept, setNewDept] = React.useState("");
  const [newLeaveType, setNewLeaveType] = React.useState("");
  const [newDocType, setNewDocType] = React.useState("");

  React.useEffect(() => {
    setDepartmentsState(getDepartments());
    setLeaveTypesState(getLeaveTypes());
    setDocumentTypesState(getDocumentTypes());
  }, []);

  function handleAddDepartment() {
    if (!newDept.trim()) return;
    const updated = [...departments, newDept.trim()];
    setDepartmentsState(updated);
    setDepartments(updated);
    setNewDept("");
  }

  function handleRemoveDepartment(dept: string) {
    const updated = departments.filter(d => d !== dept);
    setDepartmentsState(updated);
    setDepartments(updated);
  }

  function handleAddLeaveType() {
    if (!newLeaveType.trim()) return;
    const updated = [...leaveTypes, newLeaveType.trim()];
    setLeaveTypesState(updated);
    setLeaveTypes(updated);
    setNewLeaveType("");
  }

  function handleRemoveLeaveType(type: string) {
    const updated = leaveTypes.filter(t => t !== type);
    setLeaveTypesState(updated);
    setLeaveTypes(updated);
  }

  function handleAddDocumentType() {
    if (!newDocType.trim()) return;
    const updated = [...documentTypes, newDocType.trim()];
    setDocumentTypesState(updated);
    setDocumentTypes(updated);
    setNewDocType("");
  }

  function handleRemoveDocumentType(type: string) {
    const updated = documentTypes.filter(t => t !== type);
    setDocumentTypesState(updated);
    setDocumentTypes(updated);
  }

  return (
    <div className="flex flex-col h-screen">
      <Header title="Configurações" />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Configurações da Aplicação</h2>
            <p className="text-muted-foreground">
              Gerencie as configurações e preferências do seu sistema.
            </p>
        </div>

        <Tabs defaultValue="types" className="w-full">
          <TabsList>
            <TabsTrigger value="types">Tipos</TabsTrigger>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="general">Geral</TabsTrigger>
          </TabsList>

          <TabsContent value="types" className="mt-6">
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Departamentos</CardTitle>
                  <CardDescription>Gerencie os departamentos disponíveis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Novo departamento"
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddDepartment()}
                    />
                    <Button onClick={handleAddDepartment} size="icon">
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {departments.map((dept) => (
                      <div key={dept} className="flex items-center justify-between p-2 border rounded">
                        <span>{dept}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveDepartment(dept)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tipos de Licença</CardTitle>
                  <CardDescription>Gerencie os tipos de licença disponíveis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Novo tipo de licença"
                      value={newLeaveType}
                      onChange={(e) => setNewLeaveType(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddLeaveType()}
                    />
                    <Button onClick={handleAddLeaveType} size="icon">
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {leaveTypes.map((type) => (
                      <div key={type} className="flex items-center justify-between p-2 border rounded">
                        <span>{type}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveLeaveType(type)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tipos de Documento</CardTitle>
                  <CardDescription>Gerencie os tipos de documento disponíveis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Novo tipo de documento"
                      value={newDocType}
                      onChange={(e) => setNewDocType(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddDocumentType()}
                    />
                    <Button onClick={handleAddDocumentType} size="icon">
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {documentTypes.map((type) => (
                      <div key={type} className="flex items-center justify-between p-2 border rounded">
                        <span>{type}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveDocumentType(type)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Perfil</CardTitle>
                <CardDescription>Atualize as informações da sua conta.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" defaultValue="Roberto H." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="roberto.h@example.com" />
                </div>
                <Separator />
                <div className="space-y-2">
                    <Label htmlFor="current-password">Senha Atual</Label>
                    <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="new-password">Nova Senha</Label>
                    <Input id="new-password" type="password" />
                </div>
              </CardContent>
              <CardHeader>
                <Button>Salvar Alterações</Button>
              </CardHeader>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>Gerencie como você recebe notificações.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2 p-4 rounded-lg border">
                  <div className="space-y-0.5">
                    <Label className="text-base">Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba emails para novos pedidos de licença e atualizações.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between space-x-2 p-4 rounded-lg border">
                  <div className="space-y-0.5">
                    <Label className="text-base">Notificações Push</Label>
                     <p className="text-sm text-muted-foreground">
                      Receba notificações push para eventos importantes.
                    </p>
                  </div>
                  <Switch />
                </div>
                 <div className="flex items-center justify-between space-x-2 p-4 rounded-lg border">
                  <div className="space-y-0.5">
                    <Label className="text-base">Resumos Semanais</Label>
                     <p className="text-sm text-muted-foreground">
                      Receba um resumo semanal das atividades de RH.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
              <CardHeader>
                <Button>Salvar Preferências</Button>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="general" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Geral</CardTitle>
                <CardDescription>Gerencie as configurações gerais da aplicação.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <p className="text-sm text-muted-foreground">O idioma da interface da aplicação.</p>
                  {/* Real language switching would require more setup */}
                   <Button variant="outline" className="w-[200px]" disabled>Português (Brasil)</Button>
                </div>
                 <Separator />
                <div className="space-y-2">
                  <Label htmlFor="theme">Tema</Label>
                   <p className="text-sm text-muted-foreground">Selecione o tema de cores para a aplicação.</p>
                   <div className="flex items-center space-x-2">
                     <Button variant="outline" disabled>Escuro</Button>
                     <Button variant="ghost" disabled>Claro</Button>
                   </div>
                </div>
              </CardContent>
              <CardHeader>
                <Button>Salvar Configurações</Button>
              </CardHeader>
            </Card>
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
}
