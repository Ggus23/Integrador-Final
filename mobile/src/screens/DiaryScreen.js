import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { PenTool, Lightbulb, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { styles } from '../theme/styles';
import { api } from '../services/api';
import { EMOTION_THEMES, EMOTIONS, PREDEFINED_ACTIVITIES, DIARY_PROMPTS } from '../constants/data';

import { EmotionalParticles } from '../components/EmotionalParticles';
import { ChameleonBackground } from '../components/ChameleonBackground';
import { CognitiveReframeModal } from '../components/CognitiveReframeModal';
import { CrisisForecastCard } from '../components/CrisisForecastCard';
import { TimeCapsuleCard } from '../components/TimeCapsuleCard';
import { MoodHealthBreakdown } from '../components/MoodHealthBreakdown';

export function DiaryScreen() {
  const [step, setStep] = useState(1); // Paso actual: 1, 2, 3, 4
  const [experience, setExperience] = useState('');
  const [learning, setLearning] = useState('');
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [selectedEmotionIdx, setSelectedEmotionIdx] = useState(2);
  const [submitting, setSubmitting] = useState(false);
  const [showReframe, setShowReframe] = useState(false);
  const [savedEmotion, setSavedEmotion] = useState(null);
  const [showTimeCapsule, setShowTimeCapsule] = useState(true);
  const [diaryHistory, setDiaryHistory] = useState([]);

  // Referencias de inputs para auto-focus
  const learningInputRef = useRef(null);

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

  const activePrompt = useMemo(() => {
    return DIARY_PROMPTS[Math.floor(Math.random() * DIARY_PROMPTS.length)];
  }, []);

  const currentEmotion = EMOTIONS[selectedEmotionIdx];
  const chameleonTheme = EMOTION_THEMES[currentEmotion.label] || EMOTION_THEMES['Neutral'];

  const toggleActivity = (label) => {
    if (selectedActivities.includes(label)) {
      setSelectedActivities(selectedActivities.filter(a => a !== label));
    } else {
      setSelectedActivities([...selectedActivities, label]);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSave = async () => {
    if (!experience) {
      setStep(2); // Devolver al paso 2 si no ha escrito nada
      return Alert.alert("¡Espera!", "Escribe qué sucedió hoy antes de guardar.");
    }
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
      setStep(1); // Reiniciar al paso 1
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowReframe(true);
      loadHistory();
    } catch (e) { Alert.alert("Error", e.message); } finally { setSubmitting(false); }
  };

  // Funciones de navegación de pasos
  const nextStep = () => {
    if (step < 4) {
      setStep(prev => prev + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Avanzar con enter
  const handleExperienceSubmit = () => {
    nextStep();
    setTimeout(() => {
      learningInputRef.current?.focus();
    }, 100);
  };

  const handleLearningSubmit = () => {
    nextStep();
  };

  return (
    <ChameleonBackground emotionLabel={currentEmotion.label}>
      <EmotionalParticles 
        emotionColor={currentEmotion.themeColor} 
        intensity={currentEmotion.level} 
      />

      <CognitiveReframeModal
        visible={showReframe}
        onClose={() => setShowReframe(false)}
        emotionLabel={savedEmotion?.label || 'Neutral'}
        emotionColor={savedEmotion?.color || COLORS.moodNeutral}
        text={savedEmotion?.text || ''}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ── HEADER CON PASO ACTUAL ── */}
        <View style={styles.header}>
          <Text style={[styles.headerLabel, { color: chameleonTheme.accent }]}>MI DIARIO</Text>
          <View style={diaryStyles.progressHeader}>
            <Text style={styles.headerTitle}>Paso {step} de 4</Text>
            <View style={diaryStyles.progressDots}>
              {[1, 2, 3, 4].map(i => (
                <View 
                  key={i} 
                  style={[
                    diaryStyles.progressDot, 
                    { backgroundColor: step === i ? chameleonTheme.accent : 'rgba(255,255,255,0.15)' }
                  ]} 
                />
              ))}
            </View>
          </View>
        </View>

        {/* ═══════════════════════════════════════════ */}
        {/* ── PASO 1: SELECCIÓN DE EMOCIÓN ── */}
        {/* ═══════════════════════════════════════════ */}
        {step === 1 && (
          <View style={[styles.card, { backgroundColor: chameleonTheme.surface, marginBottom: 16 }]}>
            <Text style={diaryStyles.stepTitle}>Paso 1: ¿Cómo te sientes?</Text>
            <Text style={diaryStyles.stepSubtitle}>Selecciona la carita que mejor represente tu estado de ánimo de hoy</Text>

            <View style={styles.emotionPickContainer}>
              {EMOTIONS.map((emo, i) => {
                const isActive = selectedEmotionIdx === i;
                return (
                  <TouchableOpacity 
                    key={i} 
                    onPress={() => { 
                      setSelectedEmotionIdx(i); 
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); 
                    }} 
                    style={styles.emoItem}
                  >
                    <View style={[
                      styles.emoBtn, 
                      isActive && { 
                        backgroundColor: emo.themeColor, 
                        transform: [{scale: 1.15}], 
                        shadowColor: emo.themeColor, 
                        shadowOffset: {width: 0, height: 4}, 
                        shadowOpacity: 0.5, 
                        shadowRadius: 12, 
                        elevation: 8 
                      }
                    ]}>
                      <Text style={styles.emoEmoji}>{emo.emoji}</Text>
                    </View>
                    <Text style={[
                      styles.emoLabelDesc, 
                      isActive && { color: emo.themeColor, fontWeight: '800' }
                    ]}>
                      {emo.label?.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={[diaryStyles.emotionFeedback, { backgroundColor: currentEmotion.themeColor + '15', borderColor: currentEmotion.themeColor + '30' }]}>
              <Text style={diaryStyles.emotionFeedbackEmoji}>{currentEmotion.emoji}</Text>
              <Text style={[diaryStyles.emotionFeedbackText, { color: currentEmotion.themeColor }]}>
                Seleccionado: {currentEmotion.label}
              </Text>
            </View>
          </View>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* ── PASO 2: ¿QUÉ SUCEDIÓ HOY? ── */}
        {/* ═══════════════════════════════════════════ */}
        {step === 2 && (
          <View style={[styles.card, { backgroundColor: chameleonTheme.surface, marginBottom: 16 }]}>
            <Text style={diaryStyles.stepTitle}>Paso 2: ¿Qué sucedió hoy?</Text>
            <Text style={diaryStyles.stepSubtitle}>Describe los eventos más importantes. Presiona Enter o Siguiente en el teclado para continuar.</Text>

            <View style={diaryStyles.inputSection}>
              <View style={styles.inputTitleRow}>
                <PenTool size={14} color={chameleonTheme.accent} />
                <Text style={styles.cardLabelInline}>Tu experiencia</Text>
              </View>
              <TextInput 
                multiline={false} // Evitar múltiples líneas para poder enviar/avanzar directo con Enter
                placeholder={activePrompt} 
                placeholderTextColor="#556" 
                value={experience} 
                onChangeText={setExperience} 
                onSubmitEditing={handleExperienceSubmit}
                returnKeyType="next"
                style={styles.textInput} 
              />
            </View>
          </View>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* ── PASO 3: APRENDIZAJE / REFLEXIÓN ── */}
        {/* ═══════════════════════════════════════════ */}
        {step === 3 && (
          <View style={[styles.card, { backgroundColor: chameleonTheme.surface, marginBottom: 16 }]}>
            <Text style={diaryStyles.stepTitle}>Paso 3: Tu aprendizaje o reflexión</Text>
            <Text style={diaryStyles.stepSubtitle}>¿Hay alguna lección importante? Presiona Enter para pasar a las actividades.</Text>

            <View style={diaryStyles.inputSection}>
              <View style={styles.inputTitleRow}>
                <Lightbulb size={14} color={chameleonTheme.accent} />
                <Text style={styles.cardLabelInline}>Reflexión del día</Text>
              </View>
              <TextInput 
                ref={learningInputRef}
                multiline={false} 
                placeholder="¿Qué aprendiste hoy sobre ti?" 
                placeholderTextColor="#556" 
                value={learning} 
                onChangeText={setLearning} 
                onSubmitEditing={handleLearningSubmit}
                returnKeyType="next"
                style={styles.textInput} 
              />
            </View>
          </View>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* ── PASO 4: ACTIVIDADES DEL DÍA ── */}
        {/* ═══════════════════════════════════════════ */}
        {step === 4 && (
          <View style={[styles.card, { backgroundColor: chameleonTheme.surface, marginBottom: 20 }]}>
            <Text style={diaryStyles.stepTitle}>Paso 4: Actividades del día</Text>
            <Text style={diaryStyles.stepSubtitle}>Selecciona lo que realizaste. Al terminar presiona Guardar.</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activityScroll}>
              {PREDEFINED_ACTIVITIES.map(act => {
                const isActive = selectedActivities.includes(act.label);
                return (
                  <TouchableOpacity 
                    key={act.id} 
                    onPress={() => toggleActivity(act.label)} 
                    style={[
                      styles.activityPill, 
                      isActive && { backgroundColor: chameleonTheme.accent, borderColor: chameleonTheme.accent }
                    ]}
                  >
                    <View style={{ opacity: isActive ? 0.9 : 0.5 }}>{act.icon}</View>
                    <Text style={[
                      styles.activityPillText, 
                      isActive && { color: COLORS.background, opacity: 1 }
                    ]}>
                      {act.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {selectedActivities.length > 0 && (
              <Text style={diaryStyles.activityCount}>
                {selectedActivities.length} actividad{selectedActivities.length > 1 ? 'es' : ''} seleccionada{selectedActivities.length > 1 ? 's' : ''}
              </Text>
            )}
          </View>
        )}

        {/* ── BOTONES DE NAVEGACIÓN Y ACCIÓN ── */}
        <View style={diaryStyles.navButtonsRow}>
          {step > 1 && (
            <TouchableOpacity onPress={prevStep} style={[diaryStyles.btnBack, { borderColor: chameleonTheme.accent }]}>
              <ArrowLeft size={16} color={chameleonTheme.accent} />
              <Text style={[diaryStyles.btnBackText, { color: chameleonTheme.accent }]}>Atrás</Text>
            </TouchableOpacity>
          )}

          {step < 4 ? (
            <TouchableOpacity onPress={nextStep} style={[diaryStyles.btnNext, { backgroundColor: chameleonTheme.accent, marginLeft: step === 1 ? 0 : 12 }]}>
              <Text style={[diaryStyles.btnNextText, { color: COLORS.background }]}>Siguiente</Text>
              <ArrowRight size={16} color={COLORS.background} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={handleSave} 
              disabled={submitting} 
              style={[diaryStyles.btnSave, { backgroundColor: currentEmotion.themeColor }]}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.saveBtnContent}>
                  <CheckCircle2 size={16} color="#fff" />
                  <Text style={styles.saveBtnText}>Guardar Diario</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* ── SECCIÓN DE INSIGHTS (Opcional, abajo) ── */}
        {step === 1 && (
          <>
            <View style={diaryStyles.insightsSeparator}>
              <View style={diaryStyles.separatorLine} />
              <Text style={[diaryStyles.insightsTitle, { color: chameleonTheme.accent }]}>📊 Tus Insights</Text>
              <Text style={diaryStyles.insightsSubtitle}>Resumen inteligente de tus registros anteriores</Text>
            </View>

            <MoodHealthBreakdown 
              history={diaryHistory} 
              accentColor={chameleonTheme.accent} 
            />

            <CrisisForecastCard accentColor={chameleonTheme.accent} />

            {showTimeCapsule && (
              <TimeCapsuleCard
                accentColor={chameleonTheme.accent}
                onDismiss={() => setShowTimeCapsule(false)}
              />
            )}
          </>
        )}

        {/* Bottom spacer for nav */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </ChameleonBackground>
  );
}

const diaryStyles = StyleSheet.create({
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 6,
  },
  progressDot: {
    width: 24,
    height: 4,
    borderRadius: 2,
  },
  stepTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Manrope_800ExtraBold',
    marginBottom: 6,
  },
  stepSubtitle: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
    lineHeight: 18,
    marginBottom: 20,
  },
  inputSection: {
    marginVertical: 4,
  },
  emotionFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 4,
    justifyContent: 'center',
  },
  emotionFeedbackEmoji: {
    fontSize: 22,
  },
  emotionFeedbackText: {
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
  },
  activityCount: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontFamily: 'Manrope_600SemiBold',
    textAlign: 'center',
    marginTop: 12,
  },
  navButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 24,
  },
  btnBack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 14,
    flex: 1,
  },
  btnBackText: {
    fontSize: 14,
    fontFamily: 'Manrope_800ExtraBold',
  },
  btnNext: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 14,
    flex: 1.5,
  },
  btnNextText: {
    fontSize: 14,
    fontFamily: 'Manrope_800ExtraBold',
  },
  btnSave: {
    borderRadius: 16,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1.5,
    marginLeft: 12,
  },
  insightsSeparator: {
    marginTop: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  separatorLine: {
    width: '60%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16,
  },
  insightsTitle: {
    fontSize: 16,
    fontFamily: 'Manrope_800ExtraBold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  insightsSubtitle: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    fontFamily: 'Manrope_400Regular',
    textAlign: 'center',
  },
});
