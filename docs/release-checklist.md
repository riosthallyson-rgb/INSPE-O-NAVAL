# Checklist de distribuição

## Antes do build

- Executar `npm ci`, `npx expo install --check`, `npx expo-doctor` e `npm test`.
- Executar `npm audit --omit=dev` e revisar vulnerabilidades transitivas sem usar `npm audit fix --force` automaticamente.
- Confirmar `version`, `android.versionCode` e `ios.buildNumber` em `app.json`.
- Confirmar `android.package` e `ios.bundleIdentifier`.
- Confirmar que `assets/icon.png`, `assets/adaptive-icon.png`, `assets/splash.png` e `assets/favicon.png` existem e são os ativos aprovados para a entrega.
- Confirmar que nenhum checklist pendente aparece como referência validada.
- Reexecutar `.github/workflows/pdf-audit.yml` quando qualquer PDF ou chunk normativo auditado mudar.
- Executar o plano de testes de campo em `docs/test-plan.md`.
- Revisar nome público, política de privacidade e identidade visual com o responsável institucional. Os ativos atuais são neutros e não usam brasão ou marca oficial.

## Credenciais necessárias

- EAS cloud build exige autenticação Expo. Em CI, configure o secret `EXPO_TOKEN` somente em repositório/ambiente autorizado.
- Android de produção exige credencial de assinatura válida.
- iOS físico/TestFlight exige Apple Developer, certificado e perfil de provisionamento adequados.
- Não copie tokens, certificados, senhas ou chaves para o repositório.

## Builds

Desenvolvimento:

```bash
npx eas build --profile development --platform android
npx eas build --profile development --platform ios
```

Homologação/preview:

```bash
npx eas build --profile preview --platform android
npx eas build --profile preview --platform ios
```

Produção:

```bash
npx eas build --profile production --platform android
npx eas build --profile production --platform ios
```

O perfil `preview` Android gera APK. A distribuição interna iOS depende de provisionamento dos dispositivos; TestFlight requer submissão do build à Apple e não é equivalente ao simples perfil interno do EAS.

## Critérios de liberação

- CI verde no commit exato da entrega.
- Expo Doctor aprovado.
- Jest 100% aprovado.
- Build Android/iOS correspondente à entrega concluído, ou bloqueio de credenciais explicitamente registrado.
- Pelo menos um APK/build nativo aberto sem crash em teste controlado antes de declarar a versão pronta para campo.
- Fluxo principal testado em modo avião.
- Backup/exportação e reimportação testados com dados fictícios.
- Câmera, QR, localização e compartilhamento testados em dispositivo físico.
- Nenhuma publicação é tratada como integralmente validada apenas porque alguns chunks foram auditados para a Bússola.

Não publique, submeta à loja nem distribua externamente sem aprovação do responsável pelo produto e das credenciais institucionais aplicáveis.
