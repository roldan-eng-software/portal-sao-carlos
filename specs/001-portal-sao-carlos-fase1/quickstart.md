# Quickstart: Portal São Carlos — Fase 1

**Date**: 2026-09-28 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

Guia de validação executável de ponta a ponta. Não contém código de
implementação — só comandos, cenários e resultados esperados.

## Pré-requisitos

- Node.js 22+ (LTS) instalado
- Acesso à internet (fontes externas reais: Open-Meteo, feeds RSS)
- Nenhum segredo/chave necessário na Fase 1 (nenhuma env obrigatória)

## Setup

```bash
npm install        # instalar dependências
cp .env.example .env.local   # apenas se existir; opcional na Fase 1
npm run dev        # servidor de desenvolvimento (URL local exibida no terminal)
```

Variáveis de ambiente opcionais (ver `src/config/env.ts`):

| Variável | Finalidade | Padrão |
| --- | --- | --- |
| `SITE_URL` | URL canônica (SEO, sitemap) | `http://localhost:3000` |
| `NEWS_FEEDS` | Sobrescrever lista de feeds RSS | registro padrão em `config/sources.ts` |
| `CONTACT_WHATSAPP` / `CONTACT_PHONE` / `CONTACT_EMAIL` | Canais do responsável | valores de exemplo em `content/` |

## Comandos de verificação

```bash
npm run build       # build de produção (falha se houver erro de tipo/lint)
npm run test        # unit + integração (Vitest): normalizadores, sanitização, envelopes
npm run start       # serve o build para validação mais próxima da produção
```

## Cenários de validação (mapeados para os critérios de sucesso)

### V1 — Núcleo de utilidade pública (SC-001, FR-001..FR-004) — P1

1. Abrir a home em dispositivo móvel (ou emulação ≤ 360 px de largura).
2. **Esperado**: previsão do tempo de São Carlos visível com "Atualizado em…";
   ao menos uma notícia com título/resumo/data/fonte/link; informativos com
   fonte; ≥ 3 contatos úteis. Tudo isso sem login e sem bloqueio por
   publicidade, em ≤ 3 s de carregamento em rede rápida.

### V2 — Transparência de publicidade (SC-002, SC-003, FR-006..FR-008) — P2

1. Percorrer a home contando os blocos: notícia, informativo, anúncio
   gratuito, anúncio patrocinado, divulgação própria.
2. **Esperado**: cada bloco tem rótulo textual do seu tipo; todo patrocinado
   exibe rótulo de publicidade; nenhum anúncio usa título/formatação de
   notícia; toda notícia exibe fonte + link.
3. **Esperado**: 100% de rótulos corretos, 0 anúncios como notícia.

### V3 — Fluxo do comerciante (SC-006, FR-005, FR-009) — P3

1. Na home, procurar "Anuncie aqui" e um anúncio gratuito completo.
2. **Esperado**: chamada de publicidade visível em ≤ 2 interações a partir do
   topo, com canal de contato clicável (WhatsApp/telefone/e-mail); anúncio
   gratuito com nome, categoria, descrição, bairro e contato; nenhum
   botão/formulário de pagamento ou cadastro.

### V4 — Transparência editorial e políticas (FR-010, FR-011) — P4

1. Acessar `/politica-de-privacidade` e `/aviso-editorial` pelos links do
   rodapé.
2. **Esperado**: aviso declara que o portal não é órgão oficial e que dados
   devem ser confirmados na fonte; política informa finalidade, dados,
   retenção, contato e procedimento de remoção/correção.

### V5 — Falha isolada de fonte (SC-004, FR-012, FR-013)

1. Simular falha: apontar o feed/clima para host inválido via
   `NEWS_FEEDS`/config temporária **ou** desativar a rede externa no
   ambiente de teste.
2. Recarregar a home.
3. **Esperado**: módulo afetado mostra último valor válido com aviso
   ("Atualização temporariamente indisponível") ou mensagem amigável; os
   demais módulos renderizam normalmente; **nenhuma página de erro técnico**;
   log do servidor registra fonte + timestamp + falha.

### V6 — Sanitização (FR-021)

1. Injetar item de teste em feed simulado (testes de integração) com
   `<script>`, HTML e entidades no título/resumo.
2. **Esperado**: `npm run test` confirma saída em texto puro; nenhum HTML é
   renderizado na UI.

### V7 — Acessibilidade (SC-005, FR-014, FR-015)

1. Navegar a home apenas com Tab/Shift+Tab/Enter.
2. Verificar: foco visível, h1 único, h2 por seção, contraste (Lighthouse /
   devtools), links com texto compreensível, sem rolagem horizontal a 320 px.
3. **Esperado**: 100% dos itens críticos aprovados.

### V8 — SEO local (SC-007, FR-016)

1. `npm run build && npm run start`, depois acessar `/sitemap.xml`,
   `/robots.txt` e inspecionar o HTML da home.
2. **Esperado**: sitemap com as páginas públicas; robots permitindo
   indexação; título/descrição únicos; JSON-LD presente; URLs legíveis em
   pt-BR. Indexação real monitorada por até 90 dias após publicação (SC-007).

### V9 — Portaria constitucional (SC-008)

1. Revisar a home e rotas: procurar login, pagamento, upload, comentários.
2. **Esperado**: nenhum deles existe; 0 violações da lista de exclusões.

## Critérios de saída (definition of done da validação)

- V1–V9 executados com resultado esperado registrado
- `npm run build` e `npm run test` verdes
- Checklist de constituição (plan.md, 17 gates) confirmado no build final
