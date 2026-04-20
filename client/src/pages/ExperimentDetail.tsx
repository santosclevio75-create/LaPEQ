import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Beaker, ChevronLeft, AlertCircle, Shield, Clock, BookOpen, Zap, Lightbulb } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import ImageLightbox from "@/components/ImageLightbox";
import ExperimentImageManager from "@/components/admin/ExperimentImageManager";
import ChemicalExplanationWithImages from "@/components/ChemicalExplanationWithImages";
import { AdminOnly } from "@/components/AdminOnly";
import { useAuth } from "@/_core/hooks/useAuth";

// Cores para cada categoria
const CATEGORY_COLORS: Record<number, { bg: string; border: string; text: string }> = {
  1: { bg: "bg-blue-600", border: "border-blue-600", text: "text-blue-800" }, // Atmosfera
  2: { bg: "bg-green-600", border: "border-green-600", text: "text-green-800" }, // Solo
  3: { bg: "bg-cyan-600", border: "border-cyan-600", text: "text-cyan-800" }, // Água
  4: { bg: "bg-emerald-600", border: "border-emerald-600", text: "text-emerald-800" }, // Sustentabilidade
  5: { bg: "bg-amber-600", border: "border-amber-600", text: "text-amber-800" }, // Biomas brasileiros
  6: { bg: "bg-purple-600", border: "border-purple-600", text: "text-purple-800" }, // Ciência, tecnologia e cotidiano
};

