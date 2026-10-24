# UI Contracts: Fase 2 — Persistência e Captura de Interesse

**Date**: 2026-10-24  
**Spec**: specs/002-fase2-persistencia-captura/spec.md  
**Data Model**: specs/002-fase2-persistencia-captura/data-model.md  
**API Contracts**: specs/002-fase2-persistencia-captura/contracts/api-contracts.md

---

## Component Contracts

### 1. NewsHistorySection (`components/sections/news-history-section.tsx`)

**Props**:
```typescript
interface NewsHistorySectionProps {
  initialPage?: NewsHistoryPage;    // Server Component passa dados iniciais
  revalidate?: number;              // Default 1800 (30 min)
}
```

**Behavior**:
- Recebe `initialPage` do Server Component (`/noticias/page.tsx`)
- Client-side pagination via `useSearchParams` + `router.push('?page=N')`
- Suspense boundary para loading de páginas subsequentes
- Exibe `StatusMessage` se `sourceStatus !== 'ok'`

**Rendering**:
```
<section aria-labelledby="noticias-history-heading">
  <header>
    <h2 id="noticias-history-heading">Todas as Notícias</h2>
    <ContentLabel kind="noticia" />
  </header>
  <ul role="list" className="news-grid">
    {items.map(item => <NewsHistoryItemCard key={item.id} item={item} />)}
  </ul>
  <Pagination 
    currentPage={page}
    totalPages={totalPages}
    hasNextPage={hasNextPage}
    hasPreviousPage={hasPreviousPage}
    onPageChange={page => router.push(`?page=${page}`)}
  />
  {sourceStatus !== 'ok' && <StatusMessage status={sourceStatus} source="notícias" />}
</section>
```

**Accessibility**:
- `aria-labelledby` no section
- Pagination: `<nav aria-label="Paginação de notícias">`, botões com `aria-label="Página N"`, `aria-current="page"` na ativa
- Links com `rel="noopener noreferrer"` para fontes externas

---

### 2. NewsHistoryItemCard (`components/ui/news-history-item-card.tsx`)

**Props**:
```typescript
interface NewsHistoryItemCardProps {
  item: NewsHistoryItem;
}
```

**Rendering**:
```
<article className="news-card">
  {item.imageUrl && (
    <div className="news-image">
      <Image src={item.imageUrl} alt="" fill sizes="(max-width: 640px) 100vw, 33vw" />
    </div>
  )}
  <header>
    <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time>
    <span className="source">{item.source}</span>
  </header>
  <h3><a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">{item.title}</a></h3>
  <p>{item.summary}</p>
  <footer>
    <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">Ler na fonte →</a>
  </footer>
</article>
```

---

### 3. AdFormSection (`components/sections/ad-form-section.tsx`)

**Props**: Nenhuma (Client Component auto-contido)

**State**:
```typescript
const [formData, setFormData] = useState<AdSubmissionInput>(initialEmpty);
const [errors, setErrors] = useState<Record<string, string>>({});
const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
const [submitMessage, setSubmitMessage] = useState('');
```

**Validation** (client-side, mirror of server):
- Required fields: businessName, category, description, neighborhood, phone, cnpj
- Phone: regex `(\(?\d{2}\)?\s?)?(9?\d{4}-?\d{4})` → normalizado para `55DDD9XXXXXXXX`
- CNPJ: 14 dígitos, módulo 11 válido (função `validateCNPJ` em `lib/cnpj.ts`)
- ExternalLink: se preenchido, URL https válida
- Category: select com opções de `AD_CATEGORIES`

**Submission**:
```typescript
async function handleSubmit(e: FormEvent) {
  e.preventDefault();
  setSubmitStatus('submitting');
  const res = await fetch('/api/ads/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  const data = await res.json();
  if (res.ok) {
    setSubmitStatus('success');
    setSubmitMessage(data.message);
    resetForm();
  } else {
    setSubmitStatus('error');
    if (data.details) setErrors(Object.fromEntries(data.details.map(d => [d.field, d.message])));
    else setSubmitMessage(data.message);
  }
}
```

