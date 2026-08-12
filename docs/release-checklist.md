# Checklist de distribuição

## Antes do build

- Executar `npx expo install --check`, `npx expo-doctor` e `npm test`.
- Confirmar `version`, `android.versionCode` e `ios.buildNumber` em `app.json`.
- Confirmar que nenhum checklist pendente aparece como referência validada.
- Executar o plano de testes de campo em `docs/test-plan.md`.
- Revisar ícone, splash, nome público e política de privacidade com o responsável institucional.

## Builds

- Desenvolvimento: `npx eas build --profile development --platform android|ios`.
- Homologação: `npx eas build --profile preview --platform android|ios`.
- Produção: `npx eas build --profile production --platform android|ios`.

Os builds exigem conta Expo, credenciais de assinatura e, no iOS, acesso ao Apple Developer. Não publique nem envie artefatos sem aprovação do responsável.
