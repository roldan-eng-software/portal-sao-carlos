# Contract: Adaptador de Fonte de Conteúdo

**Date**: 2026-09-28 | **Plan**: [plan.md](../plan.md)

Contrato interno que todo provedor de conteúdo externo (ou curado) DEVE
satisfazer. A UI nunca acessa uma fonte diretamente — apenas consome o
resultado normalizado (constituição §Manutenibilidade: não acoplar a interface
às respostas brutas).

## Interface

```text
ContentSource<T>
  id: string                       // identificador estável ("open-meteo", "rss-google-news", "ads-file")
  displayName: string              // nome exibido ao visitante quando relevante
  fetch(): Promise<ModuleResult<T>>
```

## Regras obrigatórias

1. **Envelope**: `fetch()` retorna sempre `ModuleResult<T>` (ver
   [data-model.md](../data-model.md)) — nunca exceção propaga para a página.
2. **Timeout**: DEVE abortar a busca após timeout configurável (padrão 5 s) e
   retornar `stale` (se houver dado anterior em cache) ou `error`.
3. **Normalização**: a resposta bruta DEVE ser convertida para o modelo interno
   no próprio adapter (`normalize.ts`); formato interno é estável mesmo que a
   fonte mude.
4. **Sanitização**: todo texto vindo da fonte DEVE passar por remoção de HTML →
   texto puro; toda URL DEVE ser validada (http/https) antes de virar link.
   HTML bruto na saída é violação de contrato (gate 11).
5. **Atribuição**: `sourceName` DEVE ser preenchido e a UI DEVE exibi-lo com
   link ao original quando houver `url` (gate 13).
6. **Isolamento**: falha de um adapter NÃO DEVE impedir `fetch()` de outros
   adapters (gate 10); a página chama cada módulo de forma independente.
7. **Segredo**: adapters NÃO DEVEM expor chaves ao cliente; qualquer chave
   futura lida-se de variável de ambiente no servidor (gate 9). Na Fase 1
   nenhuma fonte exige chave.
8. **Configuração**: endpoints/feeds DEVEM vir de `config/sources.ts` (ou env),
   não hardcoded em componentes — remover uma fonte não pode exigir alteração
   de UI.
9. **Cache**: adapters são invocados sob cache com revalidação (≈15 min);
   chamada por visita do usuário é proibida (performance).
10. **Logs**: falhas DEVEM ser registradas com `id` da fonte, timestamp, tipo
    de erro e contador de falhas consecutivas (`lib/logger.ts`).

## Conformidade na Fase 1

| Adapter | Fonte | Chave | Status |
| --- | --- | --- | --- |
| `weather` | Open-Meteo (coords fixas SC) | não | previsto |
| `news` | Registro de feeds RSS (`config/sources.ts`) | não | previsto |
| `notices` | `content/notices.json` (curadoria manual) | — | previsto (arquivo) |
| `ads` | `content/ads.json` (moderação manual) | — | previsto (arquivo) |
| `promo` | `content/promo.json` | — | previsto (arquivo) |
| `contacts` | `content/contacts.json` | — | previsto (arquivo) |

Adapters de arquivo versionado cumprem o mesmo envelope `ModuleResult`
(validação de campos → `error` amigável se o JSON for inválido), mantendo a UI
indiferente à origem real do dado.
