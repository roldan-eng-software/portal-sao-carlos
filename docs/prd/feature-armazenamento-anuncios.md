# PRD — Armazenamento de Anúncios no Neon (correção de persistência)

> Tipo: PRD de feature · Data: 2026-11-14
> **Status:** Aguardando implementação
>
> Origem: auditoria de 2026-11-14 (pendência "conflito Neon × sem banco relacional" do AGENTS.md, §11). Decisões fechadas no questionamento daquela data.

## 1. Visão geral

O portal passou a guardar a fila de anúncios pendentes no Neon PostgreSQL, mas o restante do fluxo de anúncios ainda grava em arquivos JSON do projeto. Em produção o sistema de arquivos é somente leitura, então aprovar um anúncio pode não publicá-lo, e o formulário público pode não salvar o cadastro. Esta feature alinha todo o ciclo de anúncios (captura, moderação, publicação, limpeza) a um único armazenamento, o Neon, com regras documentadas e auditáveis.

## 2. Problema que resolve

- **Anúncio aprovado pode sumir:** a aprovação tenta gravar em `ads.json`, o que falha em produção. O código apenas registra um aviso e segue, e nada grava os publicados no Neon.
- **Cadastro pode não ser salvo:** o formulário `/anuncie` e o painel `/admin/anuncios` gravam em arquivo, o que falha em produção.
- **Dois painéis de moderação** (`/moderacao` no Neon e `/admin/anuncios` em arquivo) geram estados divergentes.
- **Dados não são apagados no prazo:** a política LGPD de 30 dias para pendentes existe como função, mas nada a executa em produção.
- **Schema não versionado:** a tabela da fila foi criada manualmente, sem registro no repositório.
- **Auditoria perdida:** com o Git fora do fluxo de publicação, não há registro de quem aprovou, recusou ou alterou um anúncio, o que contraria o FR-020 da spec 002.

## 3. Público-alvo

- **Comerciante local:** preenche o formulário público e recebe a resposta de aprovação ou recusa.
- **Proprietário do portal (moderador único):** aprova, recusa e gerencia anúncios.
- **Visitante:** vê apenas anúncios publicados.
- **Equipe de desenvolvimento e outras LLMs:** precisam do schema, dos ambientes e das regras documentados.

## 4. Objetivo do recorte atual

Fazer com que todo anúncio cadastrado, aprovado, publicado, alterado ou removido seja gravado de forma confiável no Neon, em produção e em preview, com log de moderação, limpeza LGPD agendada e documentação normativa atualizada. Notícias e o histórico de notícias ficam fora deste recorte.

## 5. Funcionalidades

**Essenciais:**

- Gravar cadastros de anúncio somente no armazenamento de pendentes.
- Migrar os anúncios já publicados para o armazenamento de publicados, uma única vez.
- Aprovar, recusar, editar, suspender, reativar e remover anúncios com registro de auditoria.
- Limpar automaticamente pendentes com mais de 30 dias.
- Versionar o schema do banco no repositório.
- Separar o banco de produção dos ambientes de preview e de desenvolvimento.
- Atualizar a constituição (emenda v1.4.0) e o AGENTS.md.

**Desejáveis:**

- Visualização do log de moderação dentro de `/moderacao`.

## 6. Fora do escopo

- Histórico de notícias persistido e ingestão automática por cron de notícias.
- ORM e qualquer camada de abstração de banco.
- Interface pública para consultar o log de auditoria.
- Pagamentos, cadastro de usuários e painel do comerciante.
- Upload de imagens de anúncios.
- Substituir o provedor de banco (continua Neon).

## 7. Regras de negócio

- **R1 — Fonte única:** anúncios pendentes e publicados existem somente no Neon. Arquivos JSON não são escritos em tempo de execução.
- **R2 — Seed:** `ads.json` é uma foto inicial, usada apenas pela migração (Spec 02). Após a migração, não é lido nem escrito pela aplicação.
- **R3 — Um anúncio por CNPJ:** não é permitido cadastrar um CNPJ que já tenha anúncio pendente ou publicado. A verificação vale para as duas situações.
- **R4 — Aprovação atômica:** aprovar um pendente cria o publicado e remove o pendente na mesma transação. Falha em qualquer parte desfaz tudo.
- **R5 — Recusa exige motivo:** recusar um pendente exige motivo não vazio; o motivo é guardado e enviado ao comerciante.
- **R6 — Auditoria obrigatória:** toda ação de moderação (aprovar, recusar, editar, suspender, reativar, remover) gera um registro com ator, data e hora, ação, anúncio afetado e motivo quando houver.
- **R7 — Retenção LGPD:** pendentes com mais de 30 dias sem decisão são apagados. Publicados seguem até remoção manual.
- **R8 — Rota oficial:** o formulário oficial é `/anuncie`. `/anunciar` redireciona de forma permanente para `/anuncie`.
- **R9 — Painel único:** a moderação é feita somente em `/moderacao`.
- **R10 — Sem dados sensíveis no log:** o log não guarda o conteúdo completo do anúncio, apenas o identificador e o motivo.

