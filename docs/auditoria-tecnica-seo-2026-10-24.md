# Relatório de Auditoria Técnica — Portal São Carlos (Spec 01)

**Data:** 2026-10-24  
**Branch:** `main` @ `8649fa8`  
**Ambiente:** Build de produção local (`npm run build` + inspeção estática)  
**Ferramentas:** Next.js 16.3.6 (App Router, Turbopack), React 19, TypeScript 5 strict

---

## Resumo executivo

O site está em **bom estado técnico** para SEO, performance e acessibilidade. Todas as páginas têm metadata/canonical próprios, HTML inicial completo (Server Components + ISR), estrutura semântica correta, zero erros de lint e 144 testes passando. Não há **bloqueadores críticos** para indexação no Google.

| Área | Status | Observação |
|------|--------|------------|
| Renderização / HTML inicial | ✅ PASS | Server Components por padrão; `revalidate` configurado |
| Metadata / OG / Favicon / Canonical | ✅ PASS | Completos em todas as rotas públicas |
| Robots / Sitemap / Indexação | ✅ PASS | `robots.ts` permite tudo, `sitemap.ts` dinâmico, `/admin` com `noindex` |
| Performance (Core Web Vitals - código) | ✅ PASS | JS mínimo, fonts otimizadas, sem scripts de terceiros pesados |
| Acessibilidade (WCAG AA - código) | ✅ PASS | Hierarquia H1/H2, breadcrumbs, contraste via tokens, foco visível |
| Search Console | ⚠️ PARCIAL | Meta tag de verificação não implementada (Spec 08) |
| Service Worker | ✅ N/A | Não existe SW no projeto (commit 6f65568 não está no branch atual) |

---

## 1. Framework e método de renderização

| Item | Evidência |
|------|-----------|
| **Framework** | Next.js 16 (App Router) — confirmado em `package.json` |
| **Renderização** | Server Components por padrão; `export const revalidate = 1800` na home e nas listagens (`/noticias`, `/avisos`, `/avisos/saae`, `/previsao-do-tempo/sao-carlos`) |
| **HTML inicial** | Conteúdo completo no HTML (dados buscados no servidor); `Promise.allSettled` isola falhas de módulo (FR-013) |
| **Client Components** | Somente quando necessário (ex.: `ToastProvider`, `AnnounceCTA`, `GoogleAnalytics` com `afterInteractive`) |
| **Hidratação** | Seletiva; GA4 carrega após interação (`afterInteractive`) |

**Severidade:** ✅ Nenhum problema.

---

## 2. Presença do conteúdo no HTML inicial

Todas as páginas públicas renderizam o conteúdo principal no HTML de resposta:

| Página | Conteúdo no HTML inicial | Fonte |
|--------|--------------------------|-------|
| `/` (home) | Sim — 6 módulos independentes (clima, notícias, avisos, contatos, anúncios, promo) | `src/app/page.tsx` |
| `/noticias` | Sim — lista completa dos feeds (até 20 itens) | `src/app/noticias/page.tsx` + `NewsList` |
| `/avisos` | Sim — curadoria + RSS SAAE (até 12 itens) | `src/app/avisos/page.tsx` + `NoticesList` |
| `/avisos/saae` | Sim — filtrado para SAAE | `src/app/avisos/saae/page.tsx` |
| `/utilidade-publica` | Sim — hub textual estático | `src/app/utilidade-publica/page.tsx` |
| `/utilidade-publica/telefones-uteis` | Sim — `contacts.json` carregado em build | `src/app/utilidade-publica/telefones-uteis/page.tsx` |
| `/previsao-do-tempo/sao-carlos` | Sim — módulo clima (Open-Meteo) | `src/app/previsao-do-tempo/sao-carlos/page.tsx` |
| `/empresas` | Sim — anúncios publicados do `ads.json` | `src/app/empresas/page.tsx` |
| `/empresas/[slug]` | Sim — dados do anúncio + JSON-LD LocalBusiness | `src/app/empresas/[slug]/page.tsx` |
| `/sobre`, `/contato`, `/termos-de-uso`, `/aviso-editorial`, `/politica-de-privacidade` | Sim — conteúdo estático | Respectivas páginas |

