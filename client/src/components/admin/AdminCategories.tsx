import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Edit2, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminCategories() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
  });

  const { data: categories = [], isLoading: categoriesLoading, refetch: refetchCategories } = trpc.categories.list.useQuery();
  const createCategory = trpc.categories.create.useMutation();
  const updateCategory = trpc.categories.update.useMutation();
  const deleteCategory = trpc.categories.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Nome da categoria é obrigatório");
      return;
    }

    try {
      if (editingId) {
        await updateCategory.mutateAsync({
          id: editingId,
          data: formData,
        });
        toast.success("Categoria atualizada com sucesso");
      } else {
        await createCategory.mutateAsync(formData);
        toast.success("Categoria criada com sucesso");
      }

      setOpen(false);
      setEditingId(null);
      setFormData({
        name: "",
        description: "",
        icon: "",
      });
      refetchCategories();
    } catch (error) {
      toast.error("Erro ao salvar categoria");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar esta categoria?")) {
      try {
        await deleteCategory.mutateAsync(id);
        toast.success("Categoria deletada com sucesso");
        refetchCategories();
      } catch (error) {
        toast.error("Erro ao deletar categoria");
      }
    }
  };

  const handleEdit = (category: any) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description || "",
      icon: category.icon || "",
    });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gerenciar Categorias</h2>
          <p className="mt-1 text-muted-foreground">
            {categories.length} categoria{categories.length !== 1 ? "s" : ""} cadastrada{categories.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingId(null);
                setFormData({
                  name: "",
                  description: "",
                  icon: "",
                });
              }}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-card">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {editingId ? "Editar Categoria" : "Nova Categoria"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Preencha os detalhes da categoria
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Nome *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="border-border bg-background text-foreground"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Descrição
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="border-border bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Ícone (nome do lucide-react)
                </label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="ex: Cloud, Droplets, Layers, Leaf"
                  className="border-border bg-background text-foreground"
                />
              </div>

              <Button
                type="submit"
                disabled={createCategory.isPending || updateCategory.isPending}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {createCategory.isPending || updateCategory.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  editingId ? "Atualizar" : "Criar"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories List */}
      {categoriesLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : categories.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Nenhuma categoria cadastrada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {categories.map((cat) => (
            <Card key={cat.id} className="border-border bg-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-foreground">{cat.name}</CardTitle>
                    {cat.description && (
                      <CardDescription className="text-muted-foreground">
                        {cat.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(cat)}
                      className="border-border text-foreground hover:bg-muted"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(cat.id)}
                      className="border-border text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
