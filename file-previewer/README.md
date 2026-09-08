# File Previewer

A browser-based file previewer that allows users to select multiple files, view their file information, and preview supported files directly in the browser.

## Features

- Select multiple files
- Display selected files in a list
- Show file name, size, and type
- Select a file from the list
- Preview supported file types:
  - Images
  - Text files
  - JSON
  - Audio
  - Video
  - PDF
- Show a message for unsupported file types
- Highlight the currently selected file

## How It Works

1. Select one or more files using the file picker.
2. The selected files are added to the file list.
3. Click any file in the list.
4. The application determines the file type using its MIME type.
5. The appropriate preview is generated in the browser.

## Technologies Used

- HTML
- CSS
- JavaScript
- File API
- Blob API
- URL API
- DOM APIs
- Promises / async-await

## What I Practiced

This project was built to practice working with browser APIs and asynchronous JavaScript.

- File objects
- `File.text()`
- Promises
- `async/await`
- MIME types
- `URL.createObjectURL()`
- DOM manipulation
- Event listeners
- Dynamic element creation
- Conditional rendering
- Event loop and asynchronous execution

## Project Structure

```text
file-previewer/
├── index.html
├── style.css
└── script.js