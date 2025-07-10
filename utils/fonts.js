import * as Font from 'expo-font';

// Font loading function
export const loadFonts = async () => {
  try {
    await Font.loadAsync({
      'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
      'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
      'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
      'LibertinusMono-Regular': require('../assets/fonts/LibertinusMono-Regular.ttf'),
    });
    console.log('✅ Fonts loaded successfully');
  } catch (error) {
    console.error('❌ Font loading error:', error);
  }
};

// Font family names for use in styles
export const FONTS = {
  POPPINS_REGULAR: 'Poppins-Regular',
  POPPINS_SEMIBOLD: 'Poppins-SemiBold',
  POPPINS_BOLD: 'Poppins-Bold',
  LIBERTINUS_MONO: 'LibertinusMono-Regular',
};
