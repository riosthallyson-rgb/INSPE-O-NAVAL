# Contexto técnico do projeto — Inspetor Naval

## Missão

O **Inspetor Naval** é um aplicativo React Native/Expo, offline-first, destinado a apoiar o registro de Inspeções Navais em campo. Antes de alterar o projeto, leia `docs/architecture-decisions.md`, `docs/phase-4-compass-coverage.md`, `docs/test-plan.md`, `src/domain/`, `src/legal/`, `src/infrastructure/` e os fluxos relevantes em `src/features/`.

O produto trabalha com dados e decisões sensíveis. Priorize exatidão, rastreabilidade, preservação de evidências, recuperação de dados e linguagem que não substitua a conferência da norma oficial.

## Estado técnico atual

- Expo SDK `54`.
- React `19.1.0`.
- React Native `0.81.5`.
- Expo Router como entrypoint (`expo-router/entry`).
- Plataformas: Android, iOS e web.
- `app/_layout.js` envolve as rotas em `AppErrorBoundary`.
- As cinco abas principais ainda usam navegação incremental por `activeTab`; detalhes de publicação usam rota real `publication/[id]`.
- Jest/jest-expo está configurado e a suíte é obrigatória em qualquer mudança de domínio.
- CI em `.github/workflows/ci.yml`: `npm ci`, `expo install --check`, Expo Doctor, Jest e relatórios de audit.
- Não há backend obrigatório, autenticação remota ou sincronização em nuvem.
- Estado operacional é salvo localmente; mobile usa `expo-file-system/legacy` encapsulado em `src/infrastructure/storage.js`, web usa `localStorage`.
- Estado persistido é versionado e migrado por `src/domain/persistedState.js`.
- Escritas são serializadas; arquivo temporário é validado e o anterior é mantido como backup quando possível.
- Histórico pode ser exportado/importado manualmente em JSON sem servidor externo.
- Ícone/splash atuais são neutros e não representam marca oficial da Marinha do Brasil.

## Bússola Normativa

A Bússola **não é uma IA remota**. `src/infrastructure/groundedAssistant.js` chama um motor local em `src/legal/compass/normativeCompassEngine.js`.

Regras obrigatórias:

1. Nunca gerar artigo, inciso, página, prazo, enquadramento ou medida por conhecimento externo/memória.
2. Resposta fundamentada exige chunk auditado com fonte, versão, seção e página PDF.
3. Sem evidência suficiente, devolver `INSUFFICIENT_COMPASS_ANSWER` ou solicitar o contexto necessário.
4. A presença de um PDF no catálogo não significa que o PDF inteiro foi validado para respostas.
5. Cada expansão do corpus deve ser precedida por extração/conferência do PDF embarcado e registro de hash SHA-256.
6. `.github/workflows/pdf-audit.yml` e os scripts em `scripts/` existem para reproduzir a auditoria dos PDFs.

O corpus atual possui trechos auditados de:

- RLESTA — Decreto nº 2.596/1998;
- NORMAM-301/DPC;
- NORMAM-201/DPC (cobertura parcial);
- NORMAM-204/DPC (cobertura parcial);
- NORMAM-211/DPC (cobertura parcial).

NORMAM-202, NORMAM-212, NPCP e NPCF não podem ser tratadas como fontes instaladas/validadas enquanto não houver arquivo e corpus auditado correspondente.

## Barreiras jurídicas

Preserve os ADR-005 a ADR-007.

- Não conformidade não gera automaticamente Auto de Infração, apreensão, retirada de tráfego, impedimento de saída ou outro procedimento.
- `legalFindingEngine` só aceita regra com fonte completa.
- Procedimento administrativo exige confirmação humana e mantém número interno separado do número oficial.
- Rascunho de documento não é documento emitido.
- QR lido não autentica documento.
- Campo extraído por QR/imagem/PDF nunca deve nascer `confirmedByUser: true`.
- Alteração/regularização de achado deve preservar trilha de auditoria.

## Inspeção assistida

O rascunho operacional tem dez etapas definidas em `src/domain/inspection/inspectionModel.js`:

1. Cenário;
2. Embarcação;
3. Condutor;
4. Tripulação;
5. Documentação;
6. Segurança/aplicabilidade;
7. Inspeção/checklist;
8. Não conformidades;
9. Revisão;
10. Conclusão.

O motor de aplicabilidade escolhe **módulos e fontes candidatas**; não declara infrações. `buildDynamicChecklist` só marca `referenceStatus: 'verified'` quando há chunk auditado compatível com o contexto. Os demais itens continuam `pending` e exibem `Fundamentação normativa não localizada.`.

Itens podem exigir evidência fotográfica quando o inspetor ativa `photoRequired`. O avanço deve bloquear apenas nesses itens configurados, sem tornar foto obrigatória globalmente.

## Documentos e QR

- `qrPayloadParser.js` aceita JSON, chave/valor e formato posicional reconhecido.
- Dados de QR estruturado entram como `extractedFields` com confiança alta, mas sem confirmação humana.
- QR em câmera ao vivo e em imagem importada é suportado.
- `Camera.scanFromURLAsync` recebe imagem; o app não deve fingir que lê QR diretamente de PDF sem uma etapa real de rasterização compatível com Expo.
- `officialDocumentVerificationProvider` continua declarando validação oficial indisponível até existir uma integração oficialmente documentada.

## Segurança e armazenamento

- Perfil, inspeções, histórico, cadastros e evidências podem conter dados sensíveis.
- Não introduza envio externo desses dados sem desenho explícito de segurança, consentimento e governança.
- Não remova backup local, migrações de schema ou avisos de falha de persistência.
- Evite operações assíncronas que possam substituir estado mais novo por snapshot antigo; salve/avance de forma serializada quando as operações dependem entre si.
- O painel de segurança de dados mede o diretório local do app e informa idade do último backup manual.

## Dependências e vulnerabilidades

Compatibilidade com Expo SDK 54 é requisito atual. `npm audit` pode reportar vulnerabilidades transitivas cuja correção completa recomenda atualização incompatível do Expo. Não execute `npm audit fix --force` automaticamente.

Para mudança de dependência:

1. confirmar necessidade real;
2. usar `npx expo install` quando aplicável;
3. rodar `npx expo install --check`;
4. rodar `npx expo-doctor`;
5. rodar `npm test`;
6. revisar diferenças de `npm audit --omit=dev` e `npm audit`.

## Builds

`eas.json` possui perfis `development`, `preview` e `production`. O Android `preview` usa APK e produção usa App Bundle.

Build EAS cloud exige conta Expo/token. iOS físico/TestFlight também exige credenciais Apple. Nunca invente link de build, certificado, provisioning profile ou status de submissão.

Há um workflow manual de tentativa de preview que registra explicitamente bloqueios de autenticação. O README contém os comandos e o passo a passo de instalação.

## Qualidade e entrega

Antes de considerar uma mudança concluída:

- rode a suíte Jest;
- rode Expo Doctor;
- verifique compatibilidade das dependências;
- se tocar em corpus normativo, reproduza a auditoria dos PDFs;
- se tocar em armazenamento, teste recuperação/concorrência/migração;
- se tocar em inspeção, teste retomada de rascunho;
- se tocar em câmera/localização/compartilhamento, valide em build nativo quando as credenciais/ambiente permitirem;
- não altere testes apenas para esconder um defeito real.

Consulte `docs/test-plan.md` e `docs/release-checklist.md` para o checklist completo de campo e distribuição.