## 8. Fluxos principais

### Fluxo 1 — Cadastro pelo comerciante

1. O comerciante acessa `/anuncie` e preenche o formulário.
2. O sistema valida os campos e aplica o limite de envios por origem.
3. O sistema verifica se o CNPJ já tem anúncio pendente ou publicado.
4. Se não houver conflito, o cadastro entra na fila com status pendente.
5. O comerciante vê mensagem de sucesso. Nenhum arquivo é alterado.

### Fluxo 2 — Aprovação pelo moderador

1. O moderador acessa `/moderacao` e vê a fila de pendentes.
2. Ele escolhe aprovar.
3. Em uma única operação, o anúncio sai da fila e entra nos publicados, com registro de auditoria.
4. O sistema notifica o comerciante pelos canais já existentes (WhatsApp/e-mail), com link para `/anuncie`.

### Fluxo 3 — Recusa pelo moderador

1. O moderador escolhe recusar e informa o motivo.
2. O sistema não aceita motivo vazio.
3. O anúncio sai da fila, com registro de auditoria e motivo guardado.
4. O comerciante é notificado com o motivo e o link para reenviar.

### Fluxo 4 — Gestão de publicados

1. O moderador vê a lista de publicados em `/moderacao`.
2. Pode editar campos, suspender (retira da vitrine sem apagar), reativar ou remover.
3. Cada ação gera registro de auditoria.

### Fluxo 5 — Limpeza LGPD

1. Uma tarefa agendada diária é executada pela plataforma de hospedagem.
2. Ela remove pendentes com mais de 30 dias, sem decisão.
3. O número de registros removidos é registrado no log operacional.
4. Chamadas sem a credencial correta são recusadas.

### Fluxo 6 — Migração inicial

1. Os anúncios já publicados são copiados para o armazenamento de publicados.
2. A migração é executada uma única vez e não é repetida em deploys.
3. Após a validação, o arquivo de seed deixa de ser usado pela aplicação.

## 9. Critérios de aceite

- O usuário consegue enviar um cadastro em `/anuncie` e vê o cadastro na fila de `/moderacao`.
- O sistema impede o envio de um segundo cadastro para o mesmo CNPJ.
- O sistema não cria nem altera nenhum arquivo JSON durante cadastro, aprovação ou gestão.
- O sistema não publica um anúncio se a aprovação falhar no meio do caminho.
- O sistema não aceita recusa sem motivo.
- Toda ação de moderação gera um registro de auditoria consultável no banco.
- Pendentes com mais de 30 dias são removidos pela tarefa diária.
- `/anunciar` responde com redirecionamento permanente para `/anuncie`.
- `/admin/anuncios` não existe mais e não recebe requisições de escrita.
- Um ambiente de preview não acessa a base de produção.

## 10. Stack

Stack já existente, sem alterações de tecnologia:

- Next.js 16 (App Router), React 19, TypeScript.
- Neon PostgreSQL, acessado pelo pacote `postgres` já instalado.
- Vercel para deploy, com tarefas agendadas nativas da plataforma.
- Vitest para testes.

Novo requisito da feature: uma forma de versionar o schema e aplicá-lo por comando, sem ORM.

## 11. Justificativa da stack

- O Neon já está em produção e configurado; trocar de provedor geraria custo sem benefício.
- Versionar o schema em SQL mantém a simplicidade exigida pela constituição (Princípio II) e permite recriar o banco a partir do repositório.
- Branches do Neon separam produção de preview com custo baixo.
- Tarefas agendadas da Vercel evitam infraestrutura extra para a limpeza LGPD.

## 12. Fases de construção

### Fase 1 — Base de dados

Objetivo: ter o schema versionado e os anúncios existentes no armazenamento de publicados.
Specs:

- Spec 01 — Schema versionado de anúncios e log de moderação
- Spec 02 — Migração única dos anúncios publicados

### Fase 2 — Captura

Objetivo: o cadastro público grava somente no Neon e a rota oficial fica definida.
Specs:

- Spec 03 — Cadastro público gravando na fila e deduplicação de CNPJ
- Spec 04 — Rota oficial `/anuncie` e redirecionamento de `/anunciar`

### Fase 3 — Moderação

Objetivo: aprovar, recusar e gerenciar anúncios de forma atômica e auditada, com um único painel.
Specs:

