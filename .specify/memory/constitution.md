<!-- Sync Impact Report
Version change: (inexistente / scaffold não versionado) → 1.0.0
Bump type: MAJOR (ratificação inicial — nenhuma versão anterior do projeto existia)
Modified principles: 5 princípios de exemplo do template → 8 princípios do projeto
  (I. Utilidade Pública Local; II. Simplicidade; III. Sem Imagens Armazenadas;
  IV. Sem Pagamentos Integrados; V. Publicidade Transparente;
  VI. Responsabilidade Editorial; VII. Privacidade por Minimização;
  VIII. Confiabilidade Modular)
Added sections: Visão e Propósito; Escopo Inicial; Exclusões Explícitas;
  Regras Editoriais; Publicidade e Anúncios; Privacidade e Segurança;
  Fontes Externas e Direitos de Conteúdo; Arquitetura e Tecnologia;
  Acessibilidade e Performance; Fases Futuras;
  Critérios de Aceitação da Constituição; Perguntas em Aberto
Removed sections: nenhum (template era scaffold vazio); comentários de exemplo
  do template foram removidos após substituição
Follow-up TODOs: nenhum placeholder adiado; 10 perguntas registradas em
  "Perguntas em Aberto" aguardam decisão futura do proprietário.
-->

<!-- Sync Impact Report — emenda de 2026-10-08 (decisão D2 do plano de
     pontos de atenção)
Version change: 1.0.0 → 1.1.0
Bump type: MINOR (política de métricas permitidas definida — expansão
  material de orientação na seção Privacidade e Segurança)
