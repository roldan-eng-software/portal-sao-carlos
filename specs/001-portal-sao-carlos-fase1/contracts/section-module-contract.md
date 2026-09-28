# Contract: Módulo de Seção (Renderização)

**Date**: 2026-09-28 | **Plan**: [plan.md](../plan.md)

Contrato de UI: o que cada seção da página DEVE exibir e como. Cada seção
consome um único `ModuleResult<T>` e não tem conhecimento de nenhuma fonte
externa.

## Entrada comum de toda seção

```text
SectionProps<T>
  result: ModuleResult<T>        // envelope ok/stale/error (data-model.md)
  title: string                  // título da seção em pt-BR
  kind: ContentKind | mixed      // tipo predominante de conteúdo da seção
```

## Obrigações de renderização por status

| Status | Comportamento obrigatório |
| --- | --- |
| `ok` | Renderiza `data` normalmente; exibe `lastUpdated` ("Atualizado em dd/mm/aaaa às hh:mm") |
| `stale` | Renderiza último `data` válido + aviso amigável ("Atualização temporariamente indisponível") + `lastUpdated` |
| `error` | NÃO renderiza conteúdo vazio nem erro técnico; exibe mensagem amigável + link para a fonte oficial quando apropriado |

A falha DEVE permanecer contida na seção: os demais módulos da página
renderizam normalmente (FR-013, SC-004).

## Rótulos de conteúdo — diferenciação obrigatória (FR-006/FR-007/FR-008)

Mapeamento `kind` → rótulo textual exibido (nunca apenas cor — informação
não pode depender exclusivamente de cor):

| `kind` | Rótulo obrigatório | Onde |
| --- | --- | --- |
| `noticia` | "Notícia" + nome da fonte + link "Ver na fonte" | bloco/lista de notícias |
| `informativo` | "Informativo" + fonte oficial + link oficial | bloco de informativos |
| `servico-publico` | "Serviço público" | contatos/informativos de serviço |
| `anuncio-gratuito` | "Anúncio gratuito" (ou "Classificados") | área de anúncios |
| `anuncio-patrocinado` | "Publicidade" / "Anúncio patrocinado" / "Destaque comercial" / "Parceiro local" | posição de destaque |
| `divulgacao-propria` | `label` do item (ex.: "Publicidade própria", "Serviço do portal") | bloco de divulgação |

Regras:

1. Anúncio patrocinado e divulgação própria NUNCA podem usar o mesmo
   tratamento visual/textual de notícia (SC-003: 0% formatados como notícia).
2. Rótulo DEVE ser texto (não apenas cor ou ícone).
3. Notícia e informativo DEVEM exibir fonte e, quando houver, link ao original
   (SC-002).
4. Ordem de prioridade visual: informação pública antes de publicidade; a
   publicidade NÃO DEVE bloquear o acesso ao conteúdo principal (SC-001).

## Obrigações transversais de acessibilidade (FR-015, SC-005)

- HTML semântico: uma hierarquia de títulos por página (h1 único; h2 por
  seção); listas para coleções de itens.
- Navegação por teclado e foco visível em todos os links/botões.
- Contraste WCAG AA; alvo de toque ≥ 44 px em mobile.
- Textos de link compreensíveis fora de contexto (nunca "clique aqui").
- Layout mobile-first sem rolagem horizontal (FR-014).

## Obrigações de conteúdo (FR-019, gate editorial)

- Todos os textos em pt-BR, simples e objetivos; sem sensacionalismo.
- Item de conteúdo urgente de fonte oficial DEVE apontar ao canal oficial e
  NÃO se apresentar como canal de emergência (gate 13).
- Chamadas de publicidade permitidas: "Anuncie aqui", "Entre em contato para
  contratar destaque", "Solicite informações sobre publicidade local" —
  sempre com canal de contato do responsável (SC-006: ≤ 2 interações da home).

## Proibições (verificáveis em revisão/teste)

- ❌ `dangerouslySetInnerHTML` ou renderização de HTML bruto de fonte externa.
- ❌ Qualquer formulário que colete dados pessoais (Fase 1).
- ❌ Botões de pagamento, login, upload ou comentário.
- ❌ Publicidade rotulada ou estruturada como notícia.
