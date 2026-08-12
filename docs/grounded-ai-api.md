# Contrato do assistente fundamentado da Bússola

O aplicativo nunca deve receber uma chave de provedor de IA. Configure apenas a URL HTTPS do proxy protegido em `EXPO_PUBLIC_GROUNDED_AI_URL`.

## Requisição

`POST` JSON com `question`, `instruction` e `evidence`. Cada evidência contém `id`, título, arquivo, edição, localização e trecho recuperado localmente.

## Resposta

```json
{
  "answer": "Resposta limitada às evidências fornecidas.",
  "citationIds": ["normam-301"]
}
```

O servidor deve recusar quando as evidências forem insuficientes. O aplicativo rejeita respostas vazias ou sem ao menos uma citação pertencente ao conjunto enviado e, nesses casos, mantém a pesquisa local.
