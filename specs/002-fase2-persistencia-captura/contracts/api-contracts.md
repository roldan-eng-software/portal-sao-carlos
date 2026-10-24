# API Contracts: Fase 2 — Persistência e Captura de Interesse

**Date**: 2026-10-24  
**Spec**: specs/002-fase2-persistencia-captura/spec.md  
**Data Model**: specs/002-fase2-persistencia-captura/data-model.md

---

## Base URL

All routes are relative to the Next.js app origin (ex.: `https://www.meubairro.dev.br`)

---

## 1. POST /api/ads/submit

Submete um novo anúncio gratuito para a fila de moderação.

### Request

**Headers**:
```
Content-Type: application/json
```

**Body** (`AdSubmissionInput`):
```typescript
interface AdSubmissionInput {
  businessName: string;      // required, 1-100 chars
  category: string;          // required, must be in AD_CATEGORIES
  description: string;       // required, 1-500 chars
  neighborhood: string;      // required, 1-100 chars
  phone: string;             // required, Brazilian phone format
  externalLink?: string;     // optional, valid https URL
  businessHours?: string;    // optional, 1-200 chars
  cnpj: string;              // required, 14 digits, valid módulo 11
}
```

### Response

**Success (201 Created)**:
```json
{
  "success": true,
  "message": "Anúncio enviado para moderação. Você será notificado pelo WhatsApp/e-mail quando houver uma decisão.",
  "submissionId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pendente"
}
```

