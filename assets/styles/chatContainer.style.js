import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
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
  messageBubble: {
    maxWidth: '80%',
    marginVertical: 4,
    padding: 12,
    borderRadius: 16,
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#1976D2',
    borderBottomRightRadius: 4,
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  currentUserMessageText: {
    color: '#fff',
  },
  otherUserMessageText: {
    color: '#333',
  },
  imageContainer: {
    marginBottom: 4,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginVertical: 2,
  },
  emptyMessageText: {
    fontStyle: 'italic',
    opacity: 0.7,
  },
});

export default styles;
