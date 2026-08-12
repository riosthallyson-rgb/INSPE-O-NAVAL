# Contexto do projeto para revisão pelo Claude

## Missão

Você está revisando o projeto **Bizu Inspetor Naval**, um aplicativo React Native/Expo destinado a apoiar inspetores navais durante abordagens, notificações e vistorias. Analise o repositório inteiro antes de sugerir ou implementar mudanças.

O objetivo desta revisão é produzir recomendações concretas para melhorar:

1. estabilidade no Expo Go e builds Android/iOS;
2. arquitetura e manutenibilidade;
3. experiência do inspetor em campo;
4. confiabilidade da pesquisa nas normas oficiais;
5. segurança, privacidade e integridade dos registros;
6. acessibilidade, desempenho e testes;
7. preparação para distribuição por EAS Build.

Não presuma que o aplicativo usa uma IA remota. A Bússola é uma pesquisa heurística local sobre textos previamente cadastrados.

## Estado técnico confirmado

- Expo SDK: `54.0.0` (`expo` instalado na versão `54.0.36` na última validação).
- React: `19.1.0`.
- React Native: `0.81.5`.
- Execução atual: Expo Go por LAN.
- Plataformas declaradas: Android, iOS e web.
- Entrada do aplicativo: `App.js`, que apenas exporta `src/App.js`.
- Não há TypeScript, ESLint, Prettier, Jest ou suíte de testes configurada.
- Não há backend, autenticação, banco remoto ou sincronização em nuvem.
- Dados do usuário são persistidos localmente em JSON usando `expo-file-system`; na web, usa-se `localStorage`.
- Os PDFs oficiais ficam empacotados em `assets/docs/`.
- A Bússola opera offline sobre `src/data/publications.js`.
- A validação `npx expo install --check` passou depois da migração para o SDK 54.
- A última instalação npm reportou 18 vulnerabilidades transitivas: 7 moderadas e 11 altas. Audite antes de recomendar atualizações automáticas e não use `npm audit fix --force` sem analisar mudanças incompatíveis.

## Inventário que deve ser lido

### Configuração e entrada

- `package.json`: scripts e dependências do Expo SDK 54.
- `package-lock.json`: árvore exata das dependências; não precisa ser lido linha a linha, mas deve ser consultado para auditoria.
- `app.json`: metadados Expo e identificador Android.
- `eas.json`: configuração atual, limitada a APK Android de produção.
- `babel.config.js`: preset padrão do Expo.
- `App.js`: ponto de entrada.

### Código principal

- `src/App.js`: aplicação atual completa. É um arquivo monolítico com cerca de 65 KB e concentra:
  - interface e navegação por abas feita manualmente;
  - perfil do inspetor;
  - criação e andamento de inspeções;
  - checklists por tipo de embarcação;
  - notificações e não conformidades;
  - histórico local;
  - Bússola com pesquisa local;
  - abertura/compartilhamento de PDFs;
  - geração e compartilhamento de relatório em PDF;
  - temas claro e escuro;
  - todos os estilos em um único `StyleSheet`.
- `src/App.backup.js`: cópia antiga da interface. Determine se há algum código útil não incorporado; caso contrário, recomende removê-la do código versionado.
- `src/data/publications.js`: catálogo, trechos, palavras-chave e referências aos PDFs oficiais.

### Ferramentas e documentação

- `scripts/extract-pdfs.js`: extração via `pdf-parse` com caminhos absolutos antigos em `D:/Downloads`.
- `scripts/extract-pdfs.mjs`: extração via `pdfjs-dist`, também com caminhos absolutos e limite parcial de páginas.
- `README.md`: documentação geral; o texto aparece com sinais de mojibake/encoding incorreto em algumas leituras.
- `docs/README.md`: instruções sobre publicações; também deve ser verificado quanto ao encoding.

### Documentos embarcados

- `assets/docs/L9537.pdf`
- `assets/docs/rlesta.pdf`
- `assets/docs/normam-201.pdf`
- `assets/docs/normam-204.pdf`
- `assets/docs/normam-211.pdf`
- `assets/docs/normam-301.pdf`
- `assets/docs/NORTEC-41 REV-1_2.pdf`

O conjunto de PDFs ocupa dezenas de megabytes, principalmente `normam-201.pdf`. Avalie o impacto no bundle, instalação, memória e atualizações. Não reproduza conteúdo jurídico extensivamente. Verifique se o texto pesquisável representa fielmente as versões oficiais e se existem datas/versões claras.

### Artefatos que não devem orientar a arquitetura

- `node_modules/`: gerado pelo npm.
- `.expo/`: cache local do Expo.
- `web-build/`: build web gerado e possivelmente desatualizado.

## Fluxos funcionais existentes

1. O usuário cadastra o perfil do inspetor.
2. Inicia uma inspeção informando embarcação, TIE e tipo.
3. Preenche um checklist específico e registra observações.
4. Conclui a vistoria ou notificação.
5. O registro é salvo no histórico local.
6. Um relatório HTML pode ser convertido em PDF e compartilhado.
7. O usuário pesquisa as publicações por pergunta e recebe trechos e citações ranqueados localmente.
8. Os PDFs anexos podem ser abertos ou compartilhados conforme a plataforma.

## Pontos de atenção já encontrados

Trate estes itens como hipóteses a confirmar no código, não como conclusões definitivas:

