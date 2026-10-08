# Plano de implementação — pontos de atenção (AGENTS.md §11)

**Data**: 2026-10-08 · **Base**: `AGENTS.md` §11 · **Status**: Etapas 1, 2, 3 e 5
concluídas (v0.2.0 publicada e em `origin`; constituição em v1.1.0); Etapa 4
parcial — D1 (marca), D2 (GA4/emenda) e D3 (WhatsApp) decididos/aplicados
(D3 ainda pendente de env vars na Vercel), D4 adiada pelo responsável

Cada etapa indica problema, mudança, arquivos, critério de aceite e riscos.
Etapas 1–3 são execução técnica (não exigem decisão); Etapa 4 são decisões do
responsável que destravam os itens restantes.

## Sequência e dependências

```text
Etapa 1 (correções rápidas) ──┐
Etapa 2 (fontes de notícias) ─┼─► Etapa 3 (release v0.2.0) ─► Etapa 5 (validação final)
                              │
Etapa 4 (decisões) ───────────┴─► Etapa 5 (pós-decisões + validação)
```

| Etapa | Pontos do §11 | Esforço estimado | Precisa de decisão? |
| --- | --- | --- | --- |
| 1 — Correções rápidas | 3, 5, 2 | ~1–2 h | Não |
| 2 — Fontes de notícias | 4 | ~2–4 h | Não (pesquisa) |
| 3 — Release v0.2.0 | 1 | ~30 min | Não |
| 4 — Decisões pendentes | 6, 7 | reunião/assinatura | **Sim** |
| 5 — Pós-decisões + validação | 6, 7 (fechamento) | ~1–2 h | Depende da 4 |

**Mínimo viável** (se quiser só o essencial): Etapa 1 + 3 — limpa warnings e
libera o versionamento. **Ideal**: 1 + 2 + 3, depois 4 quando puder.

---

## Etapa 1 — Correções rápidas (sem decisão humana)

### 1.1 Parar o warning `invalid_content_items` para itens arquivados

**Problema** (§11.3): `loadNotices()` em
[`src/modules/notices/loader.ts:51-62`](../src/modules/notices/loader.ts)
emite `console.warn` com evento `invalid_content_items` sempre que
`publicados ≠ total`. Os 2 itens de exemplo estão com `status: "arquivado"` —
estado **válido** do enum do `data-model.md`, não um item inválido —, mas o
build loga `discarded: 2` como warn toda vez.

**Mudança**:

- Separar três contagens no `loadNotices()`:
  - **inválidos** (`isValidNotice` falso) → continua `level: "warn"`,
    `event: "invalid_content_items"` (é erro real de conteúdo);
  - **arquivados válidos** → `level: "info"`, `event: "archived_content_items"`
    (ou nenhum log — preferir info para manter rastreabilidade);
  - publicados → inalterado (filtro `status === "publicado"` continua).
- Não mudar o envelope `ModuleResult` nem o comportamento de exibição.

**Testes**: criar `tests/unit/notices-loader.test.ts` com spy em
`console.warn`/`console.info`:

1. item `publicado` é mantido e ordenado por data;
2. item `arquivado` válido **não** gera `warn`;
3. item inválido (ex.: `title` > 200 chars) gera `warn` com contagem;
4. entrada não-array → `ModuleResult` `error` amigável (já coberto em parte
   pelos testes existentes — manter).

**Aceite**: `npm run test` verde (79+ novos); `npm run build` sem a linha
`invalid_content_items` na geração de páginas.

**Risco**: baixo — mudança de logagem apenas.

### 1.2 Eliminar os 2 warnings de lint da Material Symbols

**Problema** (§11.5): o `<link>` da Google Fonts em
[`src/app/layout.tsx:78-83`](../src/app/layout.tsx) gera
`google-font-display` e `no-page-custom-font`, além de 2 `preconnect` para
terceiro (Google Fonts) — Dependência externa que a constituição pede justificar.

