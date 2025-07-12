import { highlightText } from './search.js';
import { marked } from 'marked';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: false,
  mangle: false
});
export class ConversationRenderer {
  constructor() {
    this.contentContainer = document.getElementById('conversationContent');
    this.currentQuery = '';
  }
  renderMessages(messages, isSearchResult = false) {
    if (!messages || messages.length === 0) {
      this.contentContainer.innerHTML = '<div class="no-conversation">No messages found</div>';
      return;
    }
    const sortedMessages = messages.sort((a, b) => (a.create_time || 0) - (b.create_time || 0));
    const fragment = document.createDocumentFragment();
    sortedMessages.forEach(message => {
      if (message.content && message.content.trim()) {
        const messageElement = this.createMessageElement(message, isSearchResult);
        fragment.appendChild(messageElement);
      }
    });
    this.contentContainer.innerHTML = '';
    this.contentContainer.appendChild(fragment);
    this.applySyntaxHighlighting();
    this.contentContainer.scrollTop = 0;
  }
  applySyntaxHighlighting() {
    this.contentContainer.querySelectorAll('pre code').forEach((block) => {
      if (!block.classList.contains('language-highlighted')) {
        Prism.highlightElement(block);
        block.classList.add('language-highlighted');
      }
    });
  }
  createMessageElement(message, isSearchResult = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.role}`;
    messageDiv.dataset.messageId = message.message_id;
    const headerDiv = document.createElement('div');
    headerDiv.className = 'message-header';
    const roleSpan = document.createElement('span');
    roleSpan.className = 'message-role';
    roleSpan.textContent = message.role;
    const timeSpan = document.createElement('span');
    timeSpan.className = 'message-time';
    if (message.create_time) {
      timeSpan.textContent = new Date(message.create_time * 1000).toLocaleString();
    }
    headerDiv.appendChild(roleSpan);
    headerDiv.appendChild(timeSpan);
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    let content = message.content;
    if (isSearchResult && this.currentQuery) {
      content = highlightText(content, this.currentQuery);
    }
    content = this.processMessageContent(content);
    contentDiv.innerHTML = content;
    messageDiv.appendChild(headerDiv);
    messageDiv.appendChild(contentDiv);
    return messageDiv;
  }
  processMessageContent(content) {
    try {
      let html = marked.parse(content);
      html = html.replace(/<pre><code class="language-(\w+)">/g, (match, lang) => {
        const langMap = {
          'js': 'javascript',
          'ts': 'typescript',
          'py': 'python',
          'sh': 'bash',
          'shell': 'bash',
          'yml': 'yaml'
        };
        const mappedLang = langMap[lang] || lang;
        return `<pre><code class="language-${mappedLang}">`;
      });
      html = html.replace(/<pre><code>/g, '<pre><code class="language-text">');
      html = html.replace(/<a href="(https?:\/\/[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener noreferrer"');
      return html;
    } catch (error) {
      console.error('Error parsing markdown:', error);
      return this.processPlainText(content);
    }
  }
  processPlainText(content) {
    content = content.replace(/\n/g, '<br>');
    content = content.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    return content;
  }
  setSearchQuery(query) {
    this.currentQuery = query;
  }
  setupVirtualScrolling() {
  }
}
export function formatMessageTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diff = now - date;
  if (diff < 24 * 60 * 60 * 1000) {
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
  }
  return date.toLocaleDateString();
}
export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
