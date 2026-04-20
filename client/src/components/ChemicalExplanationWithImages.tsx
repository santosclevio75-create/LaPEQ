import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { trpc } from "@/lib/trpc";
import ImageLightbox from "./ImageLightbox";

interface ChemicalExplanationWithImagesProps {
  experimentId: number;
  explanation: string;
  isAdmin?: boolean;
}

export default function ChemicalExplanationWithImages({
  experimentId,
  explanation,
  isAdmin = false,
}: ChemicalExplanationWithImagesProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: images = [], refetch } = trpc.experimentImages.getByExperiment.useQuery(experimentId);
  const uploadMutation = trpc.experimentImages.uploadAndAdd.useMutation();
  const deleteMutation = trpc.experimentImages.delete.useMutation();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        alert("Por favor, selecione uma imagem JPG ou PNG");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Arquivo muito grande. Máximo 5MB");
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        await uploadMutation.mutateAsync({
          experimentId,
          fileData: base64,
          fileName: selectedFile.name,
          caption: caption || selectedFile.name,
        });

        // Reset form
        setSelectedFile(null);
        setCaption("");
        setPreview(null);
        refetch();
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Erro ao fazer upload da imagem");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (imageId: number) => {
    if (confirm("Tem certeza que deseja remover esta imagem?")) {
      try {
        await deleteMutation.mutateAsync(imageId);
        refetch();
      } catch (error) {
        console.error("Delete failed:", error);
        alert("Erro ao remover imagem");
      }
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader style={{display: 'none'}}>
        <CardTitle className="text-foreground">Explicação Química</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6" style={{backgroundColor: '#eaf5fb'}}>
        {/* Texto da explicação */}
        <p className="text-muted-foreground" style={{backgroundColor: '#eaf5fb'}}>{explanation}</p>

        {/* Galeria de imagens */}
        {images.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Imagens da Explicação</h3>
            <div className="grid gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <div className="relative overflow-hidden rounded-lg border border-border bg-muted">
                    <img
                      src={image.imageUrl}
                      alt={image.caption || "Imagem"}
                      className="w-full h-auto max-h-96 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => {
                        // Could open lightbox here
                      }}
                    />
                  </div>
                  {image.caption && (
                    <p className="mt-2 text-sm text-muted-foreground">{image.caption}</p>
                  )}
                  {isAdmin && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(image.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload de imagem (apenas admin) */}
        {isAdmin && (
          <div className="space-y-4 border-t border-border pt-4">
            <h3 className="font-semibold text-foreground">Adicionar Imagem</h3>

            {/* Preview */}
            {preview && (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-auto max-h-64 object-cover rounded-lg border border-border"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPreview(null);
                    setSelectedFile(null);
                  }}
                  className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* File input */}
            <div className="space-y-2">
              <label className="block">
                <div className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent transition-colors bg-muted/50">
                  <div className="flex flex-col items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium text-foreground">
                      {selectedFile ? selectedFile.name : "Clique ou arraste uma imagem"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">JPG ou PNG, máx 5MB</p>
                  </div>
                  <Input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </label>
            </div>

            {/* Caption input */}
            {selectedFile && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Legenda (opcional)
                </label>
                <Input
                  type="text"
                  placeholder="Descreva o que a imagem mostra..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="bg-background border-border"
                />
              </div>
            )}

            {/* Upload button */}
            {selectedFile && (
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full bg-accent hover:bg-accent/90"
              >
                {isUploading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Enviar Imagem
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
