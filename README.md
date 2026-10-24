# Portal São Carlos

Portal independente de utilidade pública de São Carlos/SP: previsão do tempo, notícias, informativos oficiais, telefones úteis e guia comercial.

## Stack

- **Framework**: Next.js 16 (App Router, Turbopack), React 19, TypeScript 5 (strict)
- **Estilo**: Tailwind CSS 4 — tokens `@theme` em `src/app/globals.css`
- **Fontes**: Plus Jakarta Sans (display) e Inter (corpo) via `next/font/google`
- **Ícones**: Material Symbols Outlined auto-hospedadas (subset em `src/app/fonts/`)
- **Dados externos**: `fast-xml-parser` (RSS/Atom), fetch no servidor com cache (~15 min)
- **Testes**: Vitest + React Testing Library (jsdom)
- **Qualidade**: ESLint 9, Prettier, Husky (`commit-msg` → commitlint conventional), `commit-and-tag-version`
- **Deploy**: Vercel (ISR/estático)

## Comandos

```bash
npm run dev        # desenvolvimento
npm run build      # build de produção (verifica TypeScript)
npm run start      # serve o build
npm run lint       # ESLint
npm run test       # Vitest (run)  |  npm run test:watch
npm run release    # commit-and-tag-version (patch); release:minor / release:major / release:dry
npm run cleanup:news-history # limpa notícias >12 meses (LGPD legítimo interesse)
npm run cleanup:ads-pending  # limpa submissões pendentes >30 dias (LGPD consentimento)
```

## Variáveis de ambiente

Todas **opcionais** (`.env.example`); lidas só no servidor, nenhuma `NEXT_PUBLIC_*` com segredo.

| Variável | Uso |
| --- | --- |
| `SITE_URL` | URL canônica; em produção é derivada de `VERCEL_PROJECT_PRODUCTION_URL` |
| `NEWS_FEEDS` | Sobrescreve feeds de notícias (CSV de URLs) |
| `NOTICE_FEEDS` | Sobrescreve feeds de informativos (padrão: SAAE) |
| `CONTACT_WHATSAPP` / `CONTACT_PHONE` / `CONTACT_EMAIL` | Canais das chamadas "Anuncie aqui" |
| `NEXT_PUBLIC_GSC_VERIFICATION` | **Token de verificação do Google Search Console** (apenas produção) |
| `MODERATOR_SECRET` | **Segredo do moderador** para acesso à área `/moderacao` (apenas produção) |
| `NEWS_HISTORY_RETENTION_DAYS` | Retenção do histórico de notícias em dias (padrão: 365) |

> **Importante**: `NEXT_PUBLIC_GSC_VERIFICATION` deve ser configurado **apenas em Production** na Vercel (Environment Variables → Production). Não configure em Preview/Development para evitar vazamento do token em URLs não canônicas.

## Google Search Console — Operação

### 1. Verificação de propriedade

