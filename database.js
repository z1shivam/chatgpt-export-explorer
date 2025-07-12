import Dexie from 'dexie';

// Database schema
export class ChatDatabase extends Dexie {
  constructor() {
    super('ChatGPTDatabase');
    
    this.version(1).stores({
      conversations: '++id, title, create_time, update_time, conversation_id',
      messages: '++id, conversation_id, message_id, role, content, create_time, parent_id'
    });
  }
}

// Database instance
const db = new ChatDatabase();

// Database operations
export const dbOperations = {
  // Clear all data
  async clearAll() {
    await db.conversations.clear();
    await db.messages.clear();
  },

  // Store conversations with optimized structure
  async storeConversations(conversations) {
    const conversationRecords = [];
    const messageRecords = [];
    
    conversations.forEach(conv => {
      // Store conversation metadata
      conversationRecords.push({
        conversation_id: conv.id,
        title: conv.title,
        create_time: conv.create_time,
        update_time: conv.update_time
      });
      
      // Extract and store messages from mapping
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
    
    // Bulk insert for better performance
    await db.conversations.bulkAdd(conversationRecords);
    await db.messages.bulkAdd(messageRecords);
    
    return { 
      conversations: conversationRecords.length, 
      messages: messageRecords.length 
    };
  },

  // Get all conversations sorted by update time
  async getConversations() {
    return await db.conversations
      .orderBy('update_time')
      .reverse()
      .toArray();
  },

  // Get messages for a specific conversation
  async getConversationMessages(conversationId) {
    return await db.messages
      .where('conversation_id')
      .equals(conversationId)
      .orderBy('create_time')
      .toArray();
  },

  // Search across all conversations
  async searchAllConversations(query) {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    
    // Search in conversation titles
    const titleMatches = await db.conversations
      .filter(conv => conv.title.toLowerCase().includes(lowerQuery))
      .toArray();
    
    // Search in message content
    const messageMatches = await db.messages
      .filter(msg => msg.content.toLowerCase().includes(lowerQuery))
      .toArray();
    
    // Get unique conversation IDs from message matches
    const messageConvIds = [...new Set(messageMatches.map(msg => msg.conversation_id))];
    const messageConversations = await db.conversations
      .where('conversation_id')
      .anyOf(messageConvIds)
      .toArray();
    
    // Combine and deduplicate results
    const allMatches = [...titleMatches, ...messageConversations];
    const uniqueMatches = allMatches.filter((conv, index, self) => 
      index === self.findIndex(c => c.conversation_id === conv.conversation_id)
    );
    
    return uniqueMatches.sort((a, b) => b.update_time - a.update_time);
  },

  // Search within a specific conversation
  async searchInConversation(conversationId, query) {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    
    return await db.messages
      .where('conversation_id')
      .equals(conversationId)
      .filter(msg => msg.content.toLowerCase().includes(lowerQuery))
      .toArray();
  },

  // Get database stats
  async getStats() {
    const conversationCount = await db.conversations.count();
    const messageCount = await db.messages.count();
    return { conversations: conversationCount, messages: messageCount };
  }
};

export default db;
