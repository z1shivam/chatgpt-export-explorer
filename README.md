# ChatGPT Conversation Explorer

A fast, efficient web application for exploring and searching through exported ChatGPT conversations. Built with vanilla JavaScript and Vite for optimal performance and professional code quality.

## Features

### Core Functionality
- **Beautiful Landing Screen**: Intuitive drag-and-drop interface for easy file uploads
- **Fast Local Storage**: Uses IndexedDB with Dexie.js for lightning-fast data access and offline functionality
- **Comprehensive Global Search**: Search across all conversation titles and message content simultaneously
- **Intelligent Highlighting**: Real-time search result highlighting with context snippets
- **Professional Navigation**: Clean, responsive sidebar with conversation list and search results

### User Experience
- **Dual Theme Support**: Automatic system theme detection with manual toggle (dark/light modes)
- **Keyboard Shortcuts**: Full keyboard navigation support for power users
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **Drag & Drop Support**: Simply drag your ChatGPT export file onto the landing screen
- **Search Result Navigation**: Navigate through search results with F3/Shift+F3 or dedicated buttons

### Performance Optimizations
- **Debounced Search**: 300ms intelligent debouncing for smooth search experience
- **Efficient Rendering**: Minimal DOM manipulation with DocumentFragment usage
- **Optimized Database Queries**: Bulk operations and indexed searches for large datasets
- **Lazy Loading**: Messages loaded on-demand for better performance
- **Memory Management**: Clean code architecture without memory leaks

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or pnpm package manager
- Modern web browser (Chrome 89+, Firefox 87+, Safari 14+, Edge 89+)

### Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

### Development

Start the development server:
```bash
npm run dev
# or
pnpm dev
```

The application will be available at `http://localhost:5173`

### Building for Production

Build the application:
```bash
npm run build
# or
pnpm build
```

Preview the production build:
```bash
npm run preview
# or
pnpm preview
```

## Usage

### Getting Started with Exported Conversations

This application is specifically designed to navigate and search through **exported ChatGPT conversations**. 

1. **Export your data from ChatGPT**:
   - Go to ChatGPT Settings → Data Controls → Export Data
   - Download your data (you'll receive conversations.json)
   - Extract the conversations.json file from the downloaded archive

2. **Load conversations into the explorer**:
   - **Drag & Drop**: Simply drag your conversations.json file onto the landing screen
   - **Browse**: Click "Browse Files" button and select your conversations.json file
   - The application will process and index all conversations for fast searching

### Navigation Features

- **Beautiful Landing Screen**: Professional interface with drag-and-drop functionality
- **Conversation Sidebar**: Browse all conversations chronologically with search filtering
- **Main Conversation View**: Read full conversation threads with syntax-highlighted code blocks
- **Global Search**: Find content across all conversations instantly
- **Theme Toggle**: Switch between dark and light themes or use automatic system detection

### Search Capabilities

- **Comprehensive Search**: Searches both conversation titles and message content
- **Real-time Highlighting**: Search terms highlighted in yellow, current result in orange
- **Context Snippets**: Search results show relevant context around matches
- **Search Navigation**: Use F3/Shift+F3 or navigation buttons to jump between results
- **Instant Filtering**: Search results appear as you type with intelligent debouncing

### Keyboard Shortcuts

- **Ctrl+Shift+K**: Open global search (default search mode)
- **F3**: Navigate to next search result
- **Shift+F3**: Navigate to previous search result  
- **Escape**: Clear active search and return to conversation list

### Data Management

- **Persistent Storage**: Conversations stored locally in IndexedDB (no cloud dependency)
- **Clear Data**: Remove all stored conversations with one click
- **Offline Access**: Browse and search your conversations without internet connection
- **Privacy First**: All data stays on your device

## Technical Details

### Architecture

- **Frontend**: Modern vanilla JavaScript with ES6+ modules and Vite build system
- **Database**: IndexedDB with Dexie.js wrapper for structured data storage
- **Styling**: Professional CSS with CSS custom properties for theming
- **Performance**: Optimized for handling large conversation datasets (10,000+ conversations)
- **Code Quality**: Clean, professional codebase without development comments

### Key Technologies

- **Vite**: Fast build tool with hot module replacement for development
- **Dexie.js**: IndexedDB wrapper for robust local data storage
- **Prism.js**: Syntax highlighting for code blocks in conversations
- **Marked.js**: Markdown parsing for rich text rendering
- **CSS Variables**: Dynamic theming system with light/dark mode support

### Data Structure

The application processes ChatGPT export format:
- `conversations.json` containing array of conversation objects
- Each conversation includes `title`, `create_time`, `update_time`, and `mapping`
- Messages extracted from nested `mapping` structure with role-based organization
- Optimized database schema with indexed fields for fast queries

### Performance Features

- **Intelligent Search**: Global search across titles and content with result ranking
- **Debounced Inputs**: 300ms debouncing prevents excessive database queries
- **Bulk Operations**: Efficient batch inserts for large datasets
- **Memory Optimization**: Clean event handling and DOM management
- **Responsive Rendering**: Uses DocumentFragment for efficient DOM updates
- **Theme Persistence**: Automatic theme detection with localStorage persistence

## File Structure

```
src/
├── main.js           # Core application logic and UI management
├── database.js       # IndexedDB operations with Dexie.js
├── search.js         # Global search functionality and keyboard shortcuts
├── renderer.js       # Message rendering with syntax highlighting
└── style.css         # Professional styling with theme system
index.html            # Application structure with landing screen
package.json          # Dependencies and build scripts
vite.config.js        # Vite configuration
```

## Browser Support

- **Chrome 89+** (Recommended)
- **Firefox 87+**
- **Safari 14+**
- **Edge 89+**

*IndexedDB and ES6 modules support required*

## Contributing

We welcome contributions to improve the ChatGPT Conversation Explorer!

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`
5. Make your changes and test thoroughly
6. Submit a pull request with detailed description

### Code Guidelines

- Follow existing code style and architecture
- Test with large conversation datasets
- Ensure responsive design works across devices
- Maintain performance optimizations
- Update documentation for new features

## License

This project is open source and available under the **MIT License**.

## Troubleshooting

### Common Issues

1. **File not loading**: 
   - Ensure your file is a valid JSON export from ChatGPT
   - Check file size (very large files may take time to process)
   - Verify the file structure matches ChatGPT export format

2. **Performance issues**: 
   - For datasets >10,000 conversations, allow extra time for initial indexing
   - Close other browser tabs to free up memory
   - Consider clearing old data if no longer needed

3. **Search not working**: 
   - Ensure conversations are fully loaded and indexed
   - Try refreshing the page and reloading data
   - Check browser console for any error messages

4. **Theme not persisting**:
   - Ensure localStorage is enabled in your browser
   - Check if browser is in private/incognito mode

### Performance Tips

- **Large Datasets**: Allow time for initial processing of large conversation files
- **Search Efficiency**: Use specific search terms rather than single characters
- **Memory Management**: Clear data periodically if working with multiple large datasets
- **Browser Resources**: Close unnecessary tabs when working with large conversation sets

### Getting Help

- Check the browser console (F12) for detailed error messages
- Ensure your ChatGPT export file is recent and complete
- Try the application with a smaller test file first
- Report issues with specific error messages and file sizes

For technical support or feature requests, please open an issue on the project repository.
