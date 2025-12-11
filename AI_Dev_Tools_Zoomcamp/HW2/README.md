# HW2 – End-To-End Project

AI Dev Tools Zoomcamp 2025 – Homework 2

## Overview

This is a real-time collaborative **online coding interview platform** built for Homework 2 of the AI Dev Tools Zoomcamp.

The app lets an interviewer:

- Create a coding session
- Share a link with a candidate
- Edit code together in real time
- Run code safely in the browser

## Features

- **Create & share sessions**
  - “Create new session” generates a unique session ID and shareable link
- **Real-time collaboration**
  - Multiple clients connected to the same session keep the code in sync (Socket.IO)
- **Syntax highlighting (Monaco Editor)**
  - JavaScript, Python, Java (highlight only)
- **Code execution in the browser**
  - **JavaScript** – executed with `new Function(...)`, captures `console.log`
  - **Python** – executed via **Pyodide** (Python → WebAssembly)
  - **Java** – only collaborative editing + syntax highlighting (no execution)

## Tech Stack

**Frontend**

- React (Vite)
- `@monaco-editor/react`
- `socket.io-client`
- Pyodide (Python in WASM)
- JavaScript (ES modules)

**Backend**

- Node.js
- Express
- Socket.IO
- In-memory session store (simple `Map`)

**Dev / Tooling**

- Node.js 20.x
- npm
- `concurrently` (run frontend + backend together)
- Docker (single container for frontend + backend)

---

## Running locally

From the `HW2` folder:

```bash
# install root dev dependencies
npm install

# backend
cd backend
npm install

# frontend
cd ../frontend
npm install

# back to HW2 root
cd ..

# run frontend + backend together
npm run dev
```

## The app will be available at:
```bash
http://localhost:5173
```