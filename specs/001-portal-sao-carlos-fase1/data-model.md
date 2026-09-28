# Data Model: Portal São Carlos — Fase 1

**Date**: 2026-09-28 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

Modelo interno comum (runtime, TypeScript). **Nada é persistido em banco de
dados** — entidades de conteúdo do portal vivem em arquivos JSON versionados
(`src/content/`); entidades de fonte externa existem apenas em memória após
normalização. Toda UI consome o modelo interno, nunca a resposta bruta de uma
fonte (constituição §Manutenibilidade).

## Tipos compartilhados

### `ModuleResult<T>` — envelope de todo módulo de conteúdo

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| `status` | `"ok" \| "stale" \| "error"` | sim | `ok` = atualização bem-sucedida; `stale` = exibindo último valor válido após falha; `error` = sem dado algum |
| `data` | `T \| null` | sim | `null` somente quando `status = "error"` |
| `lastUpdated` | `ISO datetime \| null` | sim | data/hora da última atualização bem-sucedida; exibida na UI (FR-012) |
| `errorMessage` | `string \| null` | sim | mensagem amigável em pt-BR para `stale`/`error`; nunca detalhe técnico (gate 10) |
| `sourceName` | `string \| null` | sim | identificação da fonte exibida ao visitante (FR-003/FR-012) |

**Transições de estado** (por módulo, a cada ciclo de atualização):

```text
(ok | stale | error) --sucesso--> ok      (data := novo; lastUpdated := agora)
ok                                --falha--> stale  (data preservado; errorMessage := aviso)
stale                             --falha--> stale  (contadorFalhas += 1; log)
(any)                             --falha sem data prévia--> error (data := null)
```

### `ContentKind` — diferenciação semântica obrigatória (FR-008)

```text
"noticia" | "informativo" | "servico-publico" | "anuncio-gratuito"
| "anuncio-patrocinado" | "divulgacao-propria"
```

Cada item renderizado carrega seu `kind`; o componente de rótulo mapeia
`kind` → texto/estilo de rótulo (ver [contracts/section-module-contract.md](./contracts/section-module-contract.md)).

## Entidades de conteúdo externo (normalizadas)

### `WeatherData` — previsão do tempo (FR-001)

| Campo | Tipo | Obrigatório | Validação |
| --- | --- | --- | --- |
| `city` | `string` | sim | sempre "São Carlos/SP" |
| `temperatureC` | `number` | sim | numérico; arredondado a 1 casa |
| `weatherCode` | `number` | sim | código WMO da fonte; mapeado para texto pt-BR + ícone textual |
| `windKmh` | `number` | não | numérico quando presente |
| `daily` | `array` de `{ date, minC, maxC, weatherCode }` | sim | 3 a 7 entradas; datas ISO `YYYY-MM-DD` |

Fonte: Open-Meteo (R2). Normalização: resposta bruta → `WeatherData`;
qualquer campo inválido → módulo em `stale`/`error`.

### `NewsItem` — notícia (FR-002)

| Campo | Tipo | Obrigatório | Validação |
| --- | --- | --- | --- |
| `title` | `string` | sim | 1–200 chars após sanitização (texto puro) |
| `summary` | `string` | sim | 1–500 chars; truncado na primeira frase limpa se maior |
| `publishedAt` | `ISO datetime` | sim | data válida; se ausente no feed, usa data da coleta e sinaliza internamente |
| `sourceName` | `string` | sim | nome do portal/feed, exibido ao visitante |
| `url` | `URL http(s)` | sim | protocolo http/https only; URL inválida → item descartado |
| `category` | `string` | não | texto livre curto ("cidade", "região") |

Regras: HTML removido (R6); no máximo N itens por feed (limite configurável,
padrão 10); nunca conteúdo integral do corpo do texto (gate 13).

### `Notice` — informativo oficial (FR-003) — fonte: `content/notices.json`

| Campo | Tipo | Obrigatório | Validação |
| --- | --- | --- | --- |
| `id` | `string` | sim | slug único |
| `title` | `string` | sim | 1–200 chars |
| `summary` | `string` | sim | 1–500 chars |
| `date` | `ISO date` | sim | `YYYY-MM-DD` |
| `sourceName` | `string` | sim | ex.: "SAAE São Carlos (comunicado)" — sempre com indicação de origem |
| `sourceUrl` | `URL \| null` | não | link ao canal oficial quando existir |
| `status` | `"publicado" \| "arquivado"` | sim | somente `publicado` é exibido |
| `kind` | fixo `"informativo"` | — | pode ser `"servico-publico"` para telefones/links de serviço |

### `Ad` — anúncio gratuito ou patrocinado (FR-005/FR-006) — fonte: `content/ads.json`

