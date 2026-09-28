# Feature Specification: Portal São Carlos — Fase 1 (Portal Público)

**Feature Branch**: `001-portal-sao-carlos-fase1`

**Created**: 2026-09-28

**Status**: Draft

**Input**: User description: "Portal São Carlos — Fase 1: landing page / portal público de utilidade pública para São Carlos/SP, com previsão do tempo, notícias, informativos oficiais, telefones e links úteis, área de anúncios (gratuitos e patrocinados), divulgação própria, contatos e políticas básicas, conforme a constituição do projeto (v1.0.0)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Morador consulta informações públicas úteis (Priority: P1)

Um morador de São Carlos acessa o portal pelo celular para consultar a previsão
do tempo, ler as últimas notícias locais, ver informativos de interesse público
(SAAE, CPFL e fontes oficiais) e encontrar telefones e links úteis — tudo sem
precisar se cadastrar, fazer login ou passar por conteúdo publicitário
intrusivo.

**Why this priority**: É a razão de existir do portal (utilidade pública local).
Sem este núcleo, o projeto não entrega valor ao visitante e a constituição é
violada. É a única história cuja entrega isolada já constitui um MVP útil.

**Independent Test**: Acessar a página inicial em um dispositivo móvel e
confirmar que, sem cadastro, é possível ver a previsão do tempo de São Carlos,
ao menos uma lista de notícias com fonte e data, informativos oficiais e ao
menos três telefones/links úteis.

**Acceptance Scenarios**:

1. **Given** o visitante está na página inicial, **When** a página carrega,
   **Then** a previsão do tempo de São Carlos/SP está visível com a data/hora
   da última atualização.
2. **Given** o visitante está na página inicial, **When** ele observa a seção
   de notícias, **Then** cada notícia exibe título, resumo curto, data, fonte e
   link para o conteúdo original.
3. **Given** o visitante está na página inicial, **When** ele consulta a seção
   de informativos, **Then** os avisos de interesse público aparecem com
   identificação da fonte oficial e link quando disponível.
4. **Given** o visitante está na página inicial, **When** ele consulta a seção
   de contatos úteis, **Then** encontra ao menos três telefones ou links
   úteis com endereço textual quando aplicável.
5. **Given** o visitante não tem conta, **When** ele usa o site, **Then**
   nenhuma tela de cadastro ou login é exigida para consultar qualquer
   conteúdo público.

---

### User Story 2 - Visitante distingue publicidade de informação (Priority: P2)

O visitante identifica claramente o que é notícia, o que é informativo oficial,
o que é anúncio gratuito, o que é anúncio patrocinado e o que é divulgação
própria do portal — sem confundir publicidade com conteúdo jornalístico
independente.

**Why this priority**: A confiança do visitante é o ativo do portal
(transparência da publicidade, princípio obrigatório V). Depois do núcleo de
informação, é o que mantém o portal credível e viabiliza a receita de
publicidade de forma ética.

**Independent Test**: Exibir a página inicial e verificar que cada bloco de
conteúdo tem um rótulo/distinção clara; em amostra de todos os anúncios
patrocinados e divulgações próprias, 100% exibem rótulo inequívoco de
publicidade e nenhum está formatado como notícia.

**Acceptance Scenarios**:

1. **Given** a página inicial exibe notícias e anúncios, **When** o visitante
   lê a página, **Then** cada anúncio patrocinado exibe rótulo como
   "Publicidade", "Anúncio patrocinado", "Destaque comercial" ou "Parceiro
   local".
2. **Given** há um anúncio gratuito na página, **When** o visitante lê o bloco,
   **Then** ele é distinguível visual e textualmente das notícias e
   informativos.
3. **Given** há uma divulgação de serviços do próprio portal ou de parceiro,
   **When** o visitante lê o bloco, **Then** ele é identificado como
   publicidade própria/parceiro e não como informação pública ou notícia.
4. **Given** um conteúdo é originado de fonte externa, **When** é exibido,
   **Then** a fonte está identificada e há link para o original sempre que
   disponível.

---

### User Story 3 - Comerciante divulge seu negócio e contratante solicite destaque (Priority: P3)

