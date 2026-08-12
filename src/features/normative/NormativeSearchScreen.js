import React, { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Button, Card, EmptyState, SectionHeader, StatusBadge } from '../../components';
import { getTheme } from '../../theme/tokens';
import { NORMATIVE_CHUNKS, VERIFIED_COMPASS_SOURCES } from '../../legal/corpus/normativeCorpus';
import { getCompassCorpusCoverage } from '../../legal/corpus/corpusCoverage';
import { NAVAL_GLOSSARY } from '../../legal/corpus/navalGlossary';

export const NormativeSearchScreen = ({
  question,
  result,
  isSearching,
  quickQuestions,
  isDarkMode,
  onChangeQuestion,
  onSearch,
  onQuickSearch,
  onOpenPublication,
  currentInspection,
  useInspectionContext,
  onToggleInspectionContext,
  history = [],
  onReopenHistory,
  onDeleteHistory,
  onSimulate,
}) => {
  const { colors, radii, spacing, typography } = getTheme(isDarkMode);
  const coverage = getCompassCorpusCoverage({ sources: VERIFIED_COMPASS_SOURCES, chunks: NORMATIVE_CHUNKS });
  const [showCoverage, setShowCoverage] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [showAnswerDetails, setShowAnswerDetails] = useState(false);
  useEffect(() => { setShowAnswerDetails(false); setShowDebug(false); }, [result.generatedAt]);

  return (
    <View style={{ marginBottom: spacing.xl }}>
      <SectionHeader
        title="Bússola Normativa"
        description="Respostas baseadas somente nas publicações locais auditadas."
        darkMode={isDarkMode}
      />
      <Card darkMode={isDarkMode} variant="outlined" accessibilityRole="alert"><Text style={[typography.bodyStrong, { color: colors.text }]}>{coverage.sourceCount} fontes · {coverage.validatedChunkCount} trechos auditados · Disponível offline</Text><Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>A Bússola recusa respostas sem evidências locais. Confira o PDF antes de fundamentar uma ação.</Text><Button label={showCoverage ? 'Ocultar cobertura' : 'Ver cobertura da Bússola'} variant="ghost" darkMode={isDarkMode} onPress={() => setShowCoverage((current) => !current)} style={{ marginTop: spacing.sm }} /></Card>
      {showCoverage ? <Card darkMode={isDarkMode} variant="outlined"><Text style={[typography.cardTitle, { color: colors.text }]}>Cobertura da Bússola</Text><Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>Percentual indexado não representa interpretação jurídica completa.</Text>{coverage.sources.map((source) => <View key={source.sourceId} style={{ marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border }}><Text style={[typography.bodyStrong, { color: colors.text }]}>{source.title}</Text><Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>Versão: {source.version} · chunks indexados: {source.indexedChunks} · estado: {source.status}</Text></View>)}<Text style={[typography.caption, { color: coverage.citationErrors ? colors.nonConform : colors.conform, marginTop: spacing.md }]}>Erros estruturais de citação: {coverage.citationErrors}</Text></Card> : null}
      <Button label={showGlossary ? 'Ocultar Glossário Naval' : 'Abrir Glossário Naval'} variant="secondary" darkMode={isDarkMode} onPress={() => setShowGlossary((current) => !current)} style={{ marginBottom: spacing.md }} />
      {showGlossary ? <Card darkMode={isDarkMode} variant="outlined"><Text style={[typography.cardTitle, { color: colors.text }]}>Glossário Naval</Text><Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>Definições literais da publicação auditada, acompanhadas de explicação auxiliar.</Text>{NAVAL_GLOSSARY.map((entry) => <View key={entry.id} style={{ marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border }}><Text style={[typography.bodyStrong, { color: colors.text }]}>{entry.term}</Text><Text style={[typography.body, { color: colors.text, marginTop: spacing.sm }]}>{entry.officialText}</Text><Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.sm }]}>{entry.plainLanguageExplanation}</Text><Text style={[typography.caption, { color: colors.action, marginTop: spacing.sm }]}>{entry.sourceTitle} · {entry.section} · PDF p. {entry.page}</Text></View>)}</Card> : null}
      {currentInspection ? <Card darkMode={isDarkMode} variant="outlined"><StatusBadge status={useInspectionContext ? 'verificado' : 'pendente'} darkMode={isDarkMode} /><Text style={[typography.bodyStrong, { color: colors.text, marginTop: spacing.sm }]}>{useInspectionContext ? 'Análise da inspeção' : 'Consulta geral'}</Text><Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>{currentInspection.vessel?.name || 'Embarcação não identificada'} · {currentInspection.context?.vesselOperationalState || 'Situação não informada'} · {currentInspection.vessel?.vesselUse || 'Emprego não informado'}</Text><Button label={useInspectionContext ? 'Ignorar contexto nesta consulta' : 'Usar contexto da inspeção'} variant="secondary" darkMode={isDarkMode} onPress={onToggleInspectionContext} style={{ marginTop: spacing.md }} /></Card> : <Text style={[typography.label, { color: colors.action, marginBottom: spacing.md }]}>CONSULTA GERAL</Text>}
      <TextInput
        value={question}
        onChangeText={onChangeQuestion}
        placeholder="Pergunte sobre uma situação de Inspeção Naval"
        placeholderTextColor={colors.textMuted}
        multiline
        accessibilityLabel="Pergunta para a Bússola"
        style={[
          typography.body,
          {
            minHeight: 112,
            padding: spacing.md,
            borderRadius: radii.control,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            color: colors.text,
            textAlignVertical: 'top',
          },
        ]}
      />
      <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.md, marginBottom: spacing.sm }]}>
        Consultas rápidas
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {quickQuestions.map((quickQuestion) => (
          <Pressable
            key={quickQuestion}
            onPress={() => onQuickSearch(quickQuestion)}
            accessibilityRole="button"
            accessibilityLabel={`Consulta rápida: ${quickQuestion}`}
            style={({ pressed }) => ({
              minHeight: 44,
              justifyContent: 'center',
              paddingHorizontal: spacing.md,
              borderRadius: radii.pill,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surfaceElevated,
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <Text style={[typography.caption, { color: colors.primary }]}>{quickQuestion}</Text>
          </Pressable>
        ))}
      </View>
      <Button
        label="Analisar nas publicações"
        onPress={() => onSearch()}
        loading={isSearching}
        darkMode={isDarkMode}
        style={{ marginTop: spacing.lg }}
      />

      {!result.answer ? (
        <View style={{ marginTop: spacing.lg }}>
          <EmptyState
            title="Pronta para pesquisar"
            description="Digite uma dúvida ou selecione uma consulta rápida. A pesquisa ocorre somente nos textos disponíveis no aplicativo."
            darkMode={isDarkMode}
          />
        </View>
      ) : (
        <View style={{ marginTop: spacing.xl }}>
          <SectionHeader title="Resposta fundamentada" darkMode={isDarkMode} />
          <Card darkMode={isDarkMode} variant="outlined">
            <StatusBadge status="Pesquisa local" darkMode={isDarkMode} />
            {result.isSimulation ? <Text style={[typography.label, { color: colors.pending, marginTop: spacing.sm }]}>SIMULAÇÃO · não altera a inspeção</Text> : null}
            <Text style={[typography.body, { color: colors.text, marginTop: spacing.md }]}>{result.answer}</Text>
            {result.assistantNotice ? (
              <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.sm }]}>
                {result.assistantNotice}
              </Text>
            ) : null}
            {!result.clarification && result.citations?.length ? <Button label={showAnswerDetails ? 'Ocultar detalhes' : 'Ver detalhes'} variant="secondary" darkMode={isDarkMode} onPress={() => setShowAnswerDetails((current) => !current)} style={{ marginTop: spacing.md }} /> : null}
          </Card>
          {result.clarification ? <Card darkMode={isDarkMode} variant="warning"><Text style={[typography.bodyStrong, { color: colors.text }]}>{result.clarification.question}</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md }}>{result.clarification.options.map((option) => <Button key={option} label={option} variant="secondary" darkMode={isDarkMode} onPress={() => onQuickSearch(`${question} ${option}`)} />)}</View></Card> : null}
          {showAnswerDetails ? <>
          {result.verificationSteps?.length ? <Card darkMode={isDarkMode} variant="outlined"><Text style={[typography.cardTitle, { color: colors.text }]}>O que verificar</Text>{result.verificationSteps.map((step) => <Text key={step} style={[typography.body, { color: colors.textMuted, marginTop: spacing.sm }]}>{step}</Text>)}</Card> : null}
          {result.possibleViolations?.length ? <Card darkMode={isDarkMode} variant="outlined"><Text style={[typography.cardTitle, { color: colors.text }]}>Possível enquadramento</Text>{result.possibleViolations.map((item) => <Text key={item} style={[typography.body, { color: colors.textMuted, marginTop: spacing.sm }]}>{item}</Text>)}</Card> : null}
          {result.possibleMeasures?.length ? <Card darkMode={isDarkMode} variant="warning"><Text style={[typography.cardTitle, { color: colors.text }]}>Possível medida administrativa</Text>{result.possibleMeasures.map((item) => <Text key={item} style={[typography.body, { color: colors.textMuted, marginTop: spacing.sm }]}>{item}</Text>)}<Text style={[typography.caption, { color: colors.pending, marginTop: spacing.md }]}>A Bússola localiza possibilidades. A medida somente pode ser adotada após análise e confirmação humana.</Text></Card> : null}
          {result.requiredDocuments?.length ? <Card darkMode={isDarkMode} variant="outlined"><Text style={[typography.cardTitle, { color: colors.text }]}>Documentos relacionados</Text>{result.requiredDocuments.map((item) => <Text key={item} style={[typography.body, { color: colors.textMuted, marginTop: spacing.sm }]}>{item}</Text>)}</Card> : null}
          {!result.insufficientEvidence && result.interpretedContext?.operationalState ? <Card darkMode={isDarkMode} variant="outlined"><Text style={[typography.bodyStrong, { color: colors.text }]}>E se a situação fosse diferente?</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md }}>{['Navegando', 'Atracada', 'Fundeada', 'Na boia'].filter((state) => state !== result.interpretedContext.operationalState).slice(0, 3).map((state) => <Button key={state} label={`E se estivesse ${state.toLowerCase()}?`} variant="secondary" darkMode={isDarkMode} onPress={() => onSimulate(state)} />)}</View></Card> : null}
          {result.summary.map((item, index) => (
            <Card key={`${item.title}-${index}`} darkMode={isDarkMode} variant="outlined">
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
                <Text style={[typography.cardTitle, { color: colors.text, flex: 1 }]}>{item.title}</Text>
                <StatusBadge
                  status={
                    item.verificationStatus === 'verified' && item.locator
                      ? 'verificado'
                      : 'validacao pendente'
                  }
                  darkMode={isDarkMode}
                />
              </View>
              <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.sm }]}>Arquivo: {item.source}</Text>
              <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>Edição: {item.edition}</Text>
              <Text style={[typography.body, { color: colors.text, marginTop: spacing.md }]}>{item.detail}</Text>
              {item.verificationStatus !== 'verified' || !item.locator ? (
                <Text style={[typography.caption, { color: colors.pending, marginTop: spacing.sm }]}>
                  Artigo e página pendentes de validação.
                </Text>
              ) : (
                <Text style={[typography.caption, { color: colors.conform, marginTop: spacing.sm }]}>{item.locator}</Text>
              )}
              {item.id ? (
                <Button
                  label="Abrir fonte"
                  variant="secondary"
                  darkMode={isDarkMode}
                  onPress={() => onOpenPublication(item.id, result.citations?.find((citation) => citation.sourceId === item.id)?.page)}
                  style={{ marginTop: spacing.md }}
                />
              ) : null}
            </Card>
          ))}
          {result.relatedQuestions?.length ? <Card darkMode={isDarkMode} variant="outlined"><Text style={[typography.cardTitle, { color: colors.text }]}>Perguntas relacionadas</Text>{result.relatedQuestions.map((related) => <Button key={related} label={related} variant="ghost" darkMode={isDarkMode} onPress={() => onQuickSearch(related)} style={{ marginTop: spacing.sm }} />)}</Card> : null}
          </> : null}
          {__DEV__ && result.debug ? <Card darkMode={isDarkMode} variant="outlined"><Button label={showDebug ? 'Ocultar construção da resposta' : 'Ver como a resposta foi construída'} variant="ghost" darkMode={isDarkMode} onPress={() => setShowDebug((current) => !current)} />{showDebug ? <View style={{ marginTop: spacing.md }}><Text style={[typography.caption, { color: colors.textMuted }]}>Consulta normalizada: {result.debug.normalizedQuery || '-'}</Text><Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>Aliases usados: {(result.debug.aliasesUsed || []).join(', ') || 'nenhum'}</Text><Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>Chunks recuperados: {(result.debug.retrievedChunkIds || []).join(', ') || 'nenhum'}</Text><Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>Regras acionadas: {(result.debug.ruleIds || []).join(', ') || 'nenhuma'}</Text><Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>Corpus: {result.corpusVersion || '-'}</Text></View> : null}</Card> : null}
        </View>
      )}
      {history.length ? <View style={{ marginTop: spacing.xl }}><SectionHeader title="Consultas recentes" description="Histórico armazenado somente neste dispositivo." darkMode={isDarkMode} />{history.slice(0, 5).map((entry) => <Card key={entry.id} darkMode={isDarkMode} variant="outlined"><Text style={[typography.bodyStrong, { color: colors.text }]}>{entry.title}</Text><Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>{new Date(entry.createdAt).toLocaleString('pt-BR')} · {entry.insufficientEvidence ? 'Fundamentação insuficiente' : 'Fundamentação localizada'}</Text><View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>{entry.question ? <Button label="Reabrir" variant="secondary" darkMode={isDarkMode} onPress={() => onReopenHistory(entry)} style={{ flex: 1 }} /> : null}<Button label="Excluir" variant="ghost" darkMode={isDarkMode} onPress={() => onDeleteHistory(entry.id)} style={{ flex: 1 }} /></View></Card>)}</View> : null}
    </View>
  );
};