**Estado atual relevante**: `globals.css:113-131` já declara a classe
`.material-symbols-outlined` (com `font-variation-settings` FILL/wght/GRAD/opsz);
só falta o `@font-face`. **10 arquivos** usam a classe — o ideal é resolvê-la
sem tocar nesses arquivos.

**Opções**:

| | Abordagem | Prós | Contras |
| --- | --- | --- | --- |
| **A (recomendada)** | Auto-hospedagem com subset: baixar `MaterialSymbolsOutlined[wght].ttf`, subsetar só as ligaduras usadas (lista extraída por grep em `src/`), `@font-face` em `globals.css` com `font-display: block`, remover `<link>` + preconnects | Some com dependência de terceiro, some os 2 warnings, sem tocar em componentes, arquivo pequeno | Requer ferramenta de subset (fonttools/pyftsubset) uma única vez |
| **B** | `next/font/google` com `Material_Symbols_Outlined` | Caminho "oficial" do Next | Risco de empacotar o TTF completo (megabytes) — medir antes de aceitar; só usar se ≤ ~200 KB |
| **C (fallback)** | Manter CDN + `eslint-disable` documentado | Mudança mínima | Esconde o warning; mantém terceiro; não recomendado |

**Passos da opção A**:

1. Extrair a lista única de ícones usados (grep do conteúdo das tags
   `material-symbols-outlined` em `src/`).
2. Baixar o fonte variável oficial (repositório google/material-design-icons
   ou CSS da API do Google Fonts com UA que sirva TTF) e medir o tamanho.
3. Subsetar com `pyftsubset --text="<ligaduras>"` mantendo os eixos variáveis;
   salvar em `src/app/fonts/material-symbols-outlined.subset.ttf`.
4. `@font-face { font-family: 'Material Symbols Outlined'; font-display: block; src: url(...) }`
   em `globals.css` — **`block` é obrigatório**: sem ele, o texto cru da
   ligadura (ex.: "storefront") aparece antes do fonte carregar.
5. Remover o `<link>` e os dois `preconnect` de `layout.tsx`.

**Aceite**: `npm run lint` com **0 erros e 0 warnings**; ícones renderizando
no header, hero, footer e seções (inspeção visual em `npm run dev`, desktop e
mobile); `npm run build` ok; fonte subset ≤ ~100 KB.

**Risco**: subset incompleto → ícone faltando (mit: teste visual de todos os
ícones listados no passo 1 + manter o TTF completo fora do commit como backup local).

### 1.3 Atualizar o status da spec

**Problema** (§11.2): [`specs/001-portal-sao-carlos-fase1/spec.md`](../specs/001-portal-sao-carlos-fase1/spec.md)
ainda diz `Status: Draft`, embora as 55/55 tasks estejam `[X]`.

**Mudança**: uma linha —

```markdown
**Status**: Implemented — 55/55 tasks concluídas (Fase 1 entregue em v0.1.0, 2026-09-28; verificação de build/testes em 2026-10-08)
```

**Aceite**: diff de 1 linha; nada mais na spec alterado.

---

## Etapa 2 — Fontes locais de notícias (checklist constitucional)

**Problema** (§11.4): só Google News como default; as candidatas locais
(G1 São Carlos, ACidade ON, São Carlos Agora, Portal da Cidade São Carlos)
estão comentadas em [`src/config/sources.ts`](../src/config/sources.ts)
aguardando o checklist da constituição §Fontes Externas (research R3).

**Passos**:

1. **Descoberta**: para cada candidata, verificar existência de RSS/Atom
   (WebFetch em `/rss`, `/feed`, `/index.atom`, link `<alternate>` do HTML).
2. **Avaliação**: preencher os 8 critérios constitucionais por candidata —
   disponibilidade pública, rate limits, termos de uso, direitos autorais,
   estabilidade, necessidade de chave, removibilidade, alternativa.
   Registrar a tabela em `specs/001-portal-sao-carlos-fase1/research.md`
   (seção nova "R3 — reavaliação 2026-10").
