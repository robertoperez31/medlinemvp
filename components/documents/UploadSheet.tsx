import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useState } from 'react';
import type { DocumentCategory } from '@/types/insurance';

const CATEGORIES: { id: DocumentCategory; label: string; icon: string }[] = [
  { id: 'sangre', label: 'Análisis de sangre', icon: '🩸' },
  { id: 'radiografia', label: 'Radiografía', icon: '🔬' },
  { id: 'ekg', label: 'EKG', icon: '📈' },
  { id: 'ecografia', label: 'Ecografía', icon: '🫁' },
  { id: 'prescripcion', label: 'Receta médica', icon: '📝' },
  { id: 'vacuna', label: 'Vacuna', icon: '💉' },
  { id: 'otro', label: 'Otro', icon: '📄' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectFile: (category: DocumentCategory) => void;
  onSelectCamera: (category: DocumentCategory) => void;
}

export function UploadSheet({ visible, onClose, onSelectFile, onSelectCamera }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>('otro');

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6">
          <View className="w-10 h-1 bg-[#E2E8F0] rounded-full self-center mb-5" />
          <Text className="text-xl font-bold text-[#0F172A] mb-4 font-[Inter_700Bold]">
            Subir documento
          </Text>

          <Text className="text-sm font-medium text-[#64748B] mb-3 font-[Inter_500Medium]">Categoría</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
            <View className="flex-row gap-2">
              {CATEGORIES.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => setSelectedCategory(c.id)}
                  className={`flex-row items-center gap-1.5 px-3 h-9 rounded-full border ${selectedCategory === c.id ? 'bg-[#4338CA] border-[#4338CA]' : 'bg-white border-[#E2E8F0]'}`}
                >
                  <Text className="text-sm">{c.icon}</Text>
                  <Text className={`text-sm font-medium font-[Inter_500Medium] ${selectedCategory === c.id ? 'text-white' : 'text-[#64748B]'}`}>
                    {c.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <View className="flex-row gap-3 mb-4">
            <Pressable
              onPress={() => { onSelectFile(selectedCategory); onClose(); }}
              className="flex-1 bg-[#EEF2FF] rounded-2xl p-4 items-center border border-[#C7D2FE]"
            >
              <Text className="text-3xl mb-2">📎</Text>
              <Text className="text-[#4338CA] font-bold font-[Inter_700Bold]">Archivo</Text>
              <Text className="text-[#64748B] text-xs text-center mt-1 font-[Inter_400Regular]">
                PDF, imagen
              </Text>
            </Pressable>
            <Pressable
              onPress={() => { onSelectCamera(selectedCategory); onClose(); }}
              className="flex-1 bg-[#F0FDFA] rounded-2xl p-4 items-center border border-[#99F6E4]"
            >
              <Text className="text-3xl mb-2">📷</Text>
              <Text className="text-[#0D9488] font-bold font-[Inter_700Bold]">Escanear</Text>
              <Text className="text-[#64748B] text-xs text-center mt-1 font-[Inter_400Regular]">
                Con la cámara
              </Text>
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