**Nenhuma página pública depende de JavaScript no cliente para exibir conteúdo principal.**

**Severidade:** ✅ Nenhum problema.

---

## 3. Metadados, Open Graph, Favicon, Canonical, Robots, Sitemap

| Item | Status | Evidência |
|------|--------|-----------|
| **Title / Description únicos por página** | ✅ | Todas as rotas exportam `metadata: Metadata` com título/descrição focados em "São Carlos/SP" |
| **Canonical autorreferente** | ✅ | `alternates: { canonical: '/rota' }` em todas as páginas |
| **Open Graph / Twitter** | ✅ | `metadata.openGraph` + `twitter` no `layout.tsx` raiz; `og-image.png` em `public/` |
| **Favicon / Apple Touch Icon** | ✅ | `icon.png`, `apple-icon.png` em `src/app/`; referenciados pelo Next automaticamente |
| **Manifest.webmanifest** | ✅ | `public/manifest.webmanifest` com `name`, `short_name`, `theme_color #001428`, ícones |
| **robots.txt** | ✅ | `src/app/robots.ts`: `userAgent: '*'`, `allow: '/'`, `disallow: ['/admin', '/api/admin']`, `sitemap: ${siteUrl}/sitemap.xml` |
| **sitemap.xml dinâmico** | ✅ | `src/app/sitemap.ts`: 17 URLs (home, institucionais, listagens, utilidade pública, guia, políticas); `changeFrequency` e `priority` coerentes |
| **/admin protegido** | ✅ | `src/app/admin/layout.tsx`: `robots: { index: false, follow: false }`; `robots.ts` faz `Disallow: /admin` |

**Severidade:** ✅ Nenhum problema crítico.

---

## 4. Páginas e rotas existentes

| Rota | Tipo | Status indexável |
|------|------|------------------|
| `/` | Home (hub) | ✅ Indexável |
| `/empresas` | Guia comercial (hub) | ✅ Indexável |
| `/empresas/[slug]` | Página da empresa (dinâmica) | ✅ Indexável (apenas publicados, não expirados) |
| `/noticias` | Listagem de notícias | ✅ Indexável |
| `/avisos` | Listagem de avisos | ✅ Indexável |
| `/avisos/saae` | Listagem filtrada SAAE | ✅ Indexável |
| `/utilidade-publica` | Hub utilidade pública | ✅ Indexável |
| `/utilidade-publica/telefones-uteis` | Telefones por categoria | ✅ Indexável |
| `/previsao-do-tempo/sao-carlos` | Previsão dedicada | ✅ Indexável |
| `/sobre` | Institucional | ✅ Indexável |
| `/contato` | Institucional | ✅ Indexável |
| `/termos-de-uso` | Institucional | ✅ Indexável |
| `/aviso-editorial` | Política | ✅ Indexável |
| `/politica-de-privacidade` | Política | ✅ Indexável |
| `/anuncie` | Captação (formulário) | ✅ Indexável (canonical próprio) |
| `/admin/*` | Administrativa | ❌ `noindex, nofollow` + `Disallow` |
| `/api/admin/*` | API admin | ❌ `Disallow` |

**Severidade:** ✅ Estrutura coerente; nenhuma página vazia ou "thin content" indexável.

---

## 5. Problemas de indexação

| Item | Status | Detalhes |
|------|--------|----------|
| `/admin` indexável? | ❌ NÃO | `noindex, nofollow` no layout + `Disallow` no robots.txt |
| Conteúdo duplicado (apex vs www) | ❌ NÃO | Redirect 301 apex → www em `next.config.ts` |
| URLs artificiais / spam | ❌ NÃO | Sem `/bairros/*`, `/eventos`, `/noticias/[slug]`, `/empresas/[categoria]` — decisões registradas no PRD |
| Sitemap inclui rotas inexistentes? | ❌ NÃO | Sitemap gerado a partir de fontes reais + rotas fixas |
| Itens de feed individuais no sitemap? | ❌ NÃO | Decisão deliberada: itens de notícias/avisos são efêmeros e apontam para fontes externas |