3. **Integração das aprovadas**: adicionar em `DEFAULT_NEWS_FEEDS`
   (`src/config/sources.ts`) com comentário `// avaliada em YYYY-MM-DD: ok`.
   Remover a linha comentada correspondente.
4. **Testes**: salvar 1 fixture real de RSS por fonte aprovada em
   `tests/fixtures/` e cobrir no `news-normalize.test.ts` (título/resumo/data/link).
5. **Validação**: `npm run build` (o ISR vai buscar as novas fontes — conferir
   tempo e nenhum erro), quickstart V1 manual, e confirmar que remover a
   fonte de `sources.ts` não altera UI (contrato content-source-adapter, regra 8).

**Se nenhuma for aprovada**: manter Google News e registrar a rejeição com
motivo em `research.md` — decisão é resultado válido.

**Aceite**: decisão documentada para as 4 candidatas; site buildando e
exibindo notícias; fontes 100% configuráveis por `sources.ts`/env.

**Risco**: fonte aprovada fica lenta/offline → o isolamento `ok/stale/error`
já testado absorve (novo feed falho não derruba os demais — coberto em
`tests/integration/`).

---

## Etapa 3 — Release v0.2.0

**Problema** (§11.1): tag `v0.1.0` em `5cc1670`; **9 commits sem release**
(logotipo, controle de versão, auditoria SEO, domínio canônico, GA4, feed SAAE,
arquivamento de exemplos, `.tsbuildinfo`, fix de enclosure). `CHANGELOG.md`
com `[Unreleased]` vazio.

**Pré-requisições**: Etapa 1 commitada (e Etapa 2, se quiser os feeds no
release); working tree limpo.

**Passos**:

1. `npm run release:dry` — conferir:
   - bump **minor → v0.2.0** (há commits `feat:` desde a tag; semver 0.x);
   - o `.versionrc.js` já mapeia `feat→Added`, `fix→Fixed`, `perf/refactor→Changed`
     e **oculta** `chore/docs/test` (os 2 chores não entram — correto);
   - links de commit/comparação apontando para o repo certo.
2. `npm run release:minor` — faz em um commit: bump do `package.json`,
   regeneração do `CHANGELOG.md` (com os títulos dos commits, que já estão em
   pt-BR e são descritivos), commit `chore(release): v0.2.0` e tag `v0.2.0`.
   *Observação*: a ferramenta **regenera** o CHANGELOG inteiro — não editar à
   mão antes; ajustes de redação só seriam feitos via títulos de commit.
3. Revisar o `CHANGELOG.md` gerado.
4. `git push origin main --follow-tags`.
5. Conferir: tag no GitHub, deploy da Vercel em produção e o rodapé da home
   mostrando a nova `APP_VERSION` (fonte: `package.json`).

**Aceite**: tag `v0.2.0` no origin; seção `[0.2.0]` no CHANGELOG com os 7 feat/fix
visíveis; site no ar com a versão nova no rodapé.

**Risco**: nada destrutivo; `release:dry` cobre surpresas. Nunca rodar com
árvore suja (a ferramenta falha ou mistura conteúdo no commit de release).

---

## Etapa 4 — Decisões do responsável (§11.6 e §11.7)

Cada decisão é independente e destrava só o seu item. **Recomendações já
marcadas** — aprovar ou contrariar.

### D1 — Nome/marca (constituição, perguntas 1 e 2; §11.7)

| Opção | Consequência |
| --- | --- |
| **(a) Manter "Portal São Carlos"** (recomendado por ora) | Zero mudança; já documentado como provisório em AGENTS.md §11.7 |
| (b) Adotar "meubairro" como marca | Alinhada ao domínio, mas exige: `layout.tsx` (title/applicationName/keywords), JSON-LD, footer, header (alt do logo), `package.json` name, README, OG image — tarefa de ~meia dia + rebranding visual |

### D2 — Métricas: GA4 × constituição (pergunta 9) — **mais urgente**

Hoje existe um desacordo formal: a constituição v1.0.0 condiciona métricas a
"política definida (pergunta em aberto)", mas o GA4 (`G-063LGPHV93`) já está
em produção.

| Opção | Consequência |
| --- | --- |
| **(a) Emenda à constituição** (recomendada) | Registrar GA4 como métrica permitida (ID público, carga adiada, somente produção, agregada) + efeitos colaterais (cookies do GA, retenção Google). Segue o protocolo de emenda: bump **MINOR → v1.1.0** + Relatório de Impacto de Sincronização no próprio `.specify/memory/constitution.md`, e mover a pergunta 9 para "respondida" |
| (b) Remover o GA4 | Apagar `components/analytics/google-analytics.tsx` + uso no layout + testes; perda de métrica já coletando |

### D3 — Canais de contato oficiais (pergunta 10)

Hoje só existe default de e-mail (`contactEmail`). Sem `CONTACT_WHATSAPP` /
`CONTACT_PHONE`, o card do hero e o "Anuncie aqui" ficam sem WhatsApp/telefone.

- **Ação**: definir os números → setar como variáveis de ambiente na Vercel
  (Production) → não commitar valor em repo (gate 9).
- **Aceite**: CTA do hero com WhatsApp clicável em produção.

### D4 — Política de anúncios gratuitos (perguntas 6 e 7)

Definir critérios de aceitação, volume e periodicidade de publicação.

- **Sugestão de entrega**: `docs/politica-anuncios.md` (critérios já existem
  na constituição §Publicidade — o que falta é operação: onde entrar, prazo,
  limite de itens) + link no aviso editorial/rodapé.

### D5 — Fechamento das perguntas em aberto

Após D1–D4: atualizar a seção "Perguntas em Aberto" da constituição (itens
respondidos saem ou viram "respondida" conforme o protocolo de emenda) e o
§11 do `AGENTS.md`.

---

## Etapa 5 — Pós-decisões + validação final

1. Aplicar D2 (emenda ou remoção do GA4) e D3 (env vars na Vercel).
2. Suite completa: `npm run lint` (0/0) · `npm run test` · `npm run build`.
3. Amostragem manual quickstart: V1 (home móvel com as 4 informações núcleo),
   V2 (rótulos), V3 (CTA ≤2 interações), V5 (falha de fonte → stale amigável).
4. `git status` limpo; tags publicadas.
5. **Atualizar `AGENTS.md`**: §2 (novos números de verificação), §11 (marcar
   resolvidos: release, status da spec, warning, lint, feeds avaliados,
   decisões D1–D4) — este plano é o que fecha cada item.

---

## Fora de escopo (deliberado)

- **Fase 2** da constituição (formulário de interesse, persistência de
  notícias, métricas além do GA4) — exige iniciar fase nova com revisão de escopo.
- Rotas do mockup (`/portal-noticias`, `/guia-comercial`…) — recusadas no
  design Civic Vanguard; navegação é por âncoras.
- Busca no header e faixa de alerta — recusadas; não reintroduzir sem perguntar.

## Riscos consolidados

| Risco | Mitigação |
| --- | --- |
| Subset da fonte corta ícone usado | Lista de ícones extraída por grep antes do subset + inspeção visual completa |
| Release mistura conteúdo sujo | Pré-requisição: árvore limpa + `release:dry` |
| Nova fonte RSS falha/lenta | Isolamento `ok/stale/error` já coberto por testes de integração |
| Emenda constitucional fora do padrão | Seguir template + Sync Impact Report do próprio `.specify/memory/constitution.md` |
| D1 adiada indefinidamente | Manter "provisório" documentado (não trava nenhuma etapa técnica) |