1. Acesse [Google Search Console](https://search.google.com/search-console)
2. Adicione propriedade do tipo **URL prefix**: `https://www.meubairro.dev.br`
3. Escolha método **Meta tag HTML**
4. Copie o valor do atributo `content` (ex.: `abc123xyz...`)
5. Na Vercel: **Settings → Environment Variables → Production** → adicione:
   - Name: `NEXT_PUBLIC_GSC_VERIFICATION`
   - Value: `<valor copiado>`
6. Faça novo deploy em Production (`vercel --prod` ou push na `main`)

O meta tag será injetado automaticamente no `<head>` apenas quando a variável estiver definida:

```html
<meta name="google-site-verification" content="abc123xyz..." />
```

### 2. Envio do sitemap

O sitemap é gerado dinamicamente em `/sitemap.xml` e inclui:
- Páginas institucionais (`/sobre`, `/contato`, `/termos-de-uso`, etc.)
- Listagens (`/noticias`, `/avisos`, `/avisos/saae`, `/empresas`, `/utilidade-publica`, `/utilidade-publica/telefones-uteis`, `/previsao-do-tempo/sao-carlos`)
- Páginas individuais de empresas publicadas (`/empresas/[slug]`)
- Políticas (`/aviso-editorial`, `/politica-de-privacidade`)

No GSC:
1. **Indexação → Sitemaps**
2. Adicione: `https://www.meubairro.dev.br/sitemap.xml`
3. Submeta — o Google rastreará periodicamente (o `robots.txt` já referencia o sitemap)

### 3. Monitoramento recomendado

| Relatório | Frequência | O que observar |
| --- | --- | --- |
| **Desempenho → Resultados da pesquisa** | Semanal | Cliques, impressões, CTR, posição média por query/página |
| **Indexação → Páginas** | Semanal | Páginas indexadas vs. não indexadas; motivos de exclusão |
| **Indexação → Sitemaps** | Semanal | Status do sitemap (sucesso/erro), URLs descobertas |
| **Experiência → Core Web Vitals** | Mensal | LCP, INP, CLS — metas: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 |
| **Melhorias → Dados estruturados** | Mensal | Erros em `WebSite`, `Organization`, `LocalBusiness`, `BreadcrumbList` |

### 4. Checklist pós-deploy

- [ ] Propriedade verificada no GSC (meta tag presente no HTML da home)
- [ ] Sitemap submetido e processado sem erros
- [ ] `robots.txt` acessível em `https://www.meubairro.dev.br/robots.txt`
- [ ] Redirect apex → www funcionando (`meubairro.dev.br` → `www.meubairro.dev.br` 301)
- [ ] Páginas-chave indexadas: `/`, `/noticias`, `/avisos`, `/empresas`, `/utilidade-publica/telefones-uteis`, `/previsao-do-tempo/sao-carlos`
- [ ] Dados estruturados válidos no [Rich Results Test](https://search.google.com/test/rich-results)
- [ ] Core Web Vitals no [PageSpeed Insights](https://pagespeed.web.dev/) ≥ 90 (mobile/desktop)

### 5. Links úteis

- [Google Search Console](https://search.google.com/search-console)
- [Rich Results Test](https://search.google.com/test/rich-results)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Validador de Schema.org](https://validator.schema.org/)
- [Documentação do sitemap do Google](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)

## Estrutura do projeto

```
src/
├── app/                    # Rotas (App Router)
│   ├── layout.tsx          # Layout raiz + metadata + GA4
│   ├── page.tsx            # Home (6 módulos independentes)
│   ├── empresas/           # Guia comercial (Spec 06)
│   ├── utilidade-publica/  # Utilidade pública (Spec 05)
│   ├── previsao-do-tempo/  # Clima dedicado (Spec 05)
│   ├── noticias/           # Listagem notícias (Spec 04)
│   ├── avisos/             # Listagem avisos (Spec 04)
│   ├── sobre/              # Institucional (Spec 03)
│   ├── contato/            # Institucional (Spec 03)
│   ├── termos-de-uso/      # Institucional (Spec 03)
│   ├── robots.ts, sitemap.ts # SEO técnico (Spec 02)
├── components/
│   ├── layout/             # Header, Footer, AnnounceCTA
│   ├── sections/           # Hero, Weather, News, Notices, Contacts, Ads, Promo
│   ├── ui/                 # ContentLabel, Section, StatusMessage, Breadcrumbs
│   ├── seo/                # JSON-LD (WebSite, Organization, BreadcrumbList)
│   └── analytics/          # GA4 (só produção, afterInteractive)
├── modules/                # Domínio isolado (weather, news, notices, ads, contacts, promo)
├── lib/                    # Utilitários (sanitize, fetch-cached, logger, date, etc.)
├── config/                 # env, sources, version
└── content/                # JSONs versionados (ads, contacts, promo, notices)
```

## Constituição do projeto (v1.1.0)

**Proibido sem emenda formal:**
- ❌ Login/cadastro, dashboard, área do comerciante
- ❌ Pagamentos (PIX, cartão, checkout, gateway)
- ❌ Upload/armazenamento de imagens de conteúdo
- ❌ Comentários, fórum, rede social, marketplace, carrinho
- ❌ Publicação automática sem revisão humana
- ❌ `dangerouslySetInnerHTML` / HTML externo sem sanitização
- ❌ Cópia integral de matérias (só título + resumo + data + fonte + link)
- ❌ Se apresentar como órgão oficial (Prefeitura/SAAE/CPFL)

**Permitido com condições:**
- ✅ Google Analytics 4 — só produção, carga adiada, coleta agregada, aviso de cookies publicado

## Licença

Uso interno — MeuBairro. Não licenciado para redistribuição.