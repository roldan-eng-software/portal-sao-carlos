# Spec 01 — Auditoria técnica de SEO, performance e acessibilidade

**Fase:** Fase 1  
**Objetivo (o quê):** Produzir um diagnóstico objetivo, sem alterações, do estado atual do site em:  
- Renderização/HTML inicial (verificação de conteúdo visível)  
- Metadados (título, descrição, canonical, OG, favicon)  
- Indexação (robots.txt, sitemap, noindex)  
- Performance (Core Web Vitals por análise de código, não de campo)  
- Acessibilidade (WCAG AA, navegação por teclado, contraste)  
- Presença de configuração de Search Console  

**Intenção (por quê):**  
Toda decisão nas specs seguintes precisa de base factual. A auditoria pode revelar problemas desconhecidos (ex.: impacto do service worker existente na cache do Googlebot, canonical faltando em `/anuncie`) que mudariam o plano de ação.  

**Contexto:**  
- Projeto Next.js 16 App Router  
- Home com `revalidate = 1800` e dados buscados no servidor (HTML inicial completo)  
- GA4 apenas em produção  
- Service worker implementado (commit 6f65568) — precisa de avaliação explícita de risco de SEO  
- Nenhum segredo no frontend (variáveis de ambiente obrigatórias)  

**Atores:**  
- Implementador (agente de codificação)  
- Responsável revisa o relatório  

**Descrição do comportamento:**  
Leitura estática do código-fonte e artefatos gerados (metadata, robots.ts, sitemap.ts, JSON-LD, layout, páginas) + build de produção para inspeção do HTML inicial. Produz diagnóstico organizado por severidade (crítico / médio / baixo) cobrindo:  
- Framework e método de renderização  
- Presença do conteúdo no HTML inicial  
- Estado de metadata/OG/favicon/canonical/robots/sitemap  
- Páginas e rotas existentes  
- Problemas de indexação  
- Performance  
- Acessibilidade  
- Presença/ausência de configuração de Search Console  

**Entradas e saídas:**  
- Entrada: código-fonte e build de produção.  
- Saída: relatório de diagnóstico (markdown em `docs/`) ou resposta ao usuário, sem nenhuma alteração de código.  

**Dados/entidades envolvidos (conceitual):**  
Não se aplica — é inspeção, não manipulação de dados de negócio.  

**Estados e transições:**  
Não se aplica — é leitura estática.  

**Regras de negócio:**  
- Regra 5 (datas honestas) e regra 9 (noindex admin) devem ser verificadas e apontadas se estiverem violadas.  

**Validações:**  
Nenhuma — é somente leitura.  

**Fluxo do usuário (passo a passo):**  
1. Rodar build de produção local e inspecionar o HTML gerado.  
2. Inspecionar `robots.ts`, `sitemap.ts`, metadados de cada rota e JSON-LD.  
3. Revisar contraste/hierarquia/foco nos componentes de UI existentes.  
4. Entregar o diagnóstico por severidade ao responsável.  

**Casos de borda e erros:**  
Se o build falhar localmente, reportar como bloqueador da entrega; não corrigir nesta spec.  

**Impacto no existente:**  
Nenhum — não há alterações de código.  

**Critérios de aceite (Dado/Quando/Então):**  
- Dado o projeto, Quando a auditoria é entregue, Então ela cobre todos os itens listados na descrição, cada um com severidade e evidência (arquivo/rota).  
- Dado o `/admin`, Quando a auditoria é feita, Então a indexabilidade atual dele está explicitamente reportada.  
- Dado o service worker, Quando a auditoria é feita, Então o risco de SEO (ou ausência dele) está avaliado com justificativa.  

**Definição de pronto:**  
Relatório entregue ao responsável com todos os itens cobertos e nenhuma alteração no código.  

**Dependências:** Nenhuma.  

**Fora do escopo desta spec:**  
- Correções ou otimizações apontadas no relatório (entram nas specs subsequentes).  
- Qualquer alteração de código ou dependência.  

**Dependências:** Nenhuma.