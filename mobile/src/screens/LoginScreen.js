import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, StatusBar, Linking, StyleSheet } from 'react-native';
import { Mail, Lock, Sparkles, AlertCircle } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { styles } from '../theme/styles';
import { api } from '../services/api';
import { EMOTION_THEMES } from '../constants/data';
import { ChameleonBackground } from '../components/ChameleonBackground';
import { EmotionalParticles } from '../components/EmotionalParticles';

const theme = EMOTION_THEMES['Neutral'];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginScreen({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: null, password: null });

  const validate = () => {
    const nextErrors = { email: null, password: null };
    if (!email.trim()) nextErrors.email = 'El correo electrónico es obligatorio';
    else if (!EMAIL_REGEX.test(email.trim())) nextErrors.email = 'Ingresa un correo electrónico válido';
    if (!password) nextErrors.password = 'La contraseña es obligatoria';
    setErrors(nextErrors);
    return !nextErrors.email && !nextErrors.password;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await api.login(email.trim(), password);
      onLoginSuccess();
    } catch (e) {
      Alert.alert("Error de Conexión", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChameleonBackground emotionLabel="Neutral">
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} translucent={false} />
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
            <View style={[styles.inputWrapper, { backgroundColor: COLORS.surface }, errors.email && loginStyles.inputError]}>
              <Mail color={theme.accent} size={20} style={styles.inputIcon} />
              <TextInput placeholder="Correo institucional" placeholderTextColor="rgba(255,255,255,0.3)" value={email} onChangeText={(text) => { setEmail(text); if (errors.email) setErrors((p) => ({ ...p, email: null })); }} style={styles.loginInput} autoCapitalize="none" keyboardType="email-address" autoCorrect={false} />
            </View>
            {errors.email && (
              <View style={loginStyles.errorRow}>
                <AlertCircle size={12} color="#f87171" />
                <Text style={loginStyles.errorText}>{errors.email}</Text>
              </View>
            )}

            <View style={[styles.inputWrapper, { backgroundColor: COLORS.surface }, errors.password && loginStyles.inputError]}>
              <Lock color={theme.accent} size={20} style={styles.inputIcon} />
              <TextInput placeholder="Contraseña" placeholderTextColor="rgba(255,255,255,0.3)" value={password} secureTextEntry onChangeText={(text) => { setPassword(text); if (errors.password) setErrors((p) => ({ ...p, password: null })); }} style={styles.loginInput} />
            </View>
            {errors.password && (
              <View style={loginStyles.errorRow}>
                <AlertCircle size={12} color="#f87171" />
                <Text style={loginStyles.errorText}>{errors.password}</Text>
              </View>
            )}

            <TouchableOpacity activeOpacity={0.8} onPress={handleLogin} disabled={loading} style={[styles.loginBtnShadow, { shadowColor: theme.accent }]}>
              <View style={[styles.loginBtn, { backgroundColor: theme.accent }]}>
                {loading ? <ActivityIndicator color={COLORS.background} /> : <Text style={[styles.loginBtnText, { color: COLORS.background }]}>Iniciar Sesión</Text>}
              </View>
            </TouchableOpacity>

            <Text style={loginStyles.verifyHint}>
              Si te registraste hace poco, confirma tu cuenta con el enlace de verificación enviado a tu correo antes de iniciar sesión.
            </Text>

            {/* Registration notice */}
            <View style={{ marginTop: 20, alignItems: 'center', paddingHorizontal: 16 }}>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: 'Manrope_400Regular', textAlign: 'center', lineHeight: 20 }}>
                ¿No tienes una cuenta?
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'Manrope_400Regular', textAlign: 'center', lineHeight: 18, marginTop: 4 }}>
                Regístrate primero en la plataforma web
              </Text>
              <TouchableOpacity 
                onPress={() => Linking.openURL('https://menta-link-plataforma-web.up.railway.app/signup')}
                style={{ marginTop: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}
              >
                <Text style={{ color: theme.accent, fontSize: 11, fontFamily: 'Manrope_800ExtraBold', letterSpacing: 1 }}>
                  MENTALINK.RAILWET.APP
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
    </ChameleonBackground>
  );
}

const loginStyles = StyleSheet.create({
  inputError: {
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.6)',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 6,
    marginTop: -6,
    marginBottom: 6,
  },
  errorText: {
    color: '#f87171',
    fontSize: 11,
    fontFamily: 'Manrope_600SemiBold',
  },
  verifyHint: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    fontFamily: 'Manrope_400Regular',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 16,
    marginTop: 12,
    fontStyle: 'italic',
  },
});