- Spec 05 — Aprovação e recusa atômicas com auditoria
- Spec 06 — Gestão de publicados (editar, suspender, reativar, remover)
- Spec 07 — Notificações ao comerciante com links corrigidos

### Fase 4 — Operação e normas

Objetivo: cumprir a LGPD em produção, separar ambientes e registrar a decisão nas normas.
Specs:

- Spec 08 — Limpeza LGPD agendada
- Spec 09 — Ambientes de banco (produção, preview e desenvolvimento)
- Spec 10 — Registro normativo (emenda v1.4.0 e AGENTS.md)

## 13. Specs funcionais detalhadas

### Spec 01 — Schema versionado de anúncios e log de moderação

- **Fase:** 1
- **Objetivo (o quê):** Definir, em arquivos versionados no repositório, a estrutura do armazenamento de pendentes, publicados e do log de moderação, com comando para aplicá-la em qualquer ambiente.
- **Intenção (por quê):** Hoje a tabela de pendentes existe apenas no console do banco. Sem versionamento, ninguém consegue recriar o ambiente nem saber o schema atual, o que impede as outras specs de serem testadas e implantadas com segurança.
- **Contexto:** A tabela `ads_pending` já é usada pelo módulo de fila em `src/modules/ads-pending/`. A tabela de publicados é lida pelo módulo de anúncios, mas nunca é escrita. Não há nenhuma migração no repositório.
- **Atores:** Equipe de desenvolvimento (aplica a estrutura); sistema (usa a estrutura).
- **Descrição do comportamento:** Deve existir um conjunto de arquivos de migração ordenados que, quando aplicados em um banco vazio, criam os três conjuntos de dados: pendentes, publicados e log de moderação. Aplicar a mesma migração duas vezes não pode quebrar nem duplicar dados. Deve haver um comando único que aplica as migrações pendentes usando a variável de conexão do ambiente.
- **Entradas e saídas:** Entrada: variável de conexão do ambiente alvo. Saída: banco com a estrutura atualizada e registro de quais migrações já foram aplicadas.
- **Dados/entidades envolvidos (conceitual):**
  - Anúncio pendente: identificador, nome do negócio, categoria, descrição, bairro, contatos, horário, CNPJ opcional, status, datas de envio e de revisão, motivo de recusa, origem do envio.
  - Anúncio publicado: mesmos campos do pendente, mais estado de vitrine (ativo ou suspenso) e data de publicação.
  - Registro de moderação: identificador, ator, ação, identificador do anúncio, motivo opcional, data e hora.
- **Estados e transições:** Pendente pode ir para aprovado (vira publicado) ou recusado (sai da fila). Publicado pode ir para suspenso, voltar a ativo ou ser removido.
- **Regras de negócio:** R1, R6, R10.
- **Validações:** Migrações devem ser aplicadas na ordem; uma migração falha não pode deixar o banco pela metade.
- **Fluxo do usuário (passo a passo):**
  1. A equipe aplica as migrações em um banco de teste.
  2. A equipe verifica que as três estruturas existem.
  3. A equipe aplica de novo e confirma que nada muda.
- **Casos de borda e erros:** Banco sem permissão de escrita: o comando falha com mensagem clara e não aplica nada. Variável de conexão ausente: o comando recusa a execução sem tentar conectar.
- **Impacto no existente:** Formaliza a tabela `ads_pending` que já existe em produção. A aplicação não deve recriá-la de forma destrutiva.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um banco vazio, quando as migrações são aplicadas, então as três estruturas existem.
  - Dado um banco já migrado, quando as migrações são aplicadas de novo, então nenhum dado é apagado nem duplicado.
  - Dado que a variável de conexão está ausente, quando o comando é executado, então ele falha sem alterar nada.
- **Definição de pronto:** Migrações versionadas, comando documentado, verificação em um banco de teste feita e registrada.
- **Dependências:** Nenhuma.
- **Fora do escopo desta spec:** Migrar dados (Spec 02). Ambientes (Spec 09).

### Spec 02 — Migração única dos anúncios publicados

