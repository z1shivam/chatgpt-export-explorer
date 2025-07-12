import './style.css';
import { dbOperations } from './database.js';
import { setupSearch } from './search.js';
import { ConversationRenderer } from './renderer.js';
class ChatGPTExplorer {
  constructor() {
    this.currentConversation = null;
    this.conversations = [];
    this.renderer = new ConversationRenderer();
    this.searchHandlers = null;
    this.searchResults = [];
    this.currentSearchIndex = -1;
    this.currentSearchQuery = '';
    this.hasConversations = false;
    this.currentFontSize = 'normal';
    this.highContrastMode = false;
    this.init();
  }
  async init() {
    this.bindEvents();
    this.initializeTheme();
    this.setupDragAndDrop();
    await this.loadConversationsFromDB();
    this.setupKeyboardShortcuts();
    this.setupAccessibilityControls();
    this.updateUI();
  }
  updateUI() {
    const landingScreen = document.getElementById('landingScreen');
    const mainApp = document.getElementById('mainApp');
    if (this.hasConversations && this.conversations.length > 0) {
      landingScreen.style.display = 'none';
      mainApp.style.display = 'flex';
      document.body.classList.add('main-app-active');
    } else {
      landingScreen.style.display = 'flex';
      mainApp.style.display = 'none';
      document.body.classList.remove('main-app-active');
    }
  }
  bindEvents() {
    document.getElementById('loadBtn').addEventListener('click', () => this.loadConversationsFile());
    document.getElementById('clearBtn').addEventListener('click', () => this.clearData());
    document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
    document.getElementById('browseBtn').addEventListener('click', () => this.loadConversationsFile());
    document.getElementById('landingThemeToggle').addEventListener('click', () => this.toggleTheme());
    document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileLoad(e));
    
    // Sample data button
    const loadSampleButton = document.getElementById('loadSampleData');
    if (loadSampleButton) {
      loadSampleButton.addEventListener('click', () => this.loadSampleData());
    }
    