**Rendering**:
```
<section aria-labelledby="anunciar-heading">
  <header>
    <h2 id="anunciar-heading">Anuncie Gratuitamente</h2>
    <ContentLabel kind="anuncio-gratuito" />
  </header>
  <form onSubmit={handleSubmit} noValidate>
    <div className="form-grid">
      <Field label="Nome do comércio/serviço *" name="businessName" required />
      <Field label="Categoria *" name="category" type="select" options={AD_CATEGORIES} required />
      <Field label="Descrição curta *" name="description" type="textarea" maxLength={500} required />
      <Field label="Bairro/região *" name="neighborhood" required />
      <Field label="Telefone/WhatsApp *" name="phone" type="tel" placeholder="(16) 99999-9999" required />
      <Field label="CNPJ *" name="cnpj" placeholder="00.000.000/0000-00" required />
      <Field label="Link externo (site, Instagram)" name="externalLink" type="url" />
      <Field label="Horário de atendimento" name="businessHours" placeholder="Seg-Sex 8h-18h, Sáb 8h-12h" />
    </div>
    <button type="submit" disabled={submitStatus === 'submitting'}>
      {submitStatus === 'submitting' ? 'Enviando...' : 'Enviar para Moderação'}
    </button>
    {submitStatus === 'success' && <Alert variant="success">{submitMessage}</Alert>}
    {submitStatus === 'error' && <Alert variant="error">{submitMessage}</Alert>}
  </form>
  <p className="form-footer">
    Ao enviar, você concorda com a <a href="/politica-de-privacidade">Política de Privacidade</a> 
    e com a <a href="/aviso-editorial">Política de Anúncios Gratuitos</a>. 
    Seu anúncio passará por moderação manual antes de ser publicado.
  </p>
</section>
```

**Accessibility**:
- `noValidate` + custom validation
- `aria-describedby` nos campos com erro
- `aria-live="polite"` no container de mensagens
- Focus trap no modal de sucesso (se usar modal)
- Labels visíveis e associados via `htmlFor`/`id`

---

### 4. Pagination (`components/ui/pagination.tsx`)

**Props**:
```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  baseUrl?: string;           // Para SSR links (ex.: "/noticias")
  category?: string;          // Preserva filtro se houver
}
```

**Rendering**:
```
<nav aria-label="Paginação de notícias" className="pagination">
  <button 
    onClick={() => onPageChange(currentPage - 1)}
    disabled={!hasPreviousPage}
    aria-label="Página anterior"
    aria-disabled={!hasPreviousPage}
  >Anterior</button>
  
  <span className="page-info" aria-live="polite">
    Página {currentPage} de {totalPages}
  </span>
  
  <div className="page-numbers" role="group" aria-label="Números das páginas">
    {getPageNumbers(currentPage, totalPages).map(p => (
      <button
        key={p}
        onClick={() => onPageChange(p)}
        aria-label={`Página ${p}`}
        aria-current={p === currentPage ? 'page' : undefined}
        className={p === currentPage ? 'active' : ''}
      >{p}</button>
    ))}
  </div>
  
  <button
    onClick={() => onPageChange(currentPage + 1)}
    disabled={!hasNextPage}
    aria-label="Próxima página"
    aria-disabled={!hasNextPage}
  >Próxima</button>
</nav>
```

**Page Numbers Logic** (`getPageNumbers`):
- Sempre mostra página 1 e última
- Mostra página atual ± 1
- Ellipsis (`...`) onde houver gaps
- Ex.: `[1] ... [4] [5] [6] ... [12]`

---

### 5. ModerationTable (`components/ui/moderation-table.tsx`)

**Props**:
```typescript
interface ModerationTableProps {
  submissions: AdSubmission[];
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  onViewDetails: (id: string) => void;
}
```

**Rendering**:
```
<table>
  <thead>
    <tr>
      <th scope="col">Comércio</th>
      <th scope="col">Categoria</th>
      <th scope="col">Bairro</th>
      <th scope="col">Telefone</th>
      <th scope="col">CNPJ</th>
      <th scope="col">Enviado em</th>
      <th scope="col">Ações</th>
    </tr>
  </thead>
  <tbody>
    {submissions.map(sub => (
      <tr key={sub.id}>
        <td>{sub.businessName}</td>
        <td><StatusBadge status={sub.category} variant="category" /></td>
        <td>{sub.neighborhood}</td>
        <td><a href={`https://wa.me/${sub.phone}`} target="_blank" rel="noopener">{formatPhone(sub.phone)}</a></td>
        <td><code>{maskCNPJ(sub.cnpj)}</code></td>
        <td><time dateTime={sub.submittedAt}>{formatDateTime(sub.submittedAt)}</time></td>
        <td>
          <div className="actions">
            <button onClick={() => handleApprove(sub.id)}>Aprovar</button>
            <button onClick={() => handleReject(sub.id)}>Recusar</button>
            <button onClick={() => onViewDetails(sub.id)}>Detalhes</button>
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

