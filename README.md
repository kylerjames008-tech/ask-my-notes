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

## 🚀 Quickstart (1-Click Run for Anyone)

Anyone who clones this GitHub repository can start the application instantly:

### 🪟 Windows (1-Click)
Double-click **`run.bat`** in the project root.
*(It automatically checks/installs dependencies, launches both servers, and opens the app in your browser!)*

### 🍎 macOS / 🐧 Linux (1-Click)
Run the launcher script:
```bash
./run.sh
```

---

## 💻 Manual Setup & Commands

If you prefer using terminal commands:

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Application (Both Engine & UI)
```bash
npm start
```
*Opens both backend and frontend concurrently at `http://localhost:3000`.*

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

## 📦 Installed QVAC Version

This project uses **`@qvac/sdk` version `0.19.1`** (declared in `package.json`).

The application invokes official QVAC SDK functions directly:
- `loadModel()`
- `ragIngest()`
- `ragSearch()`
- `completion()`
- `unloadModel()`

---

## 🛡️ Privacy Guarantee

- **No Remote Transmission**: Your documents, embeddings, and chat transcripts remain strictly on your local machine.
- **No Analytics / Telemetry**: Zero external tracking or network calls to cloud LLM providers.
- **Local Storage**: Indexed metadata is persisted locally within browser local storage.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for details.
