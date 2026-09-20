export interface DocumentItem {
  id: string;
  name: string;
  type: 'pdf' | 'txt' | 'md';
  size: number;
  pageCount?: number;
  addedAt: string;
  status: 'processing' | 'indexed' | 'error';
  content: string;
  chunkCount: number;
  workspace: string;
}

export interface SearchResultChunk {
  id: string;
  content: string;
  score: number;
  docId: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: {
    docName: string;
    snippet?: string;
    page?: number;
  }[];
  isStreaming?: boolean;
}

export interface QVACStatus {
  sdkVersion: string;
  isLoaded: boolean;
  isLoading: boolean;
  modelId: string | null;
  modelName: string;
  error: string | null;
  localOnly: boolean;
}
