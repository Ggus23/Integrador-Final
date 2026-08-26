import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Brain, Sparkles, Info, HelpCircle } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { styles } from '../theme/styles';
import { api } from '../services/api';
import { EMOTION_THEMES } from '../constants/data';
import { ChameleonBackground } from '../components/ChameleonBackground';
import { EmotionalParticles } from '../components/EmotionalParticles';

const theme = EMOTION_THEMES['Neutral'];

export function StatsScreen() {
  const [wordCloud, setWordCloud] = useState([]);
  const [phraseCloud, setPhraseCloud] = useState([]);
  const [loading, setLoading] = useState(true);
  const [phraseLimit, setPhraseLimit] = useState(5);
  const [showHelp, setShowHelp] = useState(true);

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try {
      const [words, phrases] = await Promise.all([
        api.getWordCloud(),
        api.getPhraseCloud()
      ]);
      setWordCloud(words);
      setPhraseCloud(phrases);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const getSentimentColor = (sentiment) => {
    const s = sentiment?.toLowerCase() || '';
    if (s.includes('muy feliz') || s.includes('feliz')) return '#22C55E';
    if (s.includes('neutral') || s.includes('indiferente')) return '#FACC15';
    if (s.includes('ansioso') || s.includes('estresado')) return '#F97316';
    if (s.includes('triste') || s.includes('muy triste')) return '#EF4444';
    return theme.accent;
  };

  return (
    <ChameleonBackground emotionLabel="Neutral">
      <EmotionalParticles emotionColor={theme.accent} intensity={1} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ── HEADER CON EXPLICACIÓN ── */}
        <View style={styles.header}>
          <Text style={[styles.headerLabel, { color: theme.accent }]}>ANÁLISIS DE IA</Text>
          <Text style={styles.headerTitle}>Tu Mapa Mental</Text>
          <Text style={mStyles.headerDesc}>
            Aquí puedes visualizar un análisis inteligente de todo lo que has escrito en tu diario. La IA identifica patrones en tus palabras y emociones.
          </Text>
        </View>

        {/* ── TARJETA DE AYUDA: CÓMO FUNCIONA ── */}
        {showHelp && (
          <View style={[mStyles.helpCard, { borderColor: theme.accent + '30' }]}>
            <View style={mStyles.helpHeader}>
              <View style={[mStyles.helpIconWrap, { backgroundColor: theme.accent + '20' }]}>
                <HelpCircle size={18} color={theme.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[mStyles.helpTitle, { color: theme.accent }]}>¿Cómo funciona el Mapa Mental?</Text>
              </View>
              <TouchableOpacity onPress={() => setShowHelp(false)} style={mStyles.helpClose}>
                <Text style={mStyles.helpCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={mStyles.helpBody}>
              <View style={mStyles.helpStep}>
                <Text style={mStyles.helpStepNum}>1</Text>
                <Text style={mStyles.helpStepText}>
                  <Text style={mStyles.helpBold}>Escribes en tu diario</Text> — Cada vez que registras lo que sucedió en tu día, la IA analiza las palabras que usas.
                </Text>
              </View>
              <View style={mStyles.helpStep}>
                <Text style={mStyles.helpStepNum}>2</Text>
                <Text style={mStyles.helpStepText}>
                  <Text style={mStyles.helpBold}>Se identifican patrones</Text> — Las palabras y frases que más repites se destacan con mayor tamaño y color.
                </Text>
              </View>
              <View style={mStyles.helpStep}>
                <Text style={mStyles.helpStepNum}>3</Text>
                <Text style={mStyles.helpStepText}>
                  <Text style={mStyles.helpBold}>Los colores indican emociones</Text> — Verde = positivo, Amarillo = neutral, Naranja = ansioso/estresado, Rojo = triste.
                </Text>
              </View>
            </View>

            <Text style={mStyles.helpTip}>
              💡 Cuanto más escribas en tu diario, más preciso será tu mapa mental.
            </Text>
          </View>
        )}

        {/* ── BOTÓN MOSTRAR AYUDA ── */}
        {!showHelp && (
          <TouchableOpacity onPress={() => setShowHelp(true)} style={mStyles.showHelpBtn}>
            <HelpCircle size={14} color={theme.accent} />
            <Text style={[mStyles.showHelpText, { color: theme.accent }]}>¿Cómo funciona?</Text>
          </TouchableOpacity>
        )}

        {loading ? (
          <View style={styles.loadingStats}>
            <ActivityIndicator color={theme.accent} size="large" />
            <Text style={styles.loadingStatsText}>Analizando tus pensamientos...</Text>
          </View>
        ) : (
          <View style={styles.statsGap}>

            {/* ═══════════════════════════════════════════ */}
            {/* ── SECCIÓN 1: CONCEPTOS CLAVE (PALABRAS) ── */}
            {/* ═══════════════════════════════════════════ */}
            <View style={[styles.card, { backgroundColor: theme.surface, paddingBottom: 20 }]}>
              <View style={styles.cardTitleRow}>
                <Brain size={14} color={theme.accent} />
                <Text style={[styles.cardLabelTitle, { color: theme.accent }]}>CONCEPTOS CLAVE</Text>
              </View>
              
              <Text style={mStyles.sectionDesc}>
                Las palabras que más usas en tu diario. El tamaño indica frecuencia y el color refleja la emoción asociada.
              </Text>

              <View style={styles.cloudGrid}>
                {wordCloud.length > 0 ? wordCloud.slice(0, 30).map((w, i) => (
                  <Text key={i} style={[
                    styles.cloudWord, 
                    { 
                      fontSize: Math.min(12 + w.frequency * 5, 26), 
                      fontFamily: w.frequency > 2 ? 'NotoSerif_700Bold' : 'NotoSerif_400Regular_Italic',
                      opacity: Math.min(0.4 + w.frequency * 0.2, 1),
                      color: getSentimentColor(w.sentiment)
                    }
                  ]}>
                    {w.word}
                  </Text>
                )) : (
                  <View style={mStyles.emptyState}>
                    <Text style={mStyles.emptyEmoji}>🧠</Text>
                    <Text style={mStyles.emptyTitle}>Aún no hay conceptos</Text>
                    <Text style={styles.emptyCloudText}>Escribe más en tu diario para que la IA pueda identificar las palabras que más usas.</Text>
                  </View>
                )}
              </View>

              {/* Leyenda de colores */}
              {wordCloud.length > 0 && (
                <>
                  <Text style={mStyles.legendTitle}>¿Qué significan los colores?</Text>
                  <View style={styles.legendRow}>
                    {[
                      {l: 'Positivo', c: '#22C55E'}, 
                      {l: 'Neutral', c: '#FACC15'}, 
                      {l: 'Ansioso', c: '#F97316'}, 
                      {l: 'Triste', c: '#EF4444'}
                    ].map((leg, i) => (
                      <View key={i} style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: leg.c, width: 8, height: 8, borderRadius: 4 }]} />
                        <Text style={styles.legendText}>{leg.l}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>

            {/* ═══════════════════════════════════════════ */}
            {/* ── SECCIÓN 2: FRASES RECURRENTES ── */}
            {/* ═══════════════════════════════════════════ */}
            <View style={[styles.card, { backgroundColor: theme.surface }]}>
              <View style={styles.cardTitleRow}>
                <Sparkles size={14} color={theme.accent} />
                <Text style={[styles.cardLabelTitle, { color: theme.accent }]}>FRASES RECURRENTES</Text>
              </View>

              <Text style={mStyles.sectionDesc}>
                Las frases o expresiones que repites con frecuencia en tu diario. El número indica cuántas veces las has usado.
              </Text>

              <View style={styles.phraseList}>
                {phraseCloud.length > 0 ? (
                  <>
                    {phraseCloud.slice(0, phraseLimit).map((p, i) => (
                      <View key={i} style={[styles.phraseItem, { backgroundColor: COLORS.surface }]}>
                        <View style={[
                          styles.phraseFreqDot, 
                          { 
                            backgroundColor: getSentimentColor(p.sentiment),
                            transform: [{scale: 0.5 + p.frequency * 0.1}] 
                          }
                        ]} />
                        <Text style={styles.phraseText}>{p.phrase}</Text>
                        <View style={mStyles.freqBadge}>
                          <Text style={[mStyles.freqBadgeText, { color: getSentimentColor(p.sentiment) }]}>{p.frequency}x</Text>
                        </View>
                      </View>
                    ))}
                    
                    {phraseCloud.length > phraseLimit && (
                      <TouchableOpacity onPress={() => setPhraseLimit(prev => prev + 5)} style={styles.moreBtn}>
                        <Text style={[styles.moreBtnText, { color: theme.accent }]}>EXPLORAR MÁS FRASES ({phraseCloud.length - phraseLimit} restantes)</Text>
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <View style={mStyles.emptyState}>
                    <Text style={mStyles.emptyEmoji}>💬</Text>
                    <Text style={mStyles.emptyTitle}>Aún no hay frases</Text>
                    <Text style={styles.emptyCloudText}>Sigue escribiendo en tu diario para que la IA detecte las frases que más repites.</Text>
                  </View>
                )}
              </View>
            </View>

            {/* ── NOTA INFORMATIVA ── */}
            <View style={mStyles.infoNote}>
              <Info size={14} color="rgba(255,255,255,0.3)" />
              <Text style={mStyles.infoNoteText}>
                Este análisis se genera automáticamente con inteligencia artificial a partir de tus registros del diario. No reemplaza la opinión de un profesional de salud mental.
              </Text>
            </View>
          </View>
        )}

        {/* Bottom spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </ChameleonBackground>
  );
}

const mStyles = StyleSheet.create({
  headerDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontFamily: 'Manrope_400Regular',
    marginTop: 8,
    lineHeight: 20,
  },

  // Help card
  helpCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 20,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  helpIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpTitle: {
    fontSize: 14,
    fontFamily: 'Manrope_800ExtraBold',
  },
  helpClose: {
    padding: 8,
  },
  helpCloseText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 16,
  },
  helpBody: {
    gap: 14,
    marginBottom: 16,
  },
  helpStep: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  helpStepNum: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Manrope_800ExtraBold',
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    overflow: 'hidden',
  },
  helpStepText: {
    flex: 1,
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
    lineHeight: 19,
  },
  helpBold: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'Manrope_800ExtraBold',
  },
  helpTip: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Show help button
  showHelpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
    paddingVertical: 8,
  },
  showHelpText: {
    fontSize: 12,
    fontFamily: 'Manrope_600SemiBold',
  },

  // Section descriptions
  sectionDesc: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
    lineHeight: 18,
    marginBottom: 16,
    marginTop: -8,
    textAlign: 'center',
    paddingHorizontal: 8,
  },

  // Legend
  legendTitle: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 9,
    fontFamily: 'Manrope_800ExtraBold',
    textAlign: 'center',
    marginTop: 16,
    letterSpacing: 1,
  },

  // Frequency badge
  freqBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  freqBadgeText: {
    fontSize: 11,
    fontFamily: 'Manrope_800ExtraBold',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 12,
  },
  emptyTitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
    fontFamily: 'Manrope_800ExtraBold',
    marginBottom: 6,
  },

  // Info note
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  infoNoteText: {
    flex: 1,
    color: 'rgba(255,255,255,0.25)',
    fontSize: 11,
    fontFamily: 'Manrope_400Regular',
    lineHeight: 17,
    fontStyle: 'italic',
  },
});
