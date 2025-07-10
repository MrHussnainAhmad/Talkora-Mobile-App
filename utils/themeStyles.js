import { Colors } from '../constants/Colors';

export const getThemeStyles = (theme) => {
  const colors = Colors[theme];
  
  return {
    // Container styles
    container: {
      backgroundColor: colors.background,
    },
    secondaryContainer: {
      backgroundColor: colors.secondaryBackground,
    },
    card: {
      backgroundColor: colors.cardBackground,
      shadowColor: theme === 'dark' ? '#000' : '#000',
      borderColor: colors.border,
    },
    
    // Text styles
    text: {
      color: colors.text,
    },
    secondaryText: {
      color: colors.icon,
    },
    
    // Header styles
    header: {
      backgroundColor: colors.headerBackground,
      borderBottomColor: colors.border,
    },
    
    // Input styles
    input: {
      backgroundColor: colors.inputBackground,
      color: colors.text,
      borderColor: colors.border,
    },
    
    // Button styles
    primaryButton: {
      backgroundColor: colors.tint,
    },
    
    // Modal styles
    modalOverlay: {
      backgroundColor: colors.modalOverlay,
    },
    modalContent: {
      backgroundColor: colors.cardBackground,
      borderColor: colors.border,
    },
    
    // Icon colors
    iconColor: colors.icon,
    primaryIconColor: colors.tint,
    dangerIconColor: colors.danger,
  };
};

export const applyTheme = (styles, theme) => {
  const themeStyles = getThemeStyles(theme);
  return {
    ...styles,
    ...themeStyles,
  };
};
