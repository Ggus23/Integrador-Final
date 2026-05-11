import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Sparkles } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { styles } from '../theme/styles';
import { api } from '../services/api';
import { EMOTION_THEMES } from '../constants/data';
import { ChameleonBackground } from '../components/ChameleonBackground';
import { EmotionalParticles } from '../components/EmotionalParticles';

const theme = EMOTION_THEMES['Neutral'];

export function LoginScreen({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      await api.login(email, password);
      onLoginSuccess();
    } catch (e) {
      Alert.alert("Error de Conexión", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChameleonBackground emotionLabel="Neutral">
      <EmotionalParticles emotionColor={theme.accent} intensity={1} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.loginContent}>
          <View style={styles.loginLogoContainer}>
            <View style={[styles.logoCircle, { backgroundColor: theme.accent }]}>
              <Sparkles color={COLORS.background} size={40} />
            </View>
            <Text style={styles.loginTitle}>MentaLink Diario</Text>
            <Text style={styles.loginSubtitle}>Conéctate con tu diario</Text>
          </View>
          
          <View style={styles.loginForm}>
            <View style={[styles.inputWrapper, { backgroundColor: COLORS.surface }]}>
              <Mail color={theme.accent} size={20} style={styles.inputIcon} />
              <TextInput placeholder="Correo institucional" placeholderTextColor="rgba(255,255,255,0.3)" value={email} onChangeText={setEmail} style={styles.loginInput} autoCapitalize="none" />
            </View>
            <View style={[styles.inputWrapper, { backgroundColor: COLORS.surface }]}>
              <Lock color={theme.accent} size={20} style={styles.inputIcon} />
              <TextInput placeholder="Contraseña" placeholderTextColor="rgba(255,255,255,0.3)" value={password} secureTextEntry onChangeText={setPassword} style={styles.loginInput} />
            </View>
            <TouchableOpacity activeOpacity={0.8} onPress={handleLogin} disabled={loading} style={[styles.loginBtnShadow, { shadowColor: theme.accent }]}>
              <View style={[styles.loginBtn, { backgroundColor: theme.accent }]}>
                {loading ? <ActivityIndicator color={COLORS.background} /> : <Text style={[styles.loginBtnText, { color: COLORS.background }]}>Iniciar Sesión</Text>}
              </View>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
    </ChameleonBackground>
  );
}
