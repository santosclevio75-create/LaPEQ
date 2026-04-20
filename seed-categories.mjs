import { db } from "./server/_core/db.mjs";
import { categories } from "./drizzle/schema.ts";

const categoriesData = [
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

async function seedCategories() {
  try {
    console.log("Iniciando seed de categorias...");
    
    for (const category of categoriesData) {
      try {
        await db.insert(categories).values(category);
        console.log(`✓ Categoria "${category.name}" adicionada com sucesso`);
      } catch (error) {
        if (error.message.includes("Duplicate entry")) {
          console.log(`⚠ Categoria "${category.name}" já existe`);
        } else {
          throw error;
        }
      }
    }
    
    console.log("\n✓ Seed de categorias concluído!");
  } catch (error) {
    console.error("Erro ao fazer seed de categorias:", error);
    process.exit(1);
  }
}

seedCategories();
