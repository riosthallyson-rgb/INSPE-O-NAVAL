# Publicações do Inspetor Naval

Coloque aqui os textos das publicações usadas pela Bússola.

Cada publicação deve ser carregada em `src/data/publications.js` no formato:

- id: identificador único
- title: título da publicação
- source: nome da fonte ou publicação
- content: texto completo da publicação
- file: `require('../../assets/docs/<arquivo>.pdf')` para incluir o PDF no app
- searchable: false (opcional) para documentos que não podem ser pesquisados automaticamente

O aplicativo consulta apenas estas publicações para gerar respostas e citações. Documentos PDF anexados em `assets/docs/` também são exibidos como fonte e podem ser abertos diretamente a partir da lista de publicações.
