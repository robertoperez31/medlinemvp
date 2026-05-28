import { Image, Modal, Pressable, Text, View, Platform } from 'react-native';
import type { Document } from '@/types/insurance';

interface Props {
  document: Document | null;
  onClose: () => void;
}

export function DocumentViewer({ document: doc, onClose }: Props) {
  if (!doc) return null;

  const isImage = doc.mimeType?.startsWith('image/') || doc.type === 'scan';
  const uri = doc.localUri ?? doc.remoteUrl;

  return (
    <Modal animationType="slide" presentationStyle="fullScreen">
      <View className="flex-1 bg-black">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-14 pb-4 bg-black/80">
          <View className="flex-1 mr-4">
            <Text className="text-white font-bold font-[Inter_700Bold]" numberOfLines={1}>{doc.name}</Text>
            <Text className="text-white/60 text-xs font-[Inter_400Regular]">{doc.category}</Text>
          </View>
          <Pressable onPress={onClose} className="w-9 h-9 bg-white/20 rounded-full items-center justify-center">
            <Text className="text-white font-bold">✕</Text>
          </Pressable>
        </View>

        {/* Content */}
        <View className="flex-1 items-center justify-center">
          {isImage && uri ? (
            <Image
              source={{ uri }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          ) : (
            <View className="items-center">
              <Text className="text-6xl mb-4">📄</Text>
              <Text className="text-white font-bold text-lg font-[Inter_700Bold]">{doc.name}</Text>
              <Text className="text-white/60 text-sm mt-2 font-[Inter_400Regular]">
                {doc.mimeType === 'application/pdf' ? 'PDF — usa un lector externo' : 'Vista previa no disponible'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
