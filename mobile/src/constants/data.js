import React from 'react';
import { 
  GraduationCap, Gamepad2, Dumbbell, PartyPopper, Tv, Briefcase, 
  Headphones, Utensils, Heart, Monitor, MapPin, Users
} from 'lucide-react-native';
import { COLORS } from '../theme/colors';

// ─── CHAMELEON INTERFACE: Emotion-based dynamic theme palettes ───
export const EMOTION_THEMES = {
  'Muy triste':  { bg: '#0a0e1a', surface: '#141828', gradient: ['#0a0e1a', '#1a1030', '#0a0e1a'], accent: '#ef4444', glow: 'rgba(239,68,68,0.12)' },
  'Triste':      { bg: '#0d1418', surface: '#151e25', gradient: ['#0d1418', '#1a1520', '#0d1418'], accent: '#f97316', glow: 'rgba(249,115,22,0.12)' },
  'Neutral':     { bg: '#041424', surface: '#102130', gradient: ['#041424', '#0c1d2c', '#041424'], accent: '#facc15', glow: 'rgba(250,204,21,0.10)' },
  'Feliz':       { bg: '#041a14', surface: '#0c2a1e', gradient: ['#041a14', '#0a2418', '#041a14'], accent: '#86efac', glow: 'rgba(134,239,172,0.12)' },
  'Muy feliz':   { bg: '#041c12', surface: '#0a2e1a', gradient: ['#041c12', '#082a16', '#041c12'], accent: '#22c55e', glow: 'rgba(34,197,94,0.15)' },
};

export const EMOTIONS = [
  { label: 'Muy triste', emoji: '😢', color: 'Rojo', themeColor: COLORS.moodMuyTriste, level: 1 },
  { label: 'Triste', emoji: '🙁', color: 'Naranja', themeColor: COLORS.moodTriste, level: 2 },
  { label: 'Neutral', emoji: '😐', color: 'Amarillo', themeColor: COLORS.moodNeutral, level: 3 },
  { label: 'Feliz', emoji: '🙂', color: 'Verde claro', themeColor: COLORS.moodFeliz, level: 4 },
  { label: 'Muy feliz', emoji: '😄', color: 'Verde', themeColor: COLORS.moodMuyFeliz, level: 5 },
];

export const PREDEFINED_ACTIVITIES = [
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

export const DIARY_PROMPTS = [
  "¿Qué fue lo mejor de tu día hoy?",
  "¿De qué te sientes orgulloso hoy?",
  "¿Qué te hizo reír o sonreír?",
  "¿Hubo algo que te hizo sentir un reto?",
  "¿Qué aprendiste sobre ti mismo hoy?",
  "¿Hay algo que te gustaría soltar o dejar ir?",
  "Escribe sobre un momento pequeño que te trajo paz."
];

// ─── PROMPTS ADAPTATIVOS (Visual Only - Mock) ───
export const ADAPTIVE_PROMPTS = [
  { text: '¿Cómo te fue hoy con la inquietud que mencionaste ayer?', ref: 'Ayer mencionaste sentirte ansioso por un examen.', type: 'followup' },
  { text: '¿Pudiste poner en práctica el descanso que te sugerimos?', ref: 'Hace 2 días detectamos un patrón de agotamiento.', type: 'action' },
  { text: '¿Cómo estuvo la charla con tu madre que mencionaste?', ref: 'El lunes escribiste sobre una conversación pendiente.', type: 'followup' },
  { text: '¿Hoy fue un día mejor que ayer?', ref: 'Tu bienestar bajó 2 puntos ayer respecto al promedio.', type: 'trend' },
  { text: '¿Qué emociones te generó volver a la rutina?', ref: 'El fin de semana registraste actividades de descanso.', type: 'context' },
  { text: '¿Pudiste dormir bien anoche?', ref: 'Últimamente tus registros nocturnos muestran cansancio.', type: 'pattern' },
];

// ─── CÁPSULAS DEL TIEMPO (Visual Only - Mock) ───
export const TIME_CAPSULES = [
  {
    daysAgo: 30,
    emotion: 'Muy triste',
    emoji: '😢',
    snippet: 'Sentí que no iba a poder con el parcial de matemáticas. Todo se veía oscuro.',
    resolution: 'Aprobaste con 78/100. El miedo era más grande que el obstáculo.',
    color: COLORS.moodMuyTriste,
  },
  {
    daysAgo: 14,
    emotion: 'Triste',
    emoji: '🙁',
    snippet: 'Discutí con mi mejor amigo y pensé que no íbamos a hablar más.',
    resolution: 'Se reconciliaron 3 días después. La amistad era más fuerte.',
    color: COLORS.moodTriste,
  },
  {
    daysAgo: 45,
    emotion: 'Neutral',
    emoji: '😐',
    snippet: 'Me sentía estancado, sin motivación para nada...',
    resolution: 'Una semana después empezaste el gym y tu ánimo subió a "Feliz".',
    color: COLORS.moodNeutral,
  },
];
