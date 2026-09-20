import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { EmptyState } from './components/EmptyState';
import { PrivacyModal } from './components/PrivacyModal';
import { DocumentItem, ChatMessage, QVACStatus } from './types';
import { 
  getQVACStatus, 
  loadQVACModel, 
  ingestDocumentQVAC, 
  searchRAGQVAC, 
  streamCompletionQVAC 
} from './services/qvac';
import { extractTextFromFile } from './services/pdf';
import { 
  getStoredDocuments, 
  saveStoredDocuments, 
  getStoredMessages, 
  saveStoredMessages, 
  clearStoredMessages 
} from './services/storage';

export const App: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [qvacStatus, setQvacStatus] = useState<QVACStatus>({
    sdkVersion: '0.19.1',
    isLoaded: false,
    isLoading: true,
    modelId: null,
    modelName: 'QWEN3_600M_INST_Q4',
    error: null,
    localOnly: true,
  });

  const [isProcessingDoc, setIsProcessingDoc] = useState(false);
  const [processingProgress, setProcessingProgress] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // Initialize QVAC Model & Load Storage
  useEffect(() => {
    const init = async () => {
      // Restore local documents and chat messages
      const storedDocs = getStoredDocuments();
      const storedMsgs = getStoredMessages();
      setDocuments(storedDocs);
      setMessages(storedMsgs);

      // Check and initialize QVAC local model
      try {
        await loadQVACModel();
        const status = await getQVACStatus();
        setQvacStatus(status);
      } catch (err: any) {
        console.warn('QVAC local load notice:', err.message);
        setQvacStatus(prev => ({ ...prev, isLoading: false }));
      }
    };

    init();
  }, []);

  // Save documents on change
  useEffect(() => {
    saveStoredDocuments(documents);
  }, [documents]);

  // Save messages on change
  useEffect(() => {
    saveStoredMessages(messages);
  }, [messages]);

  // Handle File Upload
  const handleUploadFile = async (file: File) => {
    setIsProcessingDoc(true);
    setProcessingProgress('Extracting document text...');

    try {
      const extracted = await extractTextFromFile(file);
      setProcessingProgress('Creating local knowledge index with QVAC ragIngest()...');

      const docId = `doc-${Date.now()}`;
      const fileType = (file.name.split('.').pop() || 'txt') as 'pdf' | 'txt' | 'md';

      // Call QVAC SDK ragIngest API
      await ingestDocumentQVAC(
        [{ id: docId, content: extracted.text, name: file.name }],
        'default'
      );

      const newDoc: DocumentItem = {
        id: docId,
        name: file.name,
        type: fileType,
        size: file.size,
        pageCount: extracted.pageCount,
        addedAt: new Date().toLocaleDateString(),
        status: 'indexed',
        content: extracted.text,
        chunkCount: Math.ceil(extracted.text.length / 300),
        workspace: 'default',
      };

      setDocuments(prev => [newDoc, ...prev]);
      setProcessingProgress('Document indexed successfully!');
    } catch (err: any) {
      alert(`Document Processing Failed: ${err.message}`);
    } finally {
      setIsProcessingDoc(false);
      setProcessingProgress('');
    }
  };

  // Handle "Try Demo" (Physics Quick Notes)
  const handleTryDemo = async () => {
    setIsProcessingDoc(true);
    setProcessingProgress('Loading Physics Quick Notes sample...');

    try {
      const response = await fetch('/demo-physics-notes.txt');
      const text = await response.text();

      setProcessingProgress('Calling QVAC ragIngest()...');
      const docId = `demo-physics-${Date.now()}`;

      await ingestDocumentQVAC(
        [{ id: docId, content: text, name: 'Physics Quick Notes' }],
        'default'
      );

      const demoDoc: DocumentItem = {
        id: docId,
        name: 'Physics Quick Notes',
        type: 'txt',
        size: text.length,
        pageCount: 1,
        addedAt: new Date().toLocaleDateString(),
        status: 'indexed',
        content: text,
        chunkCount: Math.ceil(text.length / 300),
        workspace: 'default',
      };

      // Add to document library if not already loaded
      setDocuments(prev => {
        if (prev.some(d => d.name === 'Physics Quick Notes')) return prev;
        return [demoDoc, ...prev];
      });

      setProcessingProgress('Demo notes ready!');
    } catch (err: any) {
      alert(`Demo Load Failed: ${err.message}`);
    } finally {
      setIsProcessingDoc(false);
      setProcessingProgress('');
    }
  };

  // Delete document
  const handleDeleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  // Send Message & QVAC RAG Q&A
  const handleSendMessage = async (userText: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsGenerating(true);

    try {
      // Step 1: Perform QVAC ragSearch
      const searchResults = await searchRAGQVAC(userText, 3, 'default');
      const contextChunks = searchResults.map(r => r.content);

      // Map matching source document titles
      const matchedDocs = Array.from(new Set(
        documents
          .filter(doc => contextChunks.some(chunk => chunk.length > 20 && doc.content.includes(chunk.substring(0, 30))))
          .map(doc => doc.name)
      ));

      const assistantMsgId = `msg-ast-${Date.now()}`;
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: matchedDocs.length > 0 ? matchedDocs.map(name => ({ docName: name })) : (documents.length > 0 ? [{ docName: documents[0].name }] : []),
      };

      setMessages(prev => [...prev, assistantMsg]);

      // Step 2: Stream completion from QVAC completion() API
      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

      await streamCompletionQVAC(
        history,
        contextChunks,
        (deltaText) => {
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantMsgId
                ? { ...m, content: m.content + deltaText }
                : m
            )
          );
        },
        () => {
          setIsGenerating(false);
        },
        (errMsg) => {
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantMsgId
                ? { ...m, content: `Error: ${errMsg}` }
                : m
            )
          );
          setIsGenerating(false);
        }
      );
    } catch (err: any) {
      console.error('Q&A Error:', err);
      setIsGenerating(false);
    }
  };

  // Clear Conversation
  const handleClearChat = () => {
    setMessages([]);
    clearStoredMessages();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Header 
        status={qvacStatus}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          documents={documents}
          onUploadFile={handleUploadFile}
          onTryDemo={handleTryDemo}
          onDeleteDocument={handleDeleteDocument}
          isProcessing={isProcessingDoc}
          processingProgress={processingProgress}
        />

        <main className="flex-1 flex flex-col bg-zinc-950">
          {documents.length === 0 && messages.length === 0 ? (
            <EmptyState
              onUploadClick={() => {
                const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                fileInput?.click();
              }}
              onTryDemo={handleTryDemo}
            />
          ) : (
            <ChatWindow
              messages={messages}
              onSendMessage={handleSendMessage}
              onClearChat={handleClearChat}
              isGenerating={isGenerating}
              hasDocuments={documents.length > 0}
            />
          )}
        </main>
      </div>

      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        status={qvacStatus}
      />
    </div>
  );
};
