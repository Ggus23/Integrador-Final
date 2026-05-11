import { StyleSheet, Dimensions } from 'react-native';
import { COLORS } from './colors';

const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const styles = StyleSheet.create({
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

  cloudGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, paddingHorizontal: 10 },
  cloudWord: { color: COLORS.primary, fontFamily: 'NotoSerif_400Regular_Italic', textAlign: 'center', maxWidth: '100%' },

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
  navItem: { alignItems: 'center', gap: 4, paddingVertical: 12, paddingHorizontal: 16 },
  navItemActive: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16 },
  navText: { fontSize: 9, fontFamily: 'Manrope_800ExtraBold' },

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
  legendText: { fontSize: 7, color: 'rgba(255,255,255,0.4)', fontFamily: 'Manrope_800ExtraBold', textTransform: 'uppercase' },

  // Zen Mode styles
  zenExitBtn: { marginLeft: 'auto', backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  zenExitText: { fontSize: 8, fontFamily: 'Manrope_800ExtraBold', letterSpacing: 2 },

  // Reorganized diary layout styles
  sectionLabel: { fontSize: 9, fontFamily: 'Manrope_800ExtraBold', letterSpacing: 2.5, marginBottom: 12, marginTop: 20, paddingHorizontal: 4 },
  activityScroll: { paddingBottom: 4, gap: 8 },
  activityPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.03)' },
  activityPillText: { fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'Manrope_600SemiBold' },
  saveBtnFull: { height: 54, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  saveBtnContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
