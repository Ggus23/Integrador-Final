import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Clock, Filter, BookOpen, Lightbulb, Tag } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { styles } from '../theme/styles';
import { api } from '../services/api';
import { EMOTIONS, EMOTION_THEMES } from '../constants/data';
import { ChameleonBackground } from '../components/ChameleonBackground';
import { EmotionalParticles } from '../components/EmotionalParticles';

const theme = EMOTION_THEMES['Neutral'];

export function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emotionFilter, setEmotionFilter] = useState(null);
  const [limit, setLimit] = useState(5);

  useEffect(() => { load(); }, []);
  const load = async () => { setHistory(await api.getDiaryHistory()); setLoading(false); };

  const filtered = useMemo(() => {
    if (!emotionFilter) return history;
    return history.filter(item => item.emotion === emotionFilter);
  }, [history, emotionFilter]);

  return (
    <ChameleonBackground emotionLabel="Neutral">
      <EmotionalParticles emotionColor={theme.accent} intensity={1} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ── HEADER CON EXPLICACIÓN ── */}
        <View style={styles.header}>
          <Text style={[styles.headerLabel, { color: theme.accent }]}>MI HISTORIAL</Text>
          <Text style={styles.headerTitle}>Tus registros anteriores</Text>
          <Text style={hStyles.headerDesc}>
            Aquí puedes revisar todo lo que has escrito en tu diario. Cada tarjeta muestra tu emoción, lo que sucedió, tu reflexión y las actividades que realizaste ese día.
          </Text>
        </View>

        {/* ── FILTROS CON EXPLICACIÓN ── */}
        <View style={hStyles.filterSection}>
          <View style={hStyles.filterHeader}>
            <Filter size={14} color={theme.accent} />
            <Text style={[hStyles.filterTitle, { color: theme.accent }]}>FILTRAR POR EMOCIÓN</Text>
          </View>
          <Text style={hStyles.filterDesc}>
            Toca una emoción para ver solo los días en que te sentiste así
          </Text>
        </View>
        
        <View style={styles.filterScrollContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            <TouchableOpacity 
              onPress={() => setEmotionFilter(null)}
              style={[styles.filterChip, !emotionFilter && { backgroundColor: theme.accent, borderColor: theme.accent }]}
            >
              <Text style={[styles.filterChipText, !emotionFilter && { color: COLORS.background }]}>TODOS</Text>
            </TouchableOpacity>
            {EMOTIONS.map(emo => (
              <TouchableOpacity 
                key={emo.label}
                onPress={() => setEmotionFilter(emo.label)}
                style={[styles.filterChip, emotionFilter === emo.label && { backgroundColor: emo.themeColor, borderColor: emo.themeColor }]}
              >
                <Text style={styles.filterEmoji}>{emo.emoji}</Text>
                <Text style={[styles.filterChipText, emotionFilter === emo.label && { color: '#fff' }]}>{emo.label?.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── CONTADOR DE RESULTADOS ── */}
        {!loading && (
          <View style={hStyles.resultCount}>
            <Text style={hStyles.resultCountText}>
              {filtered.length} registro{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
              {emotionFilter ? ` con "${emotionFilter}"` : ''}
            </Text>
          </View>
        )}

        {/* ── LISTA DE REGISTROS ── */}
        {loading ? <ActivityIndicator color={theme.accent} style={{marginTop: 50}} /> : (
          <View style={styles.historyList}>
            {filtered.length === 0 ? (
              <View style={hStyles.emptyState}>
                <Text style={hStyles.emptyEmoji}>📓</Text>
                <Text style={hStyles.emptyTitle}>
                  {emotionFilter ? `Sin registros "${emotionFilter}"` : 'Tu historial está vacío'}
                </Text>
                <Text style={hStyles.emptyDesc}>
                  {emotionFilter 
                    ? 'Prueba quitando el filtro o seleccionando otra emoción.' 
                    : 'Cuando escribas en tu diario, tus registros aparecerán aquí para que puedas revisarlos.'}
                </Text>
              </View>
            ) : (
              <>
                {filtered.slice(0, limit).map((item, idx) => {
                  const emo = EMOTIONS.find(e => e.label === item.emotion) || EMOTIONS[2];
                  
                  // Separar experiencia de aprendizaje
                  let exp = item.experience || '';
                  let lrn = '';
                  if (exp.includes('PASÓ HOY:') && exp.includes('APRENDIZAJES:')) {
                    const parts = exp.split('APRENDIZAJES:');
                    exp = parts[0].replace('PASÓ HOY:', '').trim();
                    lrn = parts[1].trim();
                  }

                  return (
                    <View key={item.id || idx} style={[styles.histCard, { backgroundColor: theme.surface }]}>
                      <View style={[styles.histBar, { backgroundColor: emo.themeColor }]} />
                      <View style={styles.histContent}>
                        {/* Fecha y emoción */}
                        <View style={styles.histTop}>
                          <View style={hStyles.dateRow}>
                            <Clock size={10} color="rgba(255,255,255,0.3)" />
                            <Text style={styles.histDate}>{new Date(item.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                          </View>
                          <View style={[styles.histBadge, { backgroundColor: emo.themeColor + '20' }]}>
                            <Text style={[styles.histMood, {color: emo.themeColor}]}>{emo.emoji} {item.emotion?.toUpperCase()}</Text>
                          </View>
                        </View>
                        
                        {/* Lo que sucedió */}
                        <View style={styles.histSection}>
                          <View style={hStyles.sectionTitleRow}>
                            <BookOpen size={10} color={theme.accent} />
                            <Text style={[styles.histSectionTitle, { color: theme.accent }]}>LO QUE SUCEDIÓ</Text>
                          </View>
                          <Text style={styles.histExp}>{exp}</Text>
                        </View>
                        
                        {/* Reflexión */}
                        {lrn ? (
                          <View style={[styles.histSection, { marginTop: 12, borderLeftWidth: 2, borderLeftColor: 'rgba(255,255,255,0.1)', paddingLeft: 10 }]}>
                            <View style={hStyles.sectionTitleRow}>
                              <Lightbulb size={10} color={theme.accent} />
                              <Text style={[styles.histSectionTitle, { color: theme.accent }]}>REFLEXIÓN</Text>
                            </View>
                            <Text style={[styles.histExp, { fontStyle: 'italic', opacity: 0.8 }]}>{lrn}</Text>
                          </View>
                        ) : null}

                        {/* Actividades */}
                        {item.activities ? (
                          <View style={styles.histActivities}>
                            <View style={hStyles.sectionTitleRow}>
                              <Tag size={10} color="rgba(255,255,255,0.3)" />
                              <Text style={[styles.histSectionTitle, { color: 'rgba(255,255,255,0.3)' }]}>ACTIVIDADES</Text>
                            </View>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                              {item.activities.split(',').map((act, i) => (
                                <View key={i} style={styles.miniChip}>
                                  <Text style={styles.miniChipText}>{act.trim()?.toUpperCase()}</Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  );
                })}
                
                {filtered.length > limit && (
                  <TouchableOpacity onPress={() => setLimit(prev => prev + 5)} style={styles.moreBtn}>
                    <Text style={[styles.moreBtnText, { color: theme.accent }]}>VER MÁS REGISTROS ({filtered.length - limit} restantes)</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}

        {/* Bottom spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </ChameleonBackground>
  );
}

const hStyles = StyleSheet.create({
  headerDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontFamily: 'Manrope_400Regular',
    marginTop: 8,
    lineHeight: 20,
  },
  filterSection: {
    marginBottom: 10,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  filterTitle: {
    fontSize: 9,
    fontFamily: 'Manrope_800ExtraBold',
    letterSpacing: 2,
  },
  filterDesc: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontFamily: 'Manrope_400Regular',
    marginBottom: 6,
  },
  resultCount: {
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  resultCountText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    fontFamily: 'Manrope_600SemiBold',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 16,
  },
  emptyTitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    fontFamily: 'Manrope_800ExtraBold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyDesc: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 13,
    fontFamily: 'Manrope_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
});