- **Fase:** 1
- **Objetivo (o quê):** Copiar os anúncios hoje publicados para o armazenamento de publicados, uma única vez, de forma verificável.
- **Intenção (por quê):** Após a feature, a aplicação deixa de ler o arquivo de anúncios. Se a migração não preservar todos os anúncios, eles somem do site.
- **Contexto:** Os anúncios publicados estão no arquivo de seed `ads.json`. A aplicação já lê a tabela de publicados e a junta com o seed.
- **Atores:** Equipe de desenvolvimento (executa); sistema (grava).
- **Descrição do comportamento:** A migração lê todos os anúncios do seed, grava cada um nos publicados mantendo o identificador original, e registra no log uma entrada de migração por anúncio. Anúncios já presentes nos publicados não são duplicados. Ao final, a quantidade de publicados deve ser igual à quantidade de anúncios do seed.
- **Entradas e saídas:** Entrada: seed `ads.json` e a base alvo. Saída: publicados preenchidos e relatório com quantidade lida, gravada e ignorada.
- **Dados/entidades envolvidos (conceitual):** Os mesmos campos do publicado (Spec 01).
- **Estados e transições:** Não se aplica; todos os anúncios entram como ativos, exceto os marcados como suspensos no seed.
- **Regras de negócio:** R2, R6.
- **Validações:** Anúncio do seed sem campos obrigatórios não é migrado e aparece no relatório de erros.
- **Fluxo do usuário (passo a passo):**
  1. A equipe executa a migração em um ambiente de preview.
  2. Confere o relatório e a contagem.
  3. Executa em produção.
  4. Confirma no site que todos os anúncios continuam visíveis.
- **Casos de borda e erros:** Migração executada duas vezes: a segunda não grava nada e informa que já foi feita. Falha no meio: nenhuma gravação parcial é mantida.
- **Impacto no existente:** Depois da migração, o seed deixa de ser lido pela aplicação (Spec 06 remove a escrita).
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado o seed com N anúncios válidos, quando a migração é executada, então o banco de publicados tem N anúncios.
  - Dado que a migração já foi executada, quando é executada de novo, então nenhum anúncio é duplicado.
  - Dado um anúncio inválido no seed, quando a migração roda, então ele não é gravado e aparece no relatório.
- **Definição de pronto:** Contagem conferida em preview e produção, relatório arquivado e anúncios visíveis no site.
- **Dependências:** Spec 01.
- **Fora do escopo desta spec:** Remover o arquivo seed (fica como histórico no repositório).

### Spec 03 — Cadastro público gravando na fila e deduplicação de CNPJ

- **Fase:** 2
- **Objetivo (o quê):** Fazer o formulário público gravar o cadastro somente na fila de pendentes do Neon, recusando CNPJ já cadastrado.
- **Intenção (por quê):** É a porta de entrada dos comerciantes. Se o cadastro não é salvo, o comerciante perde o pedido sem aviso, e o problema só aparece em produção.
- **Contexto:** O formulário `/anuncie` já valida campos, aplica limite de envios por origem e usa uma Server Action. Hoje ele ainda grava em arquivo, além de ter o mesmo problema da Spec 06 com o painel antigo.
- **Atores:** Comerciante (envia); sistema (valida e grava).
- **Descrição do comportamento:** O envio valida os campos obrigatórios e o formato dos contatos, higieniza o texto e grava um registro pendente no Neon. Antes de gravar, verifica se o CNPJ informado já existe como pendente ou publicado; se existir, recusa com mensagem clara, sem revelar dados do anúncio existente.
- **Entradas e saídas:** Entrada: campos do formulário e origem do envio. Saída: confirmação de envio ou mensagem de erro específica.
- **Dados/entidades envolvidos (conceitual):** Anúncio pendente (Spec 01).
- **Estados e transições:** Novo envio entra como pendente. Nenhuma outra transição neste fluxo.
- **Regras de negócio:** R1, R3, R10.
- **Validações:** Campos obrigatórios; contatos com formato válido; texto higienizado; CNPJ com dígitos verificadores válidos quando informado; limite de envios por origem.
- **Fluxo do usuário (passo a passo):**
  1. O comerciante acessa `/anuncie`.
  2. Preenche os campos e envia.
  3. Recebe a confirmação de que o cadastro está em análise.
- **Casos de borda e erros:**
  - Campo obrigatório vazio: o formulário mostra o erro no campo, sem gravar nada.
  - CNPJ já pendente ou publicado: mensagem de conflito sem detalhes do outro anúncio.
  - Limite de envios excedido: mensagem de espera, sem gravar.
  - Banco indisponível: mensagem amigável de falha temporária; o comerciante não perde o texto digitado, quando o navegador permitir.
  - Requisição sem CNPJ: aceita, pois o CNPJ é opcional.
- **Impacto no existente:** Remove a gravação em arquivo do formulário. O arquivo de pendentes deixa de ser usado (Spec 06).
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um formulário válido, quando é enviado, então um pendente é criado no Neon e nenhum arquivo é alterado.
  - Dado um CNPJ já pendente, quando um novo envio é feito, então o sistema recusa com mensagem de conflito e não cria registro.
  - Dado um CNPJ já publicado, quando um envio é feito, então o sistema recusa do mesmo modo.
  - Dado que o banco está indisponível, quando o comerciante envia, então vê mensagem de falha temporária e nada é gravado.
