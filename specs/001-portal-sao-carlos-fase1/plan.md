# Implementation Plan: Portal São Carlos — Fase 1 (Portal Público)

**Branch**: `001-portal-sao-carlos-fase1` | **Date**: 2026-09-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-portal-sao-carlos-fase1/spec.md`

## Summary

Portal público de utilidade pública para São Carlos/SP: landing page server-rendered
com cinco módulos de conteúdo independentes (previsão do tempo, notícias,
informativos, anúncios, contatos úteis), cada um com adapter próprio de fonte
externa, normalização para um modelo interno comum, cache com revalidação e
degradação graciosa (falha de um módulo não afeta os demais). Conteúdo gerenciado
manualmente pelo responsável (anúncios e informativos em arquivos versionados no
repositório), sem banco de dados, login, pagamentos ou upload de imagens —
exatamente como determina a constituição v1.0.0.

**Abordagem técnica**: Next.js 16 (App Router) + TypeScript + Tailwind CSS,
Server Components por padrão, busca de fontes externas no servidor com cache/ISR,
sanitização por remoção de HTML (texto puro), SEO local via metadados, JSON-LD,
sitemap e robots.

## Technical Context

**Language/Version**: TypeScript 5.x (strict), React 19, Node.js 22+ (LTS)

**Primary Dependencies**: Next.js 16.x (App Router) — [registry npm `next@latest` = 16.3.6](https://registry.npmjs.org/next/latest); Tailwind CSS 4.x

**Storage**: N/A — sem banco de dados na Fase 1; conteúdo externo via cache com
revalidação (ISR) e conteúdo estático do portal (anúncios/informativos) em
arquivos versionados no repositório

**Testing**: Vitest + React Testing Library (unit/integration de componentes e
normalizadores); validação E2E manual via [quickstart.md](./quickstart.md);
Playwright opcional para smoke automatizado

**Target Platform**: Web mobile-first (dispositivos móveis e conexões lentas);
deploy em Vercel (serverless/ISR nativo)

**Project Type**: Web application (landing page / portal local)

**Performance Goals**: página inicial utilizável em ≤ 3 s em conexão móvel típica
(SC-001); carregamento sem bloqueio por publicidade; JS mínimo no cliente
(Server Components por padrão, Client Components somente quando necessário)

**Constraints**: sem login/cadastro, sem pagamento, sem upload de imagens, sem
comentários, sem publicação automática (constituição); falha de qualquer fonte
externa resulta em página utilizável com aviso amigável e 0% de erro técnico
(SC-004); 100% dos itens críticos de acessibilidade aprovados (SC-005); segredos
somente em variáveis de ambiente, nunca no frontend (constituição §Segurança)

**Scale/Scope**: 1 portal; ~5 módulos de conteúdo; páginas: inicial + política
de privacidade + aviso editorial (contatos na inicial); tráfego local de
São Carlos (ordem de milhares de visitas/mês); ~20 requisitos funcionais

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Gate (constituição v1.0.0) | Status | Como o plano atende |
| --- | ------------------------- | ------ | ------------------- |
| 1 | Sem pagamentos integrados | ✅ PASS | Nenhum checkout/gateway/PIX; contratação por WhatsApp/telefone (FR-009) |
| 2 | Sem login/cadastro | ✅ PASS | Conteúdo 100% público e anônimo (FR-017) |
| 3 | Sem dashboard | ✅ PASS | Anúncios gerenciados por arquivos versionados; moderação manual (FR-020) |
| 4 | Sem imagens armazenadas | ✅ PASS | Conteúdo textual; Open Graph sem imagem própria; nenhum upload/storage (FR-018) |
| 5 | Sem comentários/fórum/marketplace | ✅ PASS | Fora do escopo, nenhuma rota ou componente previsto |
| 6 | Sem publicação automática sem revisão | ✅ PASS | Anúncios/informativos entram por edição versionada com revisão humana (FR-020) |
| 7 | Privacidade por minimização | ✅ PASS | Sem formulários na Fase 1 → zero coleta de dados pessoais; política de privacidade publicada (FR-011) |
| 8 | Acesso a APIs no servidor + normalização | ✅ PASS | Adapters de fonte em módulos server-side; modelo interno comum (FR-002, FR-021; ver [contracts/content-source-adapter.md](./contracts/content-source-adapter.md)) |
| 9 | Segredos em variáveis de ambiente | ✅ PASS | Fontes escolhidas não exigem chave; qualquer override futuro em env (ver [quickstart.md](./quickstart.md)) |
| 10 | Falhas isoladas por módulo | ✅ PASS | Cada módulo com estado próprio de atualização; resultado `ok/stale/error` (FR-013, SC-004) |
| 11 | HTML externo não confiável sanitizado | ✅ PASS | Remoção de HTML → texto puro; `dangerouslySetInnerHTML` proibido (FR-021) |
| 12 | Publicidade transparente | ✅ PASS | Rótulos obrigatórios e diferenciação semântica dos 6 tipos de conteúdo (FR-006, FR-007, FR-008; ver [contracts/section-module-contract.md](./contracts/section-module-contract.md)) |
| 13 | Responsabilidade editorial | ✅ PASS | Fonte + link em todo conteúdo externo; aviso editorial publicado (FR-002, FR-003, FR-011) |
| 14 | Sem banco de dados obrigatório | ✅ PASS | Persistência N/A; conteúdo do portal em arquivos versionados |
| 15 | Acessibilidade e performance | ✅ PASS | Requisitos FR-014/FR-015; metas SC-001/SC-005 |
| 16 | SEO local sem spam | ✅ PASS | URLs legíveis, metadados, sitemap/robots, JSON-LD; sem páginas artificiais (FR-016) |
| 17 | Conteúdo em pt-BR, sem sensacionalismo | ✅ PASS | FR-019 |

**Gate result (pré-Phase 0)**: PASS — nenhuma violação.

**Gate result (pós-Phase 1, re-avaliação)**: PASS — design de dados, contratos e
quickstart mantêm todos os 17 gates; nenhuma violação a justificar.

## Project Structure

### Documentation (this feature)

```text
specs/001-portal-sao-carlos-fase1/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── content-source-adapter.md
│   └── section-module-contract.md
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit-specify)
├── spec.md              # Feature specification
└── tasks.md             # Phase 2 output (/speckit-tasks - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx                    # Layout raiz, header, footer, metadados globais
│   ├── page.tsx                      # Página inicial (monta os módulos)
│   ├── politica-de-privacidade/
│   │   └── page.tsx
│   ├── aviso-editorial/
│   │   └── page.tsx
│   ├── robots.ts                     # robots.txt
│   └── sitemap.ts                    # sitemap.xml
├── components/
│   ├── layout/                       # Header, Footer, Navigation
│   ├── sections/                     # Um componente por módulo de conteúdo
│   │   ├── weather-section.tsx
│   │   ├── news-section.tsx
│   │   ├── notices-section.tsx
│   │   ├── ads-section.tsx
│   │   ├── contacts-section.tsx
│   │   └── promo-section.tsx         # Divulgação própria/parceiro (rotulada)
│   └── ui/                           # Rótulos de conteúdo, estados de erro/stale, badges
├── modules/                          # Lógica de domínio, isolada do framework
│   ├── weather/
│   │   ├── adapter.ts                # Busca na fonte externa
│   │   ├── normalize.ts              # → modelo interno WeatherData
│   │   └── types.ts
│   ├── news/                         # adapter.ts, normalize.ts, types.ts
│   ├── notices/                      # Fonte: conteúdo versionado (curadoria manual)
│   ├── ads/                          # Fonte: conteúdo versionado (moderação manual)
│   └── contacts/                     # Fonte: conteúdo versionado
├── lib/
│   ├── fetch-cached.ts               # Fetch com cache + revalidação + timeout
│   ├── sanitize.ts                   # Remoção de HTML → texto puro
│   ├── module-result.ts              # Resultado ok/stale/error com lastUpdated
│   └── logger.ts                     # Log estruturado de falhas de fonte
├── config/
│   ├── env.ts                        # Variáveis de ambiente validadas
│   └── sources.ts                    # Registro configurável de fontes (feeds)
└── content/                          # Conteúdo gerido manualmente pelo responsável
    ├── ads.json                      # Anúncios (gratuitos/patrocinados) com status
    ├── notices.json                  # Informativos oficiais curados
    ├── contacts.json                 # Telefones e links úteis
    └── promo.json                    # Divulgações próprias/parceiros

tests/
├── unit/                             # Normalizadores, sanitização, module-result
├── integration/                      # Adapters com respostas simuladas
└── components/                       # Renderização e rótulos das seções
```

**Structure Decision**: estrutura única de aplicação web (opção "web application"
do template, simplificada para um único app Next.js — não há backend separado).
A separação-chave é `modules/` (domínio + adapters de fonte, testável sem UI) ×
`components/sections/` (renderização) × `content/` (conteúdo curado manualmente,
moderado por revisão de versão no repositório). Essa fronteira satisfaz os gates
8, 10, 11 e 12 da constituição e mantém a integração externa isolada e substituível
(manutenibilidade: trocar um RSS quebra apenas `modules/news/adapter.ts`).

## Complexity Tracking

Nenhuma violação da constituição foi identificada (17/17 gates PASS nas duas
avaliações). Nenhuma linha de justificativa é necessária nesta seção.