O comerciante de São Carlos encontra no portal uma área de anúncios gratuitos
onde pode ter seu negócio divulgado, e um comerciante que deseja maior
destaque encontra chamadas claras ("Anuncie aqui", "Entre em contato para
contratar destaque") com canais de contato do responsável para contratar
publicidade patrocinada — processos combinados fora do sistema.

**Why this priority**: É a finalidade de marketing local do portal e a fonte de
receita, mas depende do núcleo de informação pública existir primeiro (a
constituição determina que o comercial nunca prejudique o acesso à informação).

**Independent Test**: Verificar que a área de anúncios exibe ao menos um anúncio
gratuito com todos os campos permitidos, que existe chamada visível de
"Anuncie aqui" com canal de contato, e que nenhum fluxo de pagamento existe no
site.

**Acceptance Scenarios**:

1. **Given** o visitante acessa a área de anúncios, **When** observa um anúncio
   gratuito, **Then** ele contém nome do comércio/serviço, categoria,
   descrição curta, bairro ou região, telefone ou WhatsApp e, quando houver,
   link externo e horário de atendimento em texto.
2. **Given** o visitante deseja anunciar, **When** procura a chamada de
   publicidade, **Then** encontra "Anuncie aqui" com canal de contato
   (WhatsApp, telefone ou e-mail) do responsável.
3. **Given** existe um anúncio patrocinado ativo, **When** o visitante vê a
   página, **Then** o anúncio aparece em posição de destaque, com rótulo de
   publicidade e sem imitar formato de notícia.
4. **Given** o visitante tenta contratar pelo site, **When** ele busca um
   processo de pagamento, **Then** não existe pagamento, checkout ou cadastro
   no site — apenas o contato externo.

---

### User Story 4 - Visitante verifica transparência editorial e políticas (Priority: P4)

O visitante (ou um comerciante) consulta o aviso editorial e a política de
privacidade para entender que o portal não é um órgão oficial, que informações
de terceiros devem ser confirmadas nas fontes originais, e como entrar em
contato para correção ou remoção de dados.

**Why this priority**: É exigência de responsabilidade editorial e privacidade
da constituição, mas é acessada por fração pequena de visitantes; seu valor é
de conformidade e confiança, não de uso diário.

**Independent Test**: A partir de qualquer página, localizar link para aviso
editorial e política de privacidade, abri-los e confirmar que contêm as
informações obrigatórias e o canal de contato do responsável.

**Acceptance Scenarios**:

1. **Given** o visitante está em qualquer página, **When** procura as políticas,
   **Then** encontra link acessível para a política de privacidade e para o
   aviso editorial.
2. **Given** o visitante abre o aviso editorial, **When** lê o conteúdo,
   **Then** ele declara que o portal não é órgão oficial da Prefeitura, SAAE,
   CPFL ou autoridades e que dados importantes devem ser confirmados na fonte
   oficial.
3. **Given** o visitante abre a política de privacidade, **When** lê o
   conteúdo, **Then** ela informa finalidade da coleta, dados tratados,
   retenção, canal de contato e procedimento para solicitar correção ou
   remoção.
4. **Given** o visitante identifica um dado incorreto sobre si mesmo em um
   anúncio, **When** usa o canal informado, **Then** consegue solicitar
   correção ou remoção ao responsável.

---

### Edge Cases

- Quando a fonte de previsão do tempo está indisponível, o que é exibido?
  (Esperado: último valor válido com aviso de atualização temporariamente
  indisponível, ou mensagem amigável — nunca erro técnico.)
- Quando nenhuma fonte de notícias retorna conteúdo novo, a seção mostra as
  últimas notícias válidas conhecidas, mensagem de ausência de atualização, ou
  é ocultada sem quebrar o restante da página?
- Quando um módulo inteiro falha (notícias, clima ou informativos), os demais
  módulos continuam exibindo normalmente?
- Quando o link para o conteúdo original de uma notícia está quebrado, o item
  ainda exibe título, resumo, data e fonte, com indicação de que o link pode
  estar indisponível?
- Quando um anúncio gratuito é recebido sem telefone, WhatsApp e sem link, ele
  é rejeitado na moderação por falta de informação básica de contato?
- Quando um conteúdo enviado por comerciante contém promessa enganosa,
  discurso de ódio, imitação de órgão público ou marca de terceiros sem
  autorização, ele é recusado na moderação manual?
- Quando o visitante usa conexão lenta, a página permanece utilizável com o
  conteúdo textual principal mesmo que dados externos demorem?
- Quando um informativo urgente de fonte oficial é publicado, ele aponta para o
  canal oficial em vez de se apresentar como canal de emergência?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE exibir na página inicial a previsão do tempo de
  São Carlos/SP, incluindo condição atual e previsão para os próximos dias,
  com indicação da data/hora da última atualização.
- **FR-002**: O sistema DEVE exibir uma lista de notícias da cidade e região,
  e cada item DEVE conter título, resumo curto, data, fonte e link para o
  conteúdo original.
- **FR-003**: O sistema DEVE exibir informativos e avisos de interesse público
  (incluindo temas de SAAE, CPFL e demais fontes oficiais), com identificação
  da fonte e link para o canal oficial quando disponível.
- **FR-004**: O sistema DEVE exibir seção de telefones e links úteis, com
  endereço textual e horários quando aplicáveis.
- **FR-005**: O sistema DEVE exibir área de anúncios gratuitos contendo, no
  mínimo: nome do comércio ou serviço, categoria, descrição curta, bairro ou
  região, telefone ou WhatsApp e, quando fornecidos, link externo e horário de
  atendimento em formato textual.
- **FR-006**: O sistema DEVE exibir anúncios patrocinados em posição de
  destaque, com rótulo inequívoco de publicidade e sem formato de notícia.
- **FR-007**: O sistema DEVE exibir divulgações do próprio portal e de
  parceiros autorizados identificadas como publicidade própria ou de parceiro.
- **FR-008**: O sistema DEVE diferenciar visual e semanticamente seis tipos de
  conteúdo: notícia, informativo oficial, serviço público, anúncio gratuito,
  anúncio patrocinado e divulgação própria do portal.
- **FR-009**: O sistema DEVE exibir chamadas de publicidade ("Anuncie aqui",
  "Entre em contato para contratar destaque") com canais de contato do
  responsável para contratação externa; É PROIBIDO processar pagamentos no
  site.
- **FR-010**: O sistema DEVE exibir contatos do responsável pelo portal,
  incluindo canal para solicitar correção ou remoção de dados.
- **FR-011**: O sistema DEVE publicar política de privacidade e aviso editorial
  acessíveis a partir de qualquer página.
- **FR-012**: O sistema DEVE identificar, em cada módulo de conteúdo externo, a
  fonte e a data/hora da última atualização; quando a atualização falhar,
  DEVE informar de forma amigável que a atualização está temporariamente
  indisponível.
- **FR-013**: O sistema DEVE isolar os módulos (clima, notícias, informativos,
  anúncios, contatos): a falha de um módulo NÃO DEVE impedir a exibição dos
  demais nem apresentar erro técnico ao visitante.
- **FR-014**: O sistema DEVE funcionar em dispositivos móveis sem rolagem
  horizontal e com boa legibilidade do texto principal.
- **FR-015**: O sistema DEVE observar boas práticas de acessibilidade:
  estrutura semântica de páginas, hierarquia correta de títulos, contraste
  adequado, navegação por teclado, foco visível, textos compreensíveis em
  botões e links e ausência de dependência exclusiva de cor para transmitir
  informação.
- **FR-016**: O sistema DEVE ter estrutura de SEO local: título e descrição
  claros por página, URLs legíveis, sitemap, robots.txt, dados estruturados
  quando apropriado e informações consistentes sobre a região atendida — sem
  páginas artificiais ou conteúdo repetitivo.
- **FR-017**: O sistema NÃO DEVE exigir cadastro, login ou conta de qualquer
  tipo para consultar qualquer conteúdo.
- **FR-018**: O sistema NÃO DEVE exibir upload de imagens, comentários,
  fórum, marketplace, carrinho ou qualquer mecanismo de pagamento.
- **FR-019**: Todo conteúdo DEVE ser escrito em português do Brasil, com
  linguagem simples, clara e objetiva, sem sensionalismo nem títulos que
  causem pânico ou desinformação.
- **FR-020**: Nenhum anúncio ou conteúdo de comerciante DEVE ser publicado
  automaticamente: toda publicação DEVE passar por revisão (moderação manual)
  do responsável antes de aparecer publicamente.
- **FR-021**: O sistema DEVE tratar dados externos como não confiáveis:
  validar, normalizar e sanitizar conteúdo antes de exibir; É PROIBIDO exibir
  HTML externo não confiável sem sanitização.

### Key Entities *(include if feature involves data)*

- **Notícia**: item informativo de fonte externa; atributos: título, resumo
  curto, data, fonte, link original, categoria/região.
- **Informativo oficial**: aviso de interesse público de órgão ou empresa;
  atributos: título, resumo, data, fonte oficial, link oficial.
- **Anúncio**: divulgação de comerciante; atributos: nome do comércio ou
  serviço, categoria, descrição curta, bairro ou região, telefone ou WhatsApp,
  link externo (opcional), horário textual (opcional), tipo (gratuito ou
  patrocinado), status de publicação, período de veiculação (patrocinados).
- **Divulgação própria/parceiro**: publicidade do portal ou de parceiro
  autorizado; atributos: título, texto, rótulo de publicidade, link externo
  (opcional).
- **Contato útil**: telefone, link ou endereço textual de serviço de interesse
  da população; atributos: nome, valor/URL, endereço textual, horário
  (opcional), categoria.
- **Previsão do tempo**: condição atual e previsão em dias para São Carlos/SP;
  atributos: condições, temperaturas, data/hora da última atualização, status
  da atualização.
- **Módulo de conteúdo**: unidade independente da página (clima, notícias,
  informativos, anúncios, contatos) com estado próprio de atualização, de modo
  que a falha de um não afete os demais.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A página inicial apresenta as informações principais (previsão do
  tempo, ao menos uma notícia, informativos e contatos úteis) utilizáveis em
  até 3 segundos, em uma conexão móvel típica, sem bloqueio por conteúdo
  publicitário.
- **SC-002**: 100% dos itens de conteúdo externo exibidos (notícias e
  informativos) contêm título, data, fonte e link para o original quando a
  fonte o fornece.
- **SC-003**: Em auditoria de amostra de todos os conteúdos pagos, patrocinados
  e de divulgação própria, 100% exibem rótulo inequívoco de publicidade e 0%
  aparecem formatados ou rotulados como notícia independente.
- **SC-004**: Com falha simulada em qualquer fonte externa, 100% das sessões
  resultam em página utilizável com aviso amigável e conteúdo restante
  visível; 0% de páginas de erro técnicas exibidas ao visitante.
- **SC-005**: A verificação de acessibilidade da página inicial aprova 100%
  dos itens críticos (contraste, hierarquia de títulos, navegação por teclado,
  foco visível, links compreensíveis).
- **SC-006**: O visitante encontra o canal de contato do responsável (e a
  chamada "Anuncie aqui") em até 2 interações a partir da página inicial.
- **SC-007**: Dentro de 90 dias após a publicação, ao menos uma URL do portal
  está indexada em mecanismos de busca para consultas que incluem "São Carlos"
  em conjunto com termos das seções do portal (por exemplo, previsão do tempo,
  notícias, anúncios).
- **SC-008**: 0% dos requisitos proibidos da constituição estão presentes no
  produto: sem cadastro/login, sem pagamentos, sem upload de imagens, sem
  comentários, sem publicação automática sem revisão.

## Assumptions

- O público-alvo são moradores e comerciantes de São Carlos/SP, em maioria
  móveis, com português do Brasil como idioma único da primeira versão.
- O nome "Portal São Carlos" é provisório; domínio e identidade visual serão
  definidos depois, sem impactar este escopo.
- A Fase 1 não possui painel, cadastro de comerciantes nem formulário público:
  anúncios são inseridos e moderados manualmente pelo responsável, e
  comerciantes entram em contato pelos canais exibidos (formulário de
  interesse é assunto da Fase 2, conforme constituição).
- A contratação de anúncios patrocinados, períodos de veiculação e valores
  ocorrem integralmente fora do sistema (WhatsApp, telefone ou contato direto).
- As fontes exatas de notícias serão escolhidas após avaliação dos critérios
  da constituição (disponibilidade, termos, direitos autorais, limites,
  alternativas); este especificação exige ao menos uma fonte aprovada de
  notícias locais e uma fonte de previsão do tempo — a escolha específica não
  altera o escopo.
- Exibição de imagens, cache persistente, busca, categorias avançadas e agenda
  de eventos estão fora da Fase 1 (itens das fases 2 e 3 da constituição).
- A persistência de dados não é requisito desta fase; o portal pode ser
  estático ou gerado sob demanda, desde que os critérios de sucesso sejam
  atendidos.
- Quando uma fonte externa falhar, vale o comportamento definido em FR-012 e
  FR-013: último conteúdo válido quando disponível, senão aviso amigável.
- Métricas de acesso não fazem parte desta fase até que a política de métricas
  permitidas seja definida (pergunta em aberto da constituição).