- `src/App.js` tem responsabilidades demais e deve ser dividido por domínio, telas, componentes, serviços, hooks e estilos.
- A navegação manual por estado pode dificultar back button, deep links, acessibilidade e restauração de estado; avalie Expo Router ou React Navigation.
- Persistência em arquivos JSON não oferece esquema, migrações, transações, índices nem proteção contra gravações concorrentes/corrompidas.
- Dados identificáveis do inspetor e registros de fiscalização podem exigir proteção adicional, política de retenção, exportação segura e bloqueio do dispositivo.
- A pesquisa usa normalização, tokens e pontuação simples. Ela pode retornar texto fora de contexto, não reconhecer flexões/sinônimos e não comprovar artigo/página.
- A interface usa o nome “Bússola” e deve continuar deixando claro que os resultados são apenas materiais relacionados para conferência.
- Citações devem apontar de forma verificável para norma, seção/artigo e, quando possível, página/versão.
- A base textual em `publications.js` parece resumida em comparação com os PDFs. Confirme cobertura e fidelidade.
- Os scripts de extração não são portáveis por dependerem de `D:/Downloads`.
- `pdf-parse` e `pdfjs-dist` são ferramentas Node e não deveriam aumentar desnecessariamente o bundle do app móvel; confirme que permanecem apenas como dependências de desenvolvimento.
- `app.json` possui identificador Android, mas não `ios.bundleIdentifier`.
- `eas.json` não define perfis claros de development/preview/production para ambas as plataformas.
- Ícones, splash screen, permissões, política de privacidade, versionamento de build e configuração de updates precisam ser auditados.
- Não existem testes unitários, de integração ou end-to-end.
- Não há tratamento centralizado de erros, logs estruturados ou telemetria.
- Há vários estados e efeitos na raiz; procure condições de corrida durante carregamento e salvamento.
- Confirme se APIs usadas de `expo-file-system` continuam adequadas no SDK 54 ou se estão em uma camada legada.
- Confirme o comportamento de abertura de PDF no Expo Go físico em iOS e Android.
- Avalie listas longas, teclado, safe areas, tamanhos de toque, contraste, Dynamic Type e leitores de tela.
- O build web versionado pode estar obsoleto e inflar o repositório.

## Restrições de domínio

- O aplicativo dá suporte a decisões relacionadas à inspeção naval. Recomendações devem priorizar exatidão, rastreabilidade e linguagem que não substitua a leitura da norma oficial.
- Não invente artigos, regras, procedimentos ou interpretações jurídicas.
- Preserve a capacidade offline, pois o uso pode ocorrer em campo sem conectividade.
- Antes de propor nuvem ou IA externa, explique implicações de privacidade, custo, conectividade e governança.
- Não envie dados pessoais, registros de inspeção ou documentos a serviços externos sem consentimento e desenho explícito de segurança.
- Mudanças de dependências devem permanecer compatíveis com Expo SDK 54 e Expo Go, a menos que uma migração seja proposta separadamente com justificativa.

## Como conduzir a revisão

1. Leia todos os arquivos de configuração e todos os fontes em `src/`, `scripts/` e a documentação.
2. Execute somente verificações não destrutivas inicialmente, como:
   - `npx expo install --check`;
   - `npx expo config --type public`;
   - `npm audit --omit=dev` e `npm audit`, distinguindo produção de desenvolvimento;
   - análise estática de imports, APIs obsoletas e arquivos não utilizados.
3. Não altere arquivos durante a primeira auditoria.
4. Produza achados com evidência concreta, citando arquivo e linha.
5. Separe defeitos confirmados de sugestões de produto.
6. Para cada recomendação, informe benefício, risco, esforço aproximado e dependências.
7. Apresente primeiro correções críticas e rápidas; depois refatorações estruturais e evolução de produto.
8. Não proponha uma reescrita total sem demonstrar por que uma migração incremental não atende.

## Formato esperado da resposta

Entregue a revisão em português brasileiro com estas seções:

1. **Resumo executivo** — estado geral e os cinco itens mais importantes.
2. **Problemas confirmados** — severidade, evidência com arquivo/linha, impacto e correção proposta.
3. **Arquitetura recomendada** — estrutura incremental de pastas e divisão do monólito.
4. **Pesquisa e confiabilidade normativa** — como aumentar cobertura, citações e rastreabilidade offline.
5. **UX e acessibilidade** — melhorias específicas para uso em campo.
6. **Segurança e privacidade** — ameaças, dados sensíveis e controles recomendados.
7. **Dependências e Expo/EAS** — compatibilidade, vulnerabilidades e configuração de builds.
8. **Estratégia de testes** — prioridades e exemplos de casos essenciais.
9. **Plano em fases** — ações para 1 dia, 1 semana e 1 mês.
10. **Perguntas ao responsável** — somente decisões de negócio ou domínio que não possam ser inferidas do código.

Use uma tabela de prioridades com as colunas: `Prioridade`, `Mudança`, `Motivo`, `Esforço`, `Risco` e `Arquivos afetados`.

## Solicitação final ao Claude

Faça agora uma auditoria profunda deste repositório. Não se limite a repetir os pontos de atenção acima: confirme-os no código, encontre problemas adicionais e proponha mudanças práticas e priorizadas. Não modifique o projeto até apresentar a auditoria e receber autorização explícita para implementar um conjunto de mudanças.
