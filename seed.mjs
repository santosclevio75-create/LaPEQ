import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

async function seed() {
  const connection = await mysql.createConnection(DATABASE_URL);

  try {
    console.log('Seeding database...');

    // Insert categories
    const categories = [
      { name: 'Atmosfera', description: 'Experimentos sobre atmosfera e ar', icon: 'Cloud' },
      { name: 'Água', description: 'Experimentos sobre água e soluções aquosas', icon: 'Droplets' },
      { name: 'Solo', description: 'Experimentos sobre solo e minerais', icon: 'Layers' },
      { name: 'Sustentabilidade', description: 'Experimentos sobre sustentabilidade e meio ambiente', icon: 'Leaf' },
    ];

    for (const category of categories) {
      await connection.execute(
        'INSERT INTO categories (name, description, icon) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE description=VALUES(description), icon=VALUES(icon)',
        [category.name, category.description, category.icon]
      );
      console.log(`✓ Category created: ${category.name}`);
    }

    // Get category IDs
    const [categoriesResult] = await connection.execute('SELECT id, name FROM categories');
    const categoryMap = {};
    categoriesResult.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });

    // Insert experiments
    const experiments = [
      {
        title: 'Reação de Neutralização Ácido-Base',
        categoryId: categoryMap['Água'],
        problem: 'Como identificar se uma substância é ácida ou básica?',
        objective: 'Demonstrar a reação de neutralização entre ácidos e bases usando indicadores de pH',
        materials: JSON.stringify([
          'Ácido clorídrico (HCl) diluído',
          'Hidróxido de sódio (NaOH) diluído',
          'Indicador de pH (fenolftaleína ou papel de tornassol)',
          'Béqueres',
          'Bastão de vidro',
          'Pipeta',
        ]),
        procedure: '1. Adicione 50 mL de HCl em um béquer. 2. Adicione algumas gotas de fenolftaleína. 3. Lentamente, adicione NaOH enquanto mistura. 4. Observe a mudança de cor quando a solução fica neutra.',
        chemicalExplanation: 'A reação de neutralização ocorre quando um ácido (H+) reage com uma base (OH-) formando água e um sal. HCl + NaOH → NaCl + H2O',
        simplifiedExplanation: 'Ácidos e bases se neutralizam mutuamente, formando água e um sal. A mudança de cor do indicador mostra quando a reação está completa.',
        dailyApplication: 'Essa reação é usada na produção de fertilizantes, tratamento de água e até em medicamentos para neutralizar ácidos do estômago.',
        epi: JSON.stringify(['Óculos de segurança', 'Luvas de nitrila', 'Avental de laboratório']),
        risks: 'Ácidos e bases podem causar queimaduras. Evite contato com pele e olhos.',
        estimatedTime: '30 minutos',
        level: 'fundamental',
      },
      {
        title: 'Cristalização de Sal de Cozinha',
        categoryId: categoryMap['Solo'],
        problem: 'Como se formam cristais a partir de soluções?',
        objective: 'Observar o processo de cristalização do cloreto de sódio (sal de cozinha)',
        materials: JSON.stringify([
          'Sal de cozinha (NaCl)',
          'Água destilada',
          'Béquer',
          'Bastão de vidro',
          'Prato ou placa de Petri',
          'Papel filtro',
        ]),
        procedure: '1. Dissolva sal em água quente até saturação. 2. Despeje a solução em um prato. 3. Deixe evaporar lentamente em temperatura ambiente. 4. Observe a formação de cristais após alguns dias.',
        chemicalExplanation: 'Quando a água evapora, as moléculas de NaCl se reorganizam em uma estrutura cristalina cúbica, formando cristais visíveis.',
        simplifiedExplanation: 'O sal dissolvido na água forma cristais quando a água evapora, voltando ao estado sólido em uma forma organizada.',
        dailyApplication: 'A cristalização é usada para purificar substâncias, produzir sal marinho e criar gemas sintéticas.',
        epi: JSON.stringify(['Óculos de segurança']),
        risks: 'Risco mínimo. Cuidado com água quente.',
        estimatedTime: '3-5 dias',
        level: 'fundamental',
      },
    ];

    for (const experiment of experiments) {
      await connection.execute(
        `INSERT INTO experiments (title, categoryId, problem, objective, materials, \`procedure\`, chemicalExplanation, simplifiedExplanation, dailyApplication, epi, risks, estimatedTime, level)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          experiment.title,
          experiment.categoryId,
          experiment.problem,
          experiment.objective,
          experiment.materials,
          experiment.procedure,
          experiment.chemicalExplanation,
          experiment.simplifiedExplanation,
          experiment.dailyApplication,
          experiment.epi,
          experiment.risks,
          experiment.estimatedTime,
          experiment.level,
        ]
      );
      console.log(`✓ Experiment created: ${experiment.title}`);
    }

    console.log('\n✓ Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seed();
