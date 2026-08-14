# Inspetor Naval

Aplicativo offline-first em Expo/React Native para apoiar o registro de Inspeções Navais em campo. O app organiza o fluxo operacional, mantém rascunhos e histórico no dispositivo, permite anexar evidências e consultar trechos normativos previamente auditados pela **Bússola Normativa**.

> **Importante:** o aplicativo é uma ferramenta de apoio. A Bússola não substitui a leitura da publicação oficial e nenhuma não conformidade cria automaticamente Auto de Infração, apreensão, enquadramento ou outra medida administrativa.

## Principais recursos

- Inspeção Naval assistida em 10 etapas, com retomada de rascunho e trilha de auditoria.
- Cadastro reutilizável de embarcações e perfil do inspetor.
- Captura/importação de documento por imagem ou PDF e leitura de QR estruturado com conferência humana obrigatória.
- Checklist dinâmico por contexto, com referências verificadas somente quando há fonte, versão, seção e página auditadas.
- Evidências fotográficas com hash SHA-256 e opção de exigir fotografia por item.
- Localização GPS/manual e registro explícito da jurisdição, sem inferir norma regional quando ela não está instalada.
- Bússola Normativa totalmente local, sem IA remota, com recusa segura quando a fundamentação é insuficiente.
- Histórico, relatório PDF, mapa, busca global offline e backup/importação manual em JSON.
- Modos claro e escuro controlados pelo aplicativo.

## Requisitos de desenvolvimento

- Node.js 20 recomendado para reproduzir o CI.
- npm.
- Expo/EAS CLI executado via `npx`.
- Para builds iOS físicos/TestFlight: conta Apple Developer e credenciais válidas.
- Para builds EAS: autenticação em uma conta Expo com acesso ao projeto.

## Instalação para desenvolvimento

```bash
npm ci
npx expo install --check
npx expo-doctor
npm test
npx expo start
```

Para web:

```bash
npx expo start --web
```

O repositório possui CI em `.github/workflows/ci.yml`, que executa instalação limpa, checagem das dependências Expo, Expo Doctor, Jest e relatórios de `npm audit`.

## Bússola Normativa e publicações

Os PDFs oficiais embarcados ficam em `assets/docs/`. O catálogo de documentos está em `src/data/publications.js`.

A presença de um PDF no aplicativo **não significa que todo o seu conteúdo está validado para resposta normativa**. A Bússola usa somente chunks auditados em `src/legal/corpus/normativeCorpus.js`. Cada chunk autorizado possui fonte, versão, seção e página PDF; fontes e hashes auditados estão documentados em `docs/phase-4-compass-coverage.md`.

Para reproduzir a auditoria textual dos PDFs:

```bash
node scripts/extract-pdfs.mjs
node scripts/audit-pdf.mjs normam-211.pdf "colete salva-vidas" "lotação"
```

O workflow `.github/workflows/pdf-audit.yml` também registra SHA-256 dos PDFs auditados e publica os resultados como artefato temporário do GitHub Actions.

## Estrutura do projeto

- `app/`: rotas do Expo Router.
- `src/App.js`: coordenação dos fluxos principais enquanto a migração de navegação permanece incremental.
- `src/components/`: componentes de interface compartilhados.
- `src/features/`: telas e fluxos por funcionalidade.
- `src/domain/`: modelos, regras puras e migrações.
- `src/legal/`: corpus, busca, citações e motores normativos.
- `src/infrastructure/`: armazenamento, arquivos, câmera, localização e integração com APIs do dispositivo.
- `src/theme/`: tokens e estilos visuais.
- `tests/`: suíte Jest.
- `docs/`: decisões de arquitetura, auditorias e plano de testes de campo.

## Backup local

Na tela **Histórico**, use **Exportar backup** para gerar um JSON contendo inspeções concluídas e cadastros de embarcação. O arquivo é compartilhado/salvo pelo próprio sistema operacional e não é enviado a servidor externo.

A importação valida o formato do backup, combina registros por identificador e preserva a versão mais recente de cada registro. O perfil e a inspeção em andamento não são substituídos pela importação do histórico.

## Builds com EAS

Autentique e configure o projeto quando necessário:

```bash
npx eas login
npx eas build:configure
```

Build de desenvolvimento:

```bash
npx eas build --profile development --platform android
npx eas build --profile development --platform ios
```

Build de homologação/preview:

```bash
npx eas build --profile preview --platform android
npx eas build --profile preview --platform ios
```

Build de produção:

