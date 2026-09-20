import { QVACStatus, SearchResultChunk } from '../types';

const API_BASE = '/api/qvac';

export async function getQVACStatus(): Promise<QVACStatus> {
  try {
    const res = await fetch(`${API_BASE}/status`);
    if (!res.ok) throw new Error('Failed to fetch status');
    return await res.json();
  } catch (err) {
    return {
      sdkVersion: '0.19.1',
      isLoaded: false,
      isLoading: false,
      modelId: null,
      modelName: 'QWEN3_600M_INST_Q4',
      error: 'QVAC local server offline. Make sure node server is running.',
      localOnly: true,
    };
  }
}

export async function loadQVACModel(): Promise<{ success: boolean; modelId: string }> {
  const res = await fetch(`${API_BASE}/load`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to load QVAC model');
  }
  return await res.json();
}

export async function ingestDocumentQVAC(
  documents: { id: string; content: string; name: string }[],
  workspace: string = 'default'
): Promise<{ success: boolean; chunksIngested: number }> {
  const res = await fetch(`${API_BASE}/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documents, workspace }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to ingest document into QVAC RAG');
  }
  return await res.json();
}

export async function searchRAGQVAC(
  query: string,
  topK: number = 3,
  workspace: string = 'default'
): Promise<SearchResultChunk[]> {
  const res = await fetch(`${API_BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, topK, workspace }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'RAG search failed');
  }
  const data = await res.json();
  return data.results || [];
}

export async function streamCompletionQVAC(
  history: { role: 'user' | 'assistant'; content: string }[],
  contextChunks: string[],
  onDelta: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void
): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/completion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, contextChunks }),
    });

    if (!res.ok) {
      throw new Error(`Completion HTTP ${res.status}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error('Response body unreadable');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.substring(6));
            if (data.type === 'delta' && data.text) {
              onDelta(data.text);
            } else if (data.type === 'done') {
              onDone();
              return;
            } else if (data.type === 'error') {
              onError(data.message || 'Stream error');
              return;
            }
          } catch (e) {
            // Ignore parse errors for partial chunks
          }
        }
      }
    }
    onDone();
  } catch (err: any) {
    onError(err.message || 'Failed to stream local completion');
  }
}