export default function ExperimentDetail() {
  const [, navigate] = useLocation();
  const [experimentId, setExperimentId] = useState<number | null>(null);

  // Get experiment ID from URL
  useEffect(() => {
    const match = window.location.pathname.match(/\/experiments\/(\d+)/);
    if (match) {
      setExperimentId(parseInt(match[1]));
    }
  }, []);

  const { data: experiment, isLoading } = trpc.experiments.getById.useQuery(experimentId || 0, {
    enabled: experimentId !== null,
  });
  const { data: categories = [] } = trpc.categories.list.useQuery();
  const { data: images = [] } = trpc.experimentImages.getByExperiment.useQuery(experimentId || 0, {
    enabled: experimentId !== null,
  });
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!experiment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container py-12">
          <Button
            variant="ghost"
            onClick={() => navigate("/experiments")}
            className="mb-4 text-blue-600 hover:bg-blue-50"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div className="rounded-lg border-2 border-gray-300 bg-white p-12 text-center">
            <Beaker className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-lg font-semibold text-gray-900">Experimento não encontrado</h2>
          </div>
        </div>
      </div>
    );
  }

  const category = categories.find((c) => c.id === experiment.categoryId);
  const colors = CATEGORY_COLORS[experiment.categoryId] || CATEGORY_COLORS[1];
  
  let materials: string[] = [];
  try {
    materials = experiment.materials ? JSON.parse(experiment.materials) : [];
  } catch (e) {
    materials = experiment.materials ? experiment.materials.split('\n').filter((m: string) => m.trim()) : [];
  }
  
  let epi: string[] = [];
  try {
    epi = experiment.epi ? JSON.parse(experiment.epi) : [];
  } catch (e) {
    epi = experiment.epi ? experiment.epi.split('\n').filter((e: string) => e.trim()) : [];
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className={`${colors.bg} text-white py-8 shadow-lg`}>
        <div className="container">
          <Button
            variant="ghost"
            onClick={() => navigate("/experiments")}
            className="mb-4 text-white hover:bg-white/20"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-4xl font-bold mb-2">{experiment.title}</h1>
          {category && (
            <p className="text-white/90 text-lg">
              Categoria: <span className="font-semibold">{category.name}</span>
            </p>
          )}
          <div className="flex gap-4 mt-4">
            <span className="inline-block rounded-full bg-white/20 px-4 py-2 text-sm font-medium">
              {experiment.level === "fundamental" ? "Fundamental" : "Médio"}
            </span>
            {experiment.estimatedTime && (
              <span className="inline-block rounded-full bg-white/20 px-4 py-2 text-sm font-medium">
                ⏱️ {experiment.estimatedTime}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="container py-12">
        <div className="grid gap-8">
          {/* Problema Investigativo */}
          {experiment.problem && (
            <Card className="border-2 border-gray-200 hover:shadow-lg transition-shadow" style={{backgroundColor: '#eaf5fb'}}>
              <CardHeader className="bg-gray-100 border-b-2 border-gray-200" style={{backgroundColor: '#b8dbdb'}}>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Problema Investigativo
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 text-lg leading-relaxed">{experiment.problem}</p>
              </CardContent>
            </Card>
          )}

          {/* Objetivo */}
          {experiment.objective && (
            <Card className="border-2 border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader className="bg-blue-50 border-b-2 border-blue-200" style={{backgroundColor: '#ededed', paddingLeft: '93px'}}>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Lightbulb className="h-5 w-5 text-blue-600" />
                  Objetivo
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">{experiment.objective}</p>
              </CardContent>
            </Card>
          )}

          {/* Materiais */}
          {materials.length > 0 && (
            <Card className="border-2 border-gray-200 hover:shadow-lg transition-shadow" style={{backgroundColor: '#eaf5fb'}}>
              <CardHeader className="bg-green-50 border-b-2 border-green-200" style={{backgroundColor: '#b8dbdb', paddingLeft: '8px'}}>
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <Beaker className="h-5 w-5 text-green-600" />
                  Materiais Necessários
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {materials.map((material: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-700">
                      <span className="mt-2 h-2 w-2 rounded-full bg-green-600 flex-shrink-0" />
                      <span>{material}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Procedimento */}
          {experiment.procedure && (
            <Card className="border-2 border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader className="bg-amber-50 border-b-2 border-amber-200" style={{backgroundColor: '#ededed', paddingLeft: '60px'}}>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <Zap className="h-5 w-5 text-amber-600" />
                  Procedimento
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="prose prose-sm max-w-none text-gray-700">
                  {experiment.procedure.split("\n").map((line, idx) => (
                    <p key={idx} className="mb-3 leading-relaxed">
                      {line}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Explicação Química com Imagens */}
          {experiment.chemicalExplanation && experimentId && (
            <Card className="border-2 border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader className="bg-purple-50 border-b-2 border-purple-200" style={{backgroundColor: '#b8dbdb', paddingLeft: '102px'}}>
                <CardTitle className="text-purple-900">Explicação Química</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ChemicalExplanationWithImages
                  experimentId={experimentId}
                  explanation={experiment.chemicalExplanation}
                  isAdmin={false}
                />
              </CardContent>
            </Card>
          )}

          {/* Imagem e Vídeo Principal */}
          {(experiment.imageUrl || experiment.videoUrl) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Imagem */}
              {experiment.imageUrl && (
                <Card className="border-2 border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="pt-0 flex justify-center">
                    <img
                      src={experiment.imageUrl}
                      alt={experiment.title}
                      className="w-full h-48 object-contain" style={{width: '352px', paddingLeft: '71px', paddingLeft: '307px', width: '352px', marginBottom: '-22px', paddingLeft: '307px'}}
                    />
                  </CardContent>
                </Card>
              )}
              
              {/* Vídeo */}
              {experiment.videoUrl && (
                <Card className="border-2 border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-gray-100 border-b-2 border-gray-200">
                    <CardTitle className="text-gray-900" style={{display: 'none'}}>Vídeo</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <video
                      src={experiment.videoUrl}
                      controls
                      className="w-full h-48 object-cover bg-black" style={{width: '415px', paddingLeft: '540px', marginTop: '-239px', marginLeft: '53px', width: '365px', height: '254px', paddingBottom: '2px', paddingLeft: '602px', marginTop: '-243px', marginLeft: '84px', paddingBottom: '0px', paddingLeft: '609px', marginTop: '-245px', width: '415px', height: '228px'}}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Galeria de Imagens */}
          {images.length > 0 && (
            <Card className="border-2 border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gray-100 border-b-2 border-gray-200">
                <CardTitle className="text-gray-900">Galeria de Imagens</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ImageLightbox images={images} />
              </CardContent>
            </Card>
          )}

          {/* Explicação Simplificada */}
          {experiment.simplifiedExplanation && (
            <Card className="border-2 border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader className="bg-cyan-50 border-b-2 border-cyan-200">
                <CardTitle className="text-cyan-900">Explicação Simplificada</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 text-lg leading-relaxed">{experiment.simplifiedExplanation}</p>
              </CardContent>
            </Card>
          )}

          {/* Aplicação no Cotidiano */}
          {experiment.dailyApplication && (
            <Card className="border-2 border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader className="bg-emerald-50 border-b-2 border-emerald-200" style={{backgroundColor: '#ededed', paddingLeft: '104px'}}>
                <CardTitle className="text-emerald-900">Aplicação no Cotidiano</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 text-lg leading-relaxed">{experiment.dailyApplication}</p>
              </CardContent>
            </Card>
          )}

          {/* EPIs */}
          {epi.length > 0 && (
            <Card className="border-2 border-orange-200 hover:shadow-lg transition-shadow" style={{backgroundColor: '#eaf5fb'}}>
              <CardHeader className="bg-orange-50 border-b-2 border-orange-200" style={{backgroundColor: '#b8dbdb', paddingLeft: '34px'}}>
                <CardTitle className="flex items-center gap-2 text-orange-900">
                  <Shield className="h-5 w-5 text-orange-600" />
                  EPIs Necessários
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {epi.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-3 text-gray-700">
                      <span className="h-2 w-2 rounded-full bg-orange-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Riscos */}
          {experiment.risks && (
            <Card className="border-2 border-red-300 hover:shadow-lg transition-shadow">
              <CardHeader className="bg-red-50 border-b-2 border-red-300" style={{backgroundColor: '#ededed', paddingLeft: '101px'}}>
                <CardTitle className="flex items-center gap-2 text-red-900">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Riscos
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 text-lg leading-relaxed">{experiment.risks}</p>
              </CardContent>
            </Card>
          )}

          {/* Botão de Empréstimo */}
          <Card className="border-2 border-green-300 bg-green-50 hover:shadow-lg transition-shadow" style={{backgroundColor: '#eaf5fb'}}>
            <CardContent className="pt-8 text-center">
              <h3 className="text-xl font-bold text-green-900 mb-4">Interessado?</h3>
              <p className="text-gray-700 mb-6">Solicite este kit para sua instituição</p>
              <Button
                size="lg"
                className="bg-green-600 text-white hover:bg-green-700"
                onClick={() => navigate("/loans")}
              >
                Solicitar Empréstimo
              </Button>
            </CardContent>
          </Card>

          {/* Admin Section */}
          <AdminOnly>
            {user?.role === "admin" && experimentId && (
              <Card className="border-2 border-gray-400 bg-gray-100" style={{display: 'none'}}>
                <CardHeader>
                  <CardTitle className="text-gray-900">Gerenciar Imagens (Admin)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ExperimentImageManager experimentId={experimentId} />
                </CardContent>
              </Card>
            )}
          </AdminOnly>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="container text-center">
          <p className="mb-2">LAPEQ-UFOB - Laboratório de Pesquisas em Ensino de Química</p>
          <p className="text-gray-400">Universidade Federal do Oeste da Bahia</p>
        </div>
      </footer>
    </div>
  );
}
