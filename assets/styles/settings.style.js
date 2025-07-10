import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  darkContainer: {
    backgroundColor: '#151718',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 4,
  },
  darkHeader: {
    backgroundColor: '#1F2023',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
  },
  darkHeaderTitle: {
    color: '#fff',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  darkSection: {
    backgroundColor: '#1F2023',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  darkSectionTitle: {
    color: '#9BA1A6',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
    minHeight: 56,
  },
  darkSettingItem: {
    borderBottomColor: '#2D2F33',
  },
  settingItemButton: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 16,
  },
  darkSettingText: {
    color: '#fff',
  },
  accountInfo: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  darkAccountInfo: {
    borderBottomColor: '#2D2F33',
  },
  accountInfoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  darkAccountInfoLabel: {
    color: '#7A7E83',
  },
  accountInfoValue: {
    fontSize: 16,
    color: '#2c3e50',
  },
  darkAccountInfoValue: {
    color: '#fff',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
  darkVersionText: {
    color: '#7A7E83',
  },
});

export default styles;
