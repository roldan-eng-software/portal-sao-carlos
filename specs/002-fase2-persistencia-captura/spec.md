# Feature Specification: Fase 2 — Persistência e Captura de Interesse

**Feature Branch**: `002-fase2-persistencia-captura`

**Created**: 2026-10-24

**Status**: Draft

**Input**: User description: "Fase 2 — Persistência e captura de interesse: 1) Cache e persistência das notícias: armazenar histórico de notícias além do cache volátil de 15min, permitindo consulta de notícias antigas e paginação na listagem /noticias. 2) Formulário público para anúncios gratuitos: comerciantes preenchem formulário no portal (nome, categoria, descrição, bairro, telefone/WhatsApp, link externo, horário) → entra em fila de moderação (status: pendente) → moderador (proprietário) aprova/recusa → se aprovado, publica no content/ads.json com kind=anuncio-gratuito. 3) Área de moderação simples: interface protegida (acesso apenas proprietário) para ver fila de pendentes, aprovar, recusar com motivo, editar, suspender/remover anúncios existentes. 4) Métricas básicas de acesso: GA4 já configurado (produção apenas, afterInteractive) — sem nova implementação necessária. Restrições constitucionais: Princípio II (Simplicidade): sem dashboard complexo, sem cadastro de usuários; Princípio III: sem upload/armazenamento de imagens; Princípio IV: sem pagamentos integrados; Princípio VII: minimização de dados; Política de Anúncios Gratuitos (emenda v1.2.0): comércio local geral, 1 anúncio/CNPJ, duração indeterminada até remoção manual; Retenção LGPD (emenda v1.3.0): legítimo interesse (ativo + 12m), consentimento (formulário 30d); Moderador único: proprietário do portal. Atores: visitante (lê notícias antigas), comerciante (preenche formulário), moderador/proprietário (aprova/gerencia anúncios)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitante consulta histórico de notícias (Priority: P1)

Um morador de São Carlos acessa a listagem completa de notícias (`/noticias`) e consegue navegar por páginas de notícias antigas, além das exibidas na home, para encontrar matérias de dias ou semanas anteriores.

**Why this priority**: A Fase 1 só exibe notícias recentes na home (cache 15 min). O histórico persistente é a principal entrega de valor da Fase 2 para o visitante.

**Independent Test**: Acessar `/noticias`, confirmar que há paginação (ex.: página 1, 2, 3...), que notícias de dias anteriores aparecem, e que cada item mantém título, resumo, data, fonte e link original.

**Acceptance Scenarios**:

1. **Given** o visitante acessa `/noticias`, **When** a página carrega, **Then** a listagem exibe notícias além das 10-20 mostradas na home, com paginação funcional.
2. **Given** o visitante navega para a página 2 da listagem, **When** a página carrega, **Then** notícias mais antigas são exibidas com os mesmos campos (título, resumo, data, fonte, link).
3. **Given** a fonte de notícias está indisponível no momento, **When** o visitante acessa `/noticias`, **Then** o histórico persistente permanece acessível e um aviso amigável informa que a atualização está temporariamente indisponível.
4. **Given** o visitante acessa `/noticias` em dispositivo móvel, **When** a página carrega, **Then** a paginação é utilizável sem rolagem horizontal.

---

### User Story 2 - Comerciante submete anúncio gratuito pelo formulário público (Priority: P1)

Um comerciante de São Carlos acessa o portal, preenche o formulário de anúncio gratuito com os campos obrigatórios (nome do comércio, categoria, descrição, bairro, telefone/WhatsApp) e opcionais (link externo, horário de atendimento), e submete. A submissão entra em fila de moderação com status "pendente".

**Why this priority**: É a funcionalidade central da Fase 2 para captura de interesse comercial, conforme Política de Anúncios Gratuitos (emenda v1.2.0) e constituição v1.3.0.

