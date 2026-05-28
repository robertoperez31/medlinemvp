import { eq } from 'drizzle-orm';
import { create } from 'zustand';
import { db } from '../db';
import { documents } from '../db/schema';
import type { Document, DocumentCategory } from '@/types/insurance';

interface DocumentState {
  documents: Document[];
  isLoading: boolean;
  isUploading: boolean;
  loadDocuments: () => Promise<void>;
  addDocument: (data: Omit<Document, 'id' | 'createdAt'>) => Promise<Document>;
  updateDocument: (id: number, data: Partial<Document>) => Promise<void>;
  deleteDocument: (id: number) => Promise<void>;
  getByCategory: (category: DocumentCategory) => Document[];
  getPendingUpload: () => Document[];
  setUploading: (value: boolean) => void;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  isLoading: false,
  isUploading: false,

  loadDocuments: async () => {
    set({ isLoading: true });
    try {
      const rows = await db.select().from(documents);
      set({
        documents: rows.map((r) => ({
          id: r.id,
          name: r.name,
          type: r.type as Document['type'],
          category: (r.category as DocumentCategory) ?? undefined,
          localUri: r.localUri ?? undefined,
          remoteUrl: r.remoteUrl ?? undefined,
          size: r.size ?? undefined,
          mimeType: r.mimeType ?? undefined,
          uploadedAt: r.uploadedAt ?? undefined,
          syncedAt: r.syncedAt ?? undefined,
          createdAt: r.createdAt ?? new Date().toISOString(),
        })),
      });
    } finally {
      set({ isLoading: false });
    }
  },

  addDocument: async (data) => {
    const result = await db.insert(documents).values({
      name: data.name,
      type: data.type,
      category: data.category,
      localUri: data.localUri,
      remoteUrl: data.remoteUrl,
      size: data.size,
      mimeType: data.mimeType,
      uploadedAt: data.uploadedAt,
    }).returning();

    const newDoc: Document = {
      ...data,
      id: result[0].id,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ documents: [newDoc, ...s.documents] }));
    return newDoc;
  },

  updateDocument: async (id, data) => {
    await db.update(documents).set(data).where(eq(documents.id, id));
    set((s) => ({
      documents: s.documents.map((d) => (d.id === id ? { ...d, ...data } : d)),
    }));
  },

  deleteDocument: async (id) => {
    await db.delete(documents).where(eq(documents.id, id));
    set((s) => ({ documents: s.documents.filter((d) => d.id !== id) }));
  },

  getByCategory: (category) => get().documents.filter((d) => d.category === category),

  getPendingUpload: () => get().documents.filter((d) => d.localUri && !d.remoteUrl),

  setUploading: (isUploading) => set({ isUploading }),
}));
