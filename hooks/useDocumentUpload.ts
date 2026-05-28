import * as FileSystem from 'expo-file-system';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useDocumentStore } from '@/lib/stores/documentStore';
import { useAuthStore } from '@/lib/stores/authStore';
import type { Document, DocumentCategory } from '@/types/insurance';

export function useDocumentUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { addDocument, updateDocument } = useDocumentStore();
  const user = useAuthStore((s) => s.user);

  async function uploadDocument(
    localUri: string,
    name: string,
    category: DocumentCategory,
    type: Document['type'],
    mimeType?: string | null,
    size?: number | null
  ): Promise<Document> {
    setIsUploading(true);
    setProgress(0);

    try {
      const doc = await addDocument({
        name,
        type,
        category,
        localUri,
        mimeType: mimeType ?? undefined,
        size: size ?? undefined,
        uploadedAt: new Date().toISOString(),
      });

      if (user) {
        try {
          setProgress(0.3);
          const fileContent = await FileSystem.readAsStringAsync(localUri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          const extension = mimeType === 'application/pdf' ? 'pdf' : 'jpg';
          const storagePath = `${user.id}/${category}/${doc.id}.${extension}`;

          const { data, error } = await supabase.storage
            .from('documents')
            .upload(storagePath, decode(fileContent), {
              contentType: mimeType ?? 'image/jpeg',
              upsert: false,
            });

          setProgress(0.8);

          if (!error && data) {
            const { data: urlData } = supabase.storage
              .from('documents')
              .getPublicUrl(storagePath);

            await updateDocument(doc.id, {
              remoteUrl: urlData.publicUrl,
              syncedAt: new Date().toISOString(),
            });

            setProgress(1);
            return { ...doc, remoteUrl: urlData.publicUrl };
          }
        } catch {
          // Upload failed — keep local version, sync later
        }
      }

      setProgress(1);
      return doc;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  }

  return { uploadDocument, isUploading, progress };
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
