import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDown, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void;
  onSortChange: (sortBy: SortOption) => void;
}

export interface FilterState {
  categoryId?: number;
  level?: "fundamental" | "medio";
}

export type SortOption = "name-asc" | "name-desc" | "date-newest" | "date-oldest" | "popularity" | undefined;

export function FilterBar({ onFilterChange, onSortChange }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({});
  const [sortBy, setSortBy] = useState<SortOption>(undefined);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showLevelDropdown, setShowLevelDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const { data: categories = [] } = trpc.categories.list.useQuery();

  const handleCategorySelect = (categoryId: number) => {
    const newFilters = { ...filters, categoryId };
    setFilters(newFilters);
    onFilterChange(newFilters);
    setShowCategoryDropdown(false);
  };

  const handleLevelSelect = (level: "fundamental" | "medio") => {
    const newFilters = { ...filters, level };
    setFilters(newFilters);
    onFilterChange(newFilters);
    setShowLevelDropdown(false);
  };

  const handleSortSelect = (sort: SortOption) => {
    setSortBy(sort);
    onSortChange(sort);
    setShowSortDropdown(false);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSortBy(undefined);
    onFilterChange({});
    onSortChange(undefined);
  };

  const getCategoryName = (id: number) => {
    return categories.find((c) => c.id === id)?.name || "Categoria";
  };

  const getLevelLabel = (level: string) => {
    return level === "fundamental" ? "Fundamental" : "Médio";
  };

  const getSortLabel = (sort: SortOption) => {
    switch (sort) {
      case "name-asc":
        return "Nome (A-Z)";
      case "name-desc":
        return "Nome (Z-A)";
      case "date-newest":
        return "Mais Recente";
      case "date-oldest":
        return "Mais Antigo";
      case "popularity":
        return "Popularidade";
      default:
        return "Ordenar";
    }
  };

  const hasActiveFilters = Object.keys(filters).length > 0 || sortBy;

  return (
    <Card className="p-4 mb-6 bg-white border-2 border-blue-200">
      <div className="flex flex-wrap gap-3 items-center">
        {/* Category Filter */}
        <div className="relative">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            {filters.categoryId ? getCategoryName(filters.categoryId) : "Categoria"}
            <ChevronDown className="h-4 w-4" />
          </Button>
          {showCategoryDropdown && (
            <div className="absolute top-full mt-1 left-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 w-48">
              <div className="p-2">
                <button
                  onClick={() => {
                    setFilters({ ...filters, categoryId: undefined });
                    onFilterChange({ ...filters, categoryId: undefined });
                    setShowCategoryDropdown(false);
                  }}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                >
                  Todas as categorias
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`block w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm ${
                      filters.categoryId === cat.id ? "bg-blue-100 font-semibold" : ""
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Level Filter */}
        <div className="relative">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setShowLevelDropdown(!showLevelDropdown)}
          >
            {filters.level ? getLevelLabel(filters.level) : "Nível"}
            <ChevronDown className="h-4 w-4" />
          </Button>
          {showLevelDropdown && (
            <div className="absolute top-full mt-1 left-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 w-48">
              <div className="p-2">
                <button
                  onClick={() => {
                    setFilters({ ...filters, level: undefined });
                    onFilterChange({ ...filters, level: undefined });
                    setShowLevelDropdown(false);
                  }}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                >
                  Todos os níveis
                </button>
                <button
                  onClick={() => handleLevelSelect("fundamental")}
                  className={`block w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm ${
                    filters.level === "fundamental" ? "bg-blue-100 font-semibold" : ""
                  }`}
                >
                  Fundamental
                </button>
                <button
                  onClick={() => handleLevelSelect("medio")}
                  className={`block w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm ${
                    filters.level === "medio" ? "bg-blue-100 font-semibold" : ""
                  }`}
                >
                  Médio
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setShowSortDropdown(!showSortDropdown)}
          >
            {getSortLabel(sortBy)}
            <ChevronDown className="h-4 w-4" />
          </Button>
          {showSortDropdown && (
            <div className="absolute top-full mt-1 left-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 w-48">
              <div className="p-2">
                <button
                  onClick={() => handleSortSelect(undefined)}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                >
                  Sem ordenação
                </button>
                <button
                  onClick={() => handleSortSelect("name-asc")}
                  className={`block w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm ${
                    sortBy === "name-asc" ? "bg-blue-100 font-semibold" : ""
                  }`}
                >
                  Nome (A-Z)
                </button>
                <button
                  onClick={() => handleSortSelect("name-desc")}
                  className={`block w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm ${
                    sortBy === "name-desc" ? "bg-blue-100 font-semibold" : ""
                  }`}
                >
                  Nome (Z-A)
                </button>
                <button
                  onClick={() => handleSortSelect("date-newest")}
                  className={`block w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm ${
                    sortBy === "date-newest" ? "bg-blue-100 font-semibold" : ""
                  }`}
                >
                  Mais Recente
                </button>
                <button
                  onClick={() => handleSortSelect("date-oldest")}
                  className={`block w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm ${
                    sortBy === "date-oldest" ? "bg-blue-100 font-semibold" : ""
                  }`}
                >
                  Mais Antigo
                </button>
                <button
                  onClick={() => handleSortSelect("popularity")}
                  className={`block w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm ${
                    sortBy === "popularity" ? "bg-blue-100 font-semibold" : ""
                  }`}
                >
                  Popularidade
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="flex items-center gap-1 text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>
    </Card>
  );
}