- **Definição de pronto:** Os quatro critérios verificados em preview, com envio real de teste removido depois.
- **Dependências:** Spec 01.
- **Fora do escopo desta spec:** Aprovação (Spec 05). Notificação de recebimento ao comerciante (não existe hoje e não entra).

### Spec 04 — Rota oficial `/anuncie` e redirecionamento de `/anunciar`

- **Fase:** 2
- **Objetivo (o quê):** Deixar `/anuncie` como única rota oficial do formulário, com `/anunciar` redirecionando de forma permanente.
- **Intenção (por quê):** Hoje duas rotas servem o mesmo formulário, o que duplica conteúdo para o Google e confunde o comerciante. O rodapé e as mensagens de aprovação e recusa ainda apontam para `/anunciar`.
- **Contexto:** `/anuncie` já é a rota canônica do sitemap e do cabeçalho de canonical. O rodapé, os e-mails e mensagens de WhatsApp de notificação usam `/anunciar`.
- **Atores:** Visitante e comerciante (acessam); buscadores (indexam).
- **Descrição do comportamento:** Qualquer acesso a `/anunciar` é redirecionado de forma permanente para `/anuncie`. Todos os links internos e mensagens enviadas ao comerciante passam a apontar para `/anuncie`.
- **Entradas e saídas:** Entrada: requisição a `/anunciar`. Saída: redirecionamento permanente para `/anuncie`.
- **Dados/entidades envolvidos (conceitual):** Não se aplica.
- **Estados e transições:** Não se aplica.
- **Regras de negócio:** R8.
- **Validações:** Não se aplica.
- **Fluxo do usuário (passo a passo):**
  1. O usuário acessa `/anunciar` por um link antigo.
  2. É levado a `/anuncie`.
- **Casos de borda e erros:** Links antigos com parâmetros de consulta: os parâmetros são preservados no redirecionamento.
- **Impacto no existente:** Rodapé, mensagens de notificação e página de anúncio deixam de citar `/anunciar`.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado uma requisição a `/anunciar`, quando é feita, então recebe redirecionamento permanente para `/anuncie`.
  - Dado o rodapé, quando é renderizado, então o link do formulário aponta para `/anuncie`.
  - Dado uma mensagem de aprovação ou recusa, quando é gerada, então o link citado é `/anuncie`.
- **Definição de pronto:** Redirecionamento verificado e nenhum link interno para `/anunciar` restante.
- **Dependências:** Nenhuma (pode ser feita em paralelo com a Spec 03).
- **Fora do escopo desta spec:** Remover a página `/anunciar` do código além do necessário para o redirecionamento.

### Spec 05 — Aprovação e recusa atômicas com auditoria

- **Fase:** 3
- **Objetivo (o quê):** Permitir ao moderador aprovar ou recusar um pendente, com efeito completo ou nenhum, e registro de auditoria.
- **Intenção (por quê):** Aprovar hoje tenta gravar em arquivo e falha em produção sem avisar o moderador. A aprovação precisa ser confiável, porque é o único momento em que um anúncio entra no ar.
- **Contexto:** A fila já aparece em `/moderacao`, protegida pela credencial do moderador. Hoje a aprovação grava em arquivo e tenta notificar.
- **Atores:** Moderador (decide); sistema (executa e registra).
- **Descrição do comportamento:**
  - Aprovar: cria o publicado com os mesmos dados, remove o pendente e registra a ação, tudo na mesma operação. Se qualquer parte falhar, o pendente continua na fila e o moderador vê mensagem de erro.
  - Recusar: exige motivo; remove o pendente da fila, guarda o motivo e registra a ação.
- **Entradas e saídas:** Entrada: identificador do pendente, ação e, para recusa, motivo. Saída: confirmação ou erro específico; atualização da fila.
- **Dados/entidades envolvidos (conceitual):** Anúncio pendente, anúncio publicado e registro de moderação (Spec 01).
- **Estados e transições:** Pendente → publicado (aprovação); pendente → fora da fila (recusa).
- **Regras de negócio:** R4, R5, R6, R9.
- **Validações:** Motivo obrigatório e não vazio na recusa; pendente deve existir e estar pendente no momento da ação (evita dupla aprovação).
- **Fluxo do usuário (passo a passo):**
  1. O moderador acessa `/moderacao` e vê a fila.
  2. Escolhe aprovar ou recusar. Na recusa, informa o motivo.
  3. Vê a confirmação e o item sai da fila.
