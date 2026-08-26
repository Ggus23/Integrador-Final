import React, { useState, useEffect, useRef } from 'react';
import { View, StatusBar, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { api } from './src/services/api';
import { styles } from './src/theme/styles';

import { BottomNav } from './src/components/BottomNav';

import { LoginScreen } from './src/screens/LoginScreen';
import { DiaryScreen } from './src/screens/DiaryScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { StatsScreen } from './src/screens/StatsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import * as SecureStore from 'expo-secure-store';
import { Sparkles } from 'lucide-react-native';
import { COLORS } from './src/theme/colors';

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (e) {
  console.log('Notifications not available (Expo Go SDK 53+):', e.message);
}


// Components moved to src/components

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
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    initApp();

    try {
      registerForPushNotificationsAsync().then(token => {
        if (token) setExpoPushToken(token);
      });

      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        setNotification(notification);
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notificación tocada:', response);
      });
    } catch (e) {
      console.log('Notifications setup skipped (Expo Go):', e.message);
    }

    return () => {
      try {
        notificationListener.current?.remove();
        responseListener.current?.remove();
      } catch (e) {
        // ignore cleanup errors
      }
    };
  }, []);

  // Sincronizar token cuando el usuario inicia sesión o cuando se obtiene el token
  useEffect(() => {
    if (isLoggedIn && expoPushToken) {
      api.updateUserMe({ expo_push_token: expoPushToken })
        .then(() => console.log("Push token sincronizado con éxito"))
        .catch(e => console.log("Error al sincronizar token:", e.message));
    }
  }, [isLoggedIn, expoPushToken]);

  const initApp = async () => {
    try {
      // Parallelize checking session and getting last tab
      const [token, lastTab] = await Promise.all([
        api.getToken(),
        SecureStore.getItemAsync('activeTab')
      ]);

      if (token) {
        try {
          // Verify token is still valid
          await api.getMe();
          setIsLoggedIn(true);
          if (lastTab) setActiveTab(lastTab);
        } catch (err) {
          // Token expired or invalid
          console.log("Token invalid, logging out");
          await api.logout();
          setIsLoggedIn(false);
        }
      }
    } catch (e) {
      console.error("Init Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    await SecureStore.setItemAsync('activeTab', tab);
  };

  const [fontsLoaded] = useFonts({
    NotoSerif_400Regular,
    NotoSerif_700Bold,
    NotoSerif_400Regular_Italic,
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_800ExtraBold,
  });

  if (!fontsLoaded || loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} translucent={false} />
        <View style={[styles.logoCircle, { backgroundColor: COLORS.primary, width: 60, height: 60, borderRadius: 20 }]}>
          <Sparkles color={COLORS.background} size={30} />
        </View>
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
      </View>
    );
  }

  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} translucent={false} />
      {activeTab === 'diary' && <DiaryScreen />}
      {activeTab === 'history' && <HistoryScreen />}
      {activeTab === 'stats' && <StatsScreen />}
      {activeTab === 'profile' && <ProfileScreen onLogout={() => { setIsLoggedIn(false); SecureStore.deleteItemAsync('activeTab'); }} />}
      <BottomNav active={activeTab} onChange={handleTabChange} />
    </View>
  );
}

async function registerForPushNotificationsAsync() {
  try {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('¡Fallo al obtener los permisos para las notificaciones push!');
        return;
      }
      
      try {
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
          token = (await Notifications.getExpoPushTokenAsync()).data;
        } else {
          token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        }
        console.log("Push Token:", token);
      } catch (e) {
        console.log("Error obtaining push token:", e);
      }
    } else {
      console.log('Debes usar un dispositivo físico para las notificaciones Push');
    }

    return token;
  } catch (error) {
    console.log('Push notifications not supported in this environment (Expo Go SDK 53+):', error.message);
    return undefined;
  }
}