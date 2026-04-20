import { getDb } from "./server/db";
import { categories, experiments } from "./drizzle/schema";
import { eq, sql } from "drizzle-orm";

const mainCategories = [
  {
    name: "Solo",
    description: "Explore a composição, formação e importância do solo para a vida",
    icon: "Leaf"
  },
  {
    name: "Atmosfera",
    description: "Descubra os fenômenos atmosféricos e a composição do ar",
    icon: "Cloud"
  },
  {
    name: "Água",
    description: "Compreenda as propriedades e ciclos da água na natureza",
    icon: "Droplets"
  },
  {
    name: "Sustentabilidade",
    description: "Aprenda sobre práticas sustentáveis e preservação ambiental",
    icon: "Sprout"
  },
  {
    name: "Biomas brasileiros",
    description: "Conheça a diversidade biológica dos biomas do Brasil",
    icon: "Trees"
  },
  {
    name: "Ciência, tecnologia e cotidiano",
    description: "Descubra como a ciência e tecnologia estão presentes no dia a dia",
    icon: "Lightbulb"
  }
];

async function cleanupCategories() {
  try {
    console.log("Iniciando limpeza e reorganização de categorias...");
    const db = await getDb();
    
    if (!db) {
      throw new Error("Database connection failed");
    }
    
    // Obter todas as categorias atuais
    const allCategories = await db.select().from(categories);
    console.log(`\nCategorias atuais: ${allCategories.length}`);
    
    // Deletar categorias de teste (aquelas com "Test" no nome)
    const testCategories = allCategories.filter(cat => cat.name.includes("Test"));
    if (testCategories.length > 0) {
      console.log(`\nDeletando ${testCategories.length} categorias de teste...`);
      for (const cat of testCategories) {
        try {
          await db.delete(categories).where(eq(categories.id, cat.id));
          console.log(`✓ Categoria de teste deletada: ${cat.name}`);
        } catch (error: any) {
          console.log(`⚠ Não foi possível deletar ${cat.name}: ${error.message}`);
        }
      }
    }
    
    // Adicionar ou atualizar as 6 categorias principais
    console.log(`\nAdicionando/atualizando categorias principais...`);
    for (const category of mainCategories) {
      try {
        const existing = allCategories.find(cat => cat.name === category.name);
        if (existing) {
          console.log(`✓ Categoria "${category.name}" já existe (ID: ${existing.id})`);
        } else {
          await db.insert(categories).values(category);
          console.log(`✓ Categoria "${category.name}" adicionada com sucesso`);
        }
      } catch (error: any) {
        if (error.message.includes("Duplicate entry")) {
          console.log(`⚠ Categoria "${category.name}" já existe`);
        } else {
          throw error;
        }
      }
    }
    
    // Listar categorias finais
    const finalCategories = await db.select().from(categories);
    console.log(`\n✓ Categorias finais: ${finalCategories.length}`);
    finalCategories.forEach(cat => {
      console.log(`  - ${cat.id}: ${cat.name}`);
    });
    
    console.log("\n✓ Limpeza e reorganização concluída!");
    process.exit(0);
  } catch (error) {
    console.error("Erro ao fazer limpeza de categorias:", error);
    process.exit(1);
  }
}

cleanupCategories();
