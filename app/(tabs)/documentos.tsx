import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useDocumentStore } from '@/lib/stores/documentStore';
import type { Document, DocumentCategory } from '@/types/insurance';

const CATEGORIES: { id: DocumentCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'Todos', icon: '📁' },
  { id: 'sangre', label: 'Análisis', icon: '🩸' },
  { id: 'radiografia', label: 'Radiografías', icon: '🔬' },
  { id: 'ekg', label: 'EKG', icon: '📈' },
  { id: 'ecografia', label: 'Ecografías', icon: '🫁' },
  { id: 'prescripcion', label: 'Recetas', icon: '📝' },
  { id: 'vacuna', label: 'Vacunas', icon: '💉' },
  { id: 'otro', label: 'Otros', icon: '📄' },
];

function formatBytes(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DocumentItem({
  doc,
  onPress,
  onDelete,
  onShare,
}: {
  doc: Document;
  onPress: () => void;
  onDelete: () => void;
  onShare: () => void;
}) {
  const isImage = doc.mimeType?.startsWith('image/');

  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-2xl mb-3 border border-[#E2E8F0] overflow-hidden"
    >
      <View className="flex-row items-center p-4">
        {/* Thumbnail */}
        <View className="w-14 h-14 rounded-xl bg-[#F1F5F9] items-center justify-center mr-3 overflow-hidden">
          {isImage && doc.localUri ? (
            <Image source={{ uri: doc.localUri }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <Text className="text-2xl">
              {doc.mimeType === 'application/pdf' ? '📄' : '📋'}
            </Text>
          )}
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text className="text-sm font-bold text-[#0F172A] font-[Inter_700Bold]" numberOfLines={1}>
            {doc.name}
          </Text>
          <Text className="text-xs text-[#64748B] mt-0.5 font-[Inter_400Regular]">
            {CATEGORIES.find((c) => c.id === doc.category)?.label ?? 'Documento'} • {formatBytes(doc.size)}
          </Text>
          <Text className="text-xs text-[#94A3B8] mt-0.5 font-[Inter_400Regular]">
            {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('es-DO') : ''}
            {!doc.remoteUrl && doc.localUri ? ' • ⏳ Pendiente sync' : ''}
            {doc.remoteUrl ? ' • ☁️ Sincronizado' : ''}
          </Text>
        </View>

        {/* Actions */}
        <View className="flex-row gap-2">
          <Pressable
            onPress={onShare}
            className="w-9 h-9 bg-[#F1F5F9] rounded-lg items-center justify-center"
          >
            <Text className="text-sm">↗</Text>
          </Pressable>
          <Pressable
            onPress={onDelete}
            className="w-9 h-9 bg-[#FEF2F2] rounded-lg items-center justify-center"
          >
            <Text className="text-sm">🗑</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

function UploadModal({ visible, onClose, onUpload }: {
  visible: boolean;
  onClose: () => void;
  onUpload: (category: DocumentCategory, type: 'file' | 'scan') => void;
}) {
  const [category, setCategory] = useState<DocumentCategory>('otro');

  const docCategories = CATEGORIES.filter((c) => c.id !== 'all') as { id: DocumentCategory; label: string; icon: string }[];

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6">
          <Text className="text-xl font-bold mb-4 font-[Inter_700Bold]">Subir documento</Text>

          <Text className="text-sm font-medium text-[#0F172A] mb-3 font-[Inter_500Medium]">Categoría</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <View className="flex-row gap-2">
              {docCategories.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => setCategory(c.id)}
                  className={`flex-row items-center gap-1 px-3 h-9 rounded-full border ${
                    category === c.id ? 'bg-[#4338CA] border-[#4338CA]' : 'border-[#E2E8F0] bg-white'
                  }`}
                >
                  <Text className="text-sm">{c.icon}</Text>
                  <Text className={`text-sm font-medium font-[Inter_500Medium] ${category === c.id ? 'text-white' : 'text-[#64748B]'}`}>{c.label}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <View className="flex-row gap-3 mb-4">
            <Pressable
              onPress={() => { onUpload(category, 'file'); onClose(); }}
              className="flex-1 bg-[#EEF2FF] rounded-2xl p-4 items-center"
            >
              <Text className="text-3xl mb-2">📎</Text>
              <Text className="text-[#4338CA] font-bold font-[Inter_700Bold]">Archivo</Text>
              <Text className="text-[#64748B] text-xs text-center mt-1 font-[Inter_400Regular]">PDF, imágenes</Text>
            </Pressable>
            <Pressable
              onPress={() => { onUpload(category, 'scan'); onClose(); }}
              className="flex-1 bg-[#F0FDFA] rounded-2xl p-4 items-center"
            >
              <Text className="text-3xl mb-2">📷</Text>
              <Text className="text-[#0D9488] font-bold font-[Inter_700Bold]">Escanear</Text>
              <Text className="text-[#64748B] text-xs text-center mt-1 font-[Inter_400Regular]">Con la cámara</Text>
            </Pressable>
          </View>

          <Pressable onPress={onClose} className="h-12 border border-[#E2E8F0] rounded-xl items-center justify-center">
            <Text className="text-[#64748B] font-semibold font-[Inter_600SemiBold]">Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function DocumentosScreen() {
  const { documents, loadDocuments, addDocument, deleteDocument } = useDocumentStore();
  const [activeCategory, setActiveCategory] = useState<DocumentCategory | 'all'>('all');
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const filtered = activeCategory === 'all'
    ? documents
    : documents.filter((d) => d.category === activeCategory);

  async function handleUpload(category: DocumentCategory, type: 'file' | 'scan') {
    try {
      if (type === 'scan') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Permiso requerido', 'Necesitamos acceso a la cámara para escanear documentos.');
          return;
        }
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
          allowsEditing: true,
        });
        if (result.canceled || !result.assets[0]) return;
        const asset = result.assets[0];
        await addDocument({
          name: `Escaneo_${Date.now()}`,
          type: 'scan',
          category,
          localUri: asset.uri,
          mimeType: 'image/jpeg',
          size: asset.fileSize,
          uploadedAt: new Date().toISOString(),
        });
      } else {
        const result = await DocumentPicker.getDocumentAsync({
          type: ['application/pdf', 'image/*'],
          copyToCacheDirectory: true,
        });
        if (result.canceled || !result.assets[0]) return;
        const asset = result.assets[0];
        await addDocument({
          name: asset.name,
          type: 'file',
          category,
          localUri: asset.uri,
          mimeType: asset.mimeType,
          size: asset.size,
          uploadedAt: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'No se pudo agregar el documento.');
    }
  }

  async function handleShare(doc: Document) {
    const uri = doc.localUri;
    if (!uri) { Alert.alert('No disponible', 'El archivo no está disponible localmente.'); return; }
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri);
    }
  }

  function handleDelete(doc: Document) {
    Alert.alert('Eliminar documento', `¿Eliminar "${doc.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteDocument(doc.id) },
    ]);
  }

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {/* Header */}
      <View className="bg-white pt-14 pb-4 px-5 border-b border-[#E2E8F0]">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-[#0F172A] font-[Inter_700Bold]">Documentos</Text>
            <Text className="text-sm text-[#64748B] mt-0.5 font-[Inter_400Regular]">
              {documents.length} documento{documents.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <Pressable
            onPress={() => setShowUpload(true)}
            className="bg-[#4338CA] px-4 h-10 rounded-xl flex-row items-center gap-1.5"
          >
            <Text className="text-white font-bold text-lg">+</Text>
            <Text className="text-white font-semibold font-[Inter_600SemiBold]">Subir</Text>
          </Pressable>
        </View>

        {/* Category filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 -mx-5 px-5">
          <View className="flex-row gap-2">
            {CATEGORIES.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => setActiveCategory(c.id as DocumentCategory | 'all')}
                className={`flex-row items-center gap-1.5 px-3 h-9 rounded-full border ${
                  activeCategory === c.id ? 'bg-[#4338CA] border-[#4338CA]' : 'bg-white border-[#E2E8F0]'
                }`}
              >
                <Text className="text-sm">{c.icon}</Text>
                <Text className={`text-sm font-medium font-[Inter_500Medium] ${activeCategory === c.id ? 'text-white' : 'text-[#64748B]'}`}>{c.label}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView className="flex-1 px-5 pt-4">
        {filtered.length === 0 ? (
          <View className="items-center py-16">
            <Text className="text-5xl mb-4">📁</Text>
            <Text className="text-[#0F172A] font-bold text-lg mb-2 font-[Inter_700Bold]">
              Sin documentos
            </Text>
            <Text className="text-[#64748B] text-sm text-center mb-4 font-[Inter_400Regular]">
              Sube tus análisis, radiografías y más
            </Text>
            <Pressable
              onPress={() => setShowUpload(true)}
              className="bg-[#4338CA] px-6 h-11 rounded-xl items-center justify-center"
            >
              <Text className="text-white font-semibold font-[Inter_600SemiBold]">Subir documento</Text>
            </Pressable>
          </View>
        ) : (
          filtered.map((doc) => (
            <DocumentItem
              key={doc.id}
              doc={doc}
              onPress={() => {}}
              onDelete={() => handleDelete(doc)}
              onShare={() => handleShare(doc)}
            />
          ))
        )}
        <View className="h-6" />
      </ScrollView>

      <UploadModal visible={showUpload} onClose={() => setShowUpload(false)} onUpload={handleUpload} />
    </View>
  );
}