Modified sections:
  - "Privacidade": o bullet condicional de métricas ("SOMENTE PODEM ser
    implementadas quando a política for definida") foi substituído pela
    política definida — Google Analytics 4 autorizado sob condições.
  - "Perguntas em Aberto": removidos os itens já respondidos por decisões
    implementadas — domínio (www.meubairro.dev.br, v0.1.0), identidade
    visual (Civic Vanguard + logo, v0.1.0), fontes de notícias (reavaliação
    R3.1, v0.2.0), métricas (esta emenda) e canais de contato (D3 —
    WhatsApp/e-mail definidos). Lista renumerada de 10 para 5 perguntas.
Added sections: "Métricas de acesso (política definida)".
Removed sections: nenhuma.
Follow-up TODOs: permanecem abertas as perguntas sobre nome definitivo,
  formulário da Fase 2, moderação, política de anúncios gratuitos (D4,
  adiada pelo responsável) e retenção de dados.
-->

# Portal São Carlos Constitution

Nome provisório do projeto. O nome definitivo é uma decisão futura (ver
"Perguntas em Aberto").

## Visão e Propósito

O Portal São Carlos é uma landing page / portal local de utilidade pública
dedicado à cidade de São Carlos/SP, Brasil. Seus objetivos são:

- Oferecer informações úteis, rápidas e compreensíveis para a população local:
  previsão do tempo, notícias da cidade e região, avisos do SAAE São Carlos,
  informações públicas relacionadas à CPFL, telefones e links úteis, serviços
  de interesse da população e, quando aplicável, agenda de eventos locais.
- Servir como vitrine de divulgação para comerciantes de São Carlos, com uma
  área de anúncios gratuitos e uma área separada de anúncios de maior destaque
  contratados diretamente com o responsável pelo portal.
- Apoiar marketing local: serviços de desenvolvimento web, criação de sites e
  sistemas, marketing digital, serviços de empresas e comerciantes locais e
  parceiros comerciais autorizados — sempre identificados como publicidade.

O projeto DEVE ser conduzido como iniciativa de utilidade pública local: o
conteúdo público DEVE atrair e servir os visitantes, e o conteúdo comercial
DEVE existir sem comprometer o acesso à informação pública.

O portal NÃO DEVE se apresentar como órgão oficial da Prefeitura, do SAAE, da
CPFL ou de qualquer outro órgão público ou empresa, nem sugerir vínculo
institucional por meio de nome, logotipo ou identidade visual de terceiros.

## Escopo Inicial

A Fase 1 é uma landing page / portal local enxuto, contendo no mínimo:

- Cabeçalho e identificação clara do portal e da região atendida.
- Previsão do tempo para São Carlos/SP.
- Últimas notícias da cidade e região (título, resumo, data, fonte, link).
- Informativos e avisos de interesse público (SAAE, CPFL e fontes oficiais).
- Telefones e links úteis; informações de serviços públicos.
- Área de anúncios gratuitos e área separada de anúncio patrocinado.
- Contatos do responsável pelo portal e chamadas de publicidade
  ("Anuncie aqui", "Entre em contato para contratar destaque").
- Políticas básicas: privacidade e avisos editoriais.
- SEO local.

Conteúdo textual da Fase 1: texto, links, títulos, resumos, categorias, datas,
telefones, endereços textuais, horários, status de publicação e dados de
contato fornecidos pelo anunciante.

## Princípios Obrigatórios

### I. Utilidade Pública Local (NÃO NEGOCIÁVEL)

- O portal DEVE priorizar informações úteis, relevantes e compreensíveis para
  moradores de São Carlos/SP.
- A experiência DEVE ser simples, rápida e adequada para celular.
- Conteúdo comercial NÃO DEVE impedir ou dificultar o acesso às informações
  públicas principais.

**Rationale**: a razão de existir do portal é a utilidade pública local; tudo
mais é secundário.

### II. Simplicidade (NÃO NEGOCIÁVEL)

- O projeto DEVE permanecer uma landing page / portal local enxuto.
- É PROIBIDO criar funcionalidades administrativas complexas sem necessidade
  real comprovada.
- NÃO DEVE haver, na primeira versão: dashboard para comerciantes, cadastro de
  usuários, sistema de comentários, fórum, rede social, sistema de pagamento,
  marketplace ou carrinho de compras.

**Rationale**: arquitetura de grande porte para um portal local inicialmente
pequeno aumenta custo e risco sem benefício proporcional.

### III. Sem Imagens Armazenadas (nesta fase)

- O sistema NÃO DEVE armazenar imagens em banco de dados nem em storage
  próprio.
- O conteúdo da primeira versão DEVE ser baseado principalmente em texto,
  links, títulos, resumos, categorias, datas, telefones, endereços textuais,
  horários, status de publicação e dados de contato do anunciante.
- Upload de imagens É PROIBIDO nesta fase.
- Exibir imagens futuramente PODE ser considerado como evolução, SOMENTE
  QUANDO NECESSÁRIO e mediante decisão específica de arquitetura, direitos de
  uso, hospedagem e moderação.

**Rationale**: elimina custos de storage, moderação de mídia e problemas de
direitos autorais na versão inicial.

### IV. Sem Pagamentos Integrados

- É PROIBIDO implementar PIX, cartão, checkout, assinatura, gateway ou
  qualquer outro mecanismo de pagamento no site.
- O site NÃO DEVE processar pagamentos nem armazenar dados de pagamento.
- A contratação de anúncios destacados DEVE ser combinada fora do sistema, por
  meios externos (WhatsApp, telefone ou PIX informado diretamente ao
  responsável pelo projeto).
- O site PODE exibir chamadas como "Anuncie aqui", "Entre em contato para
  contratar destaque" e "Solicite informações sobre publicidade local".

**Rationale**: pagamentos integrados introduzem obrigações legais, de
segurança e de suporte sem necessidade na fase inicial.

### V. Publicidade Transparente

- Todo conteúdo pago, patrocinado ou destacado DEVE ser identificado
  claramente com rótulos como "Publicidade", "Anúncio patrocinado",
  "Destaque comercial" ou "Parceiro local".
- Publicidade NÃO DEVE ser apresentada como notícia independente.
- O portal DEVE diferenciar visual e semanticamente: notícia, informativo
  oficial, serviço público, anúncio gratuito, anúncio patrocinado e divulgação
  própria do portal.
- É PROIBIDO publicar anúncios enganosos, ilegais, ofensivos, discriminatórios
  ou que possam induzir o usuário ao erro.

**Rationale**: a confiança do visitante é o ativo do portal; publicidade
disfarçada destrói esse ativo.

### VI. Responsabilidade Editorial

- O portal NÃO DEVE se apresentar como órgão oficial da Prefeitura, do SAAE,
  da CPFL ou de qualquer outro órgão público ou empresa.
- Sempre que o conteúdo for originado de fonte externa, DEVE ser preservada a
  identificação da fonte e, quando possível, o link para a publicação
  original.
- O site DEVE deixar claro que informações de terceiros podem sofrer
  alterações, que o visitante DEVE confirmar dados importantes diretamente com
  a fonte oficial e que o portal NÃO SUBSTITUI os canais oficiais de
  emergência, atendimento público, SAAE, CPFL, Prefeitura ou autoridades.
- É PROIBIDO copiar integralmente matérias jornalísticas protegidas por
  direitos autorais; DEVE-se priorizar título, resumo curto, data, fonte e
  link para o conteúdo original.

**Rationale**: o portal agrega e organiza informação de terceiros; não é
produtor primário nem substituto dos canais oficiais.

### VII. Privacidade por Minimização

- A primeira versão DEVE coletar o mínimo possível de dados pessoais.
- É PROIBIDO criar contas de usuários e coletar nome, CPF, endereço
  residencial ou dados sensíveis dos visitantes sem necessidade comprovada.
- É PROIBIDO armazenar dados bancários, dados de cartão ou comprovantes de
  pagamento.
- Dados de comerciantes interessados em anunciar, quando necessários, DEVIEM
  ser limitados a: nome comercial; nome do responsável, se realmente
  necessário; telefone ou WhatsApp; e-mail, se necessário; descrição do
  negócio; cidade ou região de atendimento; categoria do negócio; link
  externo, se houver.
- O projeto DEVE manter política de privacidade, aviso sobre cookies ou
  tecnologias equivalentes quando aplicável, explicação da finalidade da
  coleta, canal de contato do responsável e procedimento para solicitar
  correção ou remoção de dados.
- Retenção DEVE ser somente pelo tempo necessário à finalidade informada.

**Rationale**: portal público de utilidade não precisa de identidade de
usuários; menos dados = menos risco e menor obrigação legal.

### Métricas de acesso (política definida — emenda v1.1.0)

- A ferramenta autorizada é o **Google Analytics 4** (identificação de
  medição pública `G-063LGPHV93`), sujeita às condições obrigatórias:
  - carga adiada após a interação do visitante, sem bloquear o bundle
    inicial nem a usabilidade da página;
  - ativa **somente em produção** — previews e desenvolvimento local não
    coletam métricas;
  - nenhum segredo no cliente: o ID de medição é público por natureza
    (gate 9 refere-se a segredos, não a esse identificador);
  - coleta agregada de audiência (páginas visitadas, dispositivo, origem),
    sem identificação pessoal desnecessária e sem finalidade diversa de
    estatística de uso do portal.
- A política DEVE constar da política de privacidade publicada, incluindo
  aviso de cookies/tecnologias equivalentes e como o visitante pode
  desativá-los (Princípio VII).
- Qualquer outra ferramenta de métricas, ou mudança que amplie a coleta
  para além do agregado, EXIGE emenda prévia a esta constituição.

**Rationale**: o portal já opera com GA4 desde a v0.1.0 (commit 4b861c5);
esta emenda formaliza a autorização que a pergunta em aberto 9 exigia,
mantendo minimização e transparência.

### VIII. Confiabilidade Modular

- Falha de uma API externa NÃO DEVE apresentar erro irreparável na página.
- Previsão do tempo, notícias e informativos DEVIAM ser tratados como módulos
  independentes; a falha de um módulo NÃO DEVE impedir a exibição dos demais.
- Quando disponível, DEVE ser exibido o último conteúdo válido; caso contrário,
  mensagem amigável indicando que a atualização está temporariamente
  indisponível e, quando apropriado, o link da fonte oficial.
- Erros DEVIAM ser registrados no servidor sem revelar detalhes técnicos ao
  visitante.

**Rationale**: o portal depende de fontes externas que ele não controla; a
página DEVE permanecer útil mesmo com uma fonte indisponível.

## Exclusões Explícitas

É PROIBIDO implementar, revisar ou aprovar qualquer trabalho que inclua, na
primeira versão ou sem emenda desta constituição:

- Sistema de pagamentos (PIX, cartão, checkout, assinatura, gateway).
- Login ou cadastro de usuários.
- Dashboard administrativo ou área do comerciante.
- Upload ou armazenamento de imagens.
- Comentários, fórum ou rede social.
- Marketplace, carrinho de compras ou catálogo transacional.
- Publicação automática irrestrita de conteúdo por comerciantes sem revisão.
- Coleta invasiva de dados pessoais.
- Cópia integral de notícias de terceiros.
- Funcionalidades fora do escopo definido em "Escopo Inicial", salvo emenda
  formal desta constituição.

Funcionalidades fora do escopo SOMENTE PODEM ser adicionadas por meio de
emenda aprovada conforme "Governança e Alteração deste Documento".

## Regras Editoriais

- Todo conteúdo DEVE ser escrito em português do Brasil.
- A linguagem DEVE ser simples, clara, educada e objetiva.
- O site DEVE priorizar informações locais de São Carlos/SP e, quando
  necessário, da região.
- É PROIBIDO usar linguagem sensacionalista, títulos que causem pânico,
  desinformação ou conclusões não confirmadas.
- Informações urgentes ou sensíveis DEVIAM apontar para a fonte oficial.
- Cada conteúdo externo publicado DEVE exibir, no mínimo: título, resumo
  curto, data, fonte e link para o conteúdo original.
- A identificação da fonte DEVE ser preservada em qualquer reformulação.
- O responsável pelo portal PODE editar, recusar, suspender ou remover
  qualquer conteúdo publicado.

## Publicidade e Anúncios

### Tipos de divulgação suportados

1. **Anúncio gratuito** — pode conter: nome do comércio ou serviço, categoria,
   descrição curta, bairro ou região, telefone ou WhatsApp, link externo e
   horário de atendimento em formato textual.
2. **Anúncio patrocinado** — pode ter maior destaque visual, posição
   privilegiada ou rótulo de parceiro, sem comprometer a clareza do conteúdo
   editorial. DEVE ser claramente identificado, ter período de veiculação
   definido fora do sistema, ter responsável comercial conhecido pelo
   proprietário, ser removido ou atualizado quando o acordo terminar e NUNCA
   ser tratado como notícia.
3. **Divulgação própria do portal (marketing próprio)** — o proprietário PODE
   divulgar seus próprios serviços de desenvolvimento web, sistemas, landing
   pages, automações, marketing digital e soluções para empresas locais,
   identificados como "Serviço do portal", "Publicidade própria",
   "Desenvolvimento web" ou "Soluções digitais". Publicidade própria NÃO DEVE
   ser confundida com informação pública ou notícia.
4. **Divulgação de parceiros autorizados** — serviços de empresas e
   comerciantes locais e parceiros comerciais autorizados, sempre identificados
   como publicidade.

É PROIBIDO, nesta fase, controle automático de contratos, cobrança, renovação
ou pagamentos de anúncios.

### Moderação

- A primeira versão DEVE priorizar moderação manual.
- Anúncios gratuitos NÃO DEVEM ser publicados automaticamente sem uma
  estratégia clara de revisão.
- Conteúdo enviado por comerciantes DEVE ser validado antes de aparecer
  publicamente.
- Todo anúncio DEVE observar as regras mínimas:
  - Ser relacionado a comércio, serviço, evento ou atividade local.
  - Não conter conteúdo ilegal.
  - Não conter promessa enganosa.
  - Não conter discurso de ódio ou discriminação.
  - Não conter material adulto ou impróprio.
  - Não imitar órgãos públicos.
  - Não utilizar marcas de terceiros sem autorização.
  - Ter informações básicas suficientes para contato.
- O proprietário do portal DEVE poder recusar, editar, suspender ou remover
  anúncios que não estejam de acordo com as regras editoriais.

## Privacidade e Segurança

### Privacidade

- Aplicam-se integralmente as regras do Princípio VII (Privacidade por
  Minimização).
- O portal DEVE publicar política de privacidade acessível, informando
  finalidade da coleta, dados tratados, retenção, canal de contato do
  responsável e procedimento de correção ou remoção.
- Aviso sobre cookies ou tecnologias equivalentes DEVE ser exibido quando
  aplicável.
- Métricas de acesso seguem a política definida na seção "Métricas de
  acesso (política definida)" logo abaixo; qualquer exceção ou ampliação
  de coleta EXIGE emenda prévia.

### Segurança

- É PROIBIDO expor chaves de API no frontend; toda chave ou segredo DEVE ficar
  em variável de ambiente.
- Dados recebidos de fontes externas DEVEM ser validados e normalizados.
- Conteúdos DEVEM ser sanitizados antes de renderizar HTML externo; a
  renderização direta de HTML não confiável É PROIBIDA.
- Rotas internas e endpoints futuros DEVEM ser protegidos contra abuso.
- Formulários públicos, quando existirem, DEVEM ter limite de requisições
  (rate limiting).
- Comerciantes NÃO DEVEM ter permissão para publicar conteúdo automaticamente
  sem revisão inicial, caso um formulário venha a ser implementado.

## Fontes Externas e Direitos de Conteúdo

### Fontes pretendidas

As fontes iniciais PODEM incluir:

- Open-Meteo para previsão do tempo.
- RSS ou fontes públicas de portais de notícias: G1 São Carlos e região,
  ACidade ON São Carlos, São Carlos Agora, Portal da Cidade São Carlos.
- Site e comunicados oficiais do SAAE São Carlos.
- Canais públicos da CPFL Paulista.
- Google News RSS, quando adequado e permitido.

Fontes pretendidas NÃO significam parceria, apoio ou vínculo institucional.
É PROIBIDO usar nome, logotipo ou identidade visual de terceiros de forma que
sugira vínculo oficial. APIs oficiais NÃO confirmadas NÃO DEVEM ser
inventadas ou pressupostas.

### Avaliação obrigatória de cada fonte/integração

Antes de integrar, DEVE ser avaliado:

- Disponibilidade pública.
- Limites de uso (rate limits).
- Termos de uso.
- Direitos autorais.
- Estabilidade.
- Necessidade ou não de chave de API.
- Possibilidade de remoção da fonte.
- Existência de uma fonte alternativa.

### Direitos de conteúdo

- É PROIBIDO copiar integralmente matérias jornalísticas protegidas.
- DEVE-se publicar título, resumo curto, data, fonte e link para o original.
- Quando uma fonte deixar de funcionar ou de permitir o uso, DEVE ser
  possível removê-la ou substituí-la sem alterar a interface.

## Arquitetura e Tecnologia

### Stack preferencial

- Next.js, TypeScript, React e Tailwind CSS.
- PostgreSQL, Supabase ou Neon SOMENTE SE houver necessidade real de
  persistência.
- Vercel para deploy, se fizer sentido.
- APIs externas acessadas no servidor; RSS e fontes públicas normalizados no
  backend.

A constituição NÃO OBRIGA banco de dados na primeira versão se uma landing
page estática ou geração sob demanda for suficiente.

### Regras de arquitetura

- A arquitetura DEVE ser incremental, seguindo as fases de "Fases Futuras".
- Busca e normalização de conteúdos externos DEVEM ocorrer no servidor,
  quando possível.
- Não DEVEM ser feitas chamadas repetitivas a APIs externas a cada
  carregamento do visitante; cache DEVE ser utilizado para conteúdos externos
  quando adequado.
- A interface NÃO DEVE ser acoplada diretamente às respostas brutas das APIs
  externas; fontes diferentes DEVEM ser normalizadas para um formato interno
  comum.
- Falhas de APIs externas DEVEM ser tratadas sem quebrar a página inteira, com
  mensagens amigáveis.
- O código DEVE ser modular, fácil de entender, com nomes claros, componentes
  pequenos, integrações externas isoladas, tipos TypeScript, variáveis de
  ambiente documentadas e fácil troca de fonte quando um RSS ou API deixar de
  funcionar.
- Documentação SOMENTE QUANDO NECESSÁRIA; comentários apenas quando agregarem
  valor.

### SEO local

- O projeto DEVE ter título e descrição claros, conteúdo textual local, URLs
  legíveis, dados estruturados quando apropriado, Open Graph (sem exigir
  armazenamento próprio de imagens nesta fase), sitemap, robots.txt e
  informações consistentes sobre a região atendida.
- É PROIBIDO criar páginas artificiais ou conteúdo repetitivo apenas para
  manipular mecanismos de busca.

### Observabilidade mínima

- DEVEM ser considerados: logs de erro no servidor, identificação da fonte que
  falhou, data da última atualização de cada conteúdo, contagem de falhas de
  atualização e monitoramento básico de disponibilidade.
- É PROIBIDO implementar plataforma complexa de observabilidade nesta fase.

### Critérios para decisões técnicas futuras

Sempre que houver mais de uma solução técnica, DEVE-se priorizar nesta ordem:

1. Simplicidade.
2. Baixo custo.
3. Compatibilidade com a stack existente.
4. Facilidade de manutenção.
5. Segurança.
6. Performance.
7. Possibilidade de substituir a solução futuramente.
8. Escalabilidade SOMENTE QUANDO NECESSÁRIO real.

É PROIBIDO criar arquitetura de grande porte para um portal local
inicialmente pequeno.

## Acessibilidade e Performance

### Acessibilidade

A primeira versão DEVE seguir boas práticas de acessibilidade web:

- HTML semântico e hierarquia correta de títulos.
- Contraste adequado.
- Navegação por teclado e foco visível.
- Textos alternativos quando imagens forem adicionadas no futuro.
- Botões e links com textos compreensíveis.
- NÃO depender somente de cor para transmitir informação.
- Layout responsivo e boa leitura em dispositivos móveis.

### Performance

- O site DEVE carregar rapidamente, especialmente em dispositivos móveis e
  conexões lentas.
- DEVEM ser evitadas dependências desnecessárias e scripts de terceiros sem
  justificativa.
- Cache DEVE ser utilizado para conteúdos externos quando adequado.
- Não DEVEM ser feitas chamadas repetitivas a APIs externas a cada
  carregamento do visitante.
- Conteúdos externos DEVEM ser buscados e normalizados no servidor quando
  possível.
- Falhas de APIs externas DEVEM ser tratadas sem quebrar a página inteira,
  exibindo mensagens amigáveis quando alguma fonte estiver indisponível.

## Fases Futuras

A evolução do projeto DEVE seguir, no mínimo, a seguinte ordem conceitual.
Cada fase SOMENTE DEVE ser iniciada quando a anterior estiver estável, salvo
decisão consciente do proprietário:

**Fase 1 — Portal público**
Landing page, cabeçalho, informações úteis, previsão do tempo, notícias,
informativos, área de anúncios, contatos, políticas básicas e SEO local.

**Fase 2 — Persistência e captura de interesse**
Cache e persistência das notícias; formulário de interesse para anunciantes;
área de moderação simples, se necessária; métricas básicas de acesso sem
coleta excessiva de dados.

**Fase 3 — Expansão editorial**
Melhorias editoriais, busca, categorias, agenda de eventos e integrações
adicionais.

Cada fase DEVE ser precedida de revisão de escopo contra esta constituição.
Recursos excluídos em "Exclusões Explícitas" somente PODEM entrar por emenda.

## Critérios de Aceitação da Constituição

Esta constituição é considerada válida e aplicável quando:

1. Todos os documentos do Spec Kit (especificação, plano, tarefas, decisões
   arquiteturais, critérios de aceitação, revisão de escopo) forem derivados
   dela e com ela forem compatíveis.
2. Nenhum documento ou implementação violar uma regra marcada com DEVE,
   NÃO DEVE ou É PROIBIDO sem emenda formal prévia.
3. Exclusões explícitas são respeitadas em qualquer revisão de escopo.
4. Toda decisão técnica futura puder ser justificada pelos "Critérios para
   decisões técnicas futuras".
5. Conteúdo publicado identifica fonte, distingue publicidade de informação e
   preserva a independência editorial do portal.
6. Nenhum placeholder `[ALL_CAPS]` ou token de template permanece sem
   substituição ou justificativa explicitamente registrada.
7. Datas estejam em formato ISO (YYYY-MM-DD) e a linha de versão corresponda
   ao último registro de alteração.
8. Revisores de PR/tasks confirmam conformidade com os princípios
   obrigatórios; não conformidade bloqueia aprovação.

## Governança e Alteração deste Documento

- Esta constituição PREVALECE sobre qualquer prática, documento ou decisão
  conflitante do projeto. Em caso de conflito, a constituição prevalece até
  que seja formalmente emendada.
- Emendas DEVEM ser feitas em `.specify/memory/constitution.md`, com
  atualização da linha de versão e datas.
- Versionamento segue semântica:
  - **MAJOR**: remoção ou redefinição incompatível de princípios ou seções.
  - **MINOR**: novo princípio/seção ou expansão material de orientação.
  - **PATCH**: clarificações, ajustes de redação, correções, refinamentos não
    semânticos.
- Toda emenda DEVE registrar um Relatório de Impacto de Sincronização
  (versão antiga → nova, princípios modificados, seções adicionadas/removidas
  e TODOs adiados).
- Alterações DEVEM ser revisadas antes da implementação correspondente; a
  revisão DEVE verificar impacto em documentos downstream (spec, plan, tasks).
- Revisões de conformidade DEVEM ocorrer em toda revisão de escopo e antes de
  cada fase nova; não conformidades DEVEM ser registradas e corrigidas ou
  justificadas por emenda.
- A data de ratificação é a data da adoção inicial; a data de última alteração
  DEVE ser atualizada a cada emenda.

**Version**: 1.1.0 | **Ratified**: 2026-09-28 | **Last Amended**: 2026-10-08

## Perguntas em Aberto

Perguntas que realmente precisam de resposta futura. Nenhuma delas é decisão
definitiva. (Histórico: os itens sobre domínio, identidade visual, fontes de
notícias, métricas e canais de contato foram encerrados pela emenda v1.1.0 —
ver Relatório de Impacto no topo deste arquivo.)

1. Qual será o nome definitivo do projeto (hoje: provisório "Portal São
   Carlos")?
2. Haverá formulário público para comerciantes na Fase 2?
3. Quem fará a moderação dos anúncios e conteúdos?
4. Qual será a política de publicação dos anúncios gratuitos (critérios,
   volume, periodicidade)?
5. Qual será a política de retenção de dados e por quanto tempo?
