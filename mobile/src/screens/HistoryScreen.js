import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
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
        <View style={styles.header}>
          <Text style={[styles.headerLabel, { color: theme.accent }]}>MI BIBLIOTECA</Text>
          <Text style={styles.headerTitle}>Recuerdos</Text>
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

      {loading ? <ActivityIndicator color={theme.accent} style={{marginTop: 50}} /> : (
        <View style={styles.historyList}>
          {filtered.length === 0 ? (
            <View style={styles.emptyContainer}>
               <Text style={styles.emptyText}>No hay registros{emotionFilter ? ` con el sentir "${emotionFilter}"` : ""}.</Text>
            </View>
          ) : (
            <>
              {filtered.slice(0, limit).map((item, idx) => {
                const emo = EMOTIONS.find(e => e.label === item.emotion) || EMOTIONS[2];
                
                // Intentar separar experiencia de aprendizaje
                let exp = item.experience || '';
                let lrn = '';
                if (exp.includes('PASÓ HOY:') && exp.includes('APRENDIZAJES:')) {
                  const parts = exp.split('APRENDIZAJES:');
                  exp = parts[0].replace('PASÓ HOY:', '').trim();
                  lrn = parts[1].trim();
                }

                return (
                  <View key={item.id || idx} style={[styles.histCard, { backgroundColor: theme.surface }]}>
                    <View style={[styles.histBar, { backgroundColor: emo.themeColor } ]} />
                    <View style={styles.histContent}>
                      <View style={styles.histTop}>
                        <Text style={styles.histDate}>{new Date(item.date).toLocaleDateString()}</Text>
                        <View style={[styles.histBadge, { backgroundColor: emo.themeColor + '20' }]}>
                           <Text style={[styles.histMood, {color: emo.themeColor}]}>{emo.emoji} {item.emotion?.toUpperCase()}</Text>
                        </View>
                      </View>
                      
                      <View style={styles.histSection}>
                         <Text style={[styles.histSectionTitle, { color: theme.accent }]}>SUCEDIDO</Text>
                         <Text style={styles.histExp}>{exp}</Text>
                      </View>
                      
                      {lrn ? (
                        <View style={[styles.histSection, { marginTop: 12, borderLeftWidth: 2, borderLeftColor: 'rgba(255,255,255,0.1)', paddingLeft: 10 }]}>
                          <Text style={[styles.histSectionTitle, { color: theme.accent }]}>REFLEXIÓN</Text>
                          <Text style={[styles.histExp, { fontStyle: 'italic', opacity: 0.8 }]}>{lrn}</Text>
                        </View>
                      ) : null}

                      {item.activities ? (
                        <View style={styles.histActivities}>
                           {item.activities.split(',').map((act, i) => (
                             <View key={i} style={styles.miniChip}>
                                <Text style={styles.miniChipText}>{act.trim()?.toUpperCase()}</Text>
                             </View>
                           ))}
                        </View>
                      ) : null}
                    </View>
                  </View>
                );
              })}
              
              {filtered.length > limit && (
                <TouchableOpacity onPress={() => setLimit(prev => prev + 5)} style={styles.moreBtn}>
                  <Text style={[styles.moreBtnText, { color: theme.accent }]}>VER MÁS RECUERDOS</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      )}
      </ScrollView>
    </ChameleonBackground>
  );
}