**Validation Error (400 Bad Request)**:
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Dados inválidos",
  "details": [
    { "field": "cnpj", "message": "CNPJ inválido" },
    { "field": "phone", "message": "Telefone deve estar no formato (DD) 9XXXX-XXXX" }
  ]
}
```

**Rate Limited (429 Too Many Requests)**:
```json
{
  "success": false,
  "error": "RATE_LIMITED",
  "message": "Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.",
  "retryAfter": 900
}
```

**Duplicate CNPJ (409 Conflict)**:
```json
{
  "success": false,
  "error": "DUPLICATE_CNPJ",
  "message": "Já existe um anúncio ativo ou pendente para este CNPJ.",
  "existingStatus": "publicado" | "pendente"
}
```

**Server Error (500 Internal Server Error)**:
```json
{
  "success": false,
  "error": "INTERNAL_ERROR",
  "message": "Erro interno. Tente novamente mais tarde."
}
```

### Rate Limiting

- **Limit**: 10 requests per 15 minutes per IP
- **Headers returned**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **IP detection**: `x-forwarded-for` header (Vercel) or `request.ip`

### Security

- All string fields sanitized via `lib/sanitize.ts` (HTML stripped, URLs validated)
- CNPJ validated server-side (módulo 11)
- No authentication required (public endpoint)
- CORS: same-origin only (Next.js default)

---

## 2. GET /api/ads/pending

Lista todos os anúncios pendentes de moderação. **Protegida**.

### Authentication

**Required**: `MODERATOR_SECRET` via header or query param

**Header**: `x-moderator-secret: <secret>`
**Query**: `?secret=<secret>`

### Response

**Success (200 OK)**:
```json
{
  "success": true,
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "pendente",
      "businessName": "Padaria do João",
      "category": "Alimentação",
      "description": "Pães artesanais, bolos caseiros e café fresquinho.",
      "neighborhood": "Centro",
      "phone": "5516981442301",
      "externalLink": "https://instagram.com/padariadojoao",
      "businessHours": "Seg-Sex 6h-19h, Sáb 6h-14h",
      "cnpj": "12345678000199",
      "submittedAt": "2026-10-24T10:15:00-03:00",
      "submittedIp": "200.100.50.25",
      "userAgent": "Mozilla/5.0..."
    }
  ],
  "count": 1
}
```

**Unauthorized (401 Unauthorized)**:
```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Acesso negado. Apenas o moderador pode visualizar a fila."
}
```

---

## 3. POST /api/ads/approve

Aprova um anúncio pendente e o publica como anúncio gratuito. **Protegida**.

### Authentication

Same as GET `/api/ads/pending`

### Request

**Body**:
```typescript
interface ApproveRequest {
  submissionId: string;  // required, UUID do anúncio pendente
}
```

### Response

**Success (200 OK)**:
```json
{
  "success": true,
  "message": "Anúncio aprovado e publicado como anúncio gratuito.",
  "ad": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "kind": "anuncio-gratuito",
    "status": "publicado",
    "businessName": "Padaria do João",
    "category": "Alimentação",
    "description": "Pães artesanais, bolos caseiros e café fresquinho.",
    "neighborhood": "Centro",
    "phone": "5516981442301",
    "externalLink": "https://instagram.com/padariadojoao",
    "businessHours": "Seg-Sex 6h-19h, Sáb 6h-14h",
    "cnpj": "12345678000199",
    "approvedAt": "2026-10-24T11:00:00-03:00",
    "approvedBy": "owner",
    "publishedAt": "2026-10-24T11:00:00-03:00"
  },
  "notificationLinks": {
    "whatsapp": "https://wa.me/5516981442301?text=Seu%20an%C3%BAncio%20%22Padaria%20do%20Jo%C3%A3o%22%20foi%20APROVADO%20e%20est%C3%A1%20publicado%20no%20Meu%20Bairro%20-%20Portal%20S%C3%A3o%20Carlos.%20Acesse%3A%20https%3A%2F%2Fwww.meubairro.dev.br",
    "email": "mailto:comerciante@exemplo.com?subject=An%C3%BAncio%20Aprovado%20-%20Meu%20Bairro&body=Seu%20an%C3%BAncio%20%22Padaria%20do%20Jo%C3%A3o%22%20foi%20APROVADO..."
  }
}
```

**Not Found (404)**:
```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Anúncio pendente não encontrado."
}
```

**Conflict (409)** - CNPJ já tem anúncio gratuito ativo:
```json
{
  "success": false,
  "error": "DUPLICATE_CNPJ",
  "message": "Já existe um anúncio gratuito ativo para este CNPJ. Recuse ou edite o existente antes de aprovar este."
}
```

---

## 4. POST /api/ads/reject

Recusa um anúncio pendente com motivo obrigatório. **Protegida**.

### Authentication

Same as GET `/api/ads/pending`

### Request

**Body**:
```typescript
interface RejectRequest {
  submissionId: string;    // required
  reason: string;          // required, 1-500 chars (motivo da recusa)
}
```

### Response

**Success (200 OK)**:
```json
{
  "success": true,
  "message": "Anúncio recusado. O comerciante será notificado com o motivo.",
  "submission": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "recusado",
    "rejectionReason": "Descrição não condiz com a categoria selecionada.",
    "moderatedAt": "2026-10-24T11:30:00-03:00",
    "moderatedBy": "owner"
  },
  "notificationLinks": {
    "whatsapp": "https://wa.me/5516981442301?text=Seu%20an%C3%BAncio%20%22Padaria%20do%20Jo%C3%A3o%22%20foi%20RECUSADO.%20Motivo%3A%20Descri%C3%A7%C3%A3o%20n%C3%A3o%20condiz%20com%20a%20categoria%20selecionada.%20Entre%20em%20contato%20para%20mais%20informa%C3%A7%C3%B5es.",
    "email": "mailto:comerciante@exemplo.com?subject=An%C3%BAncio%20Recusado%20-%20Meu%20Bairro&body=Seu%20an%C3%BAncio%20foi%20RECUSADO.%20Motivo%3A%20Descri%C3%A7%C3%A3o%20n%C3%A3o%20condiz..."
  }
}
```

---

## 5. PATCH /api/ads/manage

Edita, suspende ou reativa um anúncio publicado. **Protegida**.

### Authentication

Same as GET `/api/ads/pending`

### Request

**Body**:
```typescript
interface ManageRequest {
  adId: string;                              // required
  action: 'edit' | 'suspend' | 'reactivate' | 'remove';
  // Para action='edit':
  updates?: Partial<Pick<AdPublished, 'businessName' | 'category' | 'description' | 'neighborhood' | 'phone' | 'externalLink' | 'businessHours'>>;
  // Para action='remove': opcional confirmation
  confirmRemove?: boolean;
}
```

### Response

**Success (200 OK)**:
```json
{
  "success": true,
  "message": "Anúncio atualizado com sucesso.",
  "ad": { /* AdPublished atualizado */ }
}
```

**Not Found (404)**:
```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Anúncio não encontrado."
}
```

**Validation Error (400)**:
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Dados inválidos para edição.",
  "details": [...]
}
```

