import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

/**
 * Hook para aplicar e gerenciar estilos de design salvos
 * Carrega estilos do banco de dados e aplica ao componente
 */
export function useDesignStyles(componentName: string) {
  const [appliedStyles, setAppliedStyles] = useState<Record<string, string>>({});
  
  const { data: styles = [] } = trpc.designStyles.getByComponent.useQuery(componentName);

  useEffect(() => {
    if (styles.length > 0) {
      const styleMap: Record<string, string> = {};
      styles.forEach((style) => {
        styleMap[style.cssClass] = style.cssValue;
      });
      setAppliedStyles(styleMap);
    }
  }, [styles]);

  return appliedStyles;
}

/**
 * Hook para salvar alterações de design
 */
export function useSaveDesignStyle() {
  return trpc.designStyles.save.useMutation();
}
