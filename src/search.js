import { dbOperations } from './database.js';
export function setupSearch(conversations, onConversationResults, onMessageResults) {
  const globalSearchInput = document.getElementById('globalSearch');
  const conversationSearchInput = document.getElementById('conversationSearch');
  let globalSearchTimeout;
  let conversationSearchTimeout;
  let currentApp;
  globalSearchInput.addEventListener('input', (e) => {
    clearTimeout(globalSearchTimeout);
    globalSearchTimeout = setTimeout(() => {
      handleGlobalSearch(e.target.value, onConversationResults);
    }, 300);
  });
  conversationSearchInput.addEventListener('input', (e) => {
    clearTimeout(conversationSearchTimeout);
    conversationSearchTimeout = setTimeout(() => {
      handleConversationSearch(e.target.value, onMessageResults);
    }, 300);
  });
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'K') {
      e.preventDefault();
      globalSearchInput.focus();
      return;
    }
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      conversationSearchInput.focus();
      return;
    }
    if (e.key === 'F3' && !e.shiftKey) {
      e.preventDefault();
      if (window.chatApp && conversationSearchInput.value.trim()) {
        window.chatApp.navigateSearchResult(1);
      }
      return;
    }
    if (e.key === 'F3' && e.shiftKey) {
      e.preventDefault();
      if (window.chatApp && conversationSearchInput.value.trim()) {
        window.chatApp.navigateSearchResult(-1);
      }
      return;
    }
    if (e.key === 'Escape') {
      if (document.activeElement === globalSearchInput) {
        globalSearchInput.blur();
        globalSearchInput.value = '';
        handleGlobalSearch('', onConversationResults);
      } else if (document.activeElement === conversationSearchInput) {
        conversationSearchInput.blur();
        conversationSearchInput.value = '';
        handleConversationSearch('', onMessageResults);
      }
    }
  });
  return {
    clearGlobalSearch: () => {
      globalSearchInput.value = '';
      handleGlobalSearch('', onConversationResults);
    },
    clearConversationSearch: () => {
      conversationSearchInput.value = '';
      handleConversationSearch('', onMessageResults);
    }
  };
}
async function handleGlobalSearch(query, onResults) {
  try {
    if (!query.trim()) {
      const allConversations = await dbOperations.getConversations();
      onResults(allConversations);
      return;
    }
    const results = await dbOperations.globalSearch(query);
    onResults(results, true);
  } catch (error) {
    console.error('Error performing global search:', error);
    onResults([]);
  }
}
async function handleConversationSearch(query, onResults) {
  try {
    if (!query.trim()) {
      onResults(null, '');
      return;
    }
    const currentConversation = getCurrentConversation();
    if (!currentConversation) {
      onResults([], query);
      return;
    }
    const results = await dbOperations.searchInConversation(currentConversation.conversation_id, query);
    onResults(results, query);
  } catch (error) {
    console.error('Error performing conversation search:', error);
    onResults([], query);
  }
}
function getCurrentConversation() {
  const activeItem = document.querySelector('.conversation-item.active');
  if (!activeItem) return null;
  const conversationId = activeItem.dataset.conversationId;
  return { conversation_id: conversationId };
}
export function highlightTextInPlainText(text, query) {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
}
export function highlightText(text, query) {
  if (!query.trim()) return text;
  try {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    function highlightInNode(node, searchText) {
      if (node.nodeType === Node.TEXT_NODE) {
        const content = node.textContent;
        const regex = new RegExp(`(${escapeRegExp(searchText)})`, 'gi');
        if (regex.test(content)) {
          const parent = node.parentNode;
          const highlightedContent = content.replace(regex, '<span class="highlight">$1</span>');
          const tempContainer = document.createElement('div');
          tempContainer.innerHTML = highlightedContent;
          while (tempContainer.firstChild) {
            parent.insertBefore(tempContainer.firstChild, node);
          }
          parent.removeChild(node);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.tagName.toLowerCase();
        if (tagName !== 'code' && tagName !== 'pre' && tagName !== 'script' && tagName !== 'style') {
          const children = Array.from(node.childNodes);
          children.forEach(child => highlightInNode(child, searchText));
        }
      }
    }
    highlightInNode(tempDiv, query);
    return tempDiv.innerHTML;
  } catch (error) {
    console.error('Error highlighting text:', error);
    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  }
}
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
