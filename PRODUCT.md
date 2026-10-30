# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Moradores e visitantes de São Carlos/SP**: pessoas que buscam informações úteis do dia a dia (clima, notícias locais, informativos, telefones úteis, serviços públicos).
- **Comerciantes locais**: negócios que desejam divulgar gratuitamente seus serviços/produtos via formulário público `/anunciar`, com moderação humana.

## Product Purpose

Portal local de utilidade pública de São Carlos/SP. Oferece previsões do tempo, notícias locais, informativos públicos, telefones úteis, guia comercial e espaço para anúncios gratuitos. Sem cadastro, sem pagamento, sem banco de dados relacional. Todo conteúdo passa por curadoria/revisão humana.

## Positioning

Portal comunitário de utilidade pública, com curadoria humana, sem monetização direta, sem cadastro de usuários e focado exclusivamente em informações locais relevantes para São Carlos/SP. Diferencia-se por ser gratuito, sem marketplace, sem comentários e com regras claras de moderação.

## Operating Context

- **Ambiente**: Web (Next.js 16 App Router), hospedado na Vercel.
- **Conteúdo**: Majoritariamente estático/curado em arquivos JSON versionados (`src/content/`), com agregação de RSS (notícias e informativos) e API Open-Meteo para clima.
- **Moderação**: Revisão humana via área protegida `/moderacao` com autenticação simples por segredo compartilhado.
- **Público alvo**: Usuários em dispositivos móveis e desktop buscando informações rápidas e confiáveis.

## Capabilities and Constraints

**Capacidades:**
- Clima para São Carlos/SP (Open-Meteo)
- Notícias locais com histórico paginado e retenção 12 meses
- Informativos (curadoria + feed SAAE)
- Telefones úteis e guia comercial
- Formulário público para anúncios gratuitos com moderação
- SEO local (sitemap dinâmico, JSON-LD, breadcrumbs)
- GA4 apenas em produção (com aviso de cookies)

**Restrições (constituição v1.3.0):**
- Sem login/cadastro de usuários
- Sem pagamentos/checkout
- Sem upload de imagens de usuários (apenas imagens vindas de feeds RSS)
- Sem comentários/fórum/marketplace/carrinho
- Sem publicação automática sem revisão humana
- Sem `dangerouslySetInnerHTML` sem sanitização
- Sem cópia integral de matérias (apenas título/resumo/data/fonte/link)
- Sem se apresentar como órgão oficial

## Brand Commitments

- **Nome**: "Meu Bairro - Portal São Carlos"
- **Marca/identidade**: Design Civic Vanguard (tokens em `src/app/globals.css`)
- **Fontes**: Plus Jakarta Sans (display), Inter (corpo), Material Symbols Outlined auto-hospedados
- **Domínio canônico**: `https://www.meubairro.dev.br` (apex redireciona 301)
- **Tom**: Informativo, útil, comunitário, sem sensacionalismo
- **Idiomas**: pt-BR

## Evidence on Hand

- **Código-fonte**: Repositório completo em `C:\Users\rolda\Documents\Codigos\meubairro`
- **Documentação**: `AGENTS.md`, `specs/` (Fase 1 e Fase 2 concluídas), `docs/` (PRD SEO, auditoria)
- **Conteúdo curado**: `src/content/` (ads.json, contacts.json, notices.json, promo.json, ads-pending.json, news-history.json)
- **Testes**: 144 testes passando (Vitest)
- **Deploy**: Vercel, tag `v0.2.0`
- **Analytics**: GA4 G-063LGPHV93 (apenas produção)

## Product Principles

1. **Utilidade pública primeiro**: Informações essenciais antes de publicidade. Ordem da home prioriza conteúdo público.
2. **Simplicidade e custo zero**: Sem banco de dados relacional, sem autenticação complexa, sem pagamentos. Arquivos JSON versionados.
3. **Curadoria humana**: Toda publicação passa por revisão. Moderação via git/versionamento quando aplicável.
4. **Transparência e conformidade**: Respeito à LGPD, sem cópia integral, sem apresentação como órgão oficial.
5. **Resiliente a falhas**: Falhas de fontes externas nunca derrubam a página. Usa `ModuleResult` com status `ok/stale/error`.