**Independent Test**: Acessar a página do formulário (ex.: `/anunciar`), preencher todos os campos obrigatórios e submeter; confirmar mensagem de sucesso informando que o anúncio entrou na fila de moderação e será analisado.

**Acceptance Scenarios**:

1. **Given** o comerciante acessa a página do formulário, **When** preenche todos os campos obrigatórios e submete, **Then** recebe confirmação de que o anúncio foi enviado para moderação e será analisado.
2. **Given** o comerciante deixa um campo obrigatório vazio, **When** tenta submeter, **Then** o formulário impede o envio e indica qual campo está faltando.
3. **Given** o comerciante informa um telefone/WhatsApp em formato inválido, **When** submete, **Then** o formulário valida e solicita correção.
4. **Given** o comerciante já tem um anúncio gratuito ativo (mesmo CNPJ/negócio), **When** tenta submeter outro, **Then** o sistema impede duplicidade conforme política (1 anúncio por CNPJ).
5. **Given** o comerciante submete o formulário, **When** a submissão é registrada, **Then** os dados ficam armazenados com status "pendente" aguardando moderação, sem publicação automática.

---

### User Story 3 - Moderador/proprietário gerencia fila de moderação e anúncios publicados (Priority: P1)

O proprietário do portal (moderador único) acessa uma área protegida, visualiza a fila de anúncios pendentes, aprova ou recusa com motivo, edita anúncios existentes, e pode suspender ou remover anúncios já publicados.

**Why this priority**: A moderação manual é obrigatória pela constituição (FR-020, Princípio VII) e pela Política de Anúncios Gratuitos. Sem ela, não há publicação de anúncios gratuitos.

**Independent Test**: Acessar a área de moderação (rota protegida), confirmar que lista anúncios pendentes, que ao aprovar um ele é publicado como anúncio gratuito (`kind: "anuncio-gratuito"`), que ao recusar é possível informar motivo, e que anúncios publicados podem ser editados/suspendidos/removidos.

**Acceptance Scenarios**:

1. **Given** o moderador acessa a área de moderação, **When** a página carrega, **Then** vê a lista de anúncios com status "pendente", cada um com dados do comerciante e botões de ação.
2. **Given** o moderador clica em "Aprovar" em um anúncio pendente, **When** confirma a ação, **Then** o anúncio é publicado como anúncio gratuito (`kind: "anuncio-gratuito"`), status "publicado", e o comerciante é notificado (WhatsApp/e-mail).
3. **Given** o moderador clica em "Recusar" em um anúncio pendente, **When** informa o motivo e confirma, **Then** o anúncio fica com status "recusado", o motivo é registrado, e o comerciante é notificado com o motivo.
4. **Given** o moderador visualiza anúncios já publicados, **When** clica em editar/suspender/remover, **Then** a alteração é refletida no armazenamento de anúncios e na exibição pública.
5. **Given** alguém tenta acessar a área de moderação sem ser o proprietário, **When** acessa a rota, **Then** o acesso é negado (autenticação simples).

---

### User Story 4 - Métricas de acesso continuam funcionando (Priority: P2)

O GA4 já configurado na Fase 1 continua coletando métricas agregadas em produção, sem nenhuma alteração necessária na Fase 2.

**Why this priority**: A política de métricas (emenda v1.1.0) já está definida e implementada; a Fase 2 não deve alterá-la.

**Independent Test**: Verificar que o GA4 (G-063LGPHV93) carrega apenas em produção (`VERCEL_ENV=production`), após interação do visitante (`afterInteractive`), e que eventos de página são enviados.

**Acceptance Scenarios**:

1. **Given** o site está em produção, **When** um visitante acessa qualquer página, **Then** o GA4 carrega após interação e envia page_view.
2. **Given** o site está em preview ou desenvolvimento local, **When** um visitante acessa, **Then** o GA4 não carrega nem coleta dados.

---

### Edge Cases

