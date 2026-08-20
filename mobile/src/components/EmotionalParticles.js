import React, { useRef, useEffect, useMemo } from 'react';
import { View, Animated, Easing, StyleSheet, Dimensions } from 'react-native';

const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── EMOTIONAL PARTICLES: Floating animated orbs ───
export const EmotionalParticles = React.memo(function EmotionalParticles({ emotionColor, intensity = 3 }) {
  const particleCount = 6 + intensity;

  // Pre-compute stable left positions so they don't change on re-render
  const particleLeftPositions = useMemo(
    () => Array.from({ length: particleCount }, () => Math.random() * width * 0.8),
    [particleCount]
  );

  const particles = useRef(
    Array.from({ length: particleCount }, () => ({
      x: new Animated.Value(Math.random() * width),
      y: new Animated.Value(Math.random() * SCREEN_HEIGHT * 0.6),
      scale: new Animated.Value(0.3 + Math.random() * 0.7),
      opacity: new Animated.Value(0.05 + Math.random() * 0.15),
      size: 30 + Math.random() * 80,
    }))
  ).current;

  useEffect(() => {
    const animations = [];
    particles.forEach((p, i) => {
      const duration = 4000 + Math.random() * 6000;
      const delay = i * 300;

      const floatY = Animated.loop(
        Animated.sequence([
          Animated.timing(p.y, {
            toValue: Math.random() * SCREEN_HEIGHT * 0.5,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
            delay,
          }),
          Animated.timing(p.y, {
            toValue: Math.random() * SCREEN_HEIGHT * 0.6,
            duration: duration * 0.8,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );

      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(p.scale, {
            toValue: 0.6 + Math.random() * 0.5,
            duration: 3000 + Math.random() * 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(p.scale, {
            toValue: 0.3 + Math.random() * 0.4,
            duration: 3000 + Math.random() * 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      const fade = Animated.loop(
        Animated.sequence([
          Animated.timing(p.opacity, {
            toValue: 0.08 + Math.random() * 0.12,
            duration: 2500 + Math.random() * 3000,
            useNativeDriver: true,
          }),
          Animated.timing(p.opacity, {
            toValue: 0.03 + Math.random() * 0.06,
            duration: 2500 + Math.random() * 3000,
            useNativeDriver: true,
          }),
        ])
      );

      floatY.start();
      pulse.start();
      fade.start();
      animations.push(floatY, pulse, fade);
    });

    return () => {
      animations.forEach(a => a.stop());
    };
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: particleLeftPositions[i],
            width: p.size,
            height: p.size,
            borderRadius: p.size / 2,
            backgroundColor: emotionColor,
            opacity: p.opacity,
            transform: [
              { translateY: p.y },
              { scale: p.scale },
            ],
          }}
        />
      ))}
    </View>
  );
});