- **Casos de borda e erros:**
  - Dois moderadores clicam ao mesmo tempo: apenas uma ação vale; a segunda recebe aviso de que o item já foi tratado.
  - Falha no meio da aprovação: nada é publicado e o item continua pendente.
  - Recusa sem motivo: bloqueada com mensagem.
  - Credencial inválida: acesso negado, nenhuma ação é executada.
- **Impacto no existente:** Remove a gravação em arquivo da aprovação. A notificação passa a ser tratada na Spec 07.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um pendente, quando o moderador aprova, então ele aparece nos publicados e some da fila, com registro de auditoria.
  - Dado um pendente, quando a gravação do publicado falha, então o pendente continua na fila e nada é publicado.
  - Dado um pendente, quando o moderador recusa sem motivo, então a ação é bloqueada.
  - Dado um pendente já tratado, quando uma nova ação é tentada, então o sistema informa que o item já foi tratado.
- **Definição de pronto:** Os quatro critérios verificados, incluindo o caso de falha simulada.
- **Dependências:** Spec 01, Spec 03.
- **Fora do escopo desta spec:** Edição, suspensão e remoção de publicados (Spec 06). Envio das mensagens (Spec 07).

### Spec 06 — Gestão de publicados (editar, suspender, reativar, remover)

- **Fase:** 3
- **Objetivo (o quê):** Permitir ao moderador manter os anúncios publicados, com cada alteração registrada, e eliminar o painel antigo `/admin/anuncios`.
- **Intenção (por quê):** Anúncios mudam de dados, saem do ar temporariamente ou precisam ser removidos. Sem isso, a correção de um erro exige alteração manual no banco.
- **Contexto:** `/moderacao` já lista publicados e tem essas ações, mas elas gravam em arquivo. O painel `/admin/anuncios` faz o mesmo com outro fluxo de senha e deve sair.
- **Atores:** Moderador.
- **Descrição do comportamento:**
  - Editar: altera campos do publicado, mantendo o identificador, e registra a alteração.
  - Suspender: retira o anúncio da vitrine sem apagá-lo; registra a ação.
  - Reativar: devolve à vitrine um anúncio suspenso; registra a ação.
  - Remover: apaga o anúncio da vitrine e do banco de publicados; o registro de auditoria permanece e guarda o identificador removido.
  - Remover o painel `/admin/anuncios`: a rota deixa de existir e a escrita em arquivo sai de todo o fluxo.
- **Entradas e saídas:** Entrada: identificador do anúncio, ação e dados alterados. Saída: confirmação ou erro; lista atualizada.
- **Dados/entidades envolvidos (conceitual):** Anúncio publicado e registro de moderação (Spec 01).
- **Estados e transições:** Ativo ↔ suspenso; ativo ou suspenso → removido (sem volta).
- **Regras de negócio:** R1, R6, R9, R10.
- **Validações:** Campos obrigatórios ao editar; CNPJ, se alterado, não pode colidir com outro publicado nem pendente (R3).
- **Fluxo do usuário (passo a passo):**
  1. O moderador abre a lista de publicados em `/moderacao`.
  2. Escolhe a ação sobre um anúncio e confirma.
  3. Vê a lista atualizada.
- **Casos de borda e erros:**
  - Remoção acidental: exige confirmação explícita antes de apagar.
  - Edição com CNPJ de outro anúncio: bloqueada.
  - Anúncio já removido em outra aba: mensagem de que não existe mais.
  - Acesso a `/admin/anuncios`: a página não existe e não aceita escrita.
- **Impacto no existente:** Remove `/admin/anuncios`, sua senha dedicada e a escrita em arquivo de publicados. A credencial `ADMIN_PASSWORD` deixa de ser usada.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um publicado, quando é suspenso, então sai da vitrine e continua no banco.
  - Dado um publicado suspenso, quando é reativado, então volta à vitrine.
  - Dado um publicado, quando é removido após confirmação, então não aparece mais e o registro de auditoria permanece.
  - Dado a rota `/admin/anuncios`, quando é acessada, então não existe.
- **Definição de pronto:** Quatro ações verificadas, rota antiga removida e nenhuma escrita em arquivo restante nos fluxos de anúncio.
- **Dependências:** Spec 01, Spec 02, Spec 05.
- **Fora do escopo desta spec:** Interface de histórico de auditoria (fica como desejável).

### Spec 07 — Notificações ao comerciante com links corrigidos