| Campo | Tipo | Obrigatório | Validação |
| --- | --- | --- | --- |
| `id` | `string` | sim | slug único |
| `kind` | `"anuncio-gratuito" \| "anuncio-patrocinado"` | sim | define rótulo e posição |
| `businessName` | `string` | sim | 1–100 chars |
| `category` | `string` | sim | ex.: "alimentação", "serviços", "eventos" |
| `description` | `string` | sim | 1–300 chars, texto puro |
| `neighborhood` | `string` | sim | bairro ou região de São Carlos |
| `phone` | `string` | um dos três obrigatório | telefone/WhatsApp em texto formatável |
| `whatsapp` | `string` | (mín. um contato) | número completo com DDI/DDD |
| `url` | `URL http(s)` \| `null` | não | link externo do anunciante |
| `hours` | `string` \| `null` | não | horário em texto livre curto |
| `status` | `"rascunho" \| "publicado" \| "suspenso" \| "removido"` | sim | somente `publicado` é exibido |
| `publishedAt` | `ISO date` | condicional | obrigatório quando `status = "publicado"` |
| `expiresAt` | `ISO date` \| `null` | não | patrocinados: fim do período combinado fora do sistema; expirado → tratado como `suspenso` na renderização |

**Transições de estado (moderação manual, gate 6)**:

```text
rascunho --revisão humana--> publicado --fim de acordo/expira--> suspenso
publicado --revisão humana--> removido
suspenso  --revisão humana--> publicado | removido
```

**Validação de aceitação do anúncio** (regras mínimas da constituição §13):
relacionado a comércio/serviço/evento local; sem conteúdo ilegal, enganoso,
discriminatório, adulto; não imita órgão público; não usa marca de terceiros
sem autorização; contém ao menos um canal de contato. Validação estrutural
automática no carregamento (campos) + julgamento editorial humano (conteúdo).

### `Promo` — divulgação própria/parceiro (FR-007) — fonte: `content/promo.json`

| Campo | Tipo | Obrigatório | Validação |
| --- | --- | --- | --- |
| `id` | `string` | sim | slug único |
| `kind` | fixo `"divulgacao-propria"` | — | nunca `"noticia"` |
| `title` | `string` | sim | 1–120 chars |
| `text` | `string` | sim | 1–400 chars, texto puro |
| `label` | `string` | sim | rótulo obrigatório: "Publicidade própria" / "Serviço do portal" / "Parceiro local" |
| `url` | `URL http(s)` \| `null` | não | link do serviço oferecido |
| `status` | `"publicado" \| "oculto"` | sim | somente `publicado` é exibido |

### `ContactItem` — telefone/link útil (FR-004) — fonte: `content/contacts.json`

| Campo | Tipo | Obrigatório | Validação |
| --- | --- | --- | --- |
| `id` | `string` | sim | slug único |
| `name` | `string` | sim | ex.: "SAAE — Atendimento", "Bombeiros" |
| `kind` | `"servico-publico"` ou `"contato"` | sim | rótulo na UI |
| `value` | `string` | sim | telefone formatado ou URL http(s) |
| `address` | `string` \| `null` | não | endereço textual |
| `hours` | `string` \| `null` | não | horário textual |
| `officialUrl` | `URL` \| `null` | não | link ao canal oficial |
| `urgent` | `boolean` | não | canais de emergência recebem aviso: "portal não substitui o canal oficial" (gate 13) |

## Relacionamentos

```text
ModuleResult<WeatherData>          (módulo clima — 1 por página)
ModuleResult<NewsItem[]>           (módulo notícias — agrupa N feeds)
ModuleResult<Notice[]>             (módulo informativos — arquivo versionado)
ModuleResult<Ad[]>                 (módulo anúncios — agrupa gratuitos; patrocinados ordenados primeiro)
ModuleResult<Promo[]>              (divulgação própria — rotulada)
ModuleResult<ContactItem[]>        (módulos contatos úteis)
```

Os módulos não se referenciam entre si (falha isolada, gate 10). A página
inicial compõe os seis `ModuleResult` independentes.

## Regras de validação transversais

1. Todo texto exibido passa por `sanitize.ts` (HTML → texto puro; gate 11).
2. Toda URL validada contra protocolos http/https antes de virar link.
3. Datas exibidas em formato pt-BR; datas armazenadas em ISO 8601.
4. Itens com `status ≠ publicado` nunca chegam à UI.
5. Falha de parsing de um item descarta apenas o item; falha do lote inteiro
   degrada o módulo para `stale`/`error` sem afetar outros módulos.
6. Nenhum campo de dados pessoais de visitantes existe no modelo (zero
   coleta, gate privacidade).