- Quando o formulário público recebe submissão com caracteres maliciosos (XSS, SQL injection), a sanitização impede execução e os dados são armazenados de forma segura.
- Quando o comerciante submete o formulário mas a conexão falha antes da confirmação, o estado "pendente" não é criado duplicadamente (idempotência).
- Quando o moderador aprova um anúncio que viola regras editoriais (promessa enganosa, imitação de órgão público, etc.), a moderação deve permitir edição antes da publicação ou recusa com motivo.
- Quando o histórico de notícias cresce além do limite razoável de armazenamento, deve haver política de retenção (ex.: manter últimos 12 meses) — a definir.
- Quando dois comerciantes tentam submeter anúncio para o mesmo CNPJ simultaneamente, a verificação de duplicidade deve ser atômica.
- Quando o armazenamento de anúncios é alterado externamente (fora da área de moderação), a área de moderação reflete as mudanças na próxima carga.

## Requirements *(mandatory)*

### Functional Requirements

**Persistência e Histórico de Notícias**

- **FR-001**: O sistema DEVE armazenar histórico de notícias além do cache volátil de 15 minutos, permitindo consulta de notícias antigas.
- **FR-002**: O sistema DEVE disponibilizar uma página de listagem completa de notícias (`/noticias`) com paginação.
- **FR-003**: A listagem `/noticias` DEVE exibir, para cada notícia: título, resumo curto, data, fonte e link para o conteúdo original.
- **FR-004**: O sistema DEVE manter o histórico de notícias acessível mesmo quando as fontes externas estiverem indisponíveis (resiliência modular — Princípio VIII).
- **FR-005**: O sistema DEVE definir e aplicar uma política de retenção do histórico de notícias (ex.: últimos 12 meses) para evitar crescimento ilimitado.

**Formulário Público de Anúncios Gratuitos**

- **FR-006**: O sistema DEVE disponibilizar um formulário público para submissão de anúncios gratuitos com os campos: nome do comércio/serviço (obrigatório), categoria (obrigatório), descrição curta (obrigatório), bairro/região (obrigatório), telefone ou WhatsApp (obrigatório), link externo (opcional), horário de atendimento textual (opcional).
- **FR-007**: O sistema DEVE validar todos os campos obrigatórios no cliente e no servidor antes de aceitar a submissão.
- **FR-008**: O sistema DEVE validar formato de telefone/WhatsApp e URL (apenas http/https) no link externo.
- **FR-009**: O sistema DEVE verificar duplicidade por CNPJ/negócio (1 anúncio gratuito ativo por CNPJ) antes de colocar na fila de moderação.
- **FR-010**: O sistema DEVE armazenar a submissão com status "pendente" em fila de moderação, **sem publicação automática** (constituição FR-020, Princípio VII).
- **FR-011**: O sistema DEVE aplicar rate limiting no formulário público para prevenir abuso (limite razoável por origem/IP).
- **FR-012**: O sistema DEVE sanitizar todos os dados de entrada antes de armazenar (prevenção XSS, injeção).
- **FR-013**: O sistema DEVE exibir mensagem de confirmação clara ao comerciante após submissão bem-sucedida, informando que o anúncio entrou na fila de moderação.
- **FR-014**: O sistema NÃO DEVE permitir upload de imagens no formulário (Princípio III — Sem Imagens Armazenadas).

**Área de Moderação Simples**

- **FR-015**: O sistema DEVE disponibilizar uma área de moderação acessível apenas pelo proprietário do portal (moderador único — constituição v1.3.0).
- **FR-016**: A área de moderação DEVE listar todos os anúncios com status "pendente", exibindo todos os campos submetidos.
- **FR-017**: O moderador DEVE poder aprovar um anúncio pendente, o que o publica como anúncio gratuito (`kind: "anuncio-gratuito"`) com status "publicado".
- **FR-018**: O moderador DEVE poder recusar um anúncio pendente, informando motivo obrigatório, o que define status "recusado" e notifica o comerciante.
- **FR-019**: O moderador DEVE poder visualizar, editar, suspender (ocultar temporariamente) ou remover anúncios já publicados (status "publicado").
- **FR-020**: As alterações na moderação DEVEM ser persistidas de forma auditável (histórico de alterações rastreável).
- **FR-021**: O acesso à área de moderação DEVE ser protegido por autenticação simples — sem cadastro de usuários, sem recuperação de senha, sem dashboard de comerciante (Princípio II).

