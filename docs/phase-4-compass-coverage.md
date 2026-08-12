# Fase 4 — cobertura da Bússola 2.0

## Corpus autorizado nesta entrega

| Fonte | Versão auditada | Chunks | Status |
|---|---|---:|---|
| RLESTA — Decreto nº 2.596/1998 | PDF local auditado em 08/08/2026 | 6 | CURRENT_VERIFIED |
| NORMAM-301/DPC | 2026 | 10 | CURRENT_VERIFIED |

Total: 16 chunks, todos com seção, página PDF, excerto auditado e hash da fonte. Excerto normalizado e `officialText` são campos distintos; texto oficial só deve ser exibido quando houver transcrição literal conferida. Os demais PDFs embarcados continuam com estado pendente e não são usados pela Bússola.

## Famílias cobertas

- condução sem habilitação;
- não portar CHA/CIR;
- CHA/CIR vencida em até cinco anos;
- CHA/CIR vencida há mais de cinco anos;
- embarcação não inscrita ou registrada, sem TIE/PRPM;
- embarcação inscrita que não porta TIE/PRPM;
- conceitos auditados de retirada de tráfego e impedimento de saída.

## Validação

- 30 cenários automatizados classificados como resposta fundamentada, esclarecimento obrigatório ou recusa segura;
- perguntas sem regra estruturada retornam zero citações;
- chunks sem fonte, seção ou página são descartados;
- simulações de estado operacional não alteram a inspeção real;
- histórico local limita-se a 50 entradas e remove CPF/CNPJ reconhecível.

## Limitações

- NORMAM-201, 204 e 211 ainda não possuem chunks validados para a Bússola;
- NORMAM-202, 212, NPCP e NPCF não estão presentes no projeto;
- tabelas e páginas digitalizadas ainda não têm parser específico;
- abertura em `#page=` depende do visualizador de PDF do aparelho;
- embeddings locais não foram adotados: para 16 chunks, full-text, aliases e Rule Engine oferecem menor tamanho e maior auditabilidade;
- o índice é estático e embarcado; atualização automática de normas ainda não foi implementada.
