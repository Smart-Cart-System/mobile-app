import { View, type ViewProps, StyleSheet, Platform } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: 'default' | 'card' | 'elevated' | 'outlined' | 'subtle';
  useShadow?: boolean;
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  intensity?: 'low' | 'medium' | 'high';
};

export function ThemedView({ 
  style, 
  lightColor, 
  darkColor, 
  variant = 'default',
  useShadow = false,
  radius = 'none',
  intensity = 'medium',
  ...otherProps 
}: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 
    variant === 'default' ? 'background' : 
    variant === 'card' ? 'card' :
    variant === 'subtle' ? 'backgroundSecondary' :
    variant === 'outlined' ? 'background' : 'card'
  );
  
  const borderColor = useThemeColor({}, 'border');
  const shadowColor = useThemeColor({}, 'shadow');

  return (
    <View 
      style={[
        { backgroundColor },
        variant === 'elevated' && useShadow && (
          intensity === 'low' ? styles.shadowLow :
          intensity === 'high' ? styles.shadowHigh :
          styles.shadowMedium
        ),
        variant === 'card' && useShadow && (
          intensity === 'low' ? styles.cardShadowLow :
          intensity === 'high' ? styles.cardShadowHigh :
          styles.cardShadowMedium
        ),
        variant === 'outlined' && { 
          borderWidth: StyleSheet.hairlineWidth, 
          borderColor 
        },
        radius === 'small' && styles.radiusSmall,
        radius === 'medium' && styles.radiusMedium,
        radius === 'large' && styles.radiusLarge,
        radius === 'full' && styles.radiusFull,
        style
      ]} 
      {...otherProps} 
    />
  );
}

const styles = StyleSheet.create({
  shadowLow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  shadowMedium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  shadowHigh: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  cardShadowLow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardShadowMedium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardShadowHigh: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  radiusSmall: {
    borderRadius: 8,
  },
  radiusMedium: {
    borderRadius: 12,
  },
  radiusLarge: {
    borderRadius: 20,
  },
  radiusFull: {
    borderRadius: 999,
  },
});