**Actions**:
- **Aprovar**: chama `onApprove(id)` → POST `/api/ads/approve` → toast success → remove da tabela
- **Recusar**: abre modal com `textarea` para motivo (obrigatório) → `onReject(id, reason)`
- **Detalhes**: abre drawer/modal com todos os campos da submissão

---

### 6. PublishedAdsManager (`components/ui/published-ads-manager.tsx`)

**Props**:
```typescript
interface PublishedAdsManagerProps {
  ads: AdPublished[];
  onEdit: (id: string, updates: Partial<AdPublished>) => Promise<void>;
  onSuspend: (id: string) => Promise<void>;
  onReactivate: (id: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}
```

**Rendering**: Similar table com ações [Editar] [Suspender/Reativar] [Remover]

- **Editar**: abre formulário pré-preenchido (sem CNPJ/kind) → PATCH `/api/ads/manage`
- **Suspender**: confirmação → PATCH `action: 'suspend'` → status `suspenso`
- **Reativar**: se suspenso → PATCH `action: 'reactivate'` → status `publicado`
- **Remover**: confirmação dupla → PATCH `action: 'remove'` → status `removido`

---

### 7. StatusBadge (`components/ui/status-badge.tsx`)

**Props**:
```typescript
interface StatusBadgeProps {
  status: 'pendente' | 'aprovado' | 'recusado' | 'publicado' | 'suspenso' | 'removido';
  variant?: 'default' | 'category';
}
```

**Visual** (Tailwind, Civic Vanguard tokens):
- `pendente`: `bg-amber-100 text-amber-800` (amarelo/âmbar)
- `aprovado`/`publicado`: `bg-emerald-100 text-emerald-800` (verde/sucesso)
- `recusado`/`removido`: `bg-rose-100 text-rose-800` (vermelho/erro)
- `suspenso`: `bg-slate-100 text-slate-800` (cinza/neutro)
- `category`: usa cor da categoria (se definido) ou `bg-primary-100 text-primary-800`

---

### 8. Header Update (`components/layout/header.tsx`)

**Change**: Adicionar link "Anunciar" na navegação principal

**Current Nav** (âncoras): `#noticias`, `#clima`, `#informativos`, `#contatos`, `#anuncios`

**New Nav**:
```tsx
<nav aria-label="Navegação principal">
  <ul>
    <li><a href="#noticias">Notícias</a></li>
    <li><a href="#clima">Clima</a></li>
    <li><a href="#informativos">Informativos</a></li>
    <li><a href="/utilidade-publica">Utilidade Pública</a></li>
    <li><a href="/empresas">Guia Comercial</a></li>
    <li><a href="/anunciar" className="btn-primary">Anunciar Grátis</a></li>
  </ul>
</nav>
```

- Link `/anunciar` styled as primary button (CTA)
- Mantém sticky header, logo, botão "Anuncie Aqui" existente (scroll para `#anuncie` no footer)

---

## Page Layout Contracts

### `/noticias` (`app/noticias/page.tsx`)

```tsx
export const revalidate = 1800; // 30 min

export default async function NoticiasPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Math.max(1, parseInt((await searchParams).page || '1', 10));
  const history = await getNewsHistoryPage(page); // Server call
  
  return (
    <>
      <JsonLd type="ItemList" items={history.items} />
      <main id="conteudo">
        <NewsHistorySection initialPage={history} />
      </main>
    </>
  );
}
```

### `/anunciar` (`app/anunciar/page.tsx`)

```tsx
'use client';

export default function AnunciarPage() {
  return (
    <main id="conteudo">
      <AdFormSection />
    </main>
  );
}
```

### `/moderacao` (`app/moderacao/page.tsx`)

```tsx
// app/moderacao/layout.tsx - Auth check
export default async function ModeracaoLayout({ children }: { children: React.ReactNode }) {
  const secret = (await cookies()).get('moderator_secret')?.value 
              || (await headers()).get('x-moderator-secret');
  
  if (!verifyModerator(secret)) {
    redirect('/?moderation=unauthorized');
  }
  return children;
}

// app/moderacao/page.tsx
export default async function ModeracaoPage() {
  const pending = await getPendingSubmissions(); // Server, no cache
  const published = await getPublishedAds();     // Server, no cache
  
  return (
    <main id="conteudo">
      <h1>Área de Moderação</h1>
      <Tabs defaultValue="pendentes">
        <TabsList>
          <TabsTrigger value="pendentes">Pendentes ({pending.length})</TabsTrigger>
          <TabsTrigger value="publicados">Publicados ({published.filter(a => a.kind==='anuncio-gratuito').length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pendentes">
          <ModerationTable 
            submissions={pending} 
            onApprove={handleApprove} 
            onReject={handleReject} 
            onViewDetails={handleViewDetails}
          />
        </TabsContent>
        <TabsContent value="publicados">
          <PublishedAdsManager 
            ads={published.filter(a => a.kind==='anuncio-gratuito')} 
            onEdit={handleEdit}
            onSuspend={handleSuspend}
            onReactivate={handleReactivate}
            onRemove={handleRemove}
          />
        </TabsContent>
      </Tabs>
    </main>
  );
}
```

