# Research: Fase 2 — Persistência e Captura de Interesse

**Date**: 2026-10-24  
**Spec**: specs/002-fase2-persistencia-captura/spec.md  
**Plan**: specs/002-fase2-persistencia-captura/plan.md

---

## Decisions Consolidated

All technical unknowns from the Technical Context have been resolved. Below is the consolidated research with decision, rationale, and alternatives considered for each.

---

### 1. Armazenamento: JSON versionado em `src/content/` vs SQLite/Neon

**Decision**: **JSON versionado** (`news-history.json`, `ads-pending.json`, `ads.json` estendido)

**Rationale**:
- Princípio II (Simplicidade): zero dependência externa, zero custo, zero config
- Princípio III (Sem Imagens Armazenadas): dados são apenas texto/links
- Princípio VII (Minimização): evita superfície de ataque de DB
- Auditoria nativa via Git (commits = log de alterações de anúncios)
- Migração futura para banco (se necessário) é trivial: loaders isolados em `modules/*/loader.ts`
- Volume esperado: notícias ~1000 itens/ano, anúncios pendentes ~dezenas, publicados ~centenas

**Alternatives considered**:
- **SQLite (local file)**: adiciona dependência (`better-sqlite3`), migração schema, backup separado
- **Neon/PostgreSQL**: custo, config, secrets, overkill para portal local fase 2
- **Upstash Redis**: custo, rede, latência, desnecessário para rate limiting simples

---

### 2. Autenticação da área de moderação: `MODERATOR_SECRET` (env) vs NextAuth vs Vercel Password Protection

**Decision**: **`MODERATOR_SECRET` em variável de ambiente** + verificação no layout da rota `/moderacao`

**Rationale**:
- Princípio II: sem cadastro de usuários, sem dashboard, sem recovery de senha
- Moderador único (proprietário — emenda v1.3.0)
- Implementação: middleware ou `layout.tsx` em `/moderacao` lê `headers().get('x-moderator-secret')` ou `searchParams.get('secret')` e compara com `process.env.MODERATOR_SECRET`
- Falha → 401/redirect para `/` com mensagem genérica
- Segredo só no servidor, nunca no cliente
- Rotacionável via Vercel env + redeploy

**Alternatives considered**:
- **NextAuth Credentials**: adiciona dependência, config, sessões, cookies — overkill para 1 usuário
- **Vercel Password Protection**: protege toda a preview/produção, não rota específica; custo em planos pagos
- **HTTP Basic Auth**: expõe credencial no header, menos limpo que secret customizado

---

### 3. Rate limiting no formulário público: in-memory Map vs Upstash Redis vs Vercel Edge Config

**Decision**: **In-memory `Map<IP, {count, resetAt}>`** com janela deslizante (ex.: 10 req/15min por IP)

**Rationale**:
- Volume baixo (formulário de anúncio local)
- Simplicidade: zero dependência, zero custo, zero config
- Reinicia no deploy (aceitável — abuso sustentado seria detectado por logs)
- IP obtido via `headers().get('x-forwarded-for')` ou `request.ip` no Vercel
- Cleanup automático de entradas expiradas no próprio middleware

**Alternatives considered**:
- **Upstash Redis**: persistente across deploys, mas custo, rede, dependência externa
- **Vercel Edge Config**: só leitura, não serve para contador incremental
- **Banco de dados**: overkill

---

### 4. Deduplicação por CNPJ: validação algoritmo módulo 11 vs normalização simples

**Decision**: **Normalização (só dígitos) + validação algoritmo módulo 11 (CNPJ válido)**

**Rationale**:
- Política: "1 anúncio por CNPJ/negócio" — CNPJ inválido não deve bloquear CNPJ válido diferente
- Algoritmo módulo 11 é padrão, rápido, evita falsos positivos (ex.: "11.111.111/1111-11" inválido)
- CNPJ obrigatório no formulário (campo hidden ou visible), validado no cliente e servidor
- Não exibido publicamente (apenas no painel de moderação e armazenamento)

**Alternatives considered**:
- **Só normalização**: "12345678000199" e "12.345.678/0001-99" OK, mas "11111111111111" passaria
- **Dedupe por nome+telefone+bairro**: frágil (variações de digitação, mesma empresa mudando telefone)

---

### 5. Notificação ao comerciante (aprovação/recusa): links `wa.me` + `mailto` vs API externa

**Decision**: **Links `wa.me` e `mailto` com mensagem pré-formatada** abertos pelo moderador

**Rationale**:
- Zero custo, zero segredo, zero dependência externa
- Moderador clica → abre WhatsApp/e-mail do comerciante com texto pronto (inclui motivo se recusa)
- Política de anúncios gratuitos não exige notificação automática instantânea
- LGPD: dado de contato (WhatsApp/e-mail) já fornecido pelo comerciante no formulário

**Alternatives considered**:
- **Twilio/WhatsApp Business API**: custo, config, templates aprovados, overkill
- **Serviço de e-mail (SendGrid, Resend)**: custo, config, entrega não garantida, spam
- **Notificação in-app**: não existe "área do comerciante" (Princípio II)

