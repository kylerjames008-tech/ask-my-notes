import { DocumentItem, ChatMessage } from '../types';

const STORAGE_KEYS = {
  DOCUMENTS: 'ask_my_notes_documents',
  CHAT_MESSAGES: 'ask_my_notes_chat_messages',
};

export function getStoredDocuments(): DocumentItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to parse stored documents:', err);
    return [];
  }
}

export function saveStoredDocuments(docs: DocumentItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
  } catch (err) {
    console.error('Failed to save documents to storage:', err);
  }
}

export function getStoredMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to parse chat messages:', err);
    return [];
  }
}

export function saveStoredMessages(messages: ChatMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(messages));
  } catch (err) {
    console.error('Failed to save messages to storage:', err);
  }
}

export function clearStoredMessages(): void {
  localStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES);
}
