import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

export default function AdminDesignStyles() {
  const [componentName, setComponentName] = useState("");
  const [cssClass, setCssClass] = useState("");
  const [cssValue, setCssValue] = useState("");

  const { data: styles = [], refetch } = trpc.designStyles.list.useQuery();
  const saveStyle = trpc.designStyles.save.useMutation();
  const deleteStyle = trpc.designStyles.delete.useMutation();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!componentName || !cssClass || !cssValue) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      await saveStyle.mutateAsync({
        componentName,
        cssClass,
        cssValue,
      });
      toast.success("Estilo salvo com sucesso");
      setComponentName("");
      setCssClass("");
      setCssValue("");
      refetch();
    } catch (error) {
      console.error("Erro ao salvar estilo:", error);
      toast.error(`Erro ao salvar estilo: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este estilo?")) {
      try {
        await deleteStyle.mutateAsync(id);
        toast.success("Estilo deletado com sucesso");
        refetch();
      } catch (error) {
        console.error("Erro ao deletar estilo:", error);
        toast.error(`Erro ao deletar estilo: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Novo Estilo</CardTitle>
          <CardDescription>Configure cores, tamanhos e estilos para os componentes</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome do Componente</label>
              <Input
                placeholder="Ex: Home, ExperimentsPage, Header"
                value={componentName}
                onChange={(e) => setComponentName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Classe CSS</label>
              <Input
                placeholder="Ex: bg-primary, text-xl, border-green-600"
                value={cssClass}
                onChange={(e) => setCssClass(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Valor CSS</label>
              <Input
                placeholder="Ex: #10b981, 1.25rem, 4px"
                value={cssValue}
                onChange={(e) => setCssValue(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" />
              Salvar Estilo
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estilos Salvos</CardTitle>
          <CardDescription>Gerenciar estilos de design do site</CardDescription>
        </CardHeader>
        <CardContent>
          {styles.length === 0 ? (
            <p className="text-muted-foreground">Nenhum estilo salvo ainda</p>
          ) : (
            <div className="space-y-3">
              {styles.map((style) => (
                <div
                  key={style.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg bg-card"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{style.componentName}</p>
                    <p className="text-xs text-muted-foreground">
                      {style.cssClass}: {style.cssValue}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(style.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
