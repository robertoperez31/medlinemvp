import { Animated, Image, Pressable, Text, View } from 'react-native';
import { useRef } from 'react';
import type { Document, DocumentCategory } from '@/types/insurance';

const CATEGORY_ICONS: Record<DocumentCategory | string, string> = {
  sangre: '🩸',
  radiografia: '🔬',
  ekg: '📈',
  ecografia: '🫁',
  prescripcion: '📝',
  vacuna: '💉',
  otro: '📄',
};

function formatBytes(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface Props {
  document: Document;
  onPress: () => void;
  onDelete: () => void;
  onShare: () => void;
}

export function DocumentCard({ document: doc, onPress, onDelete, onShare }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isImage = doc.mimeType?.startsWith('image/');

  function handlePressIn() {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  }

  function handlePressOut() {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className="bg-white rounded-2xl mb-3 border border-[#E2E8F0] overflow-hidden"
      >
        <View className="flex-row items-center p-4">
          <View className="w-14 h-14 rounded-xl bg-[#F1F5F9] items-center justify-center mr-3 overflow-hidden">
            {isImage && doc.localUri ? (
              <Image source={{ uri: doc.localUri }} style={{ width: 56, height: 56 }} resizeMode="cover" />
            ) : (
              <Text className="text-2xl">{CATEGORY_ICONS[doc.category ?? 'otro']}</Text>
            )}
          </View>

          <View className="flex-1">
            <Text className="text-sm font-bold text-[#0F172A] font-[Inter_700Bold]" numberOfLines={1}>
              {doc.name}
            </Text>
            <Text className="text-xs text-[#64748B] mt-0.5 font-[Inter_400Regular]">
              {CATEGORY_ICONS[doc.category ?? 'otro']} {doc.category ?? 'Documento'} • {formatBytes(doc.size)}
            </Text>
            <View className="flex-row items-center gap-1.5 mt-1">
              {doc.remoteUrl ? (
                <View className="flex-row items-center gap-0.5">
                  <Text className="text-[10px] text-[#059669]">☁️</Text>
                  <Text className="text-[10px] text-[#059669] font-[Inter_400Regular]">Sincronizado</Text>
                </View>
              ) : doc.localUri ? (
                <View className="flex-row items-center gap-0.5">
                  <Text className="text-[10px] text-[#D97706]">⏳</Text>
                  <Text className="text-[10px] text-[#D97706] font-[Inter_400Regular]">Pendiente sync</Text>
                </View>
              ) : null}
              {doc.uploadedAt && (
                <Text className="text-[10px] text-[#94A3B8] font-[Inter_400Regular]">
                  {new Date(doc.uploadedAt).toLocaleDateString('es-DO')}
                </Text>
              )}
            </View>
          </View>

          <View className="flex-row gap-2">
            <Pressable onPress={onShare} className="w-9 h-9 bg-[#F1F5F9] rounded-lg items-center justify-center">
              <Text className="text-sm">↗</Text>
            </Pressable>
            <Pressable onPress={onDelete} className="w-9 h-9 bg-[#FEF2F2] rounded-lg items-center justify-center">
              <Text className="text-sm">🗑</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
