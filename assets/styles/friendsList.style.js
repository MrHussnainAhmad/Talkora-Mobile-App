import { StyleSheet } from 'react-native';
import COLORS from '../../constants/COLORS';
import { FONTS } from '../../utils/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContainer: {
    paddingVertical: 0,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    marginBottom: 0,
    elevation: 0,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E5E7EB',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  friendInfo: {
    flex: 1,
    marginRight: 8,
  },
  friendName: {
    fontSize: 16,
    fontFamily: FONTS.POPPINS_SEMIBOLD,
    color: '#000000',
    marginBottom: 2,
    letterSpacing: 0,
  },
  lastMessage: {
    fontSize: 14,
    fontFamily: FONTS.POPPINS_REGULAR,
    color: '#6B7280',
    lineHeight: 18,
  },
  unreadMessage: {
    color: '#000000',
    fontWeight: '500',
  },
  messageTime: {
    alignItems: 'flex-end',
    minWidth: 55,
  },
  timeText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
    fontWeight: '400',
  },
  onlineStatus: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  onlineText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#25D366',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    opacity: 0.8,
  },
});

export default styles;
