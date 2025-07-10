class MessagePagination {
  constructor(pageSize = 20) {
    this.pageSize = pageSize;
    this.currentPage = 1;
    this.hasMore = true;
    this.loading = false;
    this.allMessages = [];
  }

  // Initialize with existing messages
  initialize(messages) {
    this.allMessages = messages || [];
    this.currentPage = 1;
    this.hasMore = messages.length >= this.pageSize;
    this.loading = false;
  }

  // Get current page of messages
  getCurrentMessages() {
    return this.allMessages.slice(0, this.currentPage * this.pageSize);
  }

  // Load more messages
  async loadMore(fetchFunction) {
    if (this.loading || !this.hasMore) {
      return false;
    }

    this.loading = true;
    try {
      const newMessages = await fetchFunction(this.currentPage + 1, this.pageSize);
      
      if (newMessages && newMessages.length > 0) {
        // Add new messages to the beginning (older messages)
        this.allMessages = [...newMessages, ...this.allMessages];
        this.currentPage++;
        this.hasMore = newMessages.length >= this.pageSize;
      } else {
        this.hasMore = false;
      }
      
      return true;
    } catch (error) {
      console.error('Error loading more messages:', error);
      return false;
    } finally {
      this.loading = false;
    }
  }

  // Add new message (real-time)
  addMessage(message) {
    // Check if message already exists
    const exists = this.allMessages.some(msg => msg._id === message._id);
    if (!exists) {
      this.allMessages.push(message);
    }
  }

  // Remove message
  removeMessage(messageId) {
    this.allMessages = this.allMessages.filter(msg => msg._id !== messageId);
  }

  // Clear all messages
  clear() {
    this.allMessages = [];
    this.currentPage = 1;
    this.hasMore = true;
    this.loading = false;
  }

  // Get pagination info
  getInfo() {
    return {
      currentPage: this.currentPage,
      hasMore: this.hasMore,
      loading: this.loading,
      totalMessages: this.allMessages.length,
      displayedMessages: this.getCurrentMessages().length
    };
  }
}

export default MessagePagination;
