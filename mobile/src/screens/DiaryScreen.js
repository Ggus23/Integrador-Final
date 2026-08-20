import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Animated, Easing, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { PenTool, Lightbulb, CheckCircle2 } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { styles } from '../theme/styles';
import { api } from '../services/api';
import { EMOTION_THEMES, EMOTIONS, PREDEFINED_ACTIVITIES, DIARY_PROMPTS } from '../constants/data';

import { EmotionalParticles } from '../components/EmotionalParticles';
import { ChameleonBackground } from '../components/ChameleonBackground';
import { CognitiveReframeModal } from '../components/CognitiveReframeModal';
import { CrisisForecastCard } from '../components/CrisisForecastCard';
import { AdaptivePromptCard } from '../components/AdaptivePromptCard';
import { TimeCapsuleCard } from '../components/TimeCapsuleCard';
import { MoodHealthBreakdown } from '../components/MoodHealthBreakdown';
import { analyzeMoodRealtime } from '../utils/moodAnalyzer';

export function DiaryScreen() {
  const [experience, setExperience] = useState('');
  const [learning, setLearning] = useState('');
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [selectedEmotionIdx, setSelectedEmotionIdx] = useState(2);
  const [submitting, setSubmitting] = useState(false);
  const [showReframe, setShowReframe] = useState(false);
  const [savedEmotion, setSavedEmotion] = useState(null);
  const [showTimeCapsule, setShowTimeCapsule] = useState(true);
  const [zenMode, setZenMode] = useState(false);
  const [diaryHistory, setDiaryHistory] = useState([]);
  const [realtimeAnalysis, setRealtimeAnalysis] = useState({
    scores: { depresion: 0, ansiedad: 0, estres: 0 },
    keyConcepts: []
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      const analysis = analyzeMoodRealtime(experience);
      setRealtimeAnalysis(analysis);
    }, 300);
    return () => clearTimeout(timer);
  }, [experience]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const history = await api.getDiaryHistory();
      setDiaryHistory(history);
    } catch (e) {
      console.error("Error loading history:", e);
    }
  };
  
  // Zen Mode animation
  const zenFade = useRef(new Animated.Value(1)).current;
  const zenGlow = useRef(new Animated.Value(0)).current;

  const activePrompt = useMemo(() => {
    return DIARY_PROMPTS[Math.floor(Math.random() * DIARY_PROMPTS.length)];
  }, []);

  const currentEmotion = EMOTIONS[selectedEmotionIdx];
  const chameleonTheme = EMOTION_THEMES[currentEmotion.label] || EMOTION_THEMES['Neutral'];

  // Zen Mode: fade out distractions when writing
  const enterZenMode = useCallback(() => {
    setZenMode(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.parallel([
      Animated.timing(zenFade, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(zenGlow, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const exitZenMode = useCallback(() => {
    Animated.parallel([
      Animated.timing(zenFade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(zenGlow, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => setZenMode(false));
  }, []);

  const toggleActivity = (label) => {
    if (selectedActivities.includes(label)) {
      setSelectedActivities(selectedActivities.filter(a => a !== label));
    } else {
      setSelectedActivities([...selectedActivities, label]);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSave = async () => {
    if (!experience) return Alert.alert("¡Espera!", "¿Qué pasó hoy?");
    exitZenMode();
    setSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const emo = EMOTIONS[selectedEmotionIdx];
    const fullText = `PASÓ HOY:\n${experience}\n\nAPRENDIZAJES:\n${learning}`;

    try {
      await api.saveDiaryEntry({ 
        experience: fullText, 
        activities: selectedActivities.join(', '), 
        emotion: emo.label, 
        emotion_color: emo.color, 
        wellbeing_level: emo.level 
      });
      setSavedEmotion({ label: emo.label, color: emo.themeColor, text: fullText });
      setExperience(''); setLearning(''); setSelectedActivities([]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowReframe(true);
      loadHistory(); // Reload history for accurate insights
    } catch (e) { Alert.alert("Error", e.message); } finally { setSubmitting(false); }
  };

  return (
    <ChameleonBackground emotionLabel={currentEmotion.label}>
      {/* Emotional Particles Layer */}
      <EmotionalParticles 
        emotionColor={currentEmotion.themeColor} 
        intensity={currentEmotion.level} 
      />

      {/* Zen Mode glow overlay */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: chameleonTheme.glow,
            opacity: zenGlow,
          },
        ]}
        pointerEvents="none"
      />

      {/* Cognitive Reframe Modal */}
      <CognitiveReframeModal
        visible={showReframe}
        onClose={() => setShowReframe(false)}
        emotionLabel={savedEmotion?.label || 'Neutral'}
        emotionColor={savedEmotion?.color || COLORS.moodNeutral}
        text={savedEmotion?.text || ''}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ── SECTION 1: Header + Emotion Selector (compact top) ── */}
        <Animated.View style={{ opacity: zenFade }}>
          <View style={styles.header}>
            <Text style={[styles.headerLabel, { color: chameleonTheme.accent }]}>MI DIARIO</Text>
            <Text style={styles.headerTitle}>¿Cómo te sientes hoy?</Text>
          </View>
          
          <View style={styles.emotionPickContainer}>
            {EMOTIONS.map((emo, i) => {
              const isActive = selectedEmotionIdx === i;
              return (
                <TouchableOpacity key={i} onPress={() => { setSelectedEmotionIdx(i); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} style={styles.emoItem}>
                  <View style={[styles.emoBtn, isActive && { backgroundColor: emo.themeColor, transform: [{scale: 1.15}], shadowColor: emo.themeColor, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8 }]}>
                    <Text style={styles.emoEmoji}>{emo.emoji}</Text>
                  </View>
                  <Text style={[styles.emoLabelDesc, isActive && { color: emo.themeColor, fontWeight: '800' }]}>{emo.label?.toUpperCase()}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* ── SECTION 2: Writing Area (primary action) ── */}
        <View style={[styles.card, { backgroundColor: chameleonTheme.surface }]}>

          {/* Adaptive Prompt (compact, inline) */}
          <AdaptivePromptCard
            accentColor={chameleonTheme.accent}
            onUsePrompt={(text) => { setExperience(text + '\n\n'); enterZenMode(); }}
          />

          {/* Main writing */}
          <View style={styles.inputWrap}>
            <View style={styles.inputTitleRow}>
              <PenTool size={14} color={chameleonTheme.accent} />
              <Text style={styles.cardLabelInline}>¿Qué sucedió hoy?</Text>
              {zenMode && (
                <TouchableOpacity onPress={exitZenMode} style={styles.zenExitBtn}>
                  <Text style={[styles.zenExitText, { color: chameleonTheme.accent }]}>SALIR ZEN ✦</Text>
                </TouchableOpacity>
              )}
            </View>
            <TextInput 
              multiline 
              placeholder={activePrompt} 
              placeholderTextColor="#556" 
              value={experience} 
              onChangeText={setExperience} 
              onFocus={enterZenMode}
              style={[
                styles.textInput, 
                zenMode && { 
                  minHeight: 200, 
                  borderColor: chameleonTheme.accent + '30',
                  borderWidth: 1,
                  backgroundColor: 'rgba(0,0,0,0.35)',
                }
              ]} 
            />

            {/* Real-time Indicator (Mobile) */}
            {experience.length > 10 && (
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10, paddingHorizontal: 5 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#EF4444' }} />
                  <Text style={{ fontSize: 8, color: '#fff', opacity: 0.6, fontWeight: '800' }}>DEP: {(realtimeAnalysis.scores.depresion * 100).toFixed(0)}%</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#F97316' }} />
                  <Text style={{ fontSize: 8, color: '#fff', opacity: 0.6, fontWeight: '800' }}>ANS: {(realtimeAnalysis.scores.ansiedad * 100).toFixed(0)}%</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FACC15' }} />
                  <Text style={{ fontSize: 8, color: '#fff', opacity: 0.6, fontWeight: '800' }}>EST: {(realtimeAnalysis.scores.estres * 100).toFixed(0)}%</Text>
                </View>
              </View>
            )}
          </View>

          {/* Reflection */}
          <View style={styles.inputWrap}>
            <View style={styles.inputTitleRow}>
              <Lightbulb size={14} color={chameleonTheme.accent} />
              <Text style={styles.cardLabelInline}>Mi aprendizaje / reflexión</Text>
            </View>
            <TextInput 
              multiline 
              placeholder="¿Alguna lección importante?" 
              placeholderTextColor="#556" 
              value={learning} 
              onChangeText={setLearning} 
              onFocus={enterZenMode}
              style={[
                styles.textInput, 
                { minHeight: 70 },
                zenMode && { 
                  borderColor: chameleonTheme.accent + '30',
                  borderWidth: 1,
                  backgroundColor: 'rgba(0,0,0,0.35)',
                }
              ]} 
            />
          </View>
        </View>

        {/* ── SECTION 3: Activities (horizontal scroll, compact) ── */}
        <Animated.View style={{ opacity: zenFade }}>
          <Text style={[styles.sectionLabel, { color: chameleonTheme.accent }]}>ACTIVIDADES DEL DÍA</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activityScroll}>
            {PREDEFINED_ACTIVITIES.map(act => {
              const isActive = selectedActivities.includes(act.label);
              return (
                <TouchableOpacity key={act.id} onPress={() => toggleActivity(act.label)} style={[styles.activityPill, isActive && { backgroundColor: chameleonTheme.accent, borderColor: chameleonTheme.accent }]}>
                  <View style={{ opacity: isActive ? 0.9 : 0.5 }}>{act.icon}</View>
                  <Text style={[styles.activityPillText, isActive && { color: COLORS.background, opacity: 1 }]}>{act.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* ── SECTION 4: Save ── */}
        <TouchableOpacity onPress={handleSave} disabled={submitting} style={[styles.saveBtnFull, { backgroundColor: currentEmotion.themeColor }]}>
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.saveBtnContent}>
              <CheckCircle2 size={18} color="#fff" />
              <Text style={styles.saveBtnText}>Guardar Registro</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* ── SECTION 5: Insights (secondary, below save) ── */}
        <Animated.View style={{ opacity: zenFade }}>
          <Text style={[styles.sectionLabel, { color: chameleonTheme.accent, marginTop: 28 }]}>INSIGHTS</Text>

          {/* Mood Health Breakdown */}
          <MoodHealthBreakdown 
            history={diaryHistory} 
            accentColor={chameleonTheme.accent} 
          />

          {/* Crisis Forecast */}
          <CrisisForecastCard accentColor={chameleonTheme.accent} />

          {/* Time Capsule */}
          {showTimeCapsule && (
            <TimeCapsuleCard
              accentColor={chameleonTheme.accent}
              onDismiss={() => setShowTimeCapsule(false)}
            />
          )}
        </Animated.View>

        {/* Bottom spacer for nav */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </ChameleonBackground>
  );
}
