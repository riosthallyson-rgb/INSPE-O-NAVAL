# Fase 4 — cobertura da Bússola 2.0

## Corpus autorizado nesta entrega

| Fonte | Versão auditada | Chunks | Status |
|---|---|---:|---|
| RLESTA — Decreto nº 2.596/1998 | PDF local auditado em 08/08/2026 | 6 | CURRENT_VERIFIED |
| NORMAM-301/DPC | 2026 | 13 | CURRENT_VERIFIED |
| NORMAM-201/DPC | 2023 — 1ª Revisão; PDF embarcado auditado em 14/08/2026 | 2 | CURRENT_VERIFIED |
| NORMAM-204/DPC | 2025; PDF embarcado auditado em 14/08/2026 | 3 | CURRENT_VERIFIED |
| NORMAM-211/DPC | 2026 — Revisão 1; PDF embarcado auditado em 14/08/2026 | 3 | CURRENT_VERIFIED |

Total: 27 chunks. Cada chunk autorizado possui fonte, versão, página PDF e excerto conferido. Os hashes SHA-256 dos cinco PDFs são mantidos em `src/legal/corpus/normativeCorpus.js` e foram reproduzidos no GitHub Actions por `.github/workflows/pdf-audit.yml` antes da inclusão das novas regras.

O campo `verificationStatus` do catálogo geral de publicações continua independente: um PDF inteiro pode permanecer como validação pendente mesmo quando alguns trechos específicos foram auditados para a Bússola.

## Famílias cobertas

- condução sem habilitação;
- não portar CHA/CIR;
- CHA/CIR vencida em até cinco anos;
- CHA/CIR vencida há mais de cinco anos;
- embarcação não inscrita ou registrada, sem TIE/PRPM;
- embarcação inscrita que não porta TIE/PRPM;
- conceitos auditados de retirada de tráfego e impedimento de saída;
- dotação e localização de extintores conforme referência ao Anexo 4-F da NORMAM-201;
- apresentação de listas atualizadas de tripulantes, passageiros e PNT na navegação interior, nos cenários auditados da NORMAM-204;
- requisitos operacionais auditados para transbordo de pessoal em águas não abrigadas;
- limite de lotação em embarcação de esporte/recreio;
- conferência de coletes e boias na lista de vistoria inicial da NORMAM-211.

## Validação

- cenários automatizados classificam resposta fundamentada, esclarecimento obrigatório ou recusa segura;
- perguntas sem regra estruturada retornam zero citações;
- chunks sem fonte, versão, seção ou página são descartados;
- cada fonte auditada possui hash SHA-256 de 64 caracteres e data de conferência;
- simulações de estado operacional não alteram a inspeção real;
- histórico local da Bússola permanece limitado e passa pelo saneamento já existente para dados pessoais reconhecíveis.

## Limitações

- a cobertura das NORMAM-201, 204 e 211 é deliberadamente parcial; somente os trechos explicitamente auditados entram no corpus;
- NORMAM-202, NORMAM-212, NPCP e NPCF continuam sem fonte validada instalada e não podem fundamentar respostas;
- tabelas extensas, exceções por porte/AB/comprimento e páginas digitalizadas exigem auditoria específica antes de virarem regras;
- a Bússola não deve inferir quantidade exata de extintores, material de salvatagem ou requisito regional quando o contexto necessário não estiver representado em uma regra validada;
- abertura em `#page=` depende do visualizador de PDF do aparelho;
- embeddings locais não foram adotados: para o corpus atual, full-text, aliases e Rule Engine mantêm maior auditabilidade e menor complexidade operacional;
- o índice é estático e embarcado; atualização automática de normas ainda não foi implementada.
