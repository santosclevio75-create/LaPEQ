import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ExperimentImageManagerProps {
  experimentId: number;
}

export default function ExperimentImageManager({ experimentId }: ExperimentImageManagerProps) {
  const [open, setOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<"url" | "file">("file");
  const [formData, setFormData] = useState({
    imageUrl: "",
    caption: "",
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: images = [], isLoading: imagesLoading, refetch: refetchImages } = trpc.experimentImages.getByExperiment.useQuery(experimentId);
  const uploadAndAdd = trpc.experimentImages.uploadAndAdd.useMutation();
  const addImage = trpc.experimentImages.add.useMutation();
  const deleteImage = trpc.experimentImages.delete.useMutation();

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem válido");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 5MB");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uploadMode === "file") {
      if (!selectedFile || !preview) {
        toast.error("Selecione uma imagem");
        return;
      }

      try {
        // Converter arquivo para base64 para enviar
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = reader.result as string;
          
          try {
            await uploadAndAdd.mutateAsync({
              experimentId,
              fileData: base64,
              fileName: selectedFile.name,
              caption: formData.caption || undefined,
            });
            toast.success("Imagem adicionada com sucesso");
            resetForm();
            refetchImages();
          } catch (error) {
            console.error("Erro ao adicionar imagem:", error);
            toast.error(`Erro ao adicionar imagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
          }
        };
        reader.readAsDataURL(selectedFile);
      } catch (error) {
        console.error("Erro ao processar imagem:", error);
        toast.error("Erro ao processar imagem");
      }
    } else {
      // Modo URL
      if (!formData.imageUrl.trim()) {
        toast.error("URL da imagem é obrigatória");
        return;
      }

      try {
        await addImage.mutateAsync({
          experimentId,
          imageUrl: formData.imageUrl,
          caption: formData.caption || undefined,
          order: images.length,
        });
        toast.success("Imagem adicionada com sucesso");
        resetForm();
        refetchImages();
      } catch (error) {
        console.error("Erro ao adicionar imagem:", error);
        toast.error(`Erro ao adicionar imagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }
  };

  const resetForm = () => {
    setFormData({ imageUrl: "", caption: "" });
    setPreview(null);
    setSelectedFile(null);
    setOpen(false);
    setUploadMode("file");
  };

  const handleDeleteImage = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar esta imagem?")) {
      try {
        await deleteImage.mutateAsync(id);
        toast.success("Imagem deletada com sucesso");
        refetchImages();
      } catch (error) {
        console.error("Erro ao deletar imagem:", error);
        toast.error(`Erro ao deletar imagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Imagens do Experimento</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Imagem
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-card max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">Adicionar Imagem</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Faça upload de uma imagem ou cole a URL
              </DialogDescription>
            </DialogHeader>

            {/* Abas de modo */}
            <div className="flex gap-2 mb-4">
              <Button
                size="sm"
                variant={uploadMode === "file" ? "default" : "outline"}
                onClick={() => setUploadMode("file")}
                className={uploadMode === "file" ? "bg-accent text-accent-foreground" : ""}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
              <Button
                size="sm"
                variant={uploadMode === "url" ? "default" : "outline"}
                onClick={() => setUploadMode("url")}
                className={uploadMode === "url" ? "bg-accent text-accent-foreground" : ""}
              >
                URL
              </Button>
            </div>

            <form onSubmit={handleAddImage} className="space-y-4">
              {uploadMode === "file" ? (
                <>
                  {/* Drag and drop area */}
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      dragActive
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-accent/50"
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">
                      Arraste a imagem aqui ou clique para selecionar
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, WebP até 5MB
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleFileSelect(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                  </div>

                  {/* Preview */}
                  {preview && (
                    <div className="space-y-2">
                      <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                        <img
                          src={preview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPreview(null);
                            setSelectedFile(null);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {selectedFile?.name} - {selectedFile ? ((selectedFile.size / 1024 / 1024).toFixed(2)) : '0'}MB
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    URL da Imagem
                  </label>
                  <Input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="border-border bg-background text-foreground"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Legenda (Opcional)
                </label>
                <Textarea
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  placeholder="Descreva o que a imagem mostra..."
                  className="border-border bg-background text-foreground"
                  rows={2}
                />
              </div>

              <Button
                type="submit"
                disabled={uploadAndAdd.isPending || addImage.isPending || (uploadMode === "file" && !preview) || (uploadMode === "url" && !formData.imageUrl)}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {uploadAndAdd.isPending || addImage.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  "Adicionar Imagem"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {imagesLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      ) : images.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Nenhuma imagem adicionada ainda</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <Card key={image.id} className="border-border bg-card overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square overflow-hidden bg-muted group">
                <img
                  src={image.imageUrl}
                  alt={image.caption || "Imagem do experimento"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext x='50' y='50' font-size='12' fill='%23999' text-anchor='middle' dominant-baseline='middle'%3EImagem não encontrada%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
              <CardContent className="pt-4">
                {image.caption && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{image.caption}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteImage(image.id)}
                    className="flex-1 border-border text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
