import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Shield, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react-native';
import { api } from '../services/api';

export function CrisisForecastCard({ accentColor }) {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForecast();
  }, []);

  const loadForecast = async () => {
    setLoading(true);
    const data = await api.getCrisisForecast();
    if (data) setForecast(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={[fcStyles.container, { justifyContent: 'center', alignItems: 'center', minHeight: 100 }]}>
        <ActivityIndicator color={accentColor} />
      </View>
    );
  }

  if (!forecast || !forecast.hasEnoughData) {
    return (
      <View style={fcStyles.container}>
        <View style={fcStyles.titleRow}>
          <Shield size={12} color={accentColor} />
          <Text style={[fcStyles.title, { color: accentColor }]}>PREDICCIÓN SEMANAL</Text>
          <View style={fcStyles.trendBadgeNeutral}>
             <Text style={fcStyles.trendTextNeutral}>POCA DATA</Text>
          </View>
        </View>
        <Text style={{color: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'Manrope_400Regular', textAlign: 'center', marginVertical: 10}}>Escribe en tu diario para generar tendencias.</Text>
      </View>
    );
  }

  return (
    <View style={fcStyles.container}>
      <View style={fcStyles.titleRow}>
        <Shield size={12} color={accentColor} />
        <Text style={[fcStyles.title, { color: accentColor }]}>PREDICCIÓN SEMANAL</Text>
        {forecast.isDowntrend ? (
          <View style={fcStyles.trendBadgeDown}>
            <TrendingDown size={10} color="#ef4444" />
            <Text style={fcStyles.trendTextDown}>DESCENSO</Text>
          </View>
        ) : (
          <View style={fcStyles.trendBadgeUp}>
            <TrendingUp size={10} color="#22c55e" />
            <Text style={fcStyles.trendTextUp}>ESTABLE</Text>
          </View>
        )}
      </View>

      <View style={fcStyles.chartRow}>
        {forecast.weekData.map((d, i) => (
          <View key={i} style={fcStyles.barCol}>
            <View style={fcStyles.barTrack}>
              {d.level !== null ? (
                <View style={[fcStyles.barFill, { height: `${(d.level / 5) * 100}%`, backgroundColor: d.color }]} />
              ) : (
                <View style={fcStyles.barEmpty}>
                  <Text style={fcStyles.barQuestion}>?</Text>
                </View>
              )}
            </View>
            <Text style={[fcStyles.dayLabel, d.level === null && { opacity: 0.3 }]}>{d.day}</Text>
          </View>
        ))}
      </View>

      {forecast.isDowntrend && (
        <View style={fcStyles.alertBanner}>
          <AlertTriangle size={14} color="#fbbf24" />
          <View style={{ flex: 1 }}>
            <Text style={fcStyles.alertTitle}>Tendencia descendente detectada</Text>
            <Text style={fcStyles.alertDesc}>Tu bienestar ha bajado recientemente. Considera tomar una pausa de 15 min hoy o hablar con soporte.</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const fcStyles = StyleSheet.create({
  container: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  title: { fontSize: 9, fontFamily: 'Manrope_800ExtraBold', letterSpacing: 2 },
  trendBadgeDown: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto', backgroundColor: 'rgba(239,68,68,0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  trendTextDown: { color: '#ef4444', fontSize: 7, fontFamily: 'Manrope_800ExtraBold' },
  trendBadgeUp: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto', backgroundColor: 'rgba(34,197,94,0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  trendTextUp: { color: '#22c55e', fontSize: 7, fontFamily: 'Manrope_800ExtraBold' },
  trendBadgeNeutral: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  trendTextNeutral: { color: 'rgba(255,255,255,0.4)', fontSize: 7, fontFamily: 'Manrope_800ExtraBold' },
  chartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 60, marginBottom: 12, gap: 6 },
  barCol: { flex: 1, alignItems: 'center', gap: 6 },
  barTrack: { width: '100%', height: 48, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 8, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: 8, minHeight: 6 },
  barEmpty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  barQuestion: { color: 'rgba(255,255,255,0.15)', fontSize: 12, fontFamily: 'Manrope_800ExtraBold' },
  dayLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 8, fontFamily: 'Manrope_800ExtraBold' },
  alertBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: 'rgba(251,191,36,0.08)', padding: 14, borderRadius: 14, marginTop: 4 },
  alertTitle: { color: '#fbbf24', fontSize: 11, fontFamily: 'Manrope_800ExtraBold', marginBottom: 3 },
  alertDesc: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'Manrope_400Regular', lineHeight: 17 },
});
