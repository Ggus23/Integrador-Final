import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Brain, Sparkles } from 'lucide-react-native';
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
    if (s.includes('muy feliz') || s.includes('feliz')) return '#22C55E'; // Verde
    if (s.includes('neutral') || s.includes('indiferente')) return '#FACC15'; // Amarillo
    if (s.includes('ansioso') || s.includes('estresado')) return '#F97316'; // Naranja
    if (s.includes('triste') || s.includes('muy triste')) return '#EF4444'; // Rojo
    return theme.accent;
  };

  return (
    <ChameleonBackground emotionLabel="Neutral">
      <EmotionalParticles emotionColor={theme.accent} intensity={1} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.headerLabel, { color: theme.accent }]}>ANÁLISIS DE IA</Text>
          <Text style={styles.headerTitle}>Mapa Mental</Text>
        </View>

      {loading ? (
        <View style={styles.loadingStats}>
          <ActivityIndicator color={theme.accent} size="large" />
          <Text style={styles.loadingStatsText}>Analizando tus pensamientos...</Text>
        </View>
      ) : (
        <View style={styles.statsGap}>
          {/* SECCIÓN PALABRAS */}
          <View style={[styles.card, { backgroundColor: theme.surface, paddingBottom: 20 }]}>
            <View style={styles.cardTitleRow}>
              <Brain size={14} color={theme.accent} />
              <Text style={[styles.cardLabelTitle, { color: theme.accent }]}>CONCEPTOS CLAVE</Text>
            </View>
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
                <Text style={styles.emptyCloudText}>Escribe más en tu diario para generar tu mapa mental.</Text>
              )}
            </View>

            {/* Legend Mobile */}
            <View style={styles.legendRow}>
               {[{l: 'Pos', c: '#22C55E'}, {l: 'Neu', c: '#FACC15'}, {l: 'Ans', c: '#F97316'}, {l: 'Tris', c: '#EF4444'}].map((leg, i) => (
                 <View key={i} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: leg.c }]} />
                    <Text style={styles.legendText}>{leg.l}</Text>
                 </View>
               ))}
            </View>
          </View>

          {/* SECCIÓN FRASES */}
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <View style={styles.cardTitleRow}>
              <Sparkles size={14} color={theme.accent} />
              <Text style={[styles.cardLabelTitle, { color: theme.accent }]}>FRASES RECURRENTES</Text>
            </View>
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
                      <Text style={[styles.phraseCount, { color: getSentimentColor(p.sentiment) }]}>{p.frequency}x</Text>
                    </View>
                  ))}
                  
                  {phraseCloud.length > phraseLimit && (
                    <TouchableOpacity onPress={() => setPhraseLimit(prev => prev + 5)} style={styles.moreBtn}>
                      <Text style={[styles.moreBtnText, { color: theme.accent }]}>EXPLORAR MÁS FRASES</Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <Text style={styles.emptyCloudText}>No hay suficientes frases para analizar aún.</Text>
              )}
            </View>
          </View>
        </View>
      )}
      </ScrollView>
    </ChameleonBackground>
  );
}
