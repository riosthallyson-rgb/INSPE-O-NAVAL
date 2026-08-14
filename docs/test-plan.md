# Plano de testes de campo

Execute esta lista em modo avião no Android e no iPhone antes de distribuir uma versão. Registre modelo do aparelho, versão do sistema, versão/build do app e qualquer etapa que não possa ser concluída.

## Fluxo principal

1. Preencher nome, posto ou graduação, NIP e jurisdição.
2. Fechar e reabrir o aplicativo; confirmar a recuperação do perfil.
3. Criar uma inspeção com nome, TIE, armador e tipo de embarcação.
4. Preencher parte do checklist, encerrar o aplicativo e confirmar a recuperação do rascunho.
5. Verificar que uma Inspeção Naval com itens pendentes não pode ser concluída.
6. Concluir uma inspeção conforme e confirmar sua presença no histórico.
7. Registrar uma não conformidade, revisar o fato sem geração automática de documento e gerar o relatório PDF.
8. Alterar novamente o item de “não conforme” para um estado não irregular e confirmar que o achado deixa de aparecer como não conformidade ativa, mantendo evento na trilha de auditoria.
9. Confirmar que o PDF identifica referências normativas ainda pendentes e não apresenta fundamento pendente como validado.

## Documentos e QR Code

1. Capturar uma imagem do TIE pela câmera e confirmar que a imagem original permanece acessível após reiniciar o app.
2. Importar uma imagem da galeria.
3. Importar um PDF e confirmar que o app não tenta ler QR diretamente do PDF como se fosse imagem.
4. Ler pela câmera ao vivo um QR estruturado de teste em JSON, por exemplo `{"registrationNumber":"00123","vesselName":"TESTE"}`.
5. Confirmar que os campos aparecem para revisão com alta confiança, porém **não confirmados**.
6. Confirmar manualmente apenas um campo e verificar que somente ele pode ser aplicado à inspeção.
7. Ler um QR com texto/URL não reconhecido e confirmar a mensagem “QR lido, formato não reconhecido”, sem preenchimento automático.
8. Negar permissão de câmera e confirmar mensagem clara e possibilidade de continuar usando importação de arquivo.
9. Repetir a leitura de QR presente em uma imagem já importada.
10. Confirmar em todos os casos que o app continua mostrando que a autenticidade oficial não foi verificada.

## Checklist assistido

1. Percorrer as dez etapas e confirmar que a barra de progresso, Voltar e Continuar mantêm os dados.
2. Interromper nas etapas Embarcação, Documentação e Inspeção; reiniciar o aplicativo e continuar do mesmo ponto.
3. Selecionar uma embarcação salva e confirmar os dados antes de prosseguir.
4. Confirmar que o checklist muda conforme emprego/área de navegação, sem anunciar NORMAM-202, NORMAM-212 ou regra regional como fonte instalada quando não houver fonte validada.
5. Conferir o agrupamento visual por categoria e o contador de itens avaliados.
6. Usar “Ir aos pendentes” e confirmar que aparecem itens não verificados, não conformidades sem descrição e fotos obrigatórias ausentes.
7. Marcar um item como “Não se aplica” sem justificativa e confirmar o bloqueio do avanço.
8. Marcar um item como “Não conforme” sem descrição e confirmar o destaque e o bloqueio na revisão.
9. Em um item, ativar “foto obrigatória”; confirmar que a etapa não avança sem evidência.
10. Anexar a foto e confirmar que o avanço passa a ser permitido quando as demais validações estiverem completas.
11. Regularizar um achado durante a inspeção e conferir horários na trilha do relatório.
12. Confirmar que uma referência verificada exibe fonte/item/página e que uma referência pendente continua mostrando “Fundamentação normativa não localizada.”
13. Gerar o PDF final e conferir cenário, coordenadas, condutor, lotação, evidências, achados ativos e auditoria.

## Localização e jurisdição

1. Conceder localização e capturar o ponto GPS.
2. Conferir latitude, longitude e precisão registrada.
3. Alterar/inserir coordenadas manualmente e confirmar o ponto.
4. Confirmar manualmente CP/DL/AG.
5. Perguntar à Bússola sobre “regras deste local” sem localização/jurisdição confirmada e esperar esclarecimento obrigatório.
6. Repetir com jurisdição confirmada e sem NPCP/NPCF instalada; confirmar recusa explícita em inventar regra regional.
7. Negar permissão de localização e confirmar que a inspeção pode continuar com coordenadas manuais ou sem GPS.

## Publicações e Bússola

1. Abrir cada PDF embarcado sem rede.
2. Fazer uma pergunta sobre condução sem habilitação e conferir citações de RLESTA/NORMAM-301.
3. Perguntar “Quantos coletes devem existir para a lotação da embarcação?” e conferir a citação auditada da NORMAM-211, sem extrapolar requisito fora do contexto.
4. Perguntar sobre dotação de extintores e confirmar que a Bússola remete à tabela auditada da NORMAM-201 em vez de inventar uma quantidade.
5. Em uma inspeção de navegação interior, perguntar sobre lista de passageiros e conferir a cobertura auditada da NORMAM-204.
6. Fazer a mesma pergunta sobre lista de passageiros sem contexto de navegação interior e confirmar recusa segura quando não houver regra selecionada.
7. Pesquisar um assunto fora do corpus e confirmar `Fundamentação insuficiente` e zero citações.
8. Abrir a publicação a partir de uma citação e conferir número da página PDF informado.
9. Simular outro estado operacional e confirmar que o rascunho real não foi alterado.

## Histórico, busca e backup

1. Criar pelo menos duas inspeções e duas embarcações com nomes/TIE distintos.
2. Na tela inicial, pesquisar por nome da embarcação e confirmar resultado do histórico/embarcação.
3. Pesquisar por nome/número de uma publicação e confirmar resultado de norma.
4. Abrir cada tipo de resultado e confirmar a navegação esperada.
5. Na tela Histórico, exportar um backup JSON e salvá-lo em local controlado.
6. Confirmar que a data do último backup fica registrada no aparelho.
7. Importar o mesmo backup e confirmar que não duplica inspeções com o mesmo identificador.
8. Em outro conjunto de dados de teste, importar um backup com registro mais novo e confirmar que a versão mais recente vence pelo timestamp.
9. Tentar importar JSON inválido e confirmar erro legível sem alterar os dados existentes.
10. Confirmar que perfil e inspeção em andamento não são substituídos pela importação do histórico.

## Relatório e compartilhamento

1. Gerar PDF de uma inspeção concluída no Android e compartilhar/salvar o arquivo.
2. Repetir no iOS.
3. No web, acionar a impressão e conferir o HTML/PDF resultante.
4. Conferir dados do inspetor, embarcação, cenário, checklist, achados, evidências, fontes e trilha de auditoria.
5. Confirmar que o relatório não apresenta rascunho administrativo como documento emitido.

## Acessibilidade e visual

1. Repetir o checklist com VoiceOver no iOS e TalkBack no Android.
2. Testar o maior tamanho de texto configurável no aparelho.
3. Confirmar que todos os estados são compreensíveis sem depender apenas de cor.
4. Testar campos com teclado aberto e safe areas mais comuns.
5. Testar modo claro e escuro nas cinco abas, detalhes de publicação, câmera de QR, histórico e telas da inspeção.
6. Confirmar alvos de toque confortáveis nos botões de status, navegação inferior e ações principais.

## Persistência e recuperação de erro

1. Alterar rapidamente vários campos do rascunho e confirmar que o indicador de salvamento retorna a “salvo”.
2. Fechar/reabrir após alterações rápidas e conferir a última versão.
3. Simular arquivo principal inválido em ambiente de desenvolvimento/teste e confirmar recuperação pelo backup local com aviso ao usuário.
4. Confirmar que falha ao arquivar uma inspeção não remove o rascunho antes da persistência bem-sucedida.
5. Confirmar que falha ao salvar embarcação/perfil produz mensagem visível e não é silenciosamente ignorada.

## Critério mínimo antes da distribuição

- `npx expo install --check` sem incompatibilidade.
- `npx expo-doctor` aprovado.
- `npm test` 100% aprovado.
- vulnerabilidades de `npm audit` revisadas sem uso cego de `--force`.
- build `preview` gerado e instalado em pelo menos um Android físico.
- build iOS/TestFlight ou distribuição interna validada em um aparelho iOS quando houver credenciais Apple.
- fluxo principal concluído em modo avião sem crash.