---

### 6. Retenção de notícias (12 meses): job cron vs limpeza manual vs on-demand no loader

**Decision**: **On-demand no loader** (filtra `>12 meses` na leitura) + **script manual opcional** (`npm run cleanup:news-history`) para compactar arquivo

**Rationale**:
- Simplicidade: não precisa cron, scheduler, infra extra
- Loader de `news-history.json` já lê no servidor; filtro por data é O(n) trivial (~1000 itens)
- Arquivo JSON não cresce ilimitado na prática (loader não carrega itens velhos)
- Script manual permite limpeza física do arquivo quando desejado (ex.: mensal)

**Alternatives considered**:
- **Vercel Cron Job**: adiciona config `vercel.json`, execução serverless, custo minimal mas complexidade
- **GitHub Actions scheduled**: roda fora do runtime, precisa commit/push, mais complexo
- **Limpeza só manual**: arquivo cresce no disco (Git), mas loader filtra — aceitável

---

### 7. Paginação `/noticias`: query param `page` vs path segment vs cursor-based

**Decision**: **Query param `?page=N`**, 20 itens/página, ordenação data decrescente, `revalidate=1800`

**Rationale**:
- SEO-friendly: URLs compartilháveis, indexáveis, canônicas claras
- Stateless: não depende de sessão/cursor
- Compatível com `next/link` e `useSearchParams` no Client Component para paginação
- `revalidate=1800` (30 min) balanceia frescor vs performance (ISR)

**Alternatives considered**:
- **Path segment `/noticias/page/2`**: menos padrão em Next.js App Router para paginação simples
- **Cursor-based**: complexo para SEO, não compartilhável, overkill

---

### 8. Campos do formulário: CNPJ obrigatório vs opcional (dedupe por nome+telefone)

**Decision**: **CNPJ obrigatório**, validado (algoritmo + normalização), não exibido publicamente

**Rationale**:
- Política de Anúncios Gratuitos (v1.2.0): "1 anúncio por CNPJ/negócio"
- CNPJ é identificador único forte; nome+telefone+bairro tem colisões
- Campo pode ser `type="text"` com máscara no cliente, `hidden` se preferir UX mais limpa
- Validação no cliente (feedback imediato) + servidor (segurança)

**Alternatives considered**:
- **CNPJ opcional + dedupe fuzzy**: complexo, propenso a erros, difícil de auditar

---

### 9. Categorias de anúncio: reutilizar `content/ads.json` vs lista fixa nova

**Decision**: **Reutilizar categorias existentes em `content/ads.json`** (enum derivado dos anúncios atuais)

**Rationale**:
- Consistência: mesmo vocabulário para anúncios gratuitos e patrocinados
- `content/ads.json` já tem campo `categoria` nos anúncios existentes
- Loader `ads/loader.ts` já exporta categorias se necessário
- Extensível: moderador pode editar `ads.json` para adicionar categoria

**Alternatives considered**:
- **Lista fixa hardcoded**: duplicação, divergência futura, manutenção em dois lugares

---

### 10. Sanitização: estender `lib/sanitize.ts` vs DOMPurify

**Decision**: **Estender `lib/sanitize.ts`** (já faz: HTML → texto puro, URL só http/https)

**Rationale**:
- Inputs do formulário são campos de texto (nome, descrição, bairro, horário, link)
- `sanitize.ts` já remove tags HTML, normaliza whitespace, valida URLs
- DOMPurify seria para permitir HTML seguro — mas Princípio V e VII exigem rótulo textual e minimização; não há caso de uso para HTML rico
- Menor bundle, zero dependência extra

**Alternatives considered**:
- **DOMPurify**: permite `<b>`, `<i>`, links — desnecessário e risco se config errado
- **React `dangerouslySetInnerHTML`**: PROIBIDO pela constituição

---

## Summary

| Area | Decision | Constitutional Alignment |
|---|---|---|
| Storage | JSON versionado em `content/` | Princípios II, III, VII |
| Auth (moderação) | `MODERATOR_SECRET` env + layout check | Princípio II (sem users) |
| Rate limiting | In-memory Map por IP | Princípio II (simplicidade) |
| CNPJ dedupe | Normalização + módulo 11 | Política v1.2.0 (1/CNPJ) |
| Notificação | `wa.me` + `mailto` links | Princípio II, IV (sem custo/integração) |
| Retenção notícias | Filtro on-demand no loader (12m) | LGPD v1.3.0 (legítimo interesse) |
| Paginação | `?page=N`, 20/page, data desc | SEO local, ISR 30min |
| Formulário CNPJ | Obrigatório, validado, não público | Política v1.2.0, LGPD v1.3.0 |
| Categorias | Reutilizar `ads.json` | Consistência, DRY |
| Sanitização | Estender `lib/sanitize.ts` | Princípio V, VII, constituição |

Todas as decisões priorizam **simplicidade → baixo custo → compatibilidade → manutenção** (Critérios da Constituição, seção "Arquitetura e Tecnologia").