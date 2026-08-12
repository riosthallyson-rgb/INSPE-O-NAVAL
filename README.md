# bizu-inspetor-naval

Este repositório contém um esqueleto de aplicativo Expo para Android chamado "Inspetor Naval".

O objetivo é criar um APK que ajude inspetores da Marinha do Brasil durante abordagens, notificações e vistorias. O aplicativo inclui:

- suporte para consulta a publicações oficiais
- pesquisa offline nos textos cadastrados das publicações anexadas
- exibição de citações e trechos das fontes
- guia rápido de abordagem, notificações e vistorias

## Como usar

1. Instale dependências: `npm install`
2. Rode o servidor local: `npx expo start --localhost`
3. Acesse o Expo Developer Tools em `http://localhost:19002`
4. Para testar no navegador: `npx expo start --web`
5. Para gerar um APK com a infra da Expo, use `npx eas build --platform android`

## Personalização das publicações

Adicione ou substitua os textos oficiais em `src/data/publications.js`. O mecanismo de busca interna responde apenas com base nesses documentos.

Os arquivos PDF oficiais são mantidos em `assets/docs/` para que todas as publicações estejam incluídas no aplicativo.

## Organização do projeto

- `App.js`: entrada do app que carrega a aplicação principal em `src/App.js`
- `src/App.js`: estado e coordenação dos fluxos principais
- `src/features/`: telas de perfil, inspeção, pesquisa, publicações e histórico
- `src/domain/`: regras de inspeção, relatório e pesquisa local
- `src/infrastructure/`: persistência no dispositivo e acesso aos PDFs
- `src/data/publications.js`: textos cadastrados para pesquisa offline
- `docs/README.md`: instruções para manter as publicações no aplicativo

