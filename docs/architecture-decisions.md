# Decisões de arquitetura

## ADR-001 — Navegação incremental

**Status:** aceita para a Etapa 2.

O aplicativo continuará temporariamente com a barra de abas controlada pelo estado `activeTab` enquanto as telas forem extraídas de `src/App.js`. Introduzir uma biblioteca de navegação antes dessa separação misturaria mudança estrutural, alteração visual e mudança de ciclo de vida em um único diff.

Depois que as cinco telas estiverem isoladas, a migração recomendada é para Expo Router, por ser mantido pela Expo, funcionar no Expo Go SDK 54 e oferecer histórico, botão voltar, deep links e restauração de rotas. A adoção deve começar por uma rota secundária, mantendo a tela de inspeção ativa intacta até que persistência e retorno de rota estejam cobertos por testes.

Critérios para iniciar a migração:

- telas sem dependência direta do estado interno de `App`;
- rascunho de inspeção recuperável testado;
- comportamento do botão voltar definido para cada etapa;
- foco de acessibilidade após transição especificado;
- teste manual em Android, iOS e web.

**Estado ao final da Etapa 2:** as cinco telas foram isoladas em `src/features/`. Os demais critérios, especialmente comportamento do botão voltar e teste manual multiplataforma, devem ser fechados antes da troca da navegação.

**Estado na primeira entrega de navegação:** o Expo Router passou a controlar a entrada do aplicativo e a rota secundária `publication/[id]` foi implementada com retorno nativo e suporte a deep link. A barra principal continua temporariamente controlada por `activeTab`, mantendo a inspeção ativa montada e preservando o rascunho durante esta migração incremental.

## ADR-002 — Persistência local

**Status:** implementada parcialmente na Etapa 2.

O acesso a arquivos fica isolado em `src/infrastructure/storage.js`. Gravações da mesma chave são serializadas, o JSON temporário é validado antes da promoção e o arquivo anterior é mantido como backup. A API legada do Expo SDK 54 permanece encapsulada nessa camada para permitir migração posterior para `File` e `Paths` sem alterar as telas.

## Estrutura ao final da Etapa 2

- `src/domain/`: regras puras de perfil, inspeção, pesquisa e relatório;
- `src/infrastructure/`: armazenamento e acesso a PDFs;
- `src/features/`: telas organizadas por função;
- `src/data/`: publicações e modelos de checklist;
- `src/theme/`: estilos compartilhados;
- `src/App.js`: hidratação, estado e coordenação dos fluxos.

## ADR-003 — Direção visual naval moderna

**Status:** aceita para a Fase D.

O design seguirá a direção naval moderna e minimalista, preservando uma apresentação mais sóbria nos alertas, estados críticos e relatórios. A identidade permanecerá neutra até existir autorização explícita para usar marca, brasão ou símbolo institucional.

A implementação será incremental e baseada em tokens de cor, tipografia, espaçamento, raio e movimento. Os componentes compartilhados serão adotados tela por tela, começando pela Vistoria. Nenhuma mudança de biblioteca de navegação fará parte dessas entregas visuais; a migração continua regida pelo ADR-001.

## ADR-004 — Documento TIE e perfil reutilizável

**Status:** primeira entrega implementada.

Os perfis de embarcação fazem parte do estado persistido versionado e são identificados preferencialmente pelo TIE normalizado. A seleção de câmera ou galeria usa `expo-image-picker`, compatível com o Expo Go SDK 54. A imagem escolhida é copiada para uma pasta permanente da aplicação e o estado JSON armazena somente sua URI.

Nesta etapa não há OCR nem interpretação do QR VIO. Todos os campos derivados do documento são preenchidos e revisados manualmente pelo inspetor. Perfil e inspeção inicial são gravados na mesma transação para evitar um rascunho parcialmente persistido.

**Segunda entrega:** a validade é interpretada localmente nos formatos `DD/MM/AAAA` e `AAAA-MM-DD`. O aplicativo distingue documento válido, vencendo em até 30 dias, vencido, ausente ou com data inválida, e aponta campos essenciais não preenchidos. Essa verificação trata somente consistência dos dados digitados e não representa autenticação do documento.

## ADR-005 — Barreiras de segurança jurídica

**Status:** implementada no Bloco 2A.

Uma não conformidade conduz somente a uma revisão dos fatos e nunca cria automaticamente Notificação, Auto de Infração, enquadramento ou medida administrativa. A conclusão arquiva o registro como relatório de apoio. A Bússola aceita como fundamento apenas publicações marcadas como verificadas e que possuam localização precisa; na ausência delas, deve recusar a resposta fundamentada.

O fluxo operacional principal passa a ser denominado Inspeção Naval. Registros legados cujo estágio era `Vistoria` são migrados para `Inspeção`, sem alterar ocorrências do termo que pertençam ao conteúdo original de uma publicação normativa.

## ADR-006 — Motor de inspeção assistida

**Status:** implementado na Fase 2.

A inspeção é um rascunho persistente de dez etapas, com validação antes do avanço e trilha cronológica de eventos. O motor de aplicabilidade usa o contexto operacional apenas para selecionar módulos e fontes candidatas. Ele não declara obrigações, infrações ou medidas.

Itens sem fonte estruturada exibem `Fundamentação normativa não localizada.`. Uma regra jurídica só pode produzir análise quando contiver identificador, versão, item e página da fonte. O catálogo genérico legado foi retirado do produto.

Fotografias de evidência são copiadas para armazenamento permanente sem recorte ou redução intencional, recebem hash SHA-256 e registram inspeção, item, horário e coordenadas informadas. Isso oferece rastreabilidade local, mas não constitui assinatura digital nem cadeia de custódia certificada.

## ADR-007 — Procedimentos administrativos defensivos

**Status:** primeira entrega implementada na Fase 3.

Procedimentos administrativos só podem ser sugeridos quando um achado possuir enquadramento confirmado pelo Inspetor e fonte completa. O estado `ISSUED` nunca decorre apenas da geração de arquivo. Identificadores locais e números oficiais são campos distintos.

Templates registram a versão da NORMAM, anexo e página PDF auditada. Prazos ficam centralizados no `DeadlineEngine`; dias úteis não incluem inferência de feriados locais. Custódia e lacre usam transições append-only para preservar apreensão, regularização, autorização e liberação.
