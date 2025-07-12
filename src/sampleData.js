// Sample conversation data for demonstration
export const sampleConversations = [
  {
    "title": "Learning JavaScript Fundamentals",
    "create_time": 1704067200,
    "update_time": 1704070800,
    "mapping": {},
    "moderation_results": [],
    "current_node": "",
    "plugin_ids": null,
    "conversation_id": "sample-1",
    "conversation_template_id": null,
    "gizmo_id": null,
    "is_archived": false,
    "safe_urls": []
  }
];

// Initialize the mapping for the first conversation
const conv1Messages = [
  {
    "id": "msg-1-1",
    "message": {
      "id": "msg-1-1",
      "author": { "role": "user", "name": null, "metadata": {} },
      "create_time": 1704067200,
      "update_time": null,
      "content": {
        "content_type": "text",
        "parts": ["I'm new to programming and want to learn JavaScript. Where should I start?"]
      },
      "status": "finished_successfully",
      "end_turn": null,
      "weight": 1,
      "metadata": {},
      "recipient": "all"
    },
    "parent": null,
    "children": ["msg-1-2"]
  },
  {
    "id": "msg-1-2", 
    "message": {
      "id": "msg-1-2",
      "author": { "role": "assistant", "name": "ChatGPT", "metadata": {} },
      "create_time": 1704067260,
      "update_time": null,
      "content": {
        "content_type": "text",
        "parts": ["Great choice! JavaScript is an excellent first programming language. Here's a structured approach to get you started:\n\n## 1. Understanding the Basics\n- **Variables**: Learn about `let`, `const`, and `var`\n- **Data Types**: strings, numbers, booleans, arrays, objects\n- **Operators**: arithmetic, comparison, logical operators\n\n## 2. Control Structures\n- **Conditionals**: `if`, `else if`, `else` statements\n- **Loops**: `for`, `while`, `forEach` loops\n- **Switch statements** for multiple conditions\n\n## 3. Functions\n- Function declarations and expressions\n- Arrow functions\n- Parameters and return values\n- Scope and closures\n\n## 4. Working with the DOM\n- Selecting elements\n- Modifying content and styles\n- Event handling\n\n## Recommended Learning Resources:\n1. **MDN Web Docs** - Comprehensive documentation\n2. **freeCodeCamp** - Interactive coding exercises\n3. **JavaScript.info** - Modern JavaScript tutorial\n4. **Codecademy** - Structured courses\n\nWould you like me to elaborate on any of these topics or help you set up a development environment?"]
      },
      "status": "finished_successfully", 
      "end_turn": null,
      "weight": 1,
      "metadata": {},
      "recipient": "all"
    },
    "parent": "msg-1-1",
    "children": ["msg-1-3"]
  }
];

// Add the messages to the conversation mapping
sampleConversations[0].mapping = {};
conv1Messages.forEach(msg => {
  sampleConversations[0].mapping[msg.id] = msg;
});

// Add more messages to continue the conversation
const additionalConv1Messages = [
  {
    "id": "msg-1-3",
    "message": {
      "id": "msg-1-3",
      "author": { "role": "user", "name": null, "metadata": {} },
      "create_time": 1704067320,
      "update_time": null,
      "content": {
        "content_type": "text",
        "parts": ["That's very helpful! Can you show me a simple example of variables and functions in JavaScript?"]
      },
      "status": "finished_successfully",
      "end_turn": null,
      "weight": 1,
      "metadata": {},
      "recipient": "all"
    },
    "parent": "msg-1-2",
    "children": ["msg-1-4"]
  },
  {
    "id": "msg-1-4",
    "message": {
      "id": "msg-1-4", 
      "author": { "role": "assistant", "name": "ChatGPT", "metadata": {} },
      "create_time": 1704067380,
      "update_time": null,
      "content": {
        "content_type": "text",
        "parts": ["Absolutely! Here are some practical examples:\n\n## Variables Example\n```javascript\n// Different ways to declare variables\nlet userName = 'Alice';        // Can be changed later\nconst userAge = 25;           // Cannot be changed\nvar isStudent = true;         // Older way, avoid in modern JS\n\n// Using the variables\nconsole.log('Hello, ' + userName);\nconsole.log('Age: ' + userAge);\nconsole.log('Is student: ' + isStudent);\n```\n\n## Functions Example\n```javascript\n// Function declaration\nfunction greetUser(name, age) {\n    return `Hello ${name}, you are ${age} years old!`;\n}\n\n// Arrow function (modern syntax)\nconst calculateArea = (width, height) => {\n    return width * height;\n};\n\n// Using the functions\nlet greeting = greetUser('Bob', 30);\nlet area = calculateArea(5, 10);\n\nconsole.log(greeting);  // \"Hello Bob, you are 30 years old!\"\nconsole.log(area);      // 50\n```\n\n## Combining Variables and Functions\n```javascript\nconst users = ['Alice', 'Bob', 'Charlie'];\n\nfunction welcomeUsers(userList) {\n    userList.forEach(user => {\n        console.log(`Welcome, ${user}!`);\n    });\n}\n\nwelcomeUsers(users);\n// Output:\n// Welcome, Alice!\n// Welcome, Bob! \n// Welcome, Charlie!\n```\n\nTry running these examples in your browser's console (F12 → Console tab). What questions do you have about these examples?"]
      },
      "status": "finished_successfully",
      "end_turn": null,
      "weight": 1,
      "metadata": {},
      "recipient": "all"
    },
    "parent": "msg-1-3",
    "children": ["msg-1-5"]
  }
];

