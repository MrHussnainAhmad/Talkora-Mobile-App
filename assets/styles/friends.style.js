import { StyleSheet, Dimensions } from 'react-native';
import COLORS from '../../constants/COLORS';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
    letterSpacing: 0.5,
  },
  placeholder: {
    width: 40,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    position: 'relative',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#1976D2',
  },
  tabText: {
    fontSize: 15,
    color: '#6c757d',
    marginLeft: 8,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  activeTabText: {
    color: '#1976D2',
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#dc3545',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    zIndex: 10,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e9ecef',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  searchIcon: {
    marginRight: 12,
    color: '#6c757d',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#212529',
    fontWeight: '500',
  },
  searchLoader: {
    marginLeft: 12,
  },
  content: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 18,
    marginVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e9ecef',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#e9ecef',
    backgroundColor: '#e9ecef',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 4,
  },
  userUsername: {
    fontSize: 15,
    color: '#6c757d',
    fontWeight: '500',
  },
  statusText: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 4,
    fontStyle: 'italic',
  },
  actionButton: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  actionButtonDisabled: {
    backgroundColor: '#ced4da',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonTextDisabled: {
    color: '#6c757d',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  acceptButton: {
    backgroundColor: '#28a745',
    shadowColor: '#28a745',
  },
  rejectButton: {
    backgroundColor: '#dc3545',
    shadowColor: '#dc3545',
  },
  cancelButton: {
    backgroundColor: '#ffc107',
    shadowColor: '#ffc107',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 20,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
});

export default styles;