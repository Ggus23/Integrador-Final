import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing, StyleSheet, ActivityIndicator } from 'react-native';
import { MessageCircle, Zap, ChevronRight, RefreshCw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { api } from '../services/api';

export function AdaptivePromptCard({ accentColor, onUsePrompt }) {
  const [prompts, setPrompts] = useState([]);
  const [promptIdx, setPromptIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadPrompts();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const loadPrompts = async () => {
    setLoading(true);
    const data = await api.getAdaptivePrompts();
    if (data && data.length > 0) setPrompts(data);
    setLoading(false);
  };

  const cyclePrompt = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (prompts.length > 0) {
      setPromptIdx((prev) => (prev + 1) % prompts.length);
    }
  };

  const typeLabel = { followup: 'SEGUIMIENTO', action: 'ACCIÓN', trend: 'TENDENCIA', context: 'CONTEXTO', pattern: 'PATRÓN' };

  if (loading) {
    return (
      <View style={[apStyles.container, { justifyContent: 'center', alignItems: 'center', minHeight: 120 }]}>
        <ActivityIndicator color={accentColor} />
      </View>
    );
  }

  const prompt = prompts.length > 0 ? prompts[promptIdx] : { text: "¿Qué tienes en mente hoy?", ref: "Iniciando tu diario", type: "general" };

  return (
    <View style={apStyles.container}>
      <View style={apStyles.headerRow}>
        <Animated.View style={[apStyles.iconWrap, { backgroundColor: accentColor + '15', transform: [{ scale: pulseAnim }] }]}>
          <MessageCircle size={14} color={accentColor} />
        </Animated.View>
        <View style={{ flex: 1 }}>
          <View style={apStyles.labelRow}>
            <Zap size={8} color={accentColor} />
            <Text style={[apStyles.label, { color: accentColor }]}>PROMPT ADAPTATIVO</Text>
            <View style={[apStyles.typeBadge, { backgroundColor: accentColor + '15' }]}>
              <Text style={[apStyles.typeText, { color: accentColor }]}>{typeLabel[prompt.type] || 'IA'}</Text>
            </View>
          </View>
          <Text style={apStyles.refText}>{prompt.ref}</Text>
        </View>
        <TouchableOpacity onPress={cyclePrompt} style={apStyles.refreshBtn}>
          <RefreshCw size={14} color="rgba(255,255,255,0.3)" />
        </TouchableOpacity>
      </View>

      <Text style={apStyles.promptText}>"{prompt.text}"</Text>

      <TouchableOpacity onPress={() => onUsePrompt(prompt.text)} style={[apStyles.useBtn, { borderColor: accentColor + '30' }]}>
        <Text style={[apStyles.useBtnText, { color: accentColor }]}>Usar como guía</Text>
        <ChevronRight size={12} color={accentColor} />
      </TouchableOpacity>
    </View>
  );
}

const apStyles = StyleSheet.create({
  container: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  iconWrap: { width: 34, height: 34, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 },
  label: { fontSize: 8, fontFamily: 'Manrope_800ExtraBold', letterSpacing: 2 },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  typeText: { fontSize: 6, fontFamily: 'Manrope_800ExtraBold' },
  refText: { color: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'Manrope_400Regular', lineHeight: 15 },
  refreshBtn: { padding: 8 },
  promptText: { color: '#fff', fontSize: 15, fontFamily: 'NotoSerif_400Regular_Italic', lineHeight: 24, marginBottom: 14, paddingLeft: 4 },
  useBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 40, borderRadius: 14, borderWidth: 1 },
  useBtnText: { fontSize: 11, fontFamily: 'Manrope_800ExtraBold' },
});