    // Accessibility controls
    this.setupFontSizeControls();
    this.setupHighContrastToggle();
  }
  setupDragAndDrop() {
    const dropzone = document.getElementById('dropzone');
    const landingScreen = document.getElementById('landingScreen');
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      landingScreen.addEventListener(eventName, this.preventDefaults, false);
      document.body.addEventListener(eventName, this.preventDefaults, false);
    });
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, () => {
        dropzone.classList.add('drag-over');
      }, false);
    });
    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, () => {
        dropzone.classList.remove('drag-over');
      }, false);
    });
    dropzone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleDroppedFile(files[0]);
      }
    }, false);
    dropzone.addEventListener('click', () => {
      this.loadConversationsFile();
    });
  }
  preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  async handleDroppedFile(file) {
    if (!file.name.endsWith('.json')) {
      this.showMessage('Please drop a valid JSON file (conversations.json)', 'error');
      return;
    }
    try {
      this.showLoading('Loading conversations...');
      const text = await file.text();
      const conversations = JSON.parse(text);
      await dbOperations.clearAll();
      const stats = await dbOperations.storeConversations(conversations);
      console.log(`Loaded ${stats.conversations} conversations with ${stats.messages} messages`);
      await this.loadConversationsFromDB();
      this.hideLoading();
      this.showMessage(`Successfully loaded ${stats.conversations} conversations!`);
    } catch (error) {
      console.error('Error loading conversations:', error);
      this.hideLoading();
      this.showMessage('Error loading conversations. Please check the file format.', 'error');
    }
  }
  setupKeyboardShortcuts() {
    this.searchHandlers = setupSearch(
      this.conversations,
      (conversations, isGlobalSearch) => this.renderConversationsList(conversations, isGlobalSearch),
      (messages, query) => this.handleSearchResults(messages, query)
    );
    document.getElementById('prevResult').addEventListener('click', () => this.navigateSearchResult(-1));
    document.getElementById('nextResult').addEventListener('click', () => this.navigateSearchResult(1));
    document.getElementById('clearSearchResults').addEventListener('click', () => this.clearSearchResults());
    
    // Accessibility keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl + Plus/Minus for font size
      if (e.ctrlKey && e.key === '=') {
        e.preventDefault();
        const sizes = ['small', 'normal', 'large', 'xl'];
        const currentIndex = sizes.indexOf(this.currentFontSize);
        const nextIndex = Math.min(currentIndex + 1, sizes.length - 1);
        this.setFontSize(sizes[nextIndex]);
      } else if (e.ctrlKey && e.key === '-') {
        e.preventDefault();
        const sizes = ['small', 'normal', 'large', 'xl'];
        const currentIndex = sizes.indexOf(this.currentFontSize);
        const nextIndex = Math.max(currentIndex - 1, 0);
        this.setFontSize(sizes[nextIndex]);
      } else if (e.ctrlKey && e.shiftKey && e.key === 'H') {
        // Ctrl + Shift + H for high contrast
        e.preventDefault();
        this.toggleHighContrast();
      }
    });
  }
  clearSearchResults() {
    document.getElementById('globalSearch').value = '';
    this.renderConversationsList(this.conversations, false);
  }
  handleSearchResults(messages, query) {
    this.currentSearchQuery = query;
    if (!this.currentConversation || !query.trim()) {
      this.hideSearchNavigation();
      this.highlightSearchResults(messages);
      return;
    }
    this.searchResults = this.findSearchMatches(messages, query);
    this.currentSearchIndex = this.searchResults.length > 0 ? 0 : -1;
    this.updateSearchNavigation();
    this.highlightSearchResults(messages);
    setTimeout(() => {
      this.updateCurrentHighlight();
      this.scrollToCurrentResult();
    }, 100);
  }
  findSearchMatches(messages, query) {
    const matches = [];
    const lowerQuery = query.toLowerCase();
    messages.forEach((message, messageIndex) => {
      const content = message.content.toLowerCase();
      let index = content.indexOf(lowerQuery);
      while (index !== -1) {
        matches.push({
          messageIndex,
          messageId: message.message_id,
          position: index,
          text: message.content.substr(index, query.length)
        });
        index = content.indexOf(lowerQuery, index + 1);
      }
    });
    return matches;
  }
  navigateSearchResult(direction) {
    if (this.searchResults.length === 0) return;
    this.currentSearchIndex += direction;
    if (this.currentSearchIndex >= this.searchResults.length) {
      this.currentSearchIndex = 0;
    } else if (this.currentSearchIndex < 0) {
      this.currentSearchIndex = this.searchResults.length - 1;
    }
    this.updateSearchNavigation();
    this.updateCurrentHighlight();
    this.scrollToCurrentResult();
  }
  updateSearchNavigation() {
    const navigation = document.getElementById('searchNavigation');
    const countElement = document.getElementById('searchResultsCount');
    const prevBtn = document.getElementById('prevResult');
    const nextBtn = document.getElementById('nextResult');
    if (this.searchResults.length === 0) {
      this.hideSearchNavigation();
      return;
    }
    navigation.style.display = 'flex';
    countElement.textContent = `${this.currentSearchIndex + 1} of ${this.searchResults.length}`;
    prevBtn.disabled = false;
    nextBtn.disabled = false;
  }
  hideSearchNavigation() {
    document.getElementById('searchNavigation').style.display = 'none';
    this.searchResults = [];
    this.currentSearchIndex = -1;
    this.currentSearchQuery = '';
    this.renderer.setSearchQuery('');
  }
  updateCurrentHighlight() {
    document.querySelectorAll('.highlight.current').forEach(el => {
      el.classList.remove('current');
    });
    if (this.currentSearchIndex >= 0 && this.currentSearchIndex < this.searchResults.length) {
      const currentResult = this.searchResults[this.currentSearchIndex];
      const messageElement = document.querySelector(`[data-message-id="${currentResult.messageId}"]`);
      if (messageElement) {
        const highlights = messageElement.querySelectorAll('.highlight');
        let highlightIndex = 0;
        for (let i = 0; i < this.currentSearchIndex; i++) {
          if (this.searchResults[i].messageId === currentResult.messageId) {
            highlightIndex++;
          }
        }
        if (highlights[highlightIndex]) {
          highlights[highlightIndex].classList.add('current');
          setTimeout(() => {
            const highlightRect = highlights[highlightIndex].getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const headerHeight = document.querySelector('.conversation-header')?.offsetHeight || 100;
            if (highlightRect.top < headerHeight || highlightRect.bottom > windowHeight) {
              this.scrollToCurrentResult();
            }
          }, 100);
        }
      }
    }
  }
  scrollToCurrentResult() {
    if (this.currentSearchIndex < 0) return;
    const currentResult = this.searchResults[this.currentSearchIndex];
    const messageElement = document.querySelector(`[data-message-id="${currentResult.messageId}"]`);
    if (messageElement) {
      const highlightElements = messageElement.querySelectorAll('.highlight');
      let targetHighlight = null;
      let highlightIndex = 0;
      for (let i = 0; i < this.currentSearchIndex; i++) {
        if (this.searchResults[i].messageId === currentResult.messageId) {
          highlightIndex++;
        }
      }
      if (highlightElements[highlightIndex]) {
        targetHighlight = highlightElements[highlightIndex];
      }
      const contentContainer = document.getElementById('conversationContent');
      const conversationHeader = document.querySelector('.conversation-header');
      const headerHeight = conversationHeader ? conversationHeader.offsetHeight : 100;
      if (targetHighlight && contentContainer) {
        const highlightRect = targetHighlight.getBoundingClientRect();
        const containerRect = contentContainer.getBoundingClientRect();
        const relativeTop = highlightRect.top - containerRect.top + contentContainer.scrollTop;
        const targetScrollTop = relativeTop - (contentContainer.clientHeight / 2) + (highlightRect.height / 2);
        const finalScrollTop = Math.max(0, targetScrollTop - headerHeight);
        contentContainer.scrollTo({
          top: finalScrollTop,
          behavior: 'smooth'
        });
      } else {
        const messageRect = messageElement.getBoundingClientRect();
        const containerRect = contentContainer.getBoundingClientRect();
        const relativeTop = messageRect.top - containerRect.top + contentContainer.scrollTop;
        const targetScrollTop = relativeTop - headerHeight - 20;
        contentContainer.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: 'smooth'
        });
      }
    }
  }
  async loadConversationsFile() {
    document.getElementById('fileInput').click();
  }

  async loadSampleData() {
    try {
      this.showLoading('Loading sample conversations...');
      
      const response = await fetch('./conversations.json');
      if (!response.ok) {
        throw new Error(`Failed to load sample data: ${response.status}`);
      }
      
      const sampleConversations = await response.json();
      console.log('Loaded sample conversations:', sampleConversations.length);
      
      // Clear existing data and store sample data
      await dbOperations.clearAll();
      const stats = await dbOperations.storeConversations(sampleConversations);
      
      console.log(`Loaded ${stats.conversations} conversations with ${stats.messages} messages`);
      
      // Reload conversations from database
      await this.loadConversationsFromDB();
      
      this.hideLoading();
      this.showMessage(`Successfully loaded ${stats.conversations} sample conversations!`);
      
    } catch (error) {
      console.error('Error loading sample data:', error);
      this.hideLoading();
      this.showMessage('Failed to load sample conversations. Please try again.', 'error');
    }
  }
  async handleFileLoad(event) {
    const file = event.target.files[0];
    if (!file) return;
    try {
      this.showLoading('Loading conversations...');
      const text = await file.text();
      const conversations = JSON.parse(text);
      await dbOperations.clearAll();
      const stats = await dbOperations.storeConversations(conversations);
      console.log(`Loaded ${stats.conversations} conversations with ${stats.messages} messages`);
      await this.loadConversationsFromDB();
      this.hideLoading();
      this.showMessage(`Successfully loaded ${stats.conversations} conversations!`);
    } catch (error) {
      console.error('Error loading conversations:', error);
      this.hideLoading();
      this.showMessage('Error loading conversations. Please check the file format.', 'error');
    }
    event.target.value = '';
  }
  async loadConversationsFromDB() {
    try {
      this.conversations = await dbOperations.getConversations();
      this.hasConversations = this.conversations.length > 0;
      if (this.hasConversations) {
        this.renderConversationsList(this.conversations);
        if (!this.currentConversation) {
          this.clearMainContent();
        }
      } else {
        this.clearMainContent();
      }
      this.updateUI();
    } catch (error) {
      console.error('Error loading conversations from database:', error);
      this.hasConversations = false;
      this.clearMainContent();
      this.updateUI();
    }
  }
  clearMainContent() {
    document.getElementById('conversationTitle').textContent = 'Select a conversation';
    document.getElementById('conversationContent').innerHTML = 
      '<div class="no-conversation">Select a conversation from the sidebar to view its content</div>';
    this.hideSearchNavigation();
  }
  renderConversationsList(conversations, isGlobalSearchResults = false) {
    const conversationsList = document.getElementById('conversationsList');
    const searchResults = document.getElementById('searchResults');
    if (isGlobalSearchResults) {
      conversationsList.style.display = 'none';
      searchResults.style.display = 'flex';
      this.renderGlobalSearchResults(conversations);
    } else {
      conversationsList.style.display = '';
      searchResults.style.display = 'none';
      if (!conversations || conversations.length === 0) {
        conversationsList.innerHTML = '<div class="no-data">No conversations loaded</div>';
        return;
      }
      const fragment = document.createDocumentFragment();
      conversations.forEach((conversation, index) => {
        const item = document.createElement('button');
        item.className = 'conversation-item';
        item.dataset.conversationId = conversation.conversation_id;
        item.setAttribute('role', 'listitem');
        item.setAttribute('tabindex', '0');
        item.setAttribute('aria-label', `Conversation: ${conversation.title}`);
        const date = new Date(conversation.create_time * 1000).toLocaleDateString();
        item.innerHTML = `
          <div class="conversation-title">${this.escapeHtml(conversation.title)}</div>
          <div class="conversation-date">${date}</div>
        `;
        item.addEventListener('click', () => this.selectConversation(conversation));
        item.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.selectConversation(conversation);
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextItem = item.nextElementSibling;
            if (nextItem) nextItem.focus();
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevItem = item.previousElementSibling;
            if (prevItem) prevItem.focus();
          }
        });
        fragment.appendChild(item);
      });
      conversationsList.innerHTML = '';
      conversationsList.appendChild(fragment);
    }
  }
  renderGlobalSearchResults(searchResults) {
    const searchResultsList = document.getElementById('searchResultsList');
    const query = document.getElementById('globalSearch').value.trim();
    if (!searchResults || searchResults.length === 0) {
      searchResultsList.innerHTML = '<div class="no-data">No results found</div>';
      return;
    }
    const fragment = document.createDocumentFragment();
    searchResults.forEach(result => {
      const item = document.createElement('div');
      item.className = 'search-result-item';
      const date = new Date(result.conversation.create_time * 1000).toLocaleDateString();
      let titleHtml = this.escapeHtml(result.conversation.title);
      if (result.titleMatch && query) {
        titleHtml = this.highlightSearchTerm(titleHtml, query);
      }
      let matchesHtml = '';
      if (result.messageMatches.length > 0) {
        matchesHtml = result.messageMatches.slice(0, 3).map(match => {
          const contextHtml = this.highlightSearchTerm(this.escapeHtml(match.context), query);
          return `
            <div class="search-match">
              <div class="search-match-role ${match.role}">${match.role}</div>
              <div class="search-match-context">${contextHtml}</div>
            </div>
          `;
        }).join('');
        if (result.messageMatches.length > 3) {
          matchesHtml += `<div class="search-result-summary">+${result.messageMatches.length - 3} more matches</div>`;
        }
      }
      item.innerHTML = `
        <div class="search-result-title">${titleHtml}</div>
        <div class="search-result-meta">${date} • ${result.messageMatches.length} message${result.messageMatches.length !== 1 ? 's' : ''}</div>
        <div class="search-result-matches">${matchesHtml}</div>
      `;
      item.addEventListener('click', () => this.selectConversationFromSearch(result.conversation));
      fragment.appendChild(item);
    });
    searchResultsList.innerHTML = '';
    searchResultsList.appendChild(fragment);
  }
  highlightSearchTerm(text, query) {
    if (!query.trim()) return text;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  }
  async selectConversationFromSearch(conversation) {
    document.getElementById('globalSearch').value = '';
    await this.loadConversationsFromDB();
    await this.selectConversation(conversation);
  }
  async selectConversation(conversation) {
    document.querySelectorAll('.conversation-item').forEach(item => {
      item.classList.remove('active');
    });
    const selectedItem = document.querySelector(`[data-conversation-id="${conversation.conversation_id}"]`);
    if (selectedItem) {
      selectedItem.classList.add('active');
    }
    document.getElementById('conversationSearch').value = '';
    this.hideSearchNavigation();
    try {
      this.currentConversation = conversation;
      const messages = await dbOperations.getConversationMessages(conversation.conversation_id);
      document.getElementById('conversationTitle').textContent = conversation.title;
      this.renderer.renderMessages(messages);
    } catch (error) {
      console.error('Error loading conversation messages:', error);
      this.showMessage('Error loading conversation messages', 'error');
    }
  }
  async clearData() {
    if (!confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      return;
    }
    try {
      await dbOperations.clearAll();
      this.conversations = [];
      this.hasConversations = false;
      this.currentConversation = null;
      this.clearMainContent();
      this.updateUI();
      this.showMessage('All data cleared successfully!');
    } catch (error) {
      console.error('Error clearing data:', error);
      this.showMessage('Error clearing data', 'error');
    }
  }
  highlightSearchResults(messages) {
    if (!this.currentConversation) return;
    this.renderer.setSearchQuery(this.currentSearchQuery);
    if (!messages) {
      this.selectConversation(this.currentConversation);
      return;
    }
    this.renderer.renderMessages(messages, true);
  }
  showLoading(message = 'Loading...') {
    const content = document.getElementById('conversationContent');
    content.innerHTML = `<div class="loading">${message}</div>`;
  }
  hideLoading() {
    if (this.currentConversation) {
      this.selectConversation(this.currentConversation);
    } else {
      this.clearMainContent();
    }
  }
  showMessage(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: ${type === 'error' ? '#dc3545' : '#28a745'};
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-size: 14px;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '1';
    }, 100);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }
  initializeTheme() {
    const savedTheme = localStorage.getItem('chatgpt-explorer-theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
      this.updateThemeToggleIcon(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = prefersDark ? 'dark' : 'light';
      this.updateThemeToggleIcon(theme);
    }
  }
  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('chatgpt-explorer-theme', newTheme);
    this.updateThemeToggleIcon(newTheme);
  }
  updateThemeToggleIcon(theme) {
    const themeToggle = document.getElementById('themeToggle');
    const landingThemeToggle = document.getElementById('landingThemeToggle');
    const icon = theme === 'dark' ? '☀️' : '🌙';
    const title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    if (themeToggle) {
      themeToggle.textContent = icon;
      themeToggle.title = title;
    }
    if (landingThemeToggle) {
      landingThemeToggle.textContent = icon;
      landingThemeToggle.title = title;
    }
  }
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  setupAccessibilityControls() {
    // Load saved preferences
    const savedFontSize = localStorage.getItem('fontSize') || 'normal';
    const savedHighContrast = localStorage.getItem('highContrast') === 'true';
    
    this.setFontSize(savedFontSize);
    if (savedHighContrast) {
      this.toggleHighContrast();
    }
  }

  setupFontSizeControls() {
    const fontSizeButtons = document.querySelectorAll('.font-size-btn');
    fontSizeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const size = btn.dataset.size;
        this.setFontSize(size);
      });
    });
  }

  setupHighContrastToggle() {
    const highContrastBtn = document.getElementById('highContrastToggle');
    if (highContrastBtn) {
      highContrastBtn.addEventListener('click', () => {
        this.toggleHighContrast();
      });
    }
  }

  setFontSize(size) {
    // Remove all font size classes
    document.body.classList.remove('font-size-small', 'font-size-normal', 'font-size-large', 'font-size-xl');
    
    // Add the selected font size class
    document.body.classList.add(`font-size-${size}`);
    
    this.currentFontSize = size;
    localStorage.setItem('fontSize', size);
    
    // Update button states
    document.querySelectorAll('.font-size-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.size === size);
    });
  }

  toggleHighContrast() {
    this.highContrastMode = !this.highContrastMode;
    document.body.classList.toggle('high-contrast', this.highContrastMode);
    localStorage.setItem('highContrast', this.highContrastMode);
    
    const btn = document.getElementById('highContrastToggle');
    if (btn) {
      btn.classList.toggle('active', this.highContrastMode);
      btn.title = this.highContrastMode ? 'Disable High Contrast' : 'Enable High Contrast';
    }
  }
}
const chatApp = new ChatGPTExplorer();
window.chatApp = chatApp;
