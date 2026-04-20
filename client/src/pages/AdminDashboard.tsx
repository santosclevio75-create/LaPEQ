import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useState } from "react";
import { Loader2, LogOut, Bell, Settings, User, Menu } from "lucide-react";
import { trpc } from "@/lib/trpc";
import AdminExperiments from "@/components/admin/AdminExperiments";
import AdminCategories from "@/components/admin/AdminCategories";
import AdminLoans from "@/components/admin/AdminLoans";
import AdminBookLoans from "@/components/admin/AdminBookLoans";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminDesignStyles from "@/components/admin/AdminDesignStyles";
import AdminDashboardPanel from "@/components/admin/AdminDashboardPanel";
import NotificationBell from "@/components/NotificationBell";
import { Beaker } from "lucide-react";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Remove duplicate useAuth import - already imported above

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
        <div className="container flex min-h-screen flex-col items-center justify-center">
          <Card className="border-border bg-card max-w-md">
            <CardHeader>
              <CardTitle className="text-foreground">Acesso Restrito</CardTitle>
              <CardDescription className="text-muted-foreground">
                Você precisa ser um administrador para acessar esta página
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Fazer Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Header */}
      <header className="border-b-2 border-blue-600 bg-gradient-to-r from-blue-900 to-blue-800 shadow-lg">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white p-2">
              <Beaker className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
              <p className="mt-1 text-sm text-blue-100">
                Bem-vindo, {user?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {/* Voltar ao Site */}
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-white hover:bg-blue-700"
            >
              ← Voltar ao Site
            </Button>
            
            {/* Notificações */}
            <Button
              variant="ghost"
              size="icon"
              className="relative text-white hover:bg-blue-700"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
            </Button>
            
            {/* Configurações */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-blue-700"
              onClick={() => setActiveTab("settings")}
            >
              <Settings className="h-5 w-5" />
            </Button>
            
            {/* Perfil */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-blue-700"
            >
              <User className="h-5 w-5" />
            </Button>
            
            {/* Sair */}
            <Button
              variant="outline"
              onClick={() => logout()}
              className="border-white text-white hover:bg-blue-700 hover:text-white"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 bg-card border border-border">
            <TabsTrigger value="dashboard" className="text-foreground">
              Painel
            </TabsTrigger>
            <TabsTrigger value="experiments" className="text-foreground">
              Experimentos
            </TabsTrigger>
            <TabsTrigger value="categories" className="text-foreground">
              Categorias
            </TabsTrigger>
            <TabsTrigger value="loans" className="text-foreground">
              Empréstimos (Kits)
            </TabsTrigger>
            <TabsTrigger value="bookloans" className="text-foreground">
              Empréstimos (Livros)
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-foreground">
              Configurações
            </TabsTrigger>
            <TabsTrigger value="design" className="text-foreground">
              Design
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <AdminDashboardPanel />
          </TabsContent>

          <TabsContent value="experiments" className="mt-6">
            <AdminExperiments />
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <AdminCategories />
          </TabsContent>

          <TabsContent value="loans" className="mt-6">
            <AdminLoans />
          </TabsContent>

          <TabsContent value="bookloans" className="mt-6">
            <AdminBookLoans />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <AdminSettings />
          </TabsContent>

          <TabsContent value="design" className="mt-6">
            <AdminDesignStyles />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
