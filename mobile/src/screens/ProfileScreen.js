import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { ShieldCheck, Flame, BookText, LogOut } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { styles } from '../theme/styles';
import { api } from '../services/api';
import { EMOTION_THEMES } from '../constants/data';
import { ChameleonBackground } from '../components/ChameleonBackground';
import { EmotionalParticles } from '../components/EmotionalParticles';

const theme = EMOTION_THEMES['Neutral'];

export function ProfileScreen({ onLogout }) {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ streak: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    try {
      const profile = await api.getMe();
      const history = await api.getDiaryHistory();
      setUser(profile);
      if (history && history.length > 0) {
        let streak = 0;
        const sortedDates = history.map(h => new Date(h.date).toDateString()).filter((v, i, a) => a.indexOf(v) === i);
        let current = new Date();
        for (let i = 0; i < sortedDates.length; i++) {
          const checkDate = new Date(current).toDateString();
          if (sortedDates.includes(checkDate)) { streak++; current.setDate(current.getDate() - 1); }
          else if (i === 0) { current.setDate(current.getDate() - 1); if (!sortedDates.includes(new Date(current).toDateString())) break; }
          else break;
        }
        setStats({ total: history.length, streak });
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  if (loading) return (
    <ChameleonBackground emotionLabel="Neutral">
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <ActivityIndicator color={theme.accent} size="large" />
      </View>
    </ChameleonBackground>
  );

  return (
    <ChameleonBackground emotionLabel="Neutral">
      <EmotionalParticles emotionColor={theme.accent} intensity={1} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.headerLabel, { color: theme.accent }]}>MI PERFIL</Text>
          <Text style={styles.headerTitle}>Mi Oasis</Text>
        </View>

      {/* Avatar Card */}
      <View style={[styles.profileCard, { backgroundColor: theme.surface }]}>
        <View style={[styles.profileAvatarPlaceholder, { backgroundColor: theme.accent }]}>
          <Text style={[styles.avatarInitials, { color: COLORS.background }]}>{user?.full_name?.charAt(0) || 'U'}</Text>
        </View>
        <Text style={styles.profileName}>{user?.full_name || 'Estudiante'}</Text>
        <Text style={styles.profileEmail}>{user?.email || 'email@uab.edu.bo'}</Text>
        <View style={[styles.roleBadge, { backgroundColor: theme.accent + '15' }]}>
          <ShieldCheck color={theme.accent} size={14} />
          <Text style={[styles.roleText, { color: theme.accent }]}>{user?.role?.toUpperCase() || 'ESTUDIANTE'}</Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.infoRow}>
        <View style={styles.infoCol}>
          <View style={[styles.iconCircle, { backgroundColor: theme.accent + '15' }]}>
            <Flame color={theme.accent} size={20} />
          </View>
          <Text style={styles.infoVal}>{stats.streak}</Text>
          <Text style={styles.infoLab}>Racha</Text>
        </View>
        <View style={styles.infoCol}>
          <View style={[styles.iconCircle, { backgroundColor: theme.accent + '15' }]}>
            <BookText color={theme.accent} size={20} />
          </View>
          <Text style={styles.infoVal}>{stats.total}</Text>
          <Text style={styles.infoLab}>Registros</Text>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity onPress={onLogout} style={[styles.logoutBtn, { backgroundColor: '#ef444415' }]}>
        <LogOut color="#ef4444" size={20} />
        <Text style={[styles.logoutText, { color: '#ef4444' }]}>Cerrar Sesión</Text>
      </TouchableOpacity>
      </ScrollView>
    </ChameleonBackground>
  );
}
