# Ask My Notes 📄⚡

> **Privacy-first, local AI web application for interactive document Q&A, powered by Tether's QVAC SDK.**

"Ask My Notes" enables students, researchers, and professionals to upload study notes (PDF, TXT, MD) and ask questions about them. **All AI processing happens 100% locally on your device using Tether's QVAC SDK.** No cloud AI APIs (OpenAI, Anthropic, Gemini, OpenRouter) are used. Your private documents never leave your computer.

---

## ✨ Key Features

- 🔒 **100% Private**: Your study notes and queries never leave your device.
- ⚡ **Local AI Inference**: On-device vector indexing and text generation powered by `@qvac/sdk`.
- 📄 **Multi-Format Document Support**: Upload PDF documents, plain text notes, or Markdown files.
- 🔑 **No AI API Key Required**: Free from subscriptions, cloud accounts, or remote API keys.
- 🧪 **Built-In Demo Mode**: Instant 1-click test with included `Physics Quick Notes`.
- 🎯 **Grounded Answers**: Accurate context retrieval via QVAC RAG with explicit source citations.
- 🎨 **Modern SaaS UI**: Dark mode dashboard with clean spacing, sidebar document manager, and live privacy status indicators.

---

## 🛠️ How It Works

```text
Document Upload
       ↓
Client-Side Text Extraction (pdfjs-dist / text reader)
       ↓
QVAC ragIngest() (Local Vector Embedding & Storage)
       ↓
Local Knowledge Index
       ↓
User Question
       ↓
QVAC ragSearch() (Semantic Context Retrieval)
       ↓
Relevant Document Chunks
       ↓
QVAC completion() (On-Device Generation)
       ↓
Answer + Source Document Citations
```

---

## 🚀 Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons
- **PDF Extraction**: `pdfjs-dist`
- **Local AI Engine**: `@qvac/sdk` (**Version: 0.19.1**)
- **Local Server Bridge**: Express / Node.js
- **Persistence**: Local Storage & IndexedDB

---

## 📦 Installed QVAC Version

This project uses **`@qvac/sdk` version `0.19.1`** (declared in `package.json`).

The application invokes official QVAC SDK functions directly:
- `loadModel()`
- `ragIngest()`
- `ragSearch()`
- `completion()`
- `unloadModel()`

---

## 💻 Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) version 18 or newer
- `npm` or `pnpm` package manager

### Step 1: Install Dependencies

```bash
npm install
```

---

## 🏃 Running the Application

### 1. Start the Local QVAC Engine Server

In your first terminal window, start the local QVAC backend bridge:

```bash
npm run server
```

The QVAC local server will listen at `http://localhost:3001`.

### 2. Start the Frontend Development Server

In a second terminal window, start the Vite development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:3000`.

---

## 🧪 Testing with the Built-in Demo

1. Click **"Try Demo (Physics Notes)"** in the left sidebar or landing page.
2. The app will ingest `demo-physics-notes.txt` locally using QVAC `ragIngest()`.
3. Type a sample question in the chat:
   - *"What is Gauss's law?"*
   - *"What is electric flux?"*
4. QVAC `ragSearch()` retrieves the exact matching physics notes context and generates a local response with source citations.

---

## 🛡️ Privacy Guarantee

- **No Remote Transmission**: Your documents, embeddings, and chat transcripts remain strictly on your local machine.
- **No Analytics / Telemetry**: Zero external tracking or network calls to cloud LLM providers.
- **Local Storage**: Indexed metadata is persisted locally within browser local storage.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for details.