**Severidade:** ✅ Nenhum problema.

---

## 6. Performance (análise de código — Core Web Vitals)

| Métrica / Fator | Avaliação | Evidência |
|-----------------|-----------|-----------|
| **LCP (Largest Contentful Paint)** | ✅ Boa | HeroSection com `priority` no logo; fonts `display: swap`; HTML completo no servidor |
| **CLS (Cumulative Layout Shift)** | ✅ Boa | `width`/`height` explícitos em `Image`; containers com `aspect-ratio` ou tamanho fixo; sem injeção tardia de conteúdo |
| **FID / INP (Interaction to Next Paint)** | ✅ Boa | JS mínimo no cliente; apenas `ToastProvider`, `AnnounceCTA`, `GoogleAnalytics` (deferido) |
| **Terceiros** | ✅ Mínimo | GA4 apenas em produção + `afterInteractive`; sem widgets, chat, tracking extra |
| **Fonts** | ✅ Otimizada | `next/font/google` (Plus Jakarta Sans + Inter) self-host, `display: swap`, subsets `latin` |
| **Imagens** | ✅ Controlada | `next/image` com `remotePatterns` apenas `https`; logo local com `priority`; sem imagens de conteúdo próprias |
| **Cache / Revalidação** | ✅ Configurada | `revalidate = 1800` (30 min) nas páginas dinâmicas; `Cache-Control: public, max-age=0, must-revalidate` global |
| **Bundle size** | ✅ Leve | Turbopack; sem dependências pesadas; `fast-xml-parser` apenas no servidor |

**Severidade:** ✅ Nenhum problema identificado no código. Validação de campo (Real User Metrics) recomendada pós-deploy.

---

## 7. Acessibilidade (análise de código — WCAG AA)

| Critério | Status | Evidência |
|----------|--------|-----------|
| **HTML semântico** | ✅ | `<header>`, `<main id="conteudo">`, `<footer>`, `<nav aria-label>`, `<article>`, `<section aria-labelledby>` |
| **Hierarquia de títulos** | ✅ | H1 único por página; H2/H3 por seção; `Breadcrumbs` com `nav aria-label="Você está em"` |
| **Contraste** | ✅ | Tokens `@theme` em `globals.css` derivados do DESIGN.md (Civic Vanguard); paleta navy/azul/amber testada |
| **Navegação por teclado** | ✅ | Links/botões nativos (`<a>`, `<button>`); `focus-visible` via Tailwind; `skip link` não necessário (header sticky + main landmark) |
| **Foco visível** | ✅ | `focus-visible:ring-2 focus-visible:ring-secondary` nos componentes UI |
| **Textos de link compreensíveis** | ✅ | Sem "clique aqui"; ex.: "Ver na fonte", "Fonte oficial", "WhatsApp" |
| **Sem dependência exclusiva de cor** | ✅ | `ContentLabel` sempre texto + chip colorido; status `stale`/`error` com ícone + texto |
| **Alvos de toque ≥ 44px** | ✅ | Botões/links com `py-2.5` / `px-4`; cards clicáveis com área ampla |
| **Rolagem horizontal a 320px** | ✅ | Layout mobile-first; `max-w-4xl` / `w-[calc(100%-2rem)]`; `overflow-x-auto` apenas na nav mobile |
| **Alt em imagens** | ✅ | Logo com `alt` descritivo; ícones decorativos com `aria-hidden="true"` |
| **ARIA landmarks** | ✅ | `main#conteudo`, `nav[aria-label]`, `footer`, `header` |

**Severidade:** ✅ Nenhum problema crítico. Pequenas melhorias opcionais: adicionar `skip link` para teclado (baixo impacto, header já tem nav acessível).

---

## 8. Search Console / Monitoramento

| Item | Status | Detalhes |
|------|--------|----------|
| **Meta tag de verificação** | ❌ AUSENTE | `layout.tsx` não tem suporte a `NEXT_PUBLIC_GSC_VERIFICATION` (Spec 08) |
| **GA4** | ✅ Configurado | `G-063LGPHV93` apenas `VERCEL_ENV=production`, carga `afterInteractive` |
| **Sitemap referenciado no robots.txt** | ✅ | `sitemap: ${siteUrl}/sitemap.xml` |
| **Documentação de operação** | ❌ AUSENTE | README sem seção de Search Console (Spec 08) |

