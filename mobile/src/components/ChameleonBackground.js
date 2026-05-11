import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { EMOTION_THEMES } from '../constants/data';

// ─── CHAMELEON BACKGROUND ───
export function ChameleonBackground({ emotionLabel, children }) {
  const theme = EMOTION_THEMES[emotionLabel] || EMOTION_THEMES['Neutral'];
  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <LinearGradient
        colors={theme.gradient}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {children}
    </View>
  );
}