---

## 6. GET /noticias (Page Route)

Página de listagem paginada de notícias (Server Component, ISR).

### Query Parameters

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | integer | `1` | Número da página (1-indexed) |
| `category` | string | (todas) | Filtro por categoria (opcional) |

### Response (HTML)

- Rendered via `src/app/noticias/page.tsx`
- `revalidate = 1800` (30 min)
- Includes pagination component with accessible navigation
- Each item: title, summary, date (pt-BR), source, link to original
- `StatusMessage` if source fetch failed (stale/error)

### SEO

- `<title>Notícias de São Carlos - Página {page} | Meu Bairro - Portal São Carlos</title>`
- Canonical: `/noticias` (page 1) or `/noticias?page={N}`
- Open Graph: `og:type=website`, `og:title`, `og:description`
- JSON-LD: `ItemList` com `ListItem` para cada notícia

---

## 7. GET /anunciar (Page Route)

Formulário público para submissão de anúncio gratuito (Client Component).

### Response (HTML)

- Rendered via `src/app/anunciar/page.tsx`
- Form with all required fields + CNPJ (validated client-side)
- `ContentLabel` "Anúncio Gratuito" no topo
- Submit button disabled until valid
- On success: toast/alert with confirmation message, form reset
- On error: inline field errors + toast

### Accessibility

- Labels associated with inputs
- ARIA live regions for errors/success
- Focus management on submit
- Keyboard navigable
- Contrast AA

---

## 8. GET /moderacao (Page Route)

Área de moderação protegida (Server Component com auth check).

### Authentication

Layout `src/app/moderacao/layout.tsx` verifica `MODERATOR_SECRET` via:
- Cookie `moderator_secret` (HttpOnly, Secure, SameSite=Strict) set on first valid access
- Ou header/query a cada request

### Response (HTML)

- Table/list of pending submissions (`AdSubmission[]`)
- Columns: Business Name, Category, Neighborhood, Phone, CNPJ (masked), Submitted At, Actions
- Actions per row: [Aprovar] [Recusar] [Ver Detalhes]
- Tabs/sections: Pendentes | Publicados (para gerenciar)
- Publisheds section: [Editar] [Suspender] [Remover] [Reativar]

### Security

- No caching (`no-store`)
- All mutating actions via POST to API routes above
- CSRF protection: Next.js built-in (same-origin + secret)

---

## Error Handling Conventions

All API routes return consistent envelope:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;        // error code
  message: string;       // human-readable
  details?: Array<{ field: string; message: string }>;
}
```

HTTP status codes:
- 200: OK (GET, PATCH, POST approve/reject/manage)
- 201: Created (POST submit)
- 400: Validation error
- 401: Unauthorized (moderação)
- 404: Not found
- 409: Conflict (duplicate CNPJ)
- 429: Rate limited
- 500: Internal error (logged server-side, never exposes details)

---

## TypeScript Types (Shared)

```typescript
// src/modules/ads-pending/types.ts (exported for API contracts)
export type AdSubmissionStatus = 'pendente' | 'aprovado' | 'recusado';
export type AdPublishedStatus = 'publicado' | 'suspenso' | 'removido';
export type AdKind = 'anuncio-gratuito' | 'anuncio-patrocinado' | 'divulgacao-propria';

export interface AdSubmissionInput { /* ... */ }
export interface AdSubmission { /* ... */ }
export interface AdPublished { /* ... */ }
export interface ApproveRequest { submissionId: string; }
export interface RejectRequest { submissionId: string; reason: string; }
export interface ManageRequest { /* ... */ }
export interface ApiResponse<T> { /* ... */ }
```