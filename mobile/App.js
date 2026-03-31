import React, { useState, useEffect, useMemo } from 'react';
import { 
  StyleSheet, View, Text, ScrollView, TextInput, 
  TouchableOpacity, Image, Dimensions,
  StatusBar, KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { 
  Home, Edit3, History, User, Plus, 
  CheckCircle2, Mail, Lock, LogOut, Sparkles,
  PieChart, Brain, Bell, BookOpen, Coffee, Users, Target, Moon, Smile, ShieldCheck, Flame, BookText,
  Gamepad2, Dumbbell, PartyPopper, Tv, Briefcase, GraduationCap, Headphones, Utensils, Heart, Monitor, ShoppingBag, MapPin,
  Lightbulb, PenTool
} from 'lucide-react-native';
import { 
  useFonts, 
  NotoSerif_400Regular, 
  NotoSerif_700Bold, 
  NotoSerif_400Regular_Italic 
} from '@expo-google-fonts/noto-serif';
import { 
  Manrope_400Regular, 
  Manrope_600SemiBold, 
  Manrope_800ExtraBold 
} from '@expo-google-fonts/manrope';
import { COLORS } from './src/theme/colors';
import { api } from './src/services/api';

const { width } = Dimensions.get('window');

const EMOTIONS = [
  { label: 'Muy triste', emoji: '😢', color: 'Rojo', themeColor: COLORS.moodMuyTriste, level: 1 },
  { label: 'Triste', emoji: '🙁', color: 'Naranja', themeColor: COLORS.moodTriste, level: 2 },
  { label: 'Neutral', emoji: '😐', color: 'Amarillo', themeColor: COLORS.moodNeutral, level: 3 },
  { label: 'Feliz', emoji: '🙂', color: 'Verde claro', themeColor: COLORS.moodFeliz, level: 4 },
  { label: 'Muy feliz', emoji: '😄', color: 'Verde', themeColor: COLORS.moodMuyFeliz, level: 5 },
];

const PREDEFINED_ACTIVITIES = [
  { id: 'estudio', label: 'Estudio', icon: <GraduationCap size={14} /> },
  { id: 'gaming', label: 'Gaming', icon: <Gamepad2 size={14} /> },
  { id: 'gym', label: 'Gym', icon: <Dumbbell size={14} /> },
  { id: 'fiesta', label: 'Fiesta', icon: <PartyPopper size={14} /> },
  { id: 'streaming', label: 'Streaming', icon: <Tv size={14} /> },
  { id: 'trabajo', label: 'Trabajo', icon: <Briefcase size={14} /> },
  { id: 'musica', label: 'Música', icon: <Headphones size={14} /> },
  { id: 'comida', label: 'Comida', icon: <Utensils size={14} /> },
  { id: 'social', label: 'Social', icon: <Users size={14} /> },
  { id: 'cita', label: 'Cita', icon: <Heart size={14} /> },
  { id: 'pc', label: 'PC/Tech', icon: <Monitor size={14} /> },
  { id: 'salida', label: 'Salida', icon: <MapPin size={14} /> },
];

const DIARY_PROMPTS = [
  "¿Qué fue lo mejor de tu día hoy?",
  "¿De qué te sientes orgulloso hoy?",
  "¿Qué te hizo reír o sonreír?",
  "¿Hubo algo que te hizo sentir un reto?",
  "¿Qué aprendiste sobre ti mismo hoy?",
  "¿Hay algo que te gustaría soltar o dejar ir?",
  "Escribe sobre un momento pequeño que te trajo paz."
];

export default function App() {
  return (
    <SafeAreaProvider>
      <MainLayout />
    </SafeAreaProvider>
  );
}

function MainLayout() {
  const insets = useSafeAreaInsets();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('diary');

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const token = await api.getToken();
    if (token) setIsLoggedIn(true);
    setLoading(false);
  };

  const [fontsLoaded] = useFonts({
    NotoSerif_400Regular,
    NotoSerif_700Bold,
    NotoSerif_400Regular_Italic,
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_800ExtraBold,
  });

  if (!fontsLoaded || loading) return null;

  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      {activeTab === 'diary' && <DiaryScreen />}
      {activeTab === 'history' && <HistoryScreen />}
      {activeTab === 'stats' && <StatsScreen />}
      {activeTab === 'profile' && <ProfileScreen onLogout={() => setIsLoggedIn(false)} />}
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </View>
  );
}

// --- LOGIN ---
function LoginScreen({ onLoginSuccess }) {
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
    <View style={styles.container}>
      <LinearGradient colors={['#0c1d2c', '#041424']} style={styles.loginGradient}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.loginContent}>
          <View style={styles.loginLogoContainer}>
            <View style={styles.logoCircle}>
              <Sparkles color="#fff" size={40} />
            </View>
            <Text style={styles.loginTitle}>MentaLink Diario</Text>
            <Text style={styles.loginSubtitle}>Conéctate con tu diario</Text>
          </View>
          
          <View style={styles.loginForm}>
            <View style={styles.inputWrapper}>
              <Mail color={COLORS.primary} size={20} style={styles.inputIcon} />
              <TextInput placeholder="Correo institucional" placeholderTextColor="rgba(255,255,255,0.3)" value={email} onChangeText={setEmail} style={styles.loginInput} autoCapitalize="none" />
            </View>
            <View style={styles.inputWrapper}>
              <Lock color={COLORS.primary} size={20} style={styles.inputIcon} />
              <TextInput placeholder="Contraseña" placeholderTextColor="rgba(255,255,255,0.3)" value={password} secureTextEntry onChangeText={setPassword} style={styles.loginInput} />
            </View>
            <TouchableOpacity activeOpacity={0.8} onPress={handleLogin} disabled={loading} style={styles.loginBtnShadow}>
              <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.loginBtn}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>Login</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

// --- DIARIO SCREEN ---
function DiaryScreen() {
  const [experience, setExperience] = useState('');
  const [learning, setLearning] = useState('');
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [selectedEmotionIdx, setSelectedEmotionIdx] = useState(2);
  const [submitting, setSubmitting] = useState(false);
  
  const activePrompt = useMemo(() => {
    return DIARY_PROMPTS[Math.floor(Math.random() * DIARY_PROMPTS.length)];
  }, []);

  const toggleActivity = (label) => {
    if (selectedActivities.includes(label)) {
      setSelectedActivities(selectedActivities.filter(a => a !== label));
    } else {
      setSelectedActivities([...selectedActivities, label]);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSave = async () => {
    if (!experience) return Alert.alert("¡Espera!", "¿Qué pasó hoy?");
    setSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const emo = EMOTIONS[selectedEmotionIdx];
    const fullText = `PASÓ HOY:\n${experience}\n\nAPRENDIZAJES:\n${learning}`;

    try {
      await api.saveDiaryEntry({ 
        experience: fullText, 
        activities: selectedActivities.join(', '), 
        emotion: emo.label, 
        emotion_color: emo.color, 
        wellbeing_level: emo.level 
      });
      setExperience(''); setLearning(''); setSelectedActivities([]);
      Alert.alert("¡Guardado!", "Se guardó en tu historial de MentaLink.");
    } catch (e) { Alert.alert("Error", e.message); } finally { setSubmitting(false); }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>DIARIO ESTRUCTURADO</Text>
        <Text style={styles.headerTitle}>Mi Día</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>¿Cómo te sientes?</Text>
        <View style={styles.emotionPickContainer}>
          {EMOTIONS.map((emo, i) => {
            const isActive = selectedEmotionIdx === i;
            return (
              <TouchableOpacity key={i} onPress={() => { setSelectedEmotionIdx(i); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} style={styles.emoItem}>
                <View style={[styles.emoBtn, isActive && { backgroundColor: emo.themeColor, transform: [{scale: 1.1}] }]}>
                  <Text style={styles.emoEmoji}>{emo.emoji}</Text>
                </View>
                <Text style={[styles.emoLabelDesc, isActive && { color: emo.themeColor, fontWeight: '800' }]}>{emo.label.toUpperCase()}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.cardLabel}>Hoy he realizado...</Text>
        <View style={styles.chipsContainer}>
          {PREDEFINED_ACTIVITIES.map(act => {
            const isActive = selectedActivities.includes(act.label);
            return (
              <TouchableOpacity key={act.id} onPress={() => toggleActivity(act.label)} style={[styles.chip, isActive && styles.chipActive]}>
                <View style={[styles.chipIcon, isActive && { color: COLORS.background }]}>{act.icon}</View>
                <Text style={[styles.chipLabel, isActive && { color: COLORS.background }]}>{act.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.inputWrap}>
          <View style={styles.inputTitleRow}>
            <PenTool size={14} color={COLORS.primary} />
            <Text style={styles.cardLabelInline}>¿Qué sucedió hoy?</Text>
          </View>
          <TextInput multiline placeholder={activePrompt} placeholderTextColor="#556" value={experience} onChangeText={setExperience} style={styles.textInput} />
        </View>

        <View style={styles.inputWrap}>
          <View style={styles.inputTitleRow}>
            <Lightbulb size={14} color={COLORS.primary} />
            <Text style={styles.cardLabelInline}>Mi aprendizaje / reflexión</Text>
          </View>
          <TextInput multiline placeholder="¿Alguna lección importante?" placeholderTextColor="#556" value={learning} onChangeText={setLearning} style={[styles.textInput, {minHeight: 80}]} />
        </View>

        <TouchableOpacity onPress={handleSave} disabled={submitting} style={[styles.saveBtn, { backgroundColor: EMOTIONS[selectedEmotionIdx].themeColor }]}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Guardar Registro</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// --- HISTORIAL SCREEN ---
function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emotionFilter, setEmotionFilter] = useState(null);
  const [limit, setLimit] = useState(5);

  useEffect(() => { load(); }, []);
  const load = async () => { setHistory(await api.getDiaryHistory()); setLoading(false); };

  const filtered = useMemo(() => {
    if (!emotionFilter) return history;
    return history.filter(item => item.emotion === emotionFilter);
  }, [history, emotionFilter]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>MI BIBLIOTECA</Text>
        <Text style={styles.headerTitle}>Recuerdos</Text>
      </View>

      <View style={styles.filterScrollContainer}>
         <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            <TouchableOpacity 
              onPress={() => setEmotionFilter(null)}
              style={[styles.filterChip, !emotionFilter && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, !emotionFilter && styles.filterChipTextActive]}>TODOS</Text>
            </TouchableOpacity>
            {EMOTIONS.map(emo => (
              <TouchableOpacity 
                key={emo.label}
                onPress={() => setEmotionFilter(emo.label)}
                style={[styles.filterChip, emotionFilter === emo.label && { backgroundColor: emo.themeColor, borderColor: emo.themeColor }]}
              >
                <Text style={styles.filterEmoji}>{emo.emoji}</Text>
                <Text style={[styles.filterChipText, emotionFilter === emo.label && { color: '#fff' }]}>{emo.label.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
         </ScrollView>
      </View>

      {loading ? <ActivityIndicator color={COLORS.primary} style={{marginTop: 50}} /> : (
        <View style={styles.historyList}>
          {filtered.length === 0 ? (
            <View style={styles.emptyContainer}>
               <Text style={styles.emptyText}>No hay registros{emotionFilter ? ` con el sentir "${emotionFilter}"` : ""}.</Text>
            </View>
          ) : (
            <>
              {filtered.slice(0, limit).map((item, idx) => {
                const emo = EMOTIONS.find(e => e.label === item.emotion) || EMOTIONS[2];
                
                // Intentar separar experiencia de aprendizaje
                let exp = item.experience || '';
                let lrn = '';
                if (exp.includes('PASÓ HOY:') && exp.includes('APRENDIZAJES:')) {
                  const parts = exp.split('APRENDIZAJES:');
                  exp = parts[0].replace('PASÓ HOY:', '').trim();
                  lrn = parts[1].trim();
                }

                return (
                  <View key={item.id || idx} style={styles.histCard}>
                    <View style={[styles.histBar, { backgroundColor: emo.themeColor } ]} />
                    <View style={styles.histContent}>
                      <View style={styles.histTop}>
                        <Text style={styles.histDate}>{new Date(item.date).toLocaleDateString()}</Text>
                        <View style={[styles.histBadge, { backgroundColor: emo.themeColor + '20' }]}>
                           <Text style={[styles.histMood, {color: emo.themeColor}]}>{emo.emoji} {item.emotion.toUpperCase()}</Text>
                        </View>
                      </View>
                      
                      <View style={styles.histSection}>
                         <Text style={styles.histSectionTitle}>SUCEDIDO</Text>
                         <Text style={styles.histExp}>{exp}</Text>
                      </View>
                      
                      {lrn ? (
                        <View style={[styles.histSection, { marginTop: 12, borderLeftWidth: 2, borderLeftColor: 'rgba(255,255,255,0.1)', paddingLeft: 10 }]}>
                          <Text style={styles.histSectionTitle}>REFLEXIÓN</Text>
                          <Text style={[styles.histExp, { fontStyle: 'italic', opacity: 0.8 }]}>{lrn}</Text>
                        </View>
                      ) : null}

                      {item.activities ? (
                        <View style={styles.histActivities}>
                           {item.activities.split(',').map((act, i) => (
                             <View key={i} style={styles.miniChip}>
                                <Text style={styles.miniChipText}>{act.trim().toUpperCase()}</Text>
                             </View>
                           ))}
                        </View>
                      ) : null}
                    </View>
                  </View>
                );
              })}
              
              {filtered.length > limit && (
                <TouchableOpacity onPress={() => setLimit(prev => prev + 5)} style={styles.moreBtn}>
                  <Text style={styles.moreBtnText}>VER MÁS RECUERDOS</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}

// --- STATS / NUBE ---
function StatsScreen() {
  const [wordCloud, setWordCloud] = useState([]);
  const [phraseCloud, setPhraseCloud] = useState([]);
  const [loading, setLoading] = useState(true);
  const [phraseLimit, setPhraseLimit] = useState(5);

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try {
      const [words, phrases] = await Promise.all([
        api.getWordCloud(),
        api.getPhraseCloud()
      ]);
      setWordCloud(words);
      setPhraseCloud(phrases);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const getSentimentColor = (sentiment) => {
    const s = sentiment?.toLowerCase() || '';
    if (s.includes('muy feliz') || s.includes('feliz')) return '#22C55E'; // Verde
    if (s.includes('neutral') || s.includes('indiferente')) return '#FACC15'; // Amarillo
    if (s.includes('ansioso') || s.includes('estresado')) return '#F97316'; // Naranja
    if (s.includes('triste') || s.includes('muy triste')) return '#EF4444'; // Rojo
    return COLORS.primary;
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>ANÁLISIS DE IA</Text>
        <Text style={styles.headerTitle}>Mapa Mental</Text>
      </View>

      {loading ? (
        <View style={styles.loadingStats}>
          <ActivityIndicator color={COLORS.primary} size="large" />
          <Text style={styles.loadingStatsText}>Analizando tus pensamientos...</Text>
        </View>
      ) : (
        <View style={styles.statsGap}>
          {/* SECCIÓN PALABRAS */}
          <View style={[styles.card, { paddingBottom: 20 }]}>
            <View style={styles.cardTitleRow}>
              <Brain size={14} color={COLORS.primary} />
              <Text style={styles.cardLabelTitle}>CONCEPTOS CLAVE</Text>
            </View>
            <View style={styles.cloudGrid}>
              {wordCloud.length > 0 ? wordCloud.slice(0, 30).map((w, i) => (
                <Text key={i} style={[
                  styles.cloudWord, 
                  { 
                    fontSize: Math.min(12 + w.frequency * 5, 26), 
                    fontFamily: w.frequency > 2 ? 'NotoSerif_700Bold' : 'NotoSerif_400Regular_Italic',
                    opacity: Math.min(0.4 + w.frequency * 0.2, 1),
                    color: getSentimentColor(w.sentiment)
                  }
                ]}>
                  {w.word}
                </Text>
              )) : (
                <Text style={styles.emptyCloudText}>Escribe más en tu diario para generar tu mapa mental.</Text>
              )}
            </View>

            {/* Legend Mobile */}
            <View style={styles.legendRow}>
               {[{l: 'Pos', c: '#22C55E'}, {l: 'Neu', c: '#FACC15'}, {l: 'Ans', c: '#F97316'}, {l: 'Tris', c: '#EF4444'}].map((leg, i) => (
                 <View key={i} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: leg.c }]} />
                    <Text style={styles.legendText}>{leg.l}</Text>
                 </View>
               ))}
            </View>
          </View>

          {/* SECCIÓN FRASES */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Sparkles size={14} color={COLORS.primary} />
              <Text style={styles.cardLabelTitle}>FRASES RECURRENTES</Text>
            </View>
            <View style={styles.phraseList}>
              {phraseCloud.length > 0 ? (
                <>
                  {phraseCloud.slice(0, phraseLimit).map((p, i) => (
                    <View key={i} style={styles.phraseItem}>
                      <View style={[
                        styles.phraseFreqDot, 
                        { 
                          backgroundColor: getSentimentColor(p.sentiment),
                          transform: [{scale: 0.5 + p.frequency * 0.1}] 
                        }
                      ]} />
                      <Text style={styles.phraseText}>{p.phrase}</Text>
                      <Text style={[styles.phraseCount, { color: getSentimentColor(p.sentiment) }]}>{p.frequency}x</Text>
                    </View>
                  ))}
                  
                  {phraseCloud.length > phraseLimit && (
                    <TouchableOpacity onPress={() => setPhraseLimit(prev => prev + 5)} style={styles.moreBtn}>
                      <Text style={styles.moreBtnText}>EXPLORAR MÁS FRASES</Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <Text style={styles.emptyCloudText}>No hay suficientes frases para analizar aún.</Text>
              )}
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

// --- PROFILE SCREEN ---
function ProfileScreen({ onLogout }) {
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

  if (loading) return <View style={{flex:1, justifyContent:'center'}}><ActivityIndicator color={COLORS.primary} /></View>;

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.screenTitle}>Mi Oasis</Text>
      <View style={styles.profileCard}>
        <View style={styles.profileAvatarPlaceholder}><Text style={styles.avatarInitials}>{user?.full_name?.charAt(0) || 'U'}</Text></View>
        <Text style={styles.profileName}>{user?.full_name || 'Estudiante'}</Text>
        <Text style={styles.profileEmail}>{user?.email || 'email@uab.edu.bo'}</Text>
        <View style={styles.roleBadge}><ShieldCheck color={COLORS.primary} size={14} /><Text style={styles.roleText}>{user?.role?.toUpperCase() || 'ESTUDIANTE'}</Text></View>
      </View>
      <View style={styles.infoRow}>
        <View style={styles.infoCol}><View style={styles.iconCircle}><Flame color="#FF8C00" size={20} /></View><Text style={styles.infoVal}>{stats.streak}</Text><Text style={styles.infoLab}>Racha</Text></View>
        <View style={styles.infoCol}><View style={[styles.iconCircle, {backgroundColor: 'rgba(255,182,139,0.1)'}]}><BookText color={COLORS.primary} size={20} /></View><Text style={styles.infoVal}>{stats.total}</Text><Text style={styles.infoLab}>Registros</Text></View>
      </View>
      <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}><LogOut color="#ff4444" size={20} /><Text style={styles.logoutText}>Cerrar Sesión</Text></TouchableOpacity>
    </ScrollView>
  );
}

function BottomNav({ active, onChange }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.navContainer, { height: 75 + insets.bottom }]}>
      <BlurView intensity={90} tint="dark" style={styles.navBlur}>
        <NavIcon active={active === 'diary'} icon={<Edit3 />} label="Diario" onPress={() => onChange('diary')} />
        <NavIcon active={active === 'history'} icon={<History />} label="Historial" onPress={() => onChange('history')} />
        <NavIcon active={active === 'stats'} icon={<PieChart />} label="Mapa" onPress={() => onChange('stats')} />
        <NavIcon active={active === 'profile'} icon={<User />} label="Perfil" onPress={() => onChange('profile')} />
      </BlurView>
    </View>
  );
}

function NavIcon({ active, icon, label, onPress }) {
  const color = active ? COLORS.primary : '#445';
  return (
    <TouchableOpacity onPress={onPress} style={styles.navItem}>{React.cloneElement(icon, { color, size: 22 })}<Text style={[styles.navText, { color }]}>{label}</Text></TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loginGradient: { flex: 1 },
  loginContent: { flex: 1, justifyContent: 'center', padding: 32 },
  loginLogoContainer: { alignItems: 'center', marginBottom: 48 },
  logoCircle: { width: 80, height: 80, borderRadius: 24, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  loginTitle: { color: '#fff', fontSize: 26, fontFamily: 'NotoSerif_700Bold' },
  loginSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontFamily: 'Manrope_400Regular' },
  loginForm: { gap: 16 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, paddingHorizontal: 16, height: 58 },
  inputIcon: { marginRight: 12 },
  loginInput: { flex: 1, color: '#fff' },
  loginBtnShadow: { marginTop: 10, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  loginBtn: { height: 58, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  loginBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Manrope_800ExtraBold' },

  scrollContent: { paddingHorizontal: 24, paddingBottom: 110 },
  header: { marginVertical: 20 },
  headerLabel: { color: COLORS.primary, fontSize: 9, fontFamily: 'Manrope_800ExtraBold', letterSpacing: 2 },
  headerTitle: { color: '#fff', fontSize: 26, fontFamily: 'NotoSerif_700Bold' },

  card: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 20 },
  cardLabel: { color: '#fff', fontSize: 12, fontFamily: 'Manrope_800ExtraBold', marginBottom: 16, opacity: 0.6 },
  cardLabelInline: { color: '#fff', fontSize: 11, fontFamily: 'Manrope_800ExtraBold', opacity: 0.8 },
  cardLabelTitle: { color: COLORS.primary, fontSize: 10, fontFamily: 'Manrope_800ExtraBold', letterSpacing: 2 },
  
  emotionPickContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  emoItem: { alignItems: 'center', width: 60 },
  emoBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.03)', justifyContent: 'center', alignItems: 'center' },
  emoEmoji: { fontSize: 24 },
  emoLabelDesc: { fontSize: 7, color: 'rgba(255,255,255,0.4)', fontFamily: 'Manrope_800ExtraBold', textAlign: 'center', marginTop: 8, width: '100%' },

  filterScrollContainer: { marginBottom: 20, marginHorizontal: -24 },
  filterScroll: { paddingHorizontal: 24, gap: 10 },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipText: { color: 'rgba(255,255,255,0.4)', fontSize: 9, fontFamily: 'Manrope_800ExtraBold' },
  filterChipTextActive: { color: '#fff' },
  filterEmoji: { fontSize: 14 },

  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12 },
  chipActive: { backgroundColor: COLORS.primary },
  chipIcon: { color: COLORS.primary },
  chipLabel: { color: '#fff', fontSize: 10, fontFamily: 'Manrope_800ExtraBold', textTransform: 'uppercase' },

  inputWrap: { marginVertical: 8 },
  inputTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  textInput: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 16, padding: 16, color: '#fff', minHeight: 90, textAlignVertical: 'top', fontSize: 14 },
  saveBtn: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  saveBtnText: { color: '#fff', fontSize: 14, fontFamily: 'Manrope_800ExtraBold' },

  screenTitle: { color: '#fff', fontSize: 22, fontFamily: 'NotoSerif_700Bold', marginVertical: 20 },
  historyList: { gap: 14 },
  histCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, flexDirection: 'row', overflow: 'hidden' },
  histBar: { width: 4 },
  histContent: { flex: 1, padding: 16 },
  histTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  histDate: { color: 'rgba(255,255,255,0.2)', fontSize: 8, fontFamily: 'Manrope_800ExtraBold' },
  histBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  histMood: { fontSize: 9, fontFamily: 'Manrope_800ExtraBold' },
  histSection: { gap: 4 },
  histSectionTitle: { color: COLORS.primary, fontSize: 8, fontFamily: 'Manrope_800ExtraBold', opacity: 0.6 },
  histExp: { color: '#fff', fontSize: 13, lineHeight: 20, fontFamily: 'Manrope_400Regular' },
  histActivities: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 12 },
  miniChip: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
  miniChipText: { color: 'rgba(255,255,255,0.3)', fontSize: 7, fontFamily: 'Manrope_800ExtraBold' },

  moreBtn: { height: 50, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 20 },
  moreBtnText: { color: COLORS.primary, fontSize: 10, fontFamily: 'Manrope_800ExtraBold', letterSpacing: 1 },

  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: 'rgba(255,255,255,0.2)', fontSize: 13, fontFamily: 'Manrope_400Regular', textAlign: 'center', fontStyle: 'italic' },

  cloudGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  cloudWord: { color: COLORS.primary, fontFamily: 'NotoSerif_400Regular_Italic' },

  profileCard: { backgroundColor: COLORS.surface, borderRadius: 28, padding: 32, alignItems: 'center' },
  profileAvatarPlaceholder: { width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarInitials: { color: '#fff', fontSize: 32, fontFamily: 'Manrope_800ExtraBold' },
  profileName: { color: '#fff', fontSize: 20, fontFamily: 'NotoSerif_700Bold' },
  profileEmail: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,182,139,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 12 },
  roleText: { color: COLORS.primary, fontSize: 10, fontFamily: 'Manrope_800ExtraBold' },

  infoRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 24 },
  infoCol: { alignItems: 'center' },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,140,0,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  infoVal: { color: '#fff', fontSize: 20, fontFamily: 'Manrope_800ExtraBold' },
  infoLab: { color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'Manrope_600SemiBold', marginTop: 4 },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, backgroundColor: 'rgba(255,68,68,0.1)', borderRadius: 16 },
  logoutText: { color: '#ff4444', fontSize: 14, fontFamily: 'Manrope_800ExtraBold' },

  navContainer: { position: 'absolute', bottom: 0, width: '100%' },
  navBlur: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: 'hidden' },
  navItem: { alignItems: 'center', gap: 2 },
  navText: { fontSize: 8, fontFamily: 'Manrope_800ExtraBold' },

  loadingStats: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100, gap: 16 },
  loadingStatsText: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontFamily: 'Manrope_400Regular' },
  statsGap: { gap: 20 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20 },
  emptyCloudText: { color: 'rgba(255,255,255,0.3)', fontSize: 12, textAlign: 'center', fontStyle: 'italic', padding: 20 },
  phraseList: { gap: 12 },
  phraseItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 16, gap: 12 },
  phraseFreqDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  phraseText: { flex: 1, color: '#fff', fontSize: 13, fontFamily: 'Manrope_400Regular' },
  phraseCount: { color: COLORS.primary, fontSize: 12, fontFamily: 'Manrope_800ExtraBold' },
  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 3, height: 3, borderRadius: 1.5 },
  legendText: { fontSize: 7, color: 'rgba(255,255,255,0.4)', fontFamily: 'Manrope_800ExtraBold', textTransform: 'uppercase' }
});
