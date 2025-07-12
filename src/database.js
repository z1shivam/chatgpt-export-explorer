import Dexie from 'dexie';
export class ChatDatabase extends Dexie {
  constructor() {
    super('ChatGPTDatabase');
    this.version(1).stores({
      conversations: '++id, title, create_time, update_time, conversation_id',
      messages: '++id, conversation_id, message_id, role, content, create_time, parent_id'
    });
  }
}
const db = new ChatDatabase();
export const dbOperations = {
  async clearAll() {
    await db.conversations.clear();
    await db.messages.clear();
  },
  async storeConversations(conversations) {
    const conversationRecords = [];
    const messageRecords = [];
    conversations.forEach(conv => {
      conversationRecords.push({
        conversation_id: conv.id,
        title: conv.title,
        create_time: conv.create_time,
        update_time: conv.update_time
      });
      if (conv.mapping) {
        Object.values(conv.mapping).forEach(node => {
          if (node.message && node.message.content && node.message.content.parts) {
            const content = node.message.content.parts.join('\n');
            if (content.trim()) {
              messageRecords.push({
                conversation_id: conv.id,
                message_id: node.id,
                role: node.message.author.role,
                content: content,
                create_time: node.message.create_time,
                parent_id: node.parent
              });
            }
          }
        });
      }
    });
    await db.conversations.bulkAdd(conversationRecords);
    await db.messages.bulkAdd(messageRecords);
    return { 
      conversations: conversationRecords.length, 
      messages: messageRecords.length 
    };
  },
  async getConversations() {
    return await db.conversations
      .orderBy('update_time')
      .reverse()
      .toArray();
  },
  async getConversationMessages(conversationId) {
    const messages = await db.messages
      .where('conversation_id')
      .equals(conversationId)
      .toArray();
    return messages.sort((a, b) => (a.create_time || 0) - (b.create_time || 0));
  },
  async searchAllConversations(query) {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    const titleMatches = await db.conversations
      .filter(conv => conv.title.toLowerCase().includes(lowerQuery))
      .toArray();
    return titleMatches.sort((a, b) => (b.create_time || 0) - (a.create_time || 0));
  },
  async globalSearch(query) {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    const results = [];
    const allConversations = await db.conversations.toArray();
    for (const conv of allConversations) {
      const result = {
        conversation: conv,
        titleMatch: conv.title.toLowerCase().includes(lowerQuery),
        messageMatches: []
      };
      const messages = await db.messages
        .where('conversation_id')
        .equals(conv.conversation_id)
        .filter(msg => msg.content.toLowerCase().includes(lowerQuery))
        .toArray();
      for (const message of messages) {
        const content = message.content;
        const lowerContent = content.toLowerCase();
        const index = lowerContent.indexOf(lowerQuery);
        if (index !== -1) {
          const contextStart = Math.max(0, index - 60);
          const contextEnd = Math.min(content.length, index + query.length + 60);
          let context = content.substring(contextStart, contextEnd);
          if (contextStart > 0) context = '...' + context;
          if (contextEnd < content.length) context = context + '...';
          result.messageMatches.push({
            message_id: message.message_id,
            role: message.role,
            context: context,
            create_time: message.create_time,
            matchIndex: index
          });
        }
      }
      if (result.titleMatch || result.messageMatches.length > 0) {
        results.push(result);
      }
    }
    return results.sort((a, b) => {
      if (a.titleMatch && !b.titleMatch) return -1;
      if (!a.titleMatch && b.titleMatch) return 1;
      if (a.messageMatches.length !== b.messageMatches.length) {
        return b.messageMatches.length - a.messageMatches.length;
      }
      return (b.conversation.create_time || 0) - (a.conversation.create_time || 0);
    });
  },
  async searchInConversation(conversationId, query) {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return await db.messages
      .where('conversation_id')
      .equals(conversationId)
      .filter(msg => msg.content.toLowerCase().includes(lowerQuery))
      .toArray();
  },
  async getStats() {
    const conversationCount = await db.conversations.count();
    const messageCount = await db.messages.count();
    return { conversations: conversationCount, messages: messageCount };
  }
};
export default db;