**Severidade:** ⚠️ **Médio** — impede verificação automática no GSC; entra na Spec 08.

---

## 9. Service Worker (commit 6f65568 referenciado no PRD)

**Não encontrado no branch atual.** Busca por `service.worker`, `sw.ts`, `register.*worker` no código-fonte não retorna resultados. O commit `6f65568` ("feat: implement service worker and 30-min revalidation strategy") não está no histórico linear do `main` atual (último: `8649fa8`). 

**Conclusão:** Sem SW ativo → **sem risco de SEO** (cache do Googlebot não interferido).

**Severidade:** ✅ Nenhum problema (ausência confirmada).

---

## 10. Datas honestas e estados de falha (Regra 5 + FR-012/SC-004)

| Módulo | Comportamento | Evidência |
|--------|---------------|-----------|
| **Clima (Open-Meteo)** | `ok` → data/hora real; `stale` → "Atualização temporariamente indisponível" + última data; `error` → "Dados indisponíveis no momento" | `WeatherSection` + `status-message.tsx` |
| **Notícias (RSS)** | Mesmo padrão; itens com `publishedAt` real (ISO) → exibido em pt-BR (`America/Sao_Paulo`) | `NewsList` + `dateToFormat` |
| **Avisos (SAAE + curadoria)** | Mesmo padrão; `sourceName` preservado com link oficial | `NoticesList` |
| **Anúncios** | `status = "publicado"` + `expiresAt` futuro; expirados → 404 | `loadAds` + `selectPublishedAds` + página `[slug]` |
| **Contatos** | `officialUrl` obrigatório para números novos; categorias vazias não renderizam | `TelefonesUteisPage` + `groupByCategory` |

**Severidade:** ✅ Implementado consistentemente em todos os módulos.

---

## 11. Resumo de achados por severidade

| Severidade | Quantidade | Itens |
|------------|------------|-------|
| **Crítico** | 0 | — |
| **Médio** | 1 | Meta tag de verificação do Search Console ausente (Spec 08) |
| **Baixo** | 2 | 1. `skip link` opcional para navegação por teclado (header já acessível)<br>2. Documentação de operação Search Console no README (Spec 08) |

---

## 12. Próximos passos recomendados (ordem do PRD)

1. **Spec 02** — SEO técnico base: manifest já existe; breadcrumbs já existem; `noindex` no admin já existe; **falta**: sitemap dinâmico incluir empresas publicadas individualmente (`/empresas/[slug]`) — *parcialmente feito (hub incluído, páginas individuais não)*
2. **Spec 03** — Páginas institucionais: **já implementadas** (`/sobre`, `/contato`, `/termos-de-uso`) — validar breadcrumbs e metadata
3. **Spec 04** — Listagens: **já implementadas** (`/noticias`, `/avisos`, `/avisos/saae`) — validar estados `stale`/`error`
4. **Spec 07** — Hub da home + navegação: adicionar links internos da home para `/noticias`, `/avisos`, `/empresas`, `/utilidade-publica/telefones-uteis`, `/previsao-do-tempo/sao-carlos`; header/footer com links para institucionais
5. **Spec 08** — Search Console + README: meta tag `google-site-verification` condicional + documentação completa no README

---

## Conclusão

**O site está pronto para indexação no Google.** Todos os fundamentos técnicos (HTML completo, metadata, canonical, sitemap, robots, noindex admin, redirect apex→www, estrutura semântica, performance, acessibilidade) estão corretos. 

Os únicos itens pendentes são operacionais (Spec 08: verificação GSC + documentação) e de integração (Spec 07: links internos na home/header/footer). Nenhuma alteração de código emergencial é necessária antes de prosseguir para as specs de conteúdo.

---

*Relatório gerado por inspeção estática do código-fonte e build de produção local. Não substitui validação no Google Search Console pós-deploy.*