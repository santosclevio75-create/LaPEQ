import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Edit2, Trash2, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";


export default function AdminExperiments() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    categoryId: "",
    problem: "",
    objective: "",
    materials: "",
    procedure: "",
    chemicalExplanation: "",
    simplifiedExplanation: "",
    dailyApplication: "",
    epi: "",
    risks: "",
    estimatedTime: "",
    level: "fundamental" as const,
    imageUrl: "",
    videoUrl: "",
  });

  const { data: experiments = [], isLoading: experimentsLoading, refetch: refetchExperiments } = trpc.experiments.list.useQuery();
  const { data: categories = [] } = trpc.categories.list.useQuery();
  const createExperiment = trpc.experiments.create.useMutation();
  const updateExperiment = trpc.experiments.update.useMutation();
  const deleteExperiment = trpc.experiments.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos obrigatórios
    if (!formData.title.trim()) {
      toast.error("Título é obrigatório");
      return;
    }

    if (!formData.categoryId || formData.categoryId === "") {
      toast.error("Categoria é obrigatória");
      return;
    }

    const categoryId = parseInt(formData.categoryId, 10);
    if (isNaN(categoryId)) {
      toast.error("Categoria inválida");
      return;
    }

    try {
      if (editingId) {
        await updateExperiment.mutateAsync({
          id: editingId,
          data: {
            ...formData,
            categoryId: categoryId,
            materials: formData.materials,
            epi: formData.epi,
            imageUrl: formData.imageUrl || undefined,
            videoUrl: formData.videoUrl || undefined,
          },
        });
        toast.success("Experimento atualizado com sucesso");
      } else {
        await createExperiment.mutateAsync({
          ...formData,
          categoryId: categoryId,
          materials: formData.materials,
          epi: formData.epi,
          imageUrl: formData.imageUrl || undefined,
          videoUrl: formData.videoUrl || undefined,
        });
        toast.success("Experimento criado com sucesso");
      }

      setOpen(false);
      setEditingId(null);
      setFormData({
        title: "",
        categoryId: "",
        problem: "",
        objective: "",
        materials: "",
        procedure: "",
        chemicalExplanation: "",
        simplifiedExplanation: "",
        dailyApplication: "",
        epi: "",
        risks: "",
        estimatedTime: "",
        level: "fundamental",
        imageUrl: "",
        videoUrl: "",
      });
      refetchExperiments();
    } catch (error) {
      console.error("Erro ao salvar experimento:", error);
      toast.error(`Erro ao salvar experimento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este experimento?")) {
      try {
        await deleteExperiment.mutateAsync(id);
        toast.success("Experimento deletado com sucesso");
        refetchExperiments();
      } catch (error) {
        console.error("Erro ao deletar experimento:", error);
        toast.error(`Erro ao deletar experimento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }
  };

  const handleEdit = (experiment: any) => {
    setEditingId(experiment.id);
    setFormData({
      title: experiment.title,
      categoryId: experiment.categoryId.toString(),
      problem: experiment.problem || "",
      objective: experiment.objective || "",
      materials: experiment.materials || "",
      procedure: experiment.procedure || "",
      chemicalExplanation: experiment.chemicalExplanation || "",
      simplifiedExplanation: experiment.simplifiedExplanation || "",
      dailyApplication: experiment.dailyApplication || "",
      epi: experiment.epi || "",
      risks: experiment.risks || "",
      estimatedTime: experiment.estimatedTime || "",
      level: experiment.level,
      imageUrl: experiment.imageUrl || "",
      videoUrl: experiment.videoUrl || "",
    });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between" style={{marginTop: '-8px'}} style={{marginTop: '-12px', marginRight: '-29px', marginBottom: '-30px', marginLeft: '211px', width: '424px', height: '40px'}}>
        <div style={{width: '264px'}} style={{marginTop: '-106px', width: '262px', height: '91px'}}>
          <h2 className="text-2xl font-bold text-foreground">Gerenciar Experimentos</h2>
          <p className="mt-1 text-muted-foreground">
            {experiments.length} experimento{experiments.length !== 1 ? "s" : ""} cadastrado{experiments.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingId(null);
                setFormData({
                  title: "",
                  categoryId: "",
                  problem: "",
                  objective: "",
                  materials: "",
                  procedure: "",
                  chemicalExplanation: "",
                  simplifiedExplanation: "",
                  dailyApplication: "",
                  epi: "",
                  risks: "",
                  estimatedTime: "",
                  level: "fundamental",
                  imageUrl: "",
                });
              }}
              className="bg-accent text-accent-foreground hover:bg-accent/90" style={{marginTop: '-50px', marginBottom: '50px', marginLeft: '4px'}}
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Experimento
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-4xl border-border bg-card flex flex-col max-h-[98vh] h-[98vh]" style={{marginTop: '-161px'}}>
            <DialogHeader className="flex flex-row items-start justify-between pb-4 border-b border-border">
              <div className="flex-1" style={{height: '219px', width: '117px'}}>
                <DialogTitle className="text-foreground text-xl">
                  {editingId ? "Editar Experimento" : "Novo Experimento"}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Preencha os detalhes do experimento
                </DialogDescription>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground hover:bg-muted" style={{display: 'none', display: 'none'}}
              >
                <X className="h-5 w-5" />
              </Button>
            </DialogHeader>

            <Tabs defaultValue="basico" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="grid w-full grid-cols-5 bg-muted">
                <TabsTrigger value="basico">Básico</TabsTrigger>
                <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
                <TabsTrigger value="midia">Mídia</TabsTrigger>
                <TabsTrigger value="adicionais">Adicionais</TabsTrigger>
                <TabsTrigger value="seguranca">Segurança</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                {/* TAB 1: BÁSICO */}
                <TabsContent value="basico" className="flex-1 overflow-y-auto space-y-6 p-6">
                  {/* Título */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Título *
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="border-border bg-background text-foreground h-12 text-base"
                      required
                    />
                  </div>

                  {/* Categoria e Nível */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Categoria *
                      </label>
                      <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                        <SelectTrigger className="border-border bg-background text-foreground h-12 text-base">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent className="border-border bg-card">
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()} className="text-foreground">
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Nível *
                      </label>
                      <Select value={formData.level} onValueChange={(value: any) => setFormData({ ...formData, level: value })}>
                        <SelectTrigger className="border-border bg-background text-foreground h-12 text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-border bg-card">
                          <SelectItem value="fundamental" className="text-foreground">
                            Fundamental
                          </SelectItem>
                          <SelectItem value="medio" className="text-foreground">
                            Médio
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Problema Investigativo */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Problema Investigativo
                    </label>
                    <Textarea
                      value={formData.problem}
                      onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                      className="border-border bg-background text-foreground min-h-24 text-base resize-none"
                    />
                  </div>

                  {/* Objetivo */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Objetivo
                    </label>
                    <Textarea
                      value={formData.objective}
                      onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                      className="border-border bg-background text-foreground min-h-24 text-base resize-none"
                    />
                  </div>

                  {/* Tempo Estimado */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Tempo Estimado
                    </label>
                    <Input
                      value={formData.estimatedTime}
                      onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                      placeholder="ex: 30 minutos"
                      className="border-border bg-background text-foreground h-12 text-base"
                    />
                  </div>
                </TabsContent>

                {/* TAB 2: CONTEÚDO */}
                <TabsContent value="conteudo" className="flex-1 overflow-y-auto space-y-6 p-6">
                  {/* Materiais */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Materiais (um por linha)
                    </label>
                    <Textarea
                      value={formData.materials}
                      onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                      className="border-border bg-background text-foreground min-h-28 text-base resize-none"
                      placeholder="Item 1&#10;Item 2&#10;Item 3"
                    />
                  </div>

                  {/* Procedimento */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Procedimento
                    </label>
                    <Textarea
                      value={formData.procedure}
                      onChange={(e) => setFormData({ ...formData, procedure: e.target.value })}
                      className="border-border bg-background text-foreground min-h-32 text-base resize-none"
                    />
                  </div>

                  {/* Explicação Química */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Explicação Química
                    </label>
                    <Textarea
                      value={formData.chemicalExplanation}
                      onChange={(e) => setFormData({ ...formData, chemicalExplanation: e.target.value })}
                      className="border-border bg-background text-foreground min-h-24 text-base resize-none"
                    />
                  </div>

                </TabsContent>

                {/* TAB 3: MÍDIA */}
                <TabsContent value="midia" className="flex-1 overflow-y-auto space-y-6 p-6">
                  {/* URL da Imagem */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      URL da Imagem
                    </label>
                    <Input
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://exemplo.com/imagem.jpg"
                      className="border-border bg-background text-foreground h-12 text-base"
                      type="url"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Cole a URL da imagem do experimento. Use manus-upload-file para fazer upload.
                    </p>
                  </div>

                  {/* URL do Vídeo */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      URL do Vídeo
                    </label>
                    <Input
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      placeholder="https://exemplo.com/video.mp4"
                      className="border-border bg-background text-foreground h-12 text-base"
                      type="url"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Cole a URL do vídeo curto do experimento. Use manus-upload-file para fazer upload.
                    </p>
                  </div>
                </TabsContent>

                {/* TAB 3: INFORMAÇÕES ADICIONAIS */}
                <TabsContent value="adicionais" className="flex-1 overflow-y-auto space-y-6 p-6">
                  {/* Explicação Simplificada */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Explicação Simplificada
                    </label>
                    <Textarea
                      value={formData.simplifiedExplanation}
                      onChange={(e) => setFormData({ ...formData, simplifiedExplanation: e.target.value })}
                      className="border-border bg-background text-foreground min-h-24 text-base resize-none"
                    />
                  </div>

                  {/* Aplicação no Cotidiano */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Aplicação no Cotidiano
                    </label>
                    <Textarea
                      value={formData.dailyApplication}
                      onChange={(e) => setFormData({ ...formData, dailyApplication: e.target.value })}
                      className="border-border bg-background text-foreground min-h-24 text-base resize-none"
                    />
                  </div>
                </TabsContent>

                {/* TAB 3: SEGURANÇA */}
                <TabsContent value="seguranca" className="flex-1 overflow-y-auto space-y-6 p-6">
                  {/* EPIs */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      EPIs (um por linha)
                    </label>
                    <Textarea
                      value={formData.epi}
                      onChange={(e) => setFormData({ ...formData, epi: e.target.value })}
                      className="border-border bg-background text-foreground min-h-28 text-base resize-none"
                      placeholder="Óculos de segurança&#10;Luvas&#10;Avental"
                    />
                  </div>

                  {/* Riscos */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Riscos
                    </label>
                    <Textarea
                      value={formData.risks}
                      onChange={(e) => setFormData({ ...formData, risks: e.target.value })}
                      className="border-border bg-background text-foreground min-h-32 text-base resize-none"
                    />
                  </div>
                </TabsContent>

                {/* Botões */}
                <div className="flex gap-3 p-6 border-t border-border bg-muted/30">
                  <Button
                    type="submit"
                    disabled={createExperiment.isPending || updateExperiment.isPending}
                    className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 h-12 text-base font-semibold"
                  >
                    {createExperiment.isPending || updateExperiment.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      editingId ? "Atualizar" : "Criar"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="flex-1 border-border text-foreground hover:bg-muted h-12 text-base font-semibold"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Experiments List */}
      {experimentsLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : experiments.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Nenhum experimento cadastrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {experiments.map((exp) => {
            const category = categories.find((c) => c.id === exp.categoryId);
            return (
              <Card key={exp.id} className="border-border bg-card" style={{paddingLeft: '276px'}}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-foreground" style={{backgroundColor: '#cae4e8'}}>{exp.title}</CardTitle>
                      <CardDescription className="text-muted-foreground" style={{backgroundColor: '#ffffff'}}>
                        {category?.name} • {exp.level === "fundamental" ? "Fundamental" : "Médio"}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(exp)}
                        className="border-border text-foreground hover:bg-muted"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(exp.id)}
                        className="border-border text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
