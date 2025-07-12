import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  chatContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  inputWrapper: {
    backgroundColor: '#fff',
  },

  // Dark Mode Styles
  darkContainer: {
    backgroundColor: '#121212',
  },
  darkChatContent: {
    backgroundColor: '#121212',
  },
  darkLoadingContainer: {
    backgroundColor: '#121212',
  },
  darkLoadingText: {
    color: '#FFFFFF',
  },
  darkInputWrapper: {
    backgroundColor: '#1E1E1E',
  },
});

export default styles;
