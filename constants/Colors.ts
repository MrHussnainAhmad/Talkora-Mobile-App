/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#1976D2';
const tintColorDark = '#4DA6FF';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    secondaryBackground: '#f5f5f5',
    cardBackground: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    border: '#E0E0E0',
    inputBackground: '#F5F5F5',
    modalOverlay: 'rgba(0, 0, 0, 0.5)',
    headerBackground: '#fff',
    danger: '#FF4444',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    secondaryBackground: '#1F2023',
    cardBackground: '#1F2023',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    border: '#2D2F33',
    inputBackground: '#2D2F33',
    modalOverlay: 'rgba(0, 0, 0, 0.7)',
    headerBackground: '#1F2023',
    danger: '#FF6B6B',
  },
};
