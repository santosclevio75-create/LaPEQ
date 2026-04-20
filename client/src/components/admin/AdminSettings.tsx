import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminSettings() {
  const [logoSize, setLogoSize] = useState<"small" | "medium" | "large">("medium");
  
  const { data: currentLogoSize } = trpc.settings.getLogoSize.useQuery();
  const updateLogoSize = trpc.settings.updateLogoSize.useMutation();

  const handleUpdateLogoSize = async () => {
    try {
      await updateLogoSize.mutateAsync({ size: logoSize });
      toast.success("Tamanho da logo atualizado com sucesso");
    } catch (error) {
      toast.error("Erro ao atualizar tamanho da logo");
    }
  };

  const sizeLabels = {
    small: "Pequena (h-8)",
    medium: "Média (h-12)",
    large: "Grande (h-16)",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Configurações do Site</h2>
        <p className="mt-1 text-muted-foreground">
          Personalize as configurações gerais do site
        </p>
      </div>

      {/* Logo Size Settings */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Tamanho da Logo</CardTitle>
          <CardDescription className="text-muted-foreground">
            Ajuste o tamanho da logo LAPEQ-UFOB no header
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Selecione o tamanho
            </label>
            <Select value={logoSize} onValueChange={(value: any) => setLogoSize(value)}>
              <SelectTrigger className="border-border bg-background text-foreground w-full max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-card">
                <SelectItem value="small" className="text-foreground">
                  {sizeLabels.small}
                </SelectItem>
                <SelectItem value="medium" className="text-foreground">
                  {sizeLabels.medium}
                </SelectItem>
                <SelectItem value="large" className="text-foreground">
                  {sizeLabels.large}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleUpdateLogoSize}
              disabled={updateLogoSize.isPending}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {updateLogoSize.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Atualizando...
                </>
              ) : (
                "Atualizar Tamanho"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Image Upload Info */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Upload de Imagens</CardTitle>
          <CardDescription className="text-muted-foreground">
            Como adicionar imagens aos experimentos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Passo 1:</strong> Faça upload da imagem usando o comando:
            </p>
            <code className="block bg-background p-2 rounded text-xs overflow-x-auto">
              manus-upload-file --webdev /caminho/para/imagem.jpg
            </code>
            
            <p className="mt-3">
              <strong>Passo 2:</strong> Copie a URL retornada
            </p>
            
            <p className="mt-3">
              <strong>Passo 3:</strong> Cole a URL no campo "URL da Imagem" ao criar/editar um experimento
            </p>
            
            <p className="mt-3">
              <strong>Passo 4:</strong> A imagem aparecerá na página de detalhes do experimento
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
