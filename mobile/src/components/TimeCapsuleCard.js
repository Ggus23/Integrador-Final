import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, ActivityIndicator } from 'react-native';
import { Clock, X, Sparkles } from 'lucide-react-native';
import { api } from '../services/api';

export function TimeCapsuleCard({ accentColor, onDismiss }) {
  const [capsule, setCapsule] = useState(null);
  const [loading, setLoading] = useState(true);
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadCapsule();
  }, []);

  const loadCapsule = async () => {
    setLoading(true);
    const data = await api.getTimeCapsule();
    if (data) {
      setCapsule(data);
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, tension: 40, friction: 8, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]).start();
    }
    setLoading(false);
  };

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 0.9, duration: 200, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onDismiss());
  };

  if (loading) {
    return (
      <View style={[tcStyles.container, { justifyContent: 'center', alignItems: 'center', minHeight: 120 }]}>
        <ActivityIndicator color={accentColor} />
      </View>
    );
  }

  if (!capsule) {
    return null; // Don't show if no past entries
  }

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - capsule.daysAgo);

  return (
    <Animated.View style={[tcStyles.container, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
      <View style={tcStyles.headerRow}>
        <Clock size={12} color={accentColor} />
        <Text style={[tcStyles.headerLabel, { color: accentColor }]}>CÁPSULA DEL TIEMPO</Text>
        <TouchableOpacity onPress={handleDismiss} style={tcStyles.dismissIcon}>
          <X size={14} color="rgba(255,255,255,0.3)" />
        </TouchableOpacity>
      </View>

      <View style={tcStyles.metaRow}>
        <Text style={tcStyles.dateText}>Hace {capsule.daysAgo} días · {pastDate.toLocaleDateString()}</Text>
        <View style={[tcStyles.emoBadge, { backgroundColor: capsule.color + '20' }]}>
          <Text style={{ fontSize: 12 }}>{capsule.emoji}</Text>
          <Text style={[tcStyles.emoText, { color: capsule.color }]}>{capsule.emotion?.toUpperCase() || ''}</Text>
        </View>
      </View>

      <View style={tcStyles.quoteBox}>
        <View style={[tcStyles.quoteLine, { backgroundColor: capsule.color }]} />
        <Text style={tcStyles.quoteText}>"{capsule.snippet}"</Text>
      </View>

      <View style={[tcStyles.resolutionBox, { backgroundColor: '#22c55e10' }]}>
        <Sparkles size={14} color="#22c55e" />
        <View style={{ flex: 1 }}>
          <Text style={tcStyles.resLabel}>LO QUE PASÓ DESPUÉS</Text>
          <Text style={tcStyles.resText}>{capsule.resolution}</Text>
        </View>
      </View>

      <Text style={tcStyles.motivational}>Mira cuánto has crecido desde entonces. ✨</Text>
    </Animated.View>
  );
}

const tcStyles = StyleSheet.create({
  container: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  headerLabel: { fontSize: 9, fontFamily: 'Manrope_800ExtraBold', letterSpacing: 2 },
  dismissIcon: { marginLeft: 'auto', padding: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  dateText: { color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'Manrope_400Regular' },
  emoBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  emoText: { fontSize: 8, fontFamily: 'Manrope_800ExtraBold' },
  quoteBox: { flexDirection: 'row', marginBottom: 14, gap: 12 },
  quoteLine: { width: 3, borderRadius: 2 },
  quoteText: { flex: 1, color: 'rgba(255,255,255,0.6)', fontSize: 13, fontFamily: 'NotoSerif_400Regular_Italic', lineHeight: 21 },
  resolutionBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14, borderRadius: 14, marginBottom: 12 },
  resLabel: { fontSize: 7, fontFamily: 'Manrope_800ExtraBold', color: '#22c55e', letterSpacing: 2, marginBottom: 3 },
  resText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: 'Manrope_400Regular', lineHeight: 18 },
  motivational: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: 'NotoSerif_400Regular_Italic', textAlign: 'center', marginTop: 4 },
});
