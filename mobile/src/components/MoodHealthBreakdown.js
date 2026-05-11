import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Activity } from 'lucide-react-native';
import { COLORS } from '../theme/colors';

export function MoodHealthBreakdown({ history, accentColor }) {
  if (!history || history.length === 0) return null;

  const metrics = [
    { label: 'Depresión', key: 'depresion', color: '#EF4444' },
    { label: 'Ansiedad', key: 'ansiedad', color: '#F97316' },
    { label: 'Estrés', key: 'estres', color: '#FACC15' },
  ];

  return (
    <View style={[styles.card, { borderColor: accentColor + '30' }]}>
      <View style={styles.header}>
        <Activity size={16} color={accentColor} />
        <Text style={[styles.title, { color: accentColor }]}>ANÁLISIS DE ÁNIMO IA</Text>
      </View>

      <View style={styles.metricsContainer}>
        {metrics.map((metric) => {
          // Get the average score for this metric across recent entries
          const recentScores = history.slice(0, 5).map(e => e.emotion_scores?.[metric.key] || 0);
          const avgScore = recentScores.length > 0 
            ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length 
            : 0;

          return (
            <View key={metric.key} style={styles.metricItem}>
              <View style={styles.labelRow}>
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <Text style={styles.metricValue}>{(avgScore * 100).toFixed(0)}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { backgroundColor: metric.color, width: `${avgScore * 100}%` }
                  ]} 
                />
              </View>
            </View>
          );
        })}
      </View>
      <Text style={styles.footer}>Basado en tus últimos 5 registros.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginTop: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  metricsContainer: {
    gap: 15,
  },
  metricItem: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.8,
  },
  metricValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  footer: {
    color: '#fff',
    fontSize: 9,
    fontStyle: 'italic',
    opacity: 0.4,
    marginTop: 15,
    textAlign: 'center',
  },
});
