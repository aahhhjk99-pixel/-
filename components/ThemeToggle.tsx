import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Moon, Sun } from 'lucide-react-native';
import { useTheme } from '@/lib/theme-context';

export default function ThemeToggle() {
  const { isDark, toggleTheme, colors } = useTheme();

  return (
    <TouchableOpacity style={styles.btn} onPress={toggleTheme}>
      {isDark ? (
        <Sun color={colors?.text || '#ffffff'} size={20} />
      ) : (
        <Moon color={colors?.text || '#000000'} size={20} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    padding: 8,
    borderRadius: 8,
  },
});