**Métricas de Acesso (GA4)**

- **FR-022**: O GA4 (G-063LGPHV93) DEVE continuar funcionando exatamente como na Fase 1: apenas produção, carga `afterInteractive`, coleta agregada, aviso de cookies na política de privacidade.
- **FR-023**: Nenhuma nova implementação de métricas é necessária na Fase 2.

**Conformidade Constitucional**

- **FR-024**: O sistema NÃO DEVE implementar cadastro de usuários, dashboard de comerciante, área administrativa complexa (Princípio II — Simplicidade).
- **FR-025**: O sistema NÃO DEVE implementar upload ou armazenamento de imagens (Princípio III).
- **FR-026**: O sistema NÃO DEVE implementar pagamentos, checkout, PIX, gateway (Princípio IV).
- **FR-027**: O sistema DEVE coletar apenas os dados mínimos necessários para o anúncio (Princípio VII — Minimização).
- **FR-028**: O sistema DEVE aplicar retenção LGPD: dados de anunciantes (legítimo interesse, ativo + 12 meses), dados de formulário pendente (consentimento, 30 dias se não aprovado) — emenda v1.3.0.
- **FR-029**: Todo anúncio gratuito aprovado DEVE ser publicado com `kind: "anuncio-gratuito"` e rótulo textual de distinção (Princípio V — Publicidade Transparente).
- **FR-030**: A moderação DEVE ser realizada exclusivamente pelo proprietário do portal (moderador único — emenda v1.3.0).

### Key Entities *(include if feature involves data)*

- **Notícia Persistida**: item de notícia armazenado além do cache volátil; atributos: título, resumo curto, data, fonte, link original, categoria/região, data de coleta, hash de deduplicação.
- **Submissão de Anúncio (Fila de Moderação)**: dados do formulário público aguardando revisão; atributos: todos os campos do formulário + status (pendente/aprovado/recusado), data de submissão, identificador de origem (para rate limiting), motivo de recusa (se aplicável), ID único.
- **Anúncio Publicado**: anúncio gratuito aprovado e publicado; atributos: todos os campos do formulário + `kind: "anuncio-gratuito"`, status "publicado", data de aprovação, ID único.
- **Moderador/Proprietário**: ator único com acesso à área de moderação; autenticação simples, sem sistema de usuários.
- **Histórico de Notícias**: coleção persistida de notícias para listagem paginada `/noticias`; fonte de dados para a página de listagem completa.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A página `/noticias` carrega e exibe notícias paginadas (mínimo 2 páginas com dados históricos) em até 3 segundos em conexão móvel típica.
- **SC-002**: 100% das notícias exibidas em `/noticias` contêm título, resumo, data, fonte e link original (quando a fonte fornece).
- **SC-003**: O formulário público de anúncios aceita submissão válida e a coloca na fila de moderação (status "pendente") em até 2 segundos; 0% de publicação automática.
- **SC-004**: Validação de campos obrigatórios e formatos (telefone, URL) impede 100% das submissões inválidas no cliente e no servidor.
- **SC-005**: Verificação de duplicidade por CNPJ impede 100% de anúncios duplicados para o mesmo negócio na fila de moderação.
- **SC-006**: Rate limiting bloqueia 100% das tentativas de abuso (limite razoável por origem/IP) sem afetar usuários legítimos.
- **SC-007**: A área de moderação lista 100% dos anúncios pendentes; aprovação publica como anúncio gratuito (`kind: "anuncio-gratuito"`); recusa registra motivo e notifica comerciante.
- **SC-008**: Acesso à área de moderação é negado a qualquer ator que não seja o proprietário (moderador único).
- **SC-009**: GA4 continua coletando métricas apenas em produção, após interação, sem coleta em preview/dev — 0% de regressão em relação à Fase 1.
- **SC-010**: 0% dos requisitos proibidos da constituição estão presentes: sem cadastro/login de usuários, sem dashboard complexo, sem upload de imagens, sem pagamentos, sem publicação automática sem revisão.
- **SC-011**: Dados de submissões recusadas/expiradas são removidos em até 30 dias (consentimento LGPD); dados de anúncios ativos retidos enquanto ativos + 12 meses (legítimo interesse LGPD).
- **SC-012**: Sanitização impede 100% de tentativas de XSS/injeção nos dados do formulário; nenhum HTML externo não confiável é renderizado sem sanitização.

