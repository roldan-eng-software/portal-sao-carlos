# PRD — SEO Orgânico e Estrutura de Conteúdo Local (Portal São Carlos)

> Tipo: PRD de feature · Data: 2026-10-24
> **Status:** Aguardando implementação
>
> <!-- Valores possíveis: "Aguardando implementação" | "Implementada". Atualize para "Implementada" quando todas as specs estiverem concluídas. -->

## 1. Visão geral

Este PRD planeja a evolução do Portal São Carlos (https://www.meubairro.dev.br) de
uma home-hub única para um portal local com páginas indexáveis por tema — tudo
dentro de um **recorte enxuto** acordado com o responsável: melhorias de SEO
técnico, páginas institucionais e de listagem, guia comercial com páginas
individuais de empresa e página de telefones úteis. O guia ganha profundidade de
indexação sem criar páginas vazias, thin content ou armadilhas de rastreamento.

Este é um **PRD de feature** dentro de um projeto existente: a stack, os módulos
de dados, os componentes e as convenções atuais são reutilizados como estão.

## 2. Problema que resolve

Hoje o portal tem uma home forte (módulos de clima, notícias, avisos, contatos,
anúncios e promo), mas:

- Existem apenas **3 URLs indexáveis** (home, aviso editorial, política de
  privacidade) — todo o valor do conteúdo (notícias, avisos SAAE, contatos,
  anúncios) mora dentro da home, invisível para buscas por tema
  ("mecânica São Carlos", "telefones úteis São Carlos", "previsão do tempo
  São Carlos").
- A página `/admin` está indexável (deveria ser `noindex`).
- Não há `manifest`, breadcrumbs, nem páginas internas com título,
  descrição e canonical próprios.
- O guia comercial existente (anúncios curados) não tem página por empresa —
  perde-se a chance de ranquear buscas locais de alto intento
  ("hotel para cães Jardim Embaré São Carlos").
- A busca orgânica local é o canal de crescimento mais barato para um portal
  de utilidade pública; o site hoje não captura quase nada dela.

## 3. Público-alvo

- **Primário:** moradores de São Carlos/SP buscando informações úteis no
  Google (telefones, clima, avisos, serviços).
- **Secundário:** pessoas da região que pesquisam empresas locais por
  categoria/bairro (guia comercial).
- **Terciário:** comerciantes de São Carlos que descobrem o portal via busca
  e se cadastram para anunciar.

## 4. Objetivo do recorte atual

Entregar as fundações de SEO orgânico local do portal: páginas indexáveis de
valor real (listagens de notícias/avisos, telefones úteis, previsão do tempo,
páginas institucionais e páginas individuais de empresas), corrigir problemas
técnicos de indexação e preparar o projeto para Google Search Console — **sem**
quebrar nada do que existe, sem novas dependências e sem violar a constituição
v1.1.0 do projeto.

## 5. Funcionalidades

**Essenciais:**

- Auditoria técnica de SEO/performance/acessibilidade (diagnóstico, sem mudanças).
- `noindex` em `/admin`; `manifest.webmanifest`; breadcrumbs com
  `BreadcrumbList`; sitemap dinâmico expandido; canonical e metadata por página.
- `/noticias` — listagem completa das notícias agregadas dos feeds.
- `/avisos` e `/avisos/saae` — listagens de avisos (SAAE + curadoria do portal).
- `/utilidade-publica` e `/utilidade-publica/telefones-uteis` — telefones por
  categoria com fontes oficiais verificáveis.
- `/previsao-do-tempo/sao-carlos` — página dedicada reutilizando o módulo de clima.
- `/empresas` (hub do guia) e `/empresas/[slug]` (página da empresa com
  `LocalBusiness`).
- `/sobre`, `/contato` (canal WhatsApp + e-mail, sem formulário) e
  `/termos-de-uso`.
- Home reforçada como hub: links internos para todas as páginas novas,
  preservando H1 único e ordem conteúdo público → publicidade.
- Navegação (header/rodapé) com links internos; todas as páginas importantes
  a ≤3 cliques da home.
- README: como enviar sitemap no Search Console, solicitar indexação e monitorar.
- Datas de atualização sempre reais, em fuso `America/Sao_Paulo`, com
  "Dados indisponíveis"/"Última atualização em X" quando uma fonte falhar.

**Desejáveis:**

- Manifest com ícones existentes (PWA mínimo).
- Página `/sitemap` legível para humanos (apenas se trivial; opcional).

**Descartados nesta entrega (fora do escopo, decidido):**

- `/noticias/[slug]` e `/avisos/[slug]` (thin content + armadilha de rastreamento).
- `/avisos/cpfl` e `/avisos/prefeitura` (sem fonte configurada — proibido inventar dados).
- `/eventos` (sem fonte de dados).
- `/bairros/*` (sem conteúdo real suficiente).
- `/empresas/[categoria]` e `/empresas/[categoria]/[slug]` (categorias com <3 anúncios).
- Busca e filtros (decisão de design registrada: portal sem busca).
- Qualquer emenda à constituição.

## 6. Fora do escopo

- Todas as rotas descartadas no item anterior.
- Formulários novos (contato, cadastro) — o formulário `/anuncie` já existe e é mantido como está.
- Alterações em fontes RSS, módulos de dados ou regras de moderação.
- Novas dependências npm.
- Mudanças de identidade visual (apenas melhorias de hierarquia/legibilidade dentro do design system atual).
- Cópia integral de conteúdo de terceiros.
- Páginas de bairro, eventos, marketplace ou qualquer recurso da Fase 3 completa da constituição.

## 7. Regras de negócio

- Regra 1: nenhum dado exibido pode ser inventado — todo telefone, empresa ou
  aviso deve vir de `src/content/*.json`, dos módulos de feed existentes ou de
  fonte oficial verificável com `officialUrl` registrado.
- Regra 2: anúncios só aparecem no guia com `status: "publicado"`; rascunhos,
  suspensos e removidos nunca são indexados nem listados.
- Regra 3: a ordem da home (conteúdo público antes de publicidade) é preservada.
- Regra 4: conteúdo externo (notícias/avisos de feed) exibe no mínimo título,
  resumo curto, data, fonte e link para o original — nunca cópia integral.
- Regra 5: datas exibidas usam fuso `America/Sao_Paulo`; falha de fonte exibe
  estado honesto ("Dados indisponíveis" ou "Última atualização em X"), nunca
  data antiga como se fosse atual.
- Regra 6: todo link externo com `target="_blank"` usa `rel="noopener noreferrer"`.
- Regra 7: um único H1 por página; hierarquia H2/H3 consistente.
- Regra 8: rótulos de `ContentKind` (noticia, informativo, servico-publico,
  anuncio-gratuito, anuncio-patrocinado, divulgação própria) continuam
  obrigatórios e textuais em qualquer página nova.
- Regra 9: `/admin` e subrotas nunca são indexadas (`noindex`).
- Regra 10: páginas que ficariam vazias (sem dados reais) **não são criadas**.

## 8. Fluxos principais

### Fluxo 1 — Morador busca um aviso de utilidade pública

1. Morador pesquisa "aviso SAAE São Carlos" no Google e acha `/avisos/saae`.
2. Vê a listagem por data com título, resumo, data/hora e fonte.
3. Clica no link oficial do SAAE para o comunicado original.
4. Se o feed falhar, vê "Dados indisponíveis" + link da fonte oficial, sem erro técnico.

### Fluxo 2 — Visitante procura uma empresa local

1. Visitante pesquisa "hotel para cães São Carlos" e acha `/empresas/[slug]` do Espaço Pet.
2. Vê nome, categoria, descrição, bairro, horário, rótulo de anúncio
   (gratuito/patrocinado) e contato.
3. Clica em "WhatsApp" (`rel="noopener noreferrer"`) e contata o comerciante.
4. No rodapé da página há chamada para outros comerciantes se cadastrarem via `/anuncie`.

### Fluxo 3 — Comerciante se inclui no guia

1. Comerciante encontra a chamada "Cadastre seu comércio" (home ou página `/empresas`).
2. Vai para `/anuncie` (formulário existente, com honeypot e rate limiting já implementados).
3. Submissão entra na moderação manual do responsável (arquivo de conteúdo + git).
4. Quando publicado, o anúncio passa a aparecer em `/empresas` e ganha página `/empresas/[slug]`.

### Fluxo 4 — Visitante consulta telefones úteis e clima

1. Morador acessa `/utilidade-publica/telefones-uteis` (link no header/rodapé/home).
2. Vê categorias (emergências, saúde, serviços públicos…) apenas com números
   reais, cada um com fonte oficial.
3. Em `/previsao-do-tempo/sao-carlos`, vê a previsão do Open-Meteo com
   data/hora reais de atualização e estado honesto de falha.

## 9. Critérios de aceite

- A home mantém H1 único e ganha links internos para todas as páginas novas; nenhuma funcionalidade existente é removida.
- Toda página pública nova tem título, descrição e canonical próprios.
- `/admin` responde `noindex` e `/anuncie` mantém comportamento atual sem regressão.
- `robots.txt` continua permitindo tudo e apontando o `sitemap.xml`, que passa a incluir as páginas novas (exceto administrativas).
- `/noticias` lista os itens agregados dos feeds ordenados por data, com fonte e link original; `/avisos` e `/avisos/saae` idem com avisos.
- Nenhuma página indexável criada está vazia ou com menos de um item real de conteúdo.
- `/empresas/[slug]` existe para cada anúncio publicado e tem dados estruturados `LocalBusiness` válidos (Rich Results Test sem erros).
- `/utilidade-publica/telefones-uteis` exibe apenas números com fonte oficial verificável.
- Toda data de atualização exibida é real, em `America/Sao_Paulo`, com estado honesto de falha.
- Todos os links externos com `target="_blank"` têm `rel="noopener noreferrer"`.
- Site permanece responsivo; nenhum layout shift novo significativo; `npm run test`, `npm run lint` e `npm run build` passam.
- README documenta envio do sitemap no Search Console e monitoramento de indexação.

## 10. Stack

Inalterada: Next.js 16 (App Router, Turbopack), React 19, TypeScript 5 strict,
Tailwind CSS 4, Vitest + Testing Library, fast-xml-parser, deploy na Vercel.
Dados: módulos existentes (`modules/weather`, `modules/news`, `modules/notices`,
`modules/ads`, `modules/contacts`) + arquivos versionados em `src/content/`.
Nenhuma dependência nova.

## 11. Justificativa da stack

Tudo que o recorte precisa já existe no projeto: os módulos de dados prontos
alimentam as páginas novas (listagens reutilizam news/notices; guia reutiliza
ads; telefones reutiliza contacts; clima reutiliza weather), os componentes de
UI e tokens do design system dão identidade consistente, e o padrão
Server Components + `revalidate` mantém zero chamada externa por visita. Nova
dependência ou novo serviço seria complexidade sem benefício (critério 1 da
ordem de decisões da constituição: simplicidade).

## 12. Fases de construção

### Fase 1 — Fundação técnica (SEO base)

Objetivo: corrigir problemas técnicos de indexação e dar infraestrutura de SEO
para as páginas novas, sem criar páginas de conteúdo.

Specs:

- Spec 01 — Auditoria técnica de SEO, performance e acessibilidade
- Spec 02 — SEO técnico base: noindex, manifest, breadcrumbs, sitemap dinâmico

### Fase 2 — Páginas de conteúdo e institucionais

Objetivo: criar as páginas indexáveis de valor real (listagens e institucionais).

Specs:

- Spec 03 — Páginas institucionais: `/sobre`, `/contato`, `/termos-de-uso`
- Spec 04 — Listagens de notícias e avisos: `/noticias`, `/avisos`, `/avisos/saae`
- Spec 05 — Utilidade pública: `/utilidade-publica/telefones-uteis` e `/previsao-do-tempo/sao-carlos`

### Fase 3 — Guia comercial

Objetivo: páginas individuais de empresa com `LocalBusiness`, partindo dos
anúncios já publicados.

Specs:

- Spec 06 — Guia comercial: `/empresas` (hub) e `/empresas/[slug]`

### Fase 4 — Integração, navegação e indexação

Objetivo: conectar tudo na navegação existente e preparar para Search Console.

Specs:

- Spec 07 — Hub da home, header/rodapé e links internos
- Spec 08 — Search Console, sitemap e documentação no README

## 13. Specs funcionais detalhadas

### Spec 01 — Auditoria técnica de SEO, performance e acessibilidade

- **Fase:** Fase 1
- **Objetivo (o quê):** Produzir um diagnóstico objetivo, sem alterações, do
  estado atual do site em: renderização/HTML inicial, metadata, indexação,
  performance (Core Web Vitals por inspeção de código, não de campo), e
  acessibilidade.
- **Intenção (por quê):** Toda decisão das specs seguintes precisa de base
  factual; além disso a auditoria pode revelar problemas desconhecidos (ex.:
  impacto do service worker existente na cache do Googlebot, canonical faltando
  em `/anuncie`) que mudariam o plano.
- **Contexto:** Projeto Next.js 16 App Router; home com
  `revalidate = 1800` e dados buscados no servidor (HTML inicial completo);
  GA4 apenas em produção; service worker implementado (commit 6f65568) —
  precisa de avaliação explícita de risco de SEO.
- **Atores:** Implementador (agente de codificação); responsável revisa o relatório.
- **Descrição do comportamento:** Leitura estática do código e dos artefatos
  gerados (metadata, robots.ts, sitemap.ts, JSON-LD, layout, páginas) +
  build de produção para inspeção do HTML inicial. Produce diagnóstico
  organizado por severidade (crítico / médio / baixo) cobrindo os pontos
  solicitados: framework e método de renderização; presença do conteúdo no
  HTML inicial; estado de metadata/OG/favicon/canonical/robots/sitemap;
  páginas e rotas existentes; problemas de indexação; performance; acessibilidade;
  e presença/ausência de configuração de Search Console no projeto.
- **Entradas e saídas:** Entrada: código-fonte e build de produção. Saída:
  relatório de diagnóstico (documento markdown em `docs/` ou resposta ao
  usuário), sem nenhuma alteração de código.
- **Dados/entidades envolvidos (conceitual):** Não se aplica — não manipula
  dados de negócio; é inspeção.
- **Estados e transições:** Não se aplica.
- **Regras de negócio:** Regra 5 (datas honestas) e regra 9 (noindex admin)
  devem ser verificadas e apontadas se estiverem violadas.
- **Validações:** Nenhuma — é somente leitura.
- **Fluxo do usuário (passo a passo):**
  1. Rodar build de produção local e inspecionar o HTML gerado.
  2. Inspecionar `robots.ts`, `sitemap.ts`, metadata de cada rota e JSON-LD.
  3. Revisar contraste/hierarquia/foco nos componentes de UI existentes.
  4. Entregar o diagnóstico por severidade ao responsável.
- **Casos de borda e erros:** Se o build falhar localmente, reportar como
  bloqueador da entrega; não corrigir nesta spec.
- **Impacto no existente:** Nenhum (sem alterações).
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado o projeto, Quando a auditoria é entregue, Então ela cobre todos os
    itens listados na descrição, cada um com severidade e evidência (arquivo/rota).
  - Dado o `/admin`, Quando a auditoria é feita, Então a indexabilidade atual
    dele está explicitamente reportada.
  - Dado o service worker, Quando a auditoria é feita, Então o risco de SEO
    (ou ausência dele) está avaliado com justificativa.
- **Definição de pronto:** Relatório entregue ao responsável com todos os
  itens cobertos e nenhuma alteração no código.
- **Dependências:** Nenhuma.
- **Fora do escopo desta spec:** Qualquer correção, otimização ou alteração —
  inclusive as apontadas no relatório (entram nas demais specs).

### Spec 02 — SEO técnico base: noindex, manifest, breadcrumbs, sitemap dinâmico

- **Fase:** Fase 1
- **Objetivo (o quê):** Corrigir a fundação técnica de indexação: `noindex` em
  `/admin` e subrotas; `manifest.webmanifest` mínimo com ícones já existentes;
  componente de breadcrumb visual + dados estruturados `BreadcrumbList`
  reutilizável; `sitemap.ts` expandido para incluir dinamicamente as páginas
  novas, empresas publicadas e URLs institucionais.
- **Intenção (por quê):** Sem isso, qualquer página nova criada nas specs
  seguintes nasce sem infraestrutura de SEO — e `/admin` segue expondo área
  administrativa nos resultados de busca (problema de segurança e indexação).
- **Contexto:** `robots.ts` e `sitemap.ts` atuais (3 URLs); `JsonLd` em
  `src/components/seo/json-ld.tsx` com padrão de `@graph` e escape de `<` a
  ser seguido; ícones existentes em `src/app/` (icon.png, apple-icon.png);
  admin em `/admin` e `/admin/anuncios` (já protegidos por login).
- **Atores:** Visitante (recebe páginas corretas); Googlebot (deixa de
  indexar `/admin`).
- **Descrição do comportamento:** Toda rota administrativa (`/admin/*`)
  passa a declarar `robots: { index: false, follow: false }`. Um manifesto
  web mínimo (nome, cores do design system, ícones existentes) é referenciado
  no metadata global. Um componente de breadcrumb é criado no padrão dos
  componentes de UI existentes (Server Component, tokens de `globals.css`),
  renderiza trilha visual nas páginas novas e emite `BreadcrumbList` no JSON-LD
  no mesmo padrão de escape do `JsonLd` atual. O `sitemap.ts` passa a gerar
  URLs a partir das fontes reais: páginas institucionais fixas + empresas com
  `status: "publicado"` do loader de anúncios + páginas de conteúdo novas;
  administrativas jamais entram.
- **Entradas e saídas:** Entrada: loaders existentes (anúncios), lista fixa de
  rotas públicas. Saída: `sitemap.xml` dinâmico, manifesto, meta robots
  correta por rota, componente de breadcrumb.
- **Dados/entidades envolvidos (conceitual):** Anúncio (id, status, categoria)
  para gerar URLs do guia; rotas públicas fixas.
- **Estados e transições:** Não se aplica — infraestrutura estática.
- **Regras de negócio:** Regras 2, 6, 7 e 9.
- **Validações:** Nenhuma entrada do usuário; validação de que nenhuma URL
  administrativa aparece no sitemap.
- **Fluxo do usuário (passo a passo):**
  1. Googlebot lê `robots.txt` → segue para `sitemap.xml` dinâmico.
  2. Visitante vê breadcrumb nas páginas que o suportam.
  3. Browser do visitante baixa manifesto com ícones e cores do portal.
- **Casos de borda e erros:** Se não houver nenhuma empresa publicada, o
  sitemap não inclui URL de empresa (nunca URL vazia); manifesto degrada
  silenciosamente em navegadores sem suporte.
- **Impacto no existente:** `/admin` deixa de ser indexada (comportamento
  desejado); `sitemap.ts` e `layout.tsx` são modificados sem mudar nada
  visível na home.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado `/admin/anuncios`, Quando o Googlebot lê o HTML, Então ele encontra
    `noindex, nofollow`.
  - Dado o site, Quando `sitemap.xml` é solicitado, Então ele lista todas as
    páginas públicas (incluindo empresas publicadas) e nenhuma administrativa.
  - Dado o manifesto, Quando referenciado no metadata, Então nome, cores e
    ícones correspondem à identidade atual.
  - Dado um breadcrumb em qualquer página, Quando inspecionado, Então há
    `BreadcrumbList` válido no JSON-LD com a hierarquia real da página.
- **Definição de pronto:** Testes automatizados cobrindo a geração do sitemap
  (inclui empresas publicadas, exclui rascunhos e rotas admin) passando;
  lint/test/build verdes.
- **Dependências:** Nenhuma.
- **Fora do escopo desta spec:** Criação das páginas de conteúdo (specs
  03–06); alteração do visual do header/rodapé (Spec 07); busca no Google
  Search Console (Spec 08).

### Spec 03 — Páginas institucionais: `/sobre`, `/contato`, `/termos-de-uso`

- **Fase:** Fase 2
- **Objetivo (o quê):** Criar três páginas de texto com metadata, canonical e
  breadcrumb próprios: `/sobre` (propósito do portal, fontes que utiliza,
  aviso de independência editorial), `/contato` (canais diretos — WhatsApp e
  e-mail — sem formulário) e `/termos-de-uso` (condições de uso do portal,
  limitação de responsabilidade sobre informações de terceiros, regras para
  anúncios).
- **Intenção (por quê):** Páginas institucionais são requisito mínimo de
  confiança e SEO; `/sobre` e `/termos` dão profundidade temática e
  respondem "o que é este site" ao Google e ao visitante; `/contato` canaliza
  comerciantes interessados em anunciar. `/politica-de-privacidade` já existe
  e é referenciada, não duplicada.
- **Contexto:** `/politica-de-privacidade` e `/aviso-editorial` existem e
  definem o padrão de páginas de texto (metadata por página, canonical
  próprio). `env.contactWhatsapp` e `env.contactEmail` já existem;
  `lib/contact-links.ts` já gera links WhatsApp.
- **Atores:** Visitante; comerciante interessado em anunciar.
- **Descrição do comportamento:** As três páginas seguem o layout e tokens
  atuais (Server Components), com H1 único, breadcrumb, canonical próprio,
  metadados de título/descrição focados em "São Carlos/SP" escritos com
  linguagem simples e direta. `/contato` exibe os canais disponíveis; se um
  canal não estiver configurado no ambiente, simplesmente não é exibido
  (sem link quebrado). `/sobre` explica que o portal é independente, não é
  órgão oficial, e lista as fontes de conteúdo (Open-Meteo, feeds de
  notícias, SAAE) com os devidos avisos de independência já praticados no
  aviso-editorial. `/termos-de-uso` deixa claro: uso gratuito, informação de
  terceiros pode mudar, anunciante é responsável pela veracidade dos dados do
  próprio anúncio, o portal pode remover conteúdo.
- **Entradas e saídas:** Entrada: variáveis de ambiente de contato. Saída:
  3 páginas públicas indexáveis.
- **Dados/entidades envolvidos (conceitual):** Contato do responsável
  (WhatsApp, e-mail) — os mesmos já usados no hero e no rodapé.
- **Estados e transições:** Não se aplica — conteúdo estático.
- **Regras de negócio:** Regras 6 e 7; constituição — não se apresentar como
  órgão oficial (já praticado no aviso-editorial; reutilizar a redação).
- **Validações:** Nenhuma entrada do usuário.
- **Fluxo do usuário (passo a passo):**
  1. Visitante chega via Google ou link do rodapé.
  2. Lê a página; em `/contato` clica no WhatsApp ou e-mail.
  3. Comerciante é levado ao formulário `/anuncie` pela chamada presente na página.
- **Casos de borda e erros:** `CONTACT_WHATSAPP` ou `CONTACT_EMAIL` vazios →
  canal ausente na página sem layout quebrado (padrão já praticado no hero).
- **Impacto no existente:** Nenhum — páginas novas; o rodapé ganha link para
  `/sobre` e `/contato` apenas na Spec 07.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado `/sobre`, Quando inspecionada, Então tem H1 único, título,
    descrição, canonical e breadcrumb próprios e texto em pt-BR explicando o
    portal.
  - Dado `/contato`, Quando os canais estão configurados, Então WhatsApp e
    e-mail funcionam; quando um não está, ele não aparece.
  - Dado `/termos-de-uso`, Quando lido, Então contém limitação de
    responsabilidade sobre conteúdo de terceiros e regras para anúncios.
  - Dado o sitemap, Quando gerado, Então as três páginas estão incluídas.
- **Definição de pronto:** Páginas publicadas, navegáveis a partir do
  rodapé (após Spec 07) ou por URL direta, com testes de renderização
  básicos passando.
- **Dependências:** Spec 02 (breadcrumb/infraestrutura de metadata).
- **Fora do escopo desta spec:** Formulário de contato; alterar a política de
  privacidade existente; links de navegação (Spec 07).

### Spec 04 — Listagens de notícias e avisos: `/noticias`, `/avisos`, `/avisos/saae`

- **Fase:** Fase 2
- **Objetivo (o quê):** Criar páginas de listagem indexáveis para o conteúdo
  que hoje só existe na home: `/noticias` (todas as notícias agregadas dos
  feeds, ordenadas por data) e `/avisos` + `/avisos/saae` (avisos do SAAE via
  RSS + curadoria do portal). Listagem **simples**, sem busca nem filtros
  (decisão fechada).
- **Intenção (por quê):** Capturar buscas locais por tema e dar ao
  visitante uma página completa além das 5 notícias/3 avisos da home;
  cada item leva o usuário à fonte oficial, fortalecendo a reputação do
  portal e cumprindo a constituição (título + resumo + data + fonte + link).
- **Contexto:** `modules/news/adapter.ts` (feeds: São Carlos Agora, G1 com
  filtro, Google News; dedupe por título; máx. 20) e
  `modules/notices/adapter.ts` (SAAE + `content/notices.json`, merge, máx. 12)
  já retornam `ModuleResult<T>` com `status`, `lastUpdated` e
  `errorMessage`. Home limita a 5/3 — as listagens mostram o total disponível.
- **Atores:** Morador/visitante; Googlebot.
- **Descrição do comportamento:** Cada listagem é Server Component com
  `revalidate` alinhado ao da home (nenhuma chamada por visita), H1 único,
  título/descrição/canonical próprios com "São Carlos/SP" natural, breadcrumb.
  Itens exibem: título (link para o original, `target="_blank"` +
  `rel="noopener noreferrer"`), resumo curto, data/hora da publicação em
  `America/Sao_Paulo`, rótulo textual da fonte e `ContentLabel` do tipo.
  A ordenação é por data decrescente. Estados de módulo são exibidos com os
  componentes de status já existentes: `ok` lista normalmente; `stale` lista
  o último conteúdo válido + aviso de "última atualização em X"; `error`
  exibe "Dados indisponíveis" + link da fonte oficial quando existir — nunca
  erro técnico. `/avisos/saae` filtra para o feed do SAAE apenas (fonte já
  configurada); não há `/avisos/cpfl` nem `/avisos/prefeitura` (sem fonte —
  regra 10).
- **Entradas e saídas:** Entrada: módulos news e notices existentes. Saída:
  3 páginas indexáveis com listagens completas.
- **Dados/entidades envolvidos (conceitual):** Notícia (título, resumo,
  data, fonte, link, categoria quando disponível); Aviso (id, origem SAAE ou
  portal, título, resumo, data, link, status).
- **Estados e transições:** `ModuleResult.status` → estado visual da página
  (mesma semântica da home).
- **Regras de negócio:** Regras 1, 4, 5, 6, 7, 8, 10.
- **Validações:** Nenhuma entrada do usuário.
- **Fluxo do usuário (passo a passo):**
  1. Visitante abre `/noticias` (via home ou busca).
  2. Vê lista por data com fonte em cada item.
  3. Clica em uma notícia → abre o site original da fonte em nova aba.
  4. Em `/avisos/saae`, filtra mentalmente para avisos da água; cada item
     leva ao comunicado oficial do SAAE.
- **Casos de borda e erros:** Feed vazio hoje (HTTP 200 sem itens) → mensagem
  amigável "Nenhuma notícia nova no momento" + link da fonte; feed falho →
  `stale` (último + aviso) ou `error` ("Dados indisponíveis"); notícia sem
  data → não listada (regra 5 — nunca exibir data inventada); título vazio →
  item descartado (já prática dos normalizadores).
- **Impacto no existente:** Nenhum — reutiliza os módulos sem alterá-los; a
  home mantém seus limites de 5/3.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado o feed com 12 notícias, Quando `/noticias` é aberta, Então todas
    (até o limite do módulo) aparecem ordenadas por data decrescente.
  - Dado cada item de notícia, Quando inspecionado, Então tem título,
    resumo, data, rótulo de fonte e link externo com `rel="noopener noreferrer"`.
  - Dado o feed do SAAE falho, Quando `/avisos/saae` é aberta, Então a
    página mostra estado honesto (stale ou "Dados indisponíveis") sem erro técnico.
  - Dado o sitemap, Quando gerado, Então `/noticias`, `/avisos` e
    `/avisos/saae` estão incluídas (itens individuais de feed **não** entram
    no sitemap — são efêmeros e apontam para fora).
- **Definição de pronto:** Páginas publicadas com testes cobrindo os três
    estados (`ok`/`stale`/`error`) das listagens; lint/test/build verdes.
- **Dependências:** Spec 02 (breadcrumb/sitemap).
- **Fora do escopo desta spec:** Páginas individuais de notícia/aviso
  (`[slug]`); filtros e busca; categorias; `/avisos/cpfl` e `/avisos/prefeitura`.

### Spec 05 — Utilidade pública: telefones úteis e previsão do tempo

- **Fase:** Fase 2
- **Objetivo (o quê):** Criar `/utilidade-publica` (hub textual curto) e
  `/utilidade-publica/telefones-uteis` (telefones por categoria, com fontes
  oficiais), além de `/previsao-do-tempo/sao-carlos` (página dedicada
  reutilizando o módulo Open-Meteo).
- **Intenção (por quê):** "Telefones úteis São Carlos" e "previsão do tempo
  São Carlos" são buscas locais clássicas de alto valor; o portal já tem os
  dados (contacts.json + weather module) mas escondidos na home. Páginas
  dedicadas transformam utilidade em visibilidade orgânica.
- **Contexto:** `content/contacts.json` tem hoje 4 entradas (Bombeiros 193,
  SAMU 192, Defesa Civil 199, link da Prefeitura) com campos `kind`, `value`,
  `officialUrl`, `urgent`. `modules/weather` (Open-Meteo, coordenadas fixas
  de São Carlos) já fornece previsão de 5 dias com tratamento de falha.
- **Atores:** Morador; visitante da região; Googlebot.
- **Descrição do comportamento:** `/utilidade-publica/telefones-uteis` lista
  categorias (Emergências, Saúde, Segurança, Serviços públicos, Energia,
  Água, Transporte, Prefeitura, Defesa Civil, Bombeiros, Polícia, SAMU —
  apenas as que tiverem dados reais) com os contatos carregados do loader
  existente. Cada contato exibe nome, valor (telefone clicável `tel:` ou
  link), horário quando existir, rótulo `servico-publico`/`contato` e, quando
  existir, link para a fonte oficial. **Durante a implementação**, o
  implementador pesquisa em fontes oficiais (sites do SAAE São Carlos, CPFL
  Paulista, Prefeitura de São Carlos, hospitais públicos, terminal de ônibus
  da cidade) e adiciona ao `contacts.json` apenas números com `officialUrl`
  identificável; categorias sem dados reais não aparecem. O responsável
  valida tudo no diff (moderação por git, prática atual). A página
  `/previsao-do-tempo/sao-carlos` reutiliza o componente de clima existente
  em página própria, mostrando os 5 dias, data/hora reais da atualização em
  `America/Sao_Paulo` e os estados `stale`/`error` já praticados.
  Ambas as páginas têm H1 único, metadata/canonical/breadcrumb próprios com
  "São Carlos/SP" natural.
- **Entradas e saídas:** Entrada: `contacts.json` (+ números oficiais novos
  validados), módulo weather. Saída: 3 páginas indexáveis.
- **Dados/entidades envolvidos (conceitual):** Contato útil (nome, valor,
  categoria, horário, fonte oficial, urgência); Previsão do tempo (dias,
  min/max, condição, última atualização).
- **Estados e transições:** `ModuleResult.status` do clima → mesmo padrão
  visual de stale/error da home.
- **Regras de negócio:** Regras 1, 5, 6, 7, 10; constituição — avaliação de
  fontes obrigatória (cada número novo com `officialUrl`).
- **Validações:** Nenhum número entra sem fonte oficial verificável; o
  responsável valida o diff.
- **Fluxo do usuário (passo a passo):**
  1. Morador busca "telefone SAMU São Carlos" → acha a página.
  2. Vê emergências primeiro (192/193/199), com horário 24h.
  3. Navega para serviços públicos/energia/água com links oficiais.
  4. Consulta a previsão em `/previsao-do-tempo/sao-carlos` e vê a data
     real da última atualização.
- **Casos de borda e erros:** Categoria sem nenhum contato → a categoria não
  renderiza; número sem `officialUrl` → não publicado (regra 1); Open-Meteo
  fora → estado stale/error idêntico ao da home (consistência); `tel:` com
  valor URL (Prefeitura) → vira link http(s), não `tel:`.
- **Impacto no existente:** `contacts.json` ganha novas entradas (puramente
  aditivo, validado pelo responsável); loader e home não mudam de comportamento.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado `/utilidade-publica/telefones-uteis`, Quando inspecionada, Então
    cada número exibido tem fonte oficial vinculada e categorias vazias não aparecem.
  - Dado um contato com valor numérico, Quando clicado, Então dispara `tel:`.
  - Dado o Open-Meteo falho, Quando `/previsao-do-tempo/sao-carlos` é
    aberta, Então o estado honesto de falha é exibido (nunca dado velho como atual).
  - Dado o sitemap, Quando gerado, Então as três páginas estão incluídas.
- **Definição de pronto:** Páginas publicadas; números novos revisados e
  aprovados pelo responsável; testes do loader com as novas entradas passando.
- **Dependências:** Spec 02 (breadcrumb/sitemap).
- **Fora do escopo desta spec:** Páginas por bairro; novas fontes de dados
  além dos números oficiais pesquisados; alteração das coordenadas ou
  parâmetros do Open-Meteo.

### Spec 06 — Guia comercial: `/empresas` (hub) e `/empresas/[slug]`

- **Fase:** Fase 3
- **Objetivo (o quê):** Transformar os anúncios publicados em páginas
  indexáveis: `/empresas` lista todas as empresas publicadas agrupadas por
  categoria (sem rotas de categoria — decisão fechada) e `/empresas/[slug]`
  é a página individual da empresa com dados estruturados `LocalBusiness`.
- **Intenção (por quê):** Buscas locais por empresa/serviço têm intenção
  comercial alta e baixa concorrência em cidades médias; cada página
  individual é um ponto de entrada orgânico e um canal de contato direto —
  valor para o morador (acha o serviço) e para o comerciante (é
  encontrado), sustentando o modelo de anúncios do portal.
- **Contexto:** `modules/ads/loader.ts` já valida e filtra anúncios
  (status publicado, contato obrigatório, expiração); `content/ads.json`
  tem 3 publicados (Espaço Pet — Animais, Jardim Embaré; LUCAR Mecânica —
  Mecânica, Redenção; Roldan Móveis — Móveis, Jardim Embaré) e 1 rascunho.
  Formulário `/anuncie` já existe para captação; `lib/contact-links.ts`
  gera links WhatsApp.
- **Atores:** Morador/visitante; comerciante; Googlebot.
- **Descrição do comportamento:** `/empresas` lista empresas publicadas
  agrupadas visualmente por categoria (seções H2 por categoria, ordem
  estável), cada uma com nome, categoria, bairro, descrição curta e
  indicação textual do tipo de anúncio (gratuito/patrocinado). A página tem
  chamada para cadastro via `/anuncie`. `/empresas/[slug]` usa o `id` do
  anúncio como slug (URLs estáveis) e exibe: nome (H1 único), categoria,
  descrição, bairro, horário, telefone, WhatsApp (botão, link externo com
  `rel="noopener noreferrer"`), site quando existir, rótulo de
  `ContentLabel`, e aviso de que os dados são fornecidos pelo próprio
  anunciante. O JSON-LD `LocalBusiness` é gerado no servidor a partir dos
  campos do anúncio (name, description, address como `PostalAddress` com
  addressLocality São Carlos, telephone, openingHours textual quando
  existir, url do portal da página) — **sem inventar campos** que o anúncio
  não tenha (sem geoCoordinates, sem priceRange, sem image: fotos não são
  suportadas na fase atual, constituição Art. III). Anúncio expirado
  (`expiresAt` anterior à data atual) deixa de ser listado e sua URL responde
  404 (não redireciona). Ambas as páginas têm metadata/canonical/breadcrumb
  próprios com nome da empresa + "São Carlos/SP" no título.
- **Entradas e saídas:** Entrada: anúncios publicados do loader. Saída:
  1 hub + N páginas individuais (hoje 3).
- **Dados/entidades envolvidos (conceitual):** Anúncio (id/slug, businessName,
  category, description, neighborhood, phone, whatsapp, url, hours, kind,
  status, expiresAt) — schema já existente, nenhum campo novo obrigatório.
- **Estados e transições:** publicado → listado e com página; rascunho/
  suspenso/removido → invisível; expirado → removido do guia (transição
  calculada a cada build/revalidação).
- **Regras de negócio:** Regras 1, 2, 6, 7, 8, 10; constituição — publicidade
  transparente (rótulo textual em toda página de empresa).
- **Validações:** Slug deriva do `id` já validado pelo loader; página de
  anúncio sem pelo menos um contato não é publicável (constraint já existente).
- **Fluxo do usuário (passo a passo):**
  1. Visitante pesquisa "móveis planejados São Carlos" → acha
     `/empresas/roland-moveis-planejados`.
  2. Vê descrição, bairro (Jardim Embaré), horário e rótulo "Anúncio patrocinado".
  3. Clica WhatsApp → conversa direta com o comerciante.
  4. Rodapé convida outros comerciantes: "Quer aparecer aqui? Cadastre seu comércio".
- **Casos de borda e erros:** Slug inexistente ou de anúncio não publicado →
  404; anúncio sem horário → seção de horário ausente; anúncio sem site →
  só telefone/WhatsApp; empresa sem WhatsApp mas com telefone → link `tel:`;
  categoria com 1 empresa → funciona como seção do hub, sem rota própria.
- **Impacto no existente:** Aditivo — nenhum componente ou loader é alterado
  de comportamento; a home continua exibindo a seção de anúncios como hoje.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um anúncio publicado, Quando `/empresas` é aberta, Então ele
    aparece na seção da sua categoria com rótulo de tipo de anúncio.
  - Dado o rascunho existente no `ads.json`, Quando `/empresas` e o sitemap
    são gerados, Então ele não aparece em lugar nenhum.
  - Dado `/empresas/[slug]`, Quando validado no Rich Results Test, Então o
    `LocalBusiness` não tem erros.
  - Dado um anúncio com `expiresAt` no passado, Quando a página é gerada,
    Então a URL responde 404 e ele sai do sitemap.
  - Dado o sitemap, Quando gerado, Então todas as empresas publicadas têm URL incluída.
- **Definição de pronto:** Hub e páginas individuais publicadas com JSON-LD
  validado; testes do loader cobrindo expiração; lint/test/build verdes.
- **Dependências:** Spec 02 (breadcrumb/sitemap) e Spec 07 (link do guia na
  navegação — pode ser entregue em paralelo).
- **Fora do escopo desta spec:** Rotas de categoria; busca e filtros; fotos
  de empresas; formulário novo; edição de anúncios pelo comerciante;
  geolocalização/mapa.

### Spec 07 — Hub da home, header/rodapé e links internos

- **Fase:** Fase 4
- **Objetivo (o quê):** Conectar as páginas novas na navegação: home reforçada
  como hub local (links internos para todas as seções, preservando H1 e ordem
  editorial), header e rodapé com links internos relevantes, garantindo que
  toda página importante esteja a no máximo 3 cliques da home.
- **Intenção (por quê):** Páginas novas sem links internos são quase
  invisíveis para usuários e bots; o crawl interno é o que distribui autoridade
  e descoberta. A home deve continuar transmitindo utilidade imediata — não
  virar uma lista genérica de links.
- **Contexto:** Home atual com HeroSection (H1 único existente: "O Portal de
  Informação e Negócios de São Carlos e Região"), 6 módulos e
  AnnounceCTA; header com nav por âncoras (`#noticias`, `#clima`, …) e
  rodapé com versão/emergências/políticas. Decisão de design registrada:
  sem faixa de alerta e sem caixa de busca no header — preservada.
- **Atores:** Visitante; Googlebot.
- **Descrição do comportamento:** A home mantém módulos e H1; os blocos de
  notícias e avisos ganham link "Ver todas as notícias" → `/noticias` e
  "Ver todos os avisos" → `/avisos`; a seção de contatos ganha link para
  `/utilidade-publica/telefones-uteis`; a seção de anúncios ganha link para
  `/empresas`; o hero ou a seção de clima ganha link para
  `/previsao-do-tempo/sao-carlos`. O header ganha links de página
  (Notícias, Avisos, Empresas, Telefones) integrados à nav existente sem
  remover as âncoras; o rodapé ganha seção de links internos (Sobre,
  Contato, Termos de uso, Guia comercial, Telefones úteis) além dos links
  de política já existentes. Nenhum link novo usa `target="_blank"` sem
  `rel="noopener noreferrer"` (links internos abrem na mesma aba).
- **Entradas e saídas:** Entrada: páginas das specs 03–06 existentes. Saída:
  grafo de links internos completo, ≤3 cliques para qualquer página.
- **Dados/entidades envolvidos (conceitual):** Não se aplica — navegação.
- **Estados e transições:** Não se aplica.
- **Regras de negócio:** Regra 3 (ordem editorial preservada); decisão de
  design registrada (sem busca, sem faixa de alerta).
- **Validações:** Nenhum link para rota inexistente (teste automatizado
  recomendado).
- **Fluxo do usuário (passo a passo):**
  1. Visitante abre a home e vê utilidade imediata (clima, avisos, notícias) como hoje.
  2. Clica "Ver todas as notícias" → `/noticias`.
  3. pelo header chega a `/empresas`; pelo rodapé a `/sobre`.
- **Casos de borda e erros:** Página da spec anterior não implantada → o
  link não é adicionado (zero link quebrado — specs ordenadas para evitar
  isso); mobile → nav mantém padrão responsivo atual (menu existente).
- **Impacto no existente:** Header/footer/home são modificados
  aditivamente; nenhuma funcionalidade é removida (regra da instrução
  original: nada removido sem justificativa).
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado o site, Quando qualquer página importante é acessada pela home,
    Então o caminho tem no máximo 3 cliques.
  - Dado o header, Quando inspecionado, Então as âncoras existentes
    continuam funcionando e os novos links internos estão presentes.
  - Dado o código, Quando os links internos são revisados, Então nenhum
    aponta para rota inexistente (verificado por teste).
- **Definição de pronto:** Navegação completa, teste de links internos
  passando, regressão visual zero (páginas renderizadas com os testes
  existentes).
- **Dependências:** Specs 03, 04, 05, 06 (toda página linkada deve existir).
- **Fora do escopo desta spec:** Redesign; busca; faixa de alerta;
  alteração do AnnounceCTA.

### Spec 08 — Search Console, sitemap e documentação no README

- **Fase:** Fase 4
- **Objetivo (o quê):** Deixar o projeto pronto para Google Search Console:
  suporte ao método de verificação (meta tag quando o código for fornecido),
  sitemap referenciado no `robots.txt` (já é) e documentação no README com o
  processo completo: enviar sitemap, solicitar indexação, monitorar páginas
  não indexadas e acompanhar métricas (consultas, impressões, cliques, CTR).
- **Intenção (por quê):** Indexar sem monitorar é trabalhar às cegas; a
  documentação garante que o responsável consiga operar o SEO depois que a
  implementação terminar, sem depender do agente.
- **Contexto:** GA4 já autorizado pela emenda v1.1.0 (métricas de audiência);
  Search Console é ferramenta distinta, gratuita, não prevista na
  constituição mas compatível (não coleta dados pessoais de visitantes —
  é plataforma do próprio site). `robots.txt` já aponta o sitemap.
- **Atores:** Responsável pelo portal; implementador.
- **Descrição do comportamento:** O metadata global ganha suporte a uma meta
  tag de verificação do Search Console **apenas quando o responsável
  fornecer o código** (variável de ambiente opcional, sem valor no repo —
  nada é inventado). O README do projeto é atualizado com seção de SEO
  contendo: (1) como verificar o domínio no Search Console (recomendação:
  verificação por DNS para cobrir domínio inteiro www+apex); (2) como enviar
  o `sitemap.xml`; (3) como solicitar indexação de URLs novas; (4) como
  investigar páginas não indexadas no relatório de cobertura; (5) como
  acompanhar consultas/impressões/cliques/CTR e interpretar as quedas;
  (6) fluxo de atualização de conteúdo (anúncios via `src/content/*.json`,
  aprovação por git). Uma página `/sitemap` legível para humanos é criada
  **apenas** se trivial com os dados já disponíveis (não confundir com
  `sitemap.xml`).
- **Entradas e saídas:** Entrada: código de verificação (fornecido pelo
  usuário, quando tiver). Saída: README documentado + metadata preparado.
- **Dados/entidades envolvidos (conceitual):** Código de verificação
  Search Console (valor opaco fornecido externamente).
- **Estados e transições:** Variável ausente → nenhuma meta tag renderizada
  (comportamento atual preservado); variável presente → meta tag no `<head>`.
- **Regras de negócio:** Nenhum segredo no cliente além do que já é público
  (código de verificação do GSC é público por natureza, como o ID do GA4).
- **Validações:** Código de verificação só entra por variável de ambiente;
  nunca hardcoded.
- **Fluxo do usuário (passo a passo):**
  1. Responsável cria a propriedade no Search Console e obtém o código.
  2. Configura a variável de ambiente na Vercel (Production) e redeploya.
  3. Confirma a verificação no Search Console.
  4. Envia o sitemap e acompanha a cobertura conforme o README.
- **Casos de borda e erros:** Sem código → nada quebra, documentação cobre o
  passo manual; domínio com redirect apex→www → recomendação de verificação
  por DNS evita problema de propriedade duplicada.
- **Impacto no existente:** README ganha seção; metadata global ganha campo
  condicional — zero mudança visível.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado o README, Quando lido, Então contém o passo a passo completo de
    Search Console e de atualização de conteúdo.
  - Dado o código de verificação configurado, Quando o HTML do `<head>` é
    inspecionado, Então a meta tag do Search Console está presente.
  - Dado o código sem a variável, Quando o site é buildado, Então nenhuma
    meta tag vazia/inválida é emitida.
- **Definição de pronto:** README publicado com a seção; suporte à meta tag
  implementado e testado com e sem a variável.
- **Dependências:** Spec 02 (sitemap final).
- **Fora do escopo desta spec:** Criar/verificar a propriedade no Search
  Console (ação do responsável); dashboards de métricas; qualquer nova
  ferramenta de analytics (exigiria emenda à constituição).

## 14. Ordem recomendada de implementação

1. Spec 01 — Auditoria (base factual; pode revelar bloqueadores).
2. Spec 02 — SEO técnico base (infraestrutura que as specs 03–06 usam).
3. Spec 03 — Páginas institucionais (independentes entre si).
4. Spec 04 — Listagens de notícias e avisos.
5. Spec 05 — Telefones úteis e previsão do tempo.
6. Spec 06 — Guia comercial.
7. Spec 07 — Hub da home e navegação (depende de 03–06 existirem para não
   criar link quebrado).
8. Spec 08 — Search Console e documentação (fecha a entrega).

Seguir essa ordem evita três armadilhas: criar páginas sem infraestrutura de
SEO (specs 03–06 antes da 02), criar links internos para páginas ainda não
existentes (spec 07 antes das demais) e declarar a entrega pronta antes de
documentar a operação contínua (spec 08 por último).
