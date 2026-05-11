import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Brain, RefreshCw, Lightbulb, X } from 'lucide-react-native';
import { api } from '../services/api';

export function CognitiveReframeModal({ visible, onClose, emotionLabel, emotionColor, text }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      loadReframe();
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 9, useNativeDriver: true }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      setData(null);
    }
  }, [visible, text, emotionLabel]);

  const loadReframe = async () => {
    setLoading(true);
    const result = await api.getCognitiveReframe(text || "", emotionLabel || "Neutral");
    if (result) {
      setData(result);
    }
    setLoading(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={rfStyles.overlay}>
        <Animated.View style={[rfStyles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <LinearGradient
            colors={[emotionColor + '25', 'transparent']}
            style={rfStyles.headerGlow}
          />
          <TouchableOpacity onPress={onClose} style={rfStyles.closeBtn}>
            <X color="rgba(255,255,255,0.4)" size={20} />
          </TouchableOpacity>
          <View style={rfStyles.aiBadge}>
            <Brain size={12} color={emotionColor} />
            <Text style={[rfStyles.aiBadgeText, { color: emotionColor }]}>REENCUADRE IA · TCC</Text>
          </View>
          
          {loading || !data ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator color={emotionColor} />
              <Text style={{ color: 'rgba(255,255,255,0.5)', marginTop: 10, fontSize: 12 }}>Analizando...</Text>
            </View>
          ) : (
            <>
              <View style={[rfStyles.techBadge, { backgroundColor: emotionColor + '15' }]}>
                <RefreshCw size={10} color={emotionColor} />
                <Text style={[rfStyles.techText, { color: emotionColor }]}>{data.technique}</Text>
              </View>
              <Text style={rfStyles.reframeText}>{data.reframe}</Text>
              <View style={rfStyles.divider} />
              <View style={rfStyles.actionRow}>
                <View style={[rfStyles.actionIcon, { backgroundColor: emotionColor + '15' }]}>
                  <Lightbulb size={14} color={emotionColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={rfStyles.actionLabel}>ACCIÓN SUGERIDA</Text>
                  <Text style={rfStyles.actionText}>{data.action}</Text>
                </View>
              </View>
            </>
          )}

          <TouchableOpacity onPress={onClose} style={[rfStyles.dismissBtn, { backgroundColor: emotionColor }]}>
            <Text style={rfStyles.dismissText}>Entendido ✦</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const rfStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  container: { backgroundColor: '#0f1a28', borderRadius: 28, padding: 28, width: '100%', maxWidth: 380, overflow: 'hidden' },
  headerGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 120, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  closeBtn: { position: 'absolute', top: 16, right: 16, zIndex: 10, padding: 4 },
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  aiBadgeText: { fontSize: 9, fontFamily: 'Manrope_800ExtraBold', letterSpacing: 2 },
  techBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, marginBottom: 20 },
  techText: { fontSize: 9, fontFamily: 'Manrope_800ExtraBold' },
  reframeText: { color: '#fff', fontSize: 16, fontFamily: 'NotoSerif_400Regular', lineHeight: 26, marginBottom: 20 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 20 },
  actionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 24 },
  actionIcon: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  actionLabel: { fontSize: 8, fontFamily: 'Manrope_800ExtraBold', color: 'rgba(255,255,255,0.3)', letterSpacing: 2, marginBottom: 4 },
  actionText: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: 'Manrope_400Regular', lineHeight: 20 },
  dismissBtn: { height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  dismissText: { color: '#fff', fontSize: 14, fontFamily: 'Manrope_800ExtraBold' },
});