// Add these messages to the mapping
additionalConv1Messages.forEach(msg => {
  sampleConversations[0].mapping[msg.id] = msg;
});

// Update the children array for msg-1-2
sampleConversations[0].mapping["msg-1-2"].children = ["msg-1-3"];

// Continue adding more messages for a complete conversation
const moreConv1Messages = [
  {
    "id": "msg-1-5",
    "message": {
      "id": "msg-1-5",
      "author": { "role": "user", "name": null, "metadata": {} },
      "create_time": 1704067440,
      "update_time": null,
      "content": {
        "content_type": "text",
        "parts": ["This is great! I understand variables now. Can you explain how arrays work and show me some practical examples?"]
      },
      "status": "finished_successfully",
      "end_turn": null,
      "weight": 1,
      "metadata": {},
      "recipient": "all"
    },
    "parent": "msg-1-4",
    "children": ["msg-1-6"]
  },
  {
    "id": "msg-1-6",
    "message": {
      "id": "msg-1-6",
      "author": { "role": "assistant", "name": "ChatGPT", "metadata": {} },
      "create_time": 1704067500,
      "update_time": null,
      "content": {
        "content_type": "text",
        "parts": ["Excellent question! Arrays are fundamental in JavaScript. Let me show you everything you need to know:\n\n## What are Arrays?\nArrays store multiple values in a single variable, like a list of items.\n\n## Creating Arrays\n```javascript\n// Different ways to create arrays\nlet fruits = ['apple', 'banana', 'orange'];\nlet numbers = [1, 2, 3, 4, 5];\nlet mixed = ['text', 42, true, null];\nlet empty = []; // Empty array\n\n// Using Array constructor\nlet colors = new Array('red', 'green', 'blue');\n```\n\n## Accessing Array Elements\n```javascript\nlet fruits = ['apple', 'banana', 'orange'];\n\nconsole.log(fruits[0]);    // 'apple' (first element)\nconsole.log(fruits[1]);    // 'banana'\nconsole.log(fruits[2]);    // 'orange'\nconsole.log(fruits.length); // 3 (number of elements)\n```\n\n## Common Array Methods\n```javascript\nlet todoList = ['buy groceries', 'walk the dog'];\n\n// Adding elements\ntodoList.push('finish homework');        // Add to end\ntodoList.unshift('wake up early');       // Add to beginning\n\n// Removing elements\nlet lastItem = todoList.pop();           // Remove from end\nlet firstItem = todoList.shift();        // Remove from beginning\n\n// Finding elements\nlet index = todoList.indexOf('walk the dog'); // Returns index or -1\nlet exists = todoList.includes('buy groceries'); // Returns true/false\n\nconsole.log(todoList); // Current state of array\n```\n\n## Looping Through Arrays\n```javascript\nlet hobbies = ['reading', 'gaming', 'cooking', 'traveling'];\n\n// Method 1: for loop\nfor (let i = 0; i < hobbies.length; i++) {\n    console.log(`Hobby ${i + 1}: ${hobbies[i]}`);\n}\n\n// Method 2: forEach (modern approach)\nhobbies.forEach((hobby, index) => {\n    console.log(`${index + 1}. ${hobby}`);\n});\n\n// Method 3: for...of loop\nfor (let hobby of hobbies) {\n    console.log(`I enjoy ${hobby}`);\n}\n```\n\nTry these examples! What specific array operations would you like to learn more about?"]
      },
      "status": "finished_successfully",
      "end_turn": null,
      "weight": 1,
      "metadata": {},
      "recipient": "all"
    },
    "parent": "msg-1-5",
    "children": ["msg-1-7"]
  }
];

// Add these messages to the mapping
moreConv1Messages.forEach(msg => {
  sampleConversations[0].mapping[msg.id] = msg;
});

// Update the current node
sampleConversations[0].current_node = "msg-1-6";