## Assumptions

- **Persistência de notícias**: Como a constituição não obriga banco de dados na Fase 1, a persistência na Fase 2 pode usar arquivos JSON versionados em `content/` (ex.: `content/news-history.json`) ou um banco simples (SQLite/Neon) — a decisão será feita no plano de implementação. O critério é simplicidade (Princípio II) e baixo custo.
- **Armazenamento da fila de moderação**: As submissões pendentes podem ser armazenadas em `content/ads-pending.json` (versionado no Git) ou em banco simples. A escolha deve priorizar simplicidade e auditoria via Git.
- **Autenticação da área de moderação**: Como não há cadastro de usuários (Princípio II), a proteção pode ser via variável de ambiente (ex.: `MODERATOR_SECRET` comparado com header/query) ou autenticação simples do Vercel/NextAuth (credenciais). Não deve haver "área do comerciante" nem "recuperação de senha".
- **Notificação ao comerciante**: Ao aprovar/recusar, a notificação pode ser via WhatsApp (link `wa.me` com mensagem pré-formatada) ou e-mail (mailto) — integração externa, sem servidor de e-mail próprio.
- **Política de retenção de notícias**: Assumimos retenção de 12 meses para o histórico de notícias, alinhado à LGPD (legítimo interesse). A limpeza pode ser job agendado ou manual.
- **Deduplicação de notícias**: A Fase 1 já deduplica por título normalizado entre feeds. O histórico deve manter essa deduplicação usando hash do título+fonte+data.
- **Paginação em `/noticias`**: Assumimos 20 itens por página, ordenação por data decrescente (mais recentes primeiro).
- **Campos do formulário**: Seguem exatamente a Política de Anúncios Gratuitos (emenda v1.2.0) e Princípio VII: nome, categoria, descrição, bairro, telefone/WhatsApp, link externo (opcional), horário (opcional). CNPJ pode ser campo oculto/opcional para verificação de duplicidade, mas não exibido publicamente.
- **Categorias de anúncio**: Reutilizar categorias existentes do `content/ads.json` ou definir lista fixa (ex.: Alimentação, Serviços, Comércio, Saúde, Educação, Outros).
- **GA4**: Zero mudanças — já implementado e funcionando conforme emenda v1.1.0.

## Non-Functional Requirements

- **Performance**: Listagem `/noticias` com paginação deve carregar em <3s (mobile 3G). Formulário deve responder em <2s. Moderação deve carregar lista de pendentes em <2s.
- **Segurança**: Sanitização de todas as entradas; rate limiting no formulário; proteção da rota de moderação; variáveis de ambiente para segredos; sem exposição de dados sensíveis no cliente.
- **Acessibilidade**: Formulário com labels corretos, hierarquia de títulos, navegação por teclado, foco visível, contraste adequado. Área de moderação com mesma qualidade.
- **Confiabilidade**: Falha no armazenamento do histórico não deve quebrar a home (isolamento modular — Princípio VIII). Falha no formulário não deve afetar leitura de notícias.
- **Manutenibilidade**: Código modular, tipado (TypeScript), componentes pequenos, integrações isoladas, fácil troca de armazenamento (arquivo ↔ banco) no futuro.