- **Fase:** 3
- **Objetivo (o quê):** Enviar ao comerciante a decisão do moderador pelos canais já existentes (WhatsApp e e-mail), com links para `/anuncie`.
- **Intenção (por quê):** O comerciante precisa saber o resultado e o que fazer em seguida. Links errados geram nova confusão e envio duplicado.
- **Contexto:** As mensagens já existem, com canais de WhatsApp e e-mail. Elas citam `/anunciar` e não devem mais.
- **Atores:** Sistema (envia); comerciante (recebe).
- **Descrição do comportamento:** Após aprovação ou recusa (Spec 05), o sistema tenta enviar a mensagem pelos canais configurados. Uma falha de envio não desfaz a decisão do moderador; ela fica registrada para reenvio manual. A mensagem de recusa inclui o motivo; a de aprovação confirma a publicação.
- **Entradas e saídas:** Entrada: decisão e dados de contato do comerciante. Saída: envio realizado ou falha registrada.
- **Dados/entidades envolvidos (conceitual):** Decisão, contato e motivo.
- **Estados e transições:** Não se aplica.
- **Regras de negócio:** R5, R8.
- **Validações:** Contato válido antes de tentar enviar.
- **Fluxo do usuário (passo a passo):**
  1. O moderador aprova ou recusa.
  2. O sistema tenta enviar a mensagem.
  3. O moderador vê se o envio foi feito ou falhou.
- **Casos de borda e erros:** Canal indisponível: a decisão vale mesmo assim e a falha aparece para o moderador. Contato ausente: o envio é pulado com aviso.
- **Impacto no existente:** Os textos deixam de citar `/anunciar`.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado uma aprovação, quando a mensagem é gerada, então ela confirma a publicação e cita `/anuncie`.
  - Dado uma recusa, quando a mensagem é gerada, então ela inclui o motivo e cita `/anuncie`.
  - Dado um canal de envio indisponível, quando a decisão é tomada, então ela permanece válida e a falha aparece ao moderador.
- **Definição de pronto:** Textos revisados, envio testado em preview e falha simulada.
- **Dependências:** Spec 04, Spec 05.
- **Fora do escopo desta spec:** Reenvio automático e novos canais.

### Spec 08 — Limpeza LGPD agendada

- **Fase:** 4
- **Objetivo (o quê):** Executar automaticamente, todo dia, a remoção de pendentes com mais de 30 dias sem decisão.
- **Intenção (por quê):** A política LGPD da constituição (emenda v1.3.0) prevê 30 dias. Sem execução automática, o prazo não é cumprido em produção.
- **Contexto:** A regra de limpeza já existe como função, mas só roda por comando manual.
- **Atores:** Plataforma de hospedagem (dispara); sistema (executa).
- **Descrição do comportamento:** Uma tarefa diária chama uma rota protegida por credencial de agendamento. A rota remove pendentes com mais de 30 dias e registra quantos foram removidos. Chamadas sem credencial válida são recusadas.
- **Entradas e saídas:** Entrada: disparo diário com credencial. Saída: quantidade removida, em log operacional.
- **Dados/entidades envolvidos (conceitual):** Anúncio pendente.
- **Estados e transições:** Pendente com mais de 30 dias → removido.
- **Regras de negócio:** R7.
- **Validações:** Credencial obrigatória.
- **Fluxo do usuário (passo a passo):**
  1. A tarefa diária dispara.
  2. A rota valida a credencial.
  3. Remove os vencidos e registra a quantidade.
- **Casos de borda e erros:** Nenhum pendente vencido: execução sem erro, com contagem zero. Credencial ausente ou errada: recusa sem executar nada.
- **Impacto no existente:** Torna o comando manual de limpeza redundante, que pode permanecer como apoio.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um pendente com 31 dias, quando a tarefa roda, então ele é removido.
  - Dado um pendente com 10 dias, quando a tarefa roda, então ele permanece.
  - Dado uma chamada sem credencial, quando recebida, então é recusada sem remover nada.
- **Definição de pronto:** Tarefa configurada, execução manual de teste feita e registrada.
- **Dependências:** Spec 01.
- **Fora do escopo desta spec:** Limpeza de publicados (a política prevê retenção indeterminada).

### Spec 09 — Ambientes de banco (produção, preview e desenvolvimento)

- **Fase:** 4
- **Objetivo (o quê):** Separar a base de produção dos ambientes de preview e de desenvolvimento local.
- **Intenção (por quê):** Hoje a variável de conexão existe só em produção. Previews falham ao acessar anúncios, e testes correm o risco de gravar na base real.
- **Contexto:** O Neon permite branches de banco; a variável de conexão é configurada na Vercel e no ambiente local.
- **Atores:** Equipe de desenvolvimento.
- **Descrição do comportamento:** Produção usa a base principal. Preview e desenvolvimento usam uma branch separada, com a mesma estrutura (Spec 01) e dados de teste. Cada ambiente tem sua própria variável de conexão. Nenhum ambiente que não seja produção aponta para a base principal.
- **Entradas e saídas:** Não se aplica diretamente; a saída é um ambiente de preview funcional.
- **Dados/entidades envolvidos (conceitual):** Não se aplica.
- **Estados e transições:** Não se aplica.
- **Regras de negócio:** Preview e desenvolvimento nunca usam a base de produção.
- **Validações:** Ambiente sem variável de conexão exibe erro claro em vez de falhar silenciosamente.
- **Fluxo do usuário (passo a passo):**
  1. A equipe cria a branch de preview.
  2. Aplica as migrações e carrega dados de teste.
  3. Configura a variável no ambiente de preview e no ambiente local.
- **Casos de borda e erros:** Branch de preview ausente: erro explícito no ambiente, sem fallback para produção.
- **Impacto no existente:** Documentação de configuração de ambiente atualizada.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um preview, quando um cadastro é feito, então o registro aparece só na branch de preview.
  - Dado um ambiente sem variável de conexão, quando acessa anúncios, então recebe erro claro.
- **Definição de pronto:** Preview com cadastro de teste isolado da produção.
- **Dependências:** Spec 01.
- **Fora do escopo desta spec:** Política de custos e backups do provedor.

### Spec 10 — Registro normativo (emenda v1.4.0 e AGENTS.md)

- **Fase:** 4
- **Objetivo (o quê):** Registrar nas normas do projeto a decisão de usar o Neon para anúncios e atualizar o guia para outras LLMs.
- **Intenção (por quê):** O texto atual da constituição contradiz a implementação. Sem emenda, a próxima pessoa ou IA vai tratar o banco como violação.
- **Contexto:** A constituição v1.3.0 diz que dados ficam "apenas em content/ads.json" e admite Neon só "se houver necessidade real". O AGENTS.md registra a pendência como em aberto.
- **Atores:** Proprietário (aprova a emenda); equipe (redige).
- **Descrição do comportamento:** Emenda v1.4.0 autoriza o Neon somente para anúncios (pendentes, publicados e log), mantém notícias em JSON versionado, e atualiza a seção de segurança e a LGPD de 30 dias. O AGENTS.md passa a refletir a decisão e a regra de atualização no fim de cada mudança importante.
- **Entradas e saídas:** Entrada: decisão do proprietário. Saída: constituição e AGENTS.md atualizados.
- **Dados/entidades envolvidos (conceitual):** Não se aplica.
- **Estados e transições:** Não se aplica.
- **Regras de negócio:** A emenda só é válida após aprovação do proprietário.
- **Validações:** Emenda segue o padrão das versões v1.1.0 a v1.3.0.
- **Fluxo do usuário (passo a passo):**
  1. O proprietário revisa a minuta.
  2. Aprova.
  3. A equipe registra a versão e atualiza o AGENTS.md.
- **Casos de borda e erros:** Proprietário rejeita a emenda: a decisão volta ao questionamento e a feature não avança para Fase 2 sem ela.
- **Impacto no existente:** Pendência §11 do AGENTS.md é fechada; §10 deixa de apontar conflito.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado a emenda aprovada, quando a constituição é lida, então autoriza o Neon somente para anúncios.
  - Dado o AGENTS.md atualizado, quando lido por outra IA, então descreve o Neon como fonte de anúncios e não como violação.
- **Definição de pronto:** Emenda registrada com versão e data, AGENTS.md atualizado.
- **Dependências:** Aprovação do proprietário. Pode ser feita em paralelo às demais specs, mas deve ser concluída antes de a Fase 2 ir para produção.
- **Fora do escopo desta spec:** Alterações em outras cláusulas da constituição.

## 14. Ordem recomendada de implementação

1. Spec 01 — Schema versionado de anúncios e log de moderação
2. Spec 02 — Migração única dos anúncios publicados
3. Spec 09 — Ambientes de banco (preview isolado antes de qualquer teste de escrita)
4. Spec 04 — Rota oficial `/anuncie` e redirecionamento de `/anunciar`
5. Spec 03 — Cadastro público gravando na fila
6. Spec 05 — Aprovação e recusa atômicas com auditoria
7. Spec 06 — Gestão de publicados e remoção de `/admin/anuncios`
8. Spec 07 — Notificações com links corrigidos
9. Spec 08 — Limpeza LGPD agendada
10. Spec 10 — Registro normativo (emenda v1.4.0 e AGENTS.md)

Seguir esta ordem evita implementar partes fora de contexto e respeita as dependências: sem o schema versionado não há como testar escrita, e sem a migração a remoção do seed quebraria a vitrine. A Spec 09 vem cedo para que os testes de escrita não toquem a base de produção.
