# Chemistry Lab CMS - TODO

## Banco de Dados & Backend
- [x] Criar schema Drizzle para tabelas: categories, experiments, loans
- [x] Implementar migrations SQL para criar tabelas
- [x] Criar query helpers em server/db.ts
- [x] Implementar tRPC procedures para CRUD de experimentos
- [x] Implementar tRPC procedures para CRUD de categorias
- [x] Implementar tRPC procedures para gerenciar empréstimos
- [x] Implementar tRPC procedures para busca e filtros

## Frontend Público
- [x] Criar página Home com visão geral do site
- [x] Criar página de listagem de experimentos com busca, filtro por tema e nível
- [x] Criar página de detalhes do experimento
- [x] Criar página de formulário de empréstimo
- [x] Implementar design responsivo com paleta verde, azul e branco
- [x] Adicionar ícones relacionados à ciência

## Painel Administrativo
- [x] Criar layout do dashboard administrativo
- [x] Implementar página de gerenciamento de experimentos (CRUD)
- [x] Implementar página de gerenciamento de categorias (CRUD)
- [x] Implementar página de gerenciamento de empréstimos (visualizar e atualizar status)
- [x] Adicionar autenticação/proteção para admin

## Dados Iniciais
- [x] Inserir 4 categorias: Atmosfera, Água, Solo, Sustentabilidade
- [x] Inserir 2 experimentos de exemplo
- [x] Criar script seed.mjs para popular dados iniciais

## Testes
- [x] Escrever testes vitest para procedures de experimentos
- [x] Escrever testes vitest para procedures de categorias
- [x] Escrever testes vitest para procedures de empréstimos

## Design & UI
- [x] Configurar tema com Tailwind (verde, azul, branco)
- [x] Adicionar fontes do Google Fonts
- [x] Criar componentes reutilizáveis
- [x] Implementar responsividade mobile-first


## Ajustes Adicionais (Fase 8)
- [x] Adicionar campo de tamanho da logo no painel admin (configuração)
- [x] Permitir upload de imagens na explicação dos experimentos
- [x] Adicionar campo de URL de imagem no schema de experimentos
- [x] Criar componente de upload de imagem no formulário de experimentos
- [x] Exibir imagem na página de detalhes do experimento
- [x] Corrigir erros de salvamento de edições
- [x] Adicionar aba de Configurações no painel admin


## Debug - Problema de Salvamento (Fase 8)
- [x] Investigar por que edições de experimentos não estão sendo salvas
- [x] Verificar logs do servidor para erros nas mutations
- [x] Testar fluxo completo de criar/editar/deletar experimentos
- [x] Validar que dados estão sendo persistidos no banco de dados
- [x] Corrigir qualquer erro de validação ou autorização
- [x] Corrigir retorno de createExperiment e updateExperiment para retornar dados salvos
- [x] Adicionar logging detalhado de erros no AdminExperiments
- [x] Adicionar parsing seguro para materials e epi em ExperimentDetail


## Persistência de Alterações de Design (Fase 9)
- [x] Implementar sistema para salvar alterações de design feitas no editor visual
- [x] Criar API para atualizar estilos CSS dinamicamente
- [x] Persistir configurações de cores, tamanhos e layout no banco de dados
- [x] Aplicar estilos salvos ao carregar as páginas
- [x] Garantir que mudanças permaneçam após sair e voltar ao site

## Refinamento Visual - LoansPage (Fase 10)
- [x] Ajustar marginTop do título para -388px
- [x] Ajustar marginTop do parágrafo descritivo para -29px
- [x] Ajustar dimensões do card de formulário (671px x 168px)
- [x] Ajustar marginTop do card para 87px
- [x] Ajustar backgroundColor e borderColor do card para branco
- [x] Adicionar marginTop ao parágrafo do footer (56px)
- [x] Ocultar segundo parágrafo do footer (display: none)
- [x] Remover duplicações de estilos inline