```bash
npx eas build --profile production --platform android
npx eas build --profile production --platform ios
```

No Android, o perfil `preview` gera um APK instalável para testes internos e o perfil `production` usa App Bundle. No iOS, a distribuição interna exige provisionamento Apple; para TestFlight, gere o build apropriado e faça a submissão com uma conta Apple Developer autorizada.

Antes de qualquer entrega, execute:

```bash
npx expo install --check
npx expo-doctor
npm test
npm audit --omit=dev
```

Não use `npm audit fix --force` sem revisar incompatibilidades com o Expo SDK adotado.

# Instalação no celular

## Android — APK de preview sem loja

1. No celular Android, abra o link de download do build `preview` gerado pela Expo, recebido por link ou QR Code.
2. Se o Android exibir o aviso sobre instalação de aplicativos de fontes desconhecidas, abra **Configurações** e permita temporariamente a instalação para o navegador ou gerenciador de arquivos utilizado.
3. Abra o arquivo `.apk` baixado e toque em **Instalar**.
4. Abra **Inspetor Naval** e conceda as permissões de câmera e localização quando solicitadas.
5. Após a instalação, você pode revogar novamente a permissão de instalar aplicativos desconhecidos do navegador, se desejar.

## iPhone/iOS — TestFlight recomendado

1. Instale o **TestFlight** pela App Store.
2. Receba do responsável pelo projeto o convite/link do TestFlight. Esse convite só existe depois que um build iOS válido é submetido à infraestrutura Apple.
3. Abra o convite no iPhone, toque em **Aceitar** e depois em **Instalar** no TestFlight.
4. Abra **Inspetor Naval** e conceda câmera e localização quando solicitadas.

Um build EAS `preview` com distribuição interna e um convite TestFlight são mecanismos diferentes. Para uso por TestFlight, é necessário gerar/submeter um build iOS com as credenciais Apple apropriadas.

## Testes rápidos com Expo Go

1. Instale o **Expo Go** no Android ou iPhone.
2. No computador, execute:

```bash
npx expo start
```

3. Escaneie o QR Code exibido pelo Expo: no iOS, use a câmera; no Android, use o leitor dentro do Expo Go.

O Expo Go serve para desenvolvimento rápido e **não substitui a validação do build final**. Permissões, arquivos, compartilhamento, mapas e outros comportamentos nativos devem ser testados também em um build `preview`/development client.

## Solução de problemas

### A câmera não abre

- Abra as configurações do sistema e confirme que **Inspetor Naval** possui permissão de câmera.
- Se a permissão foi negada permanentemente, habilite-a manualmente nas configurações do aplicativo.
- Reinicie o app após alterar a permissão.

### O GPS não localiza

- Confirme que a localização do aparelho está ativada.
- Confirme a permissão de localização **durante o uso** para o app.
- Em área coberta ou com sinal fraco, tente novamente em local aberto ou informe as coordenadas manualmente.
- A obtenção do GPS não determina sozinha a jurisdição nem uma regra regional.

### O app não abre depois da instalação

- Remova a instalação anterior e instale novamente o APK/build recebido.
- Confirme que o arquivo foi baixado por completo.
- Se o problema ocorrer apenas em um modelo/versão do sistema, registre aparelho, versão do Android/iOS e etapa em que o app fecha para investigação.

### Um PDF não abre na página citada

O aplicativo pode solicitar `#page=` ao visualizador, mas o posicionamento depende do leitor de PDF instalado. Se a página não abrir automaticamente, use o número de página PDF exibido na citação e navegue manualmente.

## Checklist antes de distribuição

Consulte `docs/release-checklist.md` e `docs/test-plan.md`. Em especial:

- percorrer as 10 etapas em modo avião;
- fechar/reabrir o app e recuperar um rascunho;
- testar câmera, QR, importação de PDF e evidências;
- testar backup/exportação e reimportação;
- conferir Bússola com cenário fundamentado e com cenário que deve ser recusado;
- gerar/compartilhar relatório PDF;
- testar TalkBack/VoiceOver e fonte ampliada;
- executar um build `preview` em dispositivo físico antes da distribuição.

## Privacidade e segurança

Os registros são locais ao dispositivo. Fotos, dados de inspeção, identificação do inspetor e histórico podem ser sensíveis. O operador deve proteger o aparelho, controlar os backups exportados e compartilhar relatórios/arquivos somente pelos canais autorizados pela organização.

A aplicação não possui sincronização em nuvem obrigatória nem envia consultas da Bússola para um serviço de IA remoto.
