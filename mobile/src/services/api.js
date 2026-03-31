import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const DEV_PC_IP = '192.168.0.13'; // IP de tu PC en la red local
const BASE_URL = `http://${DEV_PC_IP}:8000`; // Cambiado para que funcione en celulares físicos (Android e iOS)
const API_V1 = `${BASE_URL}/api/v1`;

export const api = {
  async login(email, password) {
    try {
      const details = { 'username': email, 'password': password };
      const formBody = Object.keys(details).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(details[key])).join('&');

      const response = await fetch(`${API_V1}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', 'Accept': 'application/json' },
        body: formBody,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Credenciales incorrectas');
      await SecureStore.setItemAsync('userToken', data.access_token);
      return data;
    } catch (error) {
      console.error("Auth ERROR:", error.message);
      throw error;
    }
  },

  async getMe() {
    const token = await this.getToken();
    if (!token) throw new Error('No token');
    const response = await fetch(`${API_V1}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Error al obtener perfil');
    return data;
  },

  async logout() { await SecureStore.deleteItemAsync('userToken'); },
  async getToken() { return await SecureStore.getItemAsync('userToken'); },

  async saveDiaryEntry(entryData) {
    const token = await this.getToken();
    if (!token) throw new Error('Sesión expirada');
    try {
      const response = await fetch(`${API_V1}/diary/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          experience: entryData.experience,
          activities: entryData.activities,
          emotion: entryData.emotion,
          emotion_color: entryData.emotion_color,
          wellbeing_level: entryData.wellbeing_level,
          date: new Date().toISOString().split('T')[0]
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Error al guardar');
      return data;
    } catch (error) { throw error; }
  },

  async getDiaryHistory() {
    const token = await this.getToken();
    if (!token) return [];
    try {
      const response = await fetch(`${API_V1}/diary/me?limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) { return []; }
  },

  async getWordCloud() {
    const token = await this.getToken();
    if (!token) return [];
    try {
      const response = await fetch(`${API_V1}/visualizations/wordcloud`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) { return []; }
  },

  async getPhraseCloud() {
    const token = await this.getToken();
    if (!token) return [];
    try {
      const response = await fetch(`${API_V1}/visualizations/phrasecloud`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) { return []; }
  }
};