## Refinamento Visual - ExperimentsPage (Fase 11)
- [x] Redimensionar logo para 500px
- [x] Alterar título do header para "Experimentos"
- [x] Remover duplicações de estilos inline

## Implementação de BookLoansPage (Fase 12)
- [x] Criar página BookLoansPage.tsx separada
- [x] Adicionar rota /book-loans em App.tsx
- [x] Implementar formulário de empréstimo de livros
- [x] Adicionar validação de datas
- [x] Aplicar refinamentos visuais na BookLoansPage
- [x] Remover duplicações de estilos inline

## Novas Funcionalidades (Fase 13)
- [x] Receber solicitações de empréstimos de livros no painel administrativo
- [x] Criar aba para gerenciar empréstimos de livros no AdminDashboard
- [x] Implementar campo flexível para adicionar imagens em experimentos
- [x] Permitir upload e gerenciamento de múltiplas imagens por experimento
- [x] Criar tabela experimentImages no banco de dados
- [x] Implementar tRPC procedures para gerenciar imagens de experimentos
- [x] Criar componente ExperimentImageManager no painel administrativo
- [x] Adicionar galeria de imagens na página de detalhes do experimento
- [x] Exibir múltiplas imagens com legendas na página de detalhes

## Sistema de Imagens Melhorado (Fase 14)
- [x] Implementar upload de imagens para S3 no ExperimentImageManager
- [x] Adicionar drag-and-drop para upload de imagens
- [x] Criar preview de imagens antes do upload
- [x] Validar tamanho e tipo de arquivo
- [x] Adicionar componente de lightbox para ampliar imagens
- [x] Implementar reordenação de imagens com drag-and-drop
- [x] Melhorar responsividade da galeria para mobile
- [x] Testar upload e exibição de imagens

## Correção do Sistema de Upload de Imagens (Fase 15)
- [x] Reescrever ExperimentImageManager com input type="file"
- [x] Adicionar preview de imagem antes de salvar
- [x] Implementar upload para S3 usando storagePut
- [x] Vincular imagens ao experimento no banco de dados
- [x] Exibir imagens na seção de explicação química
- [x] Permitir remover imagens
- [x] Permitir adicionar múltiplas imagens
- [x] Testar upload, salvamento e exibição persistente

## Integração de Imagens na Seção "Explicação Química" (Fase 16)
- [x] Analisar estrutura de ExperimentDetail e localizar seção "Explicação Química"
- [x] Criar componente ImageUploadSection para upload dentro da Explicação Química
- [x] Implementar upload real de arquivo com input type="file"
- [x] Integrar upload com S3 e banco de dados para persistência
- [x] Exibir imagens dentro da seção Explicação Química com galeria
- [x] Permitir adicionar e remover imagens na Explicação Química
- [x] Testar fluxo completo de upload e exibição

## Sistema de Notificações (Fase 17)
- [x] Criar tabela de notificações no banco de dados
- [x] Implementar tRPC procedures para gerenciar notificações
- [x] Criar componente de notificações no frontend (NotificationBell)
- [x] Integrar notificações com empréstimos de kits (AdminLoans)
- [x] Integrar notificações com empréstimos de livros (AdminBookLoans)
- [x] Testar sistema de notificações (5 testes adicionados)

## Sistema de Controle de Acesso (Fase 18)
- [x] Criar middleware de autenticação para rotas protegidas (ProtectedRoute component)
- [x] Implementar ProtectedRoute component para esconder rotas de usuários comuns
- [x] Proteger rota /admin e todas as sub-rotas administrativas
- [x] Esconder botões de edição/criação para usuários não-admin (AdminOnly component)
- [x] Adicionar validação de role em todos os tRPC procedures de edição (já existente)
- [x] Criar componente AdminOnly para renderizar conteúdo apenas para admins
- [x] Manter explicação química visível para todos, esconder apenas controles de edição
- [x] Criar testes de autorização (33 testes)
- [x] Validar que operações de edição são bloqueadas sem permissão

## Filtro e Ordenação de Experimentos (Fase 19)
- [x] Criar tRPC procedure para buscar experimentos com filtro e ordenação (listWithFilters)
- [x] Implementar filtro por categoria
- [x] Implementar filtro por nível de dificuldade
- [x] Implementar ordenação alfabética (A-Z, Z-A)
- [x] Implementar ordenação por data (mais recente/antigo)
- [x] Implementar ordenação por popularidade (mais emprestado)
- [x] Criar componente FilterBar para UI de filtros
- [x] Integrar filtro e ordenação em ExperimentsPage
- [x] Criar testes de filtro e ordenação (8 testes)
- [x] Todos os 79 testes passando

## Sistema de Empréstimo Completo (Fase 20)
- [ ] Adicionar campos de disponibilidade e quantidade em kits e livros
- [ ] Implementar lógica de aprovação automática se disponível
- [ ] Criar sistema de notificações por email (aprovado/rejeitado)
- [ ] Implementar lembrete de devolução próxima
- [ ] Criar dashboard de empréstimos ativos para usuários
- [ ] Implementar histórico de empréstimos
- [ ] Implementar estatísticas de uso (gráficos e relatórios)
- [ ] Criar página de solicitação de empréstimo para usuários comuns
- [ ] Implementar confirmação de devolução pelo admin
- [ ] Criar testes do sistema completo
## Categorias de Conteúdo (Fase 21)
- [x] Adicionar 6 categorias ao banco de dados: Solo, Atmosfera, Água, Sustentabilidade, Biomas brasileiros, Ciência/tecnologia/cotidiano
- [x] Criar descrições para cada categoria
- [ ] Exibir categorias no menu principal com descrições
- [ ] Implementar filtro de categorias na página de experimentos
- [ ] Adicionar ícones visuais para cada categoria
- [ ] Testar navegação e filtros de categorias

## Correção de Posicionamento de Imagens (Fase 22)
- [x] Mover imagem principal para logo abaixo da Explicação Química
- [x] Reduzir tamanho da imagem (de h-64 para h-48)3o e filtros de categorias

## Organização Visual de Experimentos (Fase 23)
- [x] Adicionar faixas coloridas na lista de experimentos para separar por categoria
- [x] Reorganizar página de detalhes em cards bem definidos e separados
- [x] Testar visualização em diferentes tamanhos de tela

## Funcionalidade de Vídeos (Fase 24)
- [x] Adicionar campo videoUrl ao schema de experimentos
- [x] Criar migração SQL para adicionar campo de vídeo
- [x] Atualizar interface de admin para upload de vídeos (nova aba Mídia)
- [x] Exibir vídeos ao lado da imagem na página de detalhes
- [x] Testar upload e exibição de vídeos

## Melhoria do Painel Administrativo (Fase 25)
- [x] Melhorar header com ícones (notificações, configurações, perfil)
- [x] Criar nova aba "Painel" com cards de resumo
- [x] Implementar calendário de reservas com legenda de cores
- [x] Criar tabela de empréstimos pendentes
- [x] Adicionar gráficos (Experimentos mais acessados, Status dos kits)
- [x] Expandir funcionalidade de empréstimos de kits com filtros e cards de status
- [x] Expandir funcionalidade de empréstimos de livros com filtros e cards de status
- [x] Adicionar routers tRPC para loans.getAll, bookLoans.getAll, experiments.getAll, users.getAll
- [x] Adicionar botão "Voltar ao Site" no header
- [ ] Implementar sistema de notificações de atraso
- [ ] Adicionar indicadores visuais para kits em manutenção
- [ ] Testar responsividade do novo painel em mobile e desktop

## Correções de Bugs (Fase 26)
- [x] Corrigir erro de email undefined em BookLoansPage
- [ ] Corrigir erro de propriedades duplicadas em Home.tsx