---

## Styling Contract (Civic Vanguard Tokens)

All new components use tokens from `src/app/globals.css` (`@theme`):

| Token | Usage |
|---|---|
| `--color-primary` | `#001428` (navy) - headers, primary buttons, active pagination |
| `--color-secondary` | `#0050cc` (azul) - links, secondary actions |
| `--color-amber` | `#ffb300` - pending status, warnings |
| `--color-emerald` | `#10b981` - success, approved, published |
| `--color-rose` | `#f43f5e` - error, rejected, removed |
| `--color-slate` | `#64748b` - suspended, neutral |
| `--font-display` | `Plus Jakarta Sans` - headings |
| `--font-body` | `Inter` - body text, forms, tables |
| `--radius-md` | `0.5rem` - cards, buttons, inputs |
| `--shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1)` - cards, modals |

**Responsive Breakpoints** (Tailwind):
- `sm`: 640px (mobile landscape)
- `md`: 768px (tablet)
- `lg`: 1024px (desktop)
- `xl`: 1280px (wide)

---

## ContentLabel Integration

All new sections/pages must include `ContentLabel` per FR-008:

| Page/Section | Kind |
|---|---|
| `/noticias` listagem | `noticia` |
| `/noticias` item card | `noticia` |
| `/anunciar` formulário | `anuncio-gratuito` |
| `/moderacao` tabela pendentes | (área administrativa - sem label público) |
| Anúncios gratuitos publicados | `anuncio-gratuito` (já existente no `AdsSection`) |

---

## SEO Contracts

### `/noticias` Metadata
```typescript
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = parseInt((await searchParams).page || '1', 10);
  const title = page === 1 
    ? 'Notícias de São Carlos | Meu Bairro - Portal São Carlos'
    : `Notícias de São Carlos - Página ${page} | Meu Bairro - Portal São Carlos`;
  
  return {
    title,
    description: 'Todas as notícias de São Carlos e região em um só lugar. Acompanhe o que acontece na cidade.',
    openGraph: {
      title,
      description: 'Todas as notícias de São Carlos e região.',
      type: 'website',
      url: `/noticias${page > 1 ? `?page=${page}` : ''}`,
    },
    robots: { index: true, follow: true },
    alternates: { canonical: `/noticias${page > 1 ? `?page=${page}` : ''}` },
  };
}
```

### `/anunciar` Metadata
```typescript
export const metadata = {
  title: 'Anuncie Gratuitamente | Meu Bairro - Portal São Carlos',
  description: 'Publique seu anúncio grátis no portal de São Carlos. Comércio local, serviços, alimentação e mais. Moderação manual, sem custo.',
  robots: { index: true, follow: true },
  openGraph: { /* ... */ },
};
```

### `/moderacao` Metadata
```typescript
export const metadata = {
  title: 'Área de Moderação | Meu Bairro - Portal São Carlos',
  robots: { index: false, follow: false }, // No index
};
```

---

## JSON-LD Contracts

### `/noticias` - ItemList
```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "NewsArticle",
        "headline": "Título da notícia",
        "description": "Resumo...",
        "datePublished": "2026-10-20T14:30:00-03:00",
        "author": { "@type": "Organization", "name": "G1 São Carlos" },
        "url": "https://g1.globo.com/...",
        "image": "https://..."
      }
    }
  ]
}
```

### Anúncio Gratuito (em `ads.json` já renderizado via `JsonLd` existente)
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://www.meubairro.dev.br/anuncio/550e8400-...",
  "name": "Padaria do João",
  "description": "Pães artesanais...",
  "address": { "@type": "PostalAddress", "addressLocality": "São Carlos", "addressRegion": "SP", "addressCountry": "BR" },
  "telephone": "+5516981442301",
  "url": "https://instagram.com/padariadojoao",
  "openingHoursSpecification": [ /* parsed from businessHours */ ],
  "priceRange": "Grátis",
  "category": "Alimentação"
}
```