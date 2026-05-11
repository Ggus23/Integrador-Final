import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Edit3, History, PieChart, User } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { styles } from '../theme/styles';

export function BottomNav({ active, onChange }) {
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
  const color = active ? COLORS.primary : 'rgba(255,255,255,0.5)';
  return (
    <TouchableOpacity onPress={onPress} style={[styles.navItem, active && styles.navItemActive]}>
      {React.cloneElement(icon, { color, size: 22 })}
      <Text style={[styles.navText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}
