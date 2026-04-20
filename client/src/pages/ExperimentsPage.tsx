import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Beaker, Search, ChevronRight, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState, useMemo, useEffect } from "react";
import ImageLightbox from "@/components/ImageLightbox";
import { FilterBar, type FilterState, type SortOption } from "@/components/FilterBar";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663138388912/Sg53Qp3VHExKb8spk84Ana/WhatsAppImage2026-04-16at08.01.14_20623c9f.jpeg";

// Cores para cada categoria
const CATEGORY_COLORS: Record<number, { bg: string; border: string; text: string; light: string }> = {
  1: { bg: "bg-blue-600", border: "border-blue-600", text: "text-blue-800", light: "bg-blue-50" }, // Atmosfera
  2: { bg: "bg-green-600", border: "border-green-600", text: "text-green-800", light: "bg-green-50" }, // Solo
  3: { bg: "bg-cyan-600", border: "border-cyan-600", text: "text-cyan-800", light: "bg-cyan-50" }, // Água
  4: { bg: "bg-emerald-600", border: "border-emerald-600", text: "text-emerald-800", light: "bg-emerald-50" }, // Sustentabilidade
  5: { bg: "bg-amber-600", border: "border-amber-600", text: "text-amber-800", light: "bg-amber-50" }, // Biomas brasileiros
  6: { bg: "bg-purple-600", border: "border-purple-600", text: "text-purple-800", light: "bg-purple-50" }, // Ciência, tecnologia e cotidiano
};

export default function ExperimentsPage() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>(undefined);
  const [experimentImages, setExperimentImages] = useState<Record<number, any[]>>({});

  // Fetch data
  const { data: experiments = [], isLoading: experimentsLoading } = trpc.experiments.list.useQuery();
  const { data: categories = [] } = trpc.categories.list.useQuery();
  const { data: logoSizeConfig } = trpc.settings.getLogoSize.useQuery();
  const logoSize = logoSizeConfig?.size || "h-10";

  // Get category from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get("category");
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, []);

  // Fetch images for each experiment
  const utils = trpc.useUtils();
  useEffect(() => {
    experiments.forEach(exp => {
      if (!experimentImages[exp.id]) {
        utils.experimentImages.getByExperiment.fetch(exp.id).then(images => {
          setExperimentImages(prev => ({ ...prev, [exp.id]: images }));
        }).catch(() => {
          setExperimentImages(prev => ({ ...prev, [exp.id]: [] }));
        });
      }
    });
  }, [experiments, experimentImages, utils]);

  // Filter and sort experiments
  const filteredExperiments = useMemo(() => {
    let result = experiments.filter((exp) => {
      const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || exp.categoryId === parseInt(selectedCategory);
      const matchesLevel = selectedLevel === "all" || exp.level === selectedLevel;
      return matchesSearch && matchesCategory && matchesLevel;
    });

    // Apply sorting
    if (sortBy) {
      switch (sortBy) {
        case "name-asc":
          result.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case "name-desc":
          result.sort((a, b) => b.title.localeCompare(a.title));
          break;
        case "date-newest":
          result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case "date-oldest":
          result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          break;
      }
    }

    return result;
  }, [experiments, searchQuery, selectedCategory, selectedLevel, sortBy]);

  // Agrupar experimentos por categoria
  const experimentsByCategory = useMemo(() => {
    const grouped: Record<number, typeof filteredExperiments> = {};
    filteredExperiments.forEach(exp => {
      if (!grouped[exp.categoryId]) {
        grouped[exp.categoryId] = [];
      }
      grouped[exp.categoryId].push(exp);
    });
    return grouped;
  }, [filteredExperiments]);

  const handleFilterChange = (filters: FilterState) => {
    if (filters.categoryId) {
      setSelectedCategory(filters.categoryId.toString());
    } else {
      setSelectedCategory("all");
    }
    if (filters.level) {
      setSelectedLevel(filters.level);
    } else {
      setSelectedLevel("all");
    }
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
  };

  const selectedCategoryName = selectedCategory === "all" 
    ? "Todos os Experimentos"
    : categories.find(c => c.id === parseInt(selectedCategory))?.name || "Experimentos";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100">
      {/* Header */}
      <header className="border-b-4 border-green-600 bg-white shadow-md">
        <div className="container py-3">
          <div className="flex items-center gap-3 mb-4">
            <img src={LOGO_URL} alt="LAPEQ-UFOB" className={`${logoSize} w-auto`} style={{width: '249px', height: '206px', height: '206px'}} />
            <h1 className="text-xl font-bold text-green-700">Experimentos</h1>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4 text-green-700 hover:bg-green-100"
          >
            ← Voltar
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">{selectedCategoryName}</h1>
          <p className="mt-2 text-gray-600">
            Explore nossos experimentos educacionais de química
          </p>
        </div>
      </header>

      {/* Filters Section */}
      <section className="border-b-4 border-blue-600 bg-white py-6 shadow-sm">
        <div className="container space-y-4">
          {/* Search Bar */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-2 border-gray-300 focus:border-green-600 bg-white"
              />
            </div>
          </div>

          {/* Filter and Sort Bar */}
          <FilterBar
            onFilterChange={handleFilterChange}
            onSortChange={handleSortChange}
          />
        </div>
      </section>

      {/* Results Count */}
      <section className="container py-4">
        <p className="text-gray-700">
          {experimentsLoading ? (
            "Carregando..."
          ) : (
            <>
              <span className="font-semibold text-gray-900">{filteredExperiments.length}</span> experimento(s) encontrado(s)
            </>
          )}
        </p>
      </section>

      {/* Experiments by Category */}
      <section className="container pb-12">
        {experimentsLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        ) : filteredExperiments.length === 0 ? (
          <Card className="border-2 border-gray-300 bg-gray-50">
            <CardContent className="py-12 text-center">
              <Beaker className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">Nenhum experimento encontrado com esses filtros.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(experimentsByCategory).map(([categoryId, categoryExperiments]) => {
              const category = categories.find(c => c.id === parseInt(categoryId));
              const colors = CATEGORY_COLORS[parseInt(categoryId)] || CATEGORY_COLORS[1];
              
              return (
                <div key={categoryId} className="space-y-4">
                  {/* Faixa de Categoria */}
                  <div className={`${colors.bg} text-white py-4 px-6 rounded-lg shadow-md`}>
                    <h2 className="text-2xl font-bold" style={{backgroundColor: '#cae4e8'}}>{category?.name || "Sem categoria"}</h2>
                    <p className="text-sm opacity-90 mt-1">{category?.description || ""}</p>
                  </div>

                  {/* Grid de Experimentos */}
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {categoryExperiments.map((experiment) => {
                      const levelLabel = experiment.level === "fundamental" ? "Fundamental" : "Médio";
                      
                      return (
                        <Card
                          key={experiment.id}
                          className={`border-2 ${colors.border} ${colors.light} hover:shadow-xl hover:border-opacity-100 transition-all cursor-pointer group`}
                          onClick={() => navigate(`/experiments/${experiment.id}`)}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between mb-2">
                              <div className={`rounded-lg ${colors.bg} p-2 group-hover:opacity-80 transition-opacity`}>
                                <Beaker className="h-5 w-5 text-white" />
                              </div>
                              <span className={`inline-block rounded-full ${colors.light} px-3 py-1 text-xs font-semibold ${colors.text}`}>
                                {levelLabel}
                              </span>
                            </div>
                            <CardTitle className={`${colors.text} group-hover:opacity-80 transition-opacity`}>
                              {experiment.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {experimentImages[experiment.id] && experimentImages[experiment.id].length > 0 && (
                              <div className="mb-4">
                                <div className="grid grid-cols-3 gap-2">
                                  {experimentImages[experiment.id].slice(0, 3).map((img) => (
                                    <div key={img.id} className="aspect-square overflow-hidden rounded-lg bg-gray-200">
                                      <img
                                        src={img.imageUrl}
                                        alt={img.caption || "Imagem"}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                              {experiment.objective || "Sem descrição"}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="space-y-1 text-xs text-gray-600">
                                {experiment.estimatedTime && (
                                  <p>⏱️ {experiment.estimatedTime}</p>
                                )}
                              </div>
                              <ChevronRight className={`h-5 w-5 ${colors.text} group-hover:translate-x-1 transition-transform`} />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Separador */}
      <div className="border-t-4 border-green-600 my-8"></div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container text-center">
          <p className="mb-2">LAPEQ-UFOB - Laboratório de Pesquisas em Ensino de Química</p>
          <p className="text-gray-400">Universidade Federal do Oeste da Bahia</p>
        </div>
      </footer>
    </div>
  );
}
