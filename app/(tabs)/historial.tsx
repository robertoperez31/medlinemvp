import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useMedicalStore } from '@/lib/stores/medicalStore';
import { useAuthStore } from '@/lib/stores/authStore';
import type { AddAllergyForm, AddConditionForm, AddMedicationForm } from '@/types/medical';
import type { BloodType } from '@/types/medical';

const BLOOD_TYPES: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const SEVERITY_COLORS = {
  alta: { bg: '#FEF2F2', text: '#DC2626', border: '#FCA5A5' },
  moderada: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
  baja: { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' },
};

function Section({
  title,
  icon,
  count,
  onAdd,
  children,
}: {
  title: string;
  icon: string;
  count: number;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(true);
  return (
    <View className="bg-white rounded-2xl mb-4 border border-[#E2E8F0] overflow-hidden">
      <Pressable
        onPress={() => setExpanded(!expanded)}
        className="flex-row items-center justify-between px-4 py-4"
      >
        <View className="flex-row items-center gap-2">
          <Text className="text-xl">{icon}</Text>
          <Text className="text-base font-bold text-[#0F172A] font-[Inter_700Bold]">{title}</Text>
          <View className="bg-[#F1F5F9] rounded-full px-2 py-0.5">
            <Text className="text-xs font-medium text-[#64748B] font-[Inter_500Medium]">{count}</Text>
          </View>
        </View>
        <Text className="text-[#64748B]">{expanded ? '▲' : '▼'}</Text>
      </Pressable>

      {expanded && (
        <View className="border-t border-[#F1F5F9]">
          {children}
          <Pressable
            onPress={onAdd}
            className="flex-row items-center gap-2 px-4 py-3 border-t border-[#F1F5F9]"
          >
            <Text className="text-[#4338CA] text-lg">+</Text>
            <Text className="text-[#4338CA] text-sm font-semibold font-[Inter_600SemiBold]">
              Agregar {title.toLowerCase()}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function AddConditionModal({ visible, onClose, onSave }: { visible: boolean; onClose: () => void; onSave: (data: AddConditionForm) => void }) {
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [status, setStatus] = useState<'activa' | 'inactiva'>('activa');
  const [notes, setNotes] = useState('');

  function save() {
    if (!name.trim()) { Alert.alert('Nombre requerido'); return; }
    onSave({ name: name.trim(), status, diagnosisYear: year || undefined, notes: notes || undefined });
    setName(''); setYear(''); setStatus('activa'); setNotes('');
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6">
          <Text className="text-xl font-bold mb-5 font-[Inter_700Bold]">Nueva Condición</Text>
          <TextInput className="border border-[#E2E8F0] rounded-xl px-4 h-12 mb-3 text-[#0F172A]" placeholder="Nombre de la condición" value={name} onChangeText={setName} />
          <TextInput className="border border-[#E2E8F0] rounded-xl px-4 h-12 mb-3 text-[#0F172A]" placeholder="Año de diagnóstico (opcional)" value={year} onChangeText={setYear} keyboardType="numeric" />
          <View className="flex-row gap-2 mb-3">
            {(['activa', 'inactiva'] as const).map((s) => (
              <Pressable key={s} onPress={() => setStatus(s)} className={`flex-1 h-11 rounded-xl items-center justify-center border ${status === s ? 'bg-[#4338CA] border-[#4338CA]' : 'border-[#E2E8F0]'}`}>
                <Text className={`font-semibold capitalize font-[Inter_600SemiBold] ${status === s ? 'text-white' : 'text-[#64748B]'}`}>{s}</Text>
              </Pressable>
            ))}
          </View>
          <TextInput className="border border-[#E2E8F0] rounded-xl px-4 py-3 mb-4 text-[#0F172A]" placeholder="Notas (opcional)" value={notes} onChangeText={setNotes} multiline numberOfLines={2} />
          <View className="flex-row gap-3">
            <Pressable onPress={onClose} className="flex-1 h-12 border border-[#E2E8F0] rounded-xl items-center justify-center"><Text className="text-[#64748B] font-semibold font-[Inter_600SemiBold]">Cancelar</Text></Pressable>
            <Pressable onPress={save} className="flex-1 h-12 bg-[#4338CA] rounded-xl items-center justify-center"><Text className="text-white font-semibold font-[Inter_600SemiBold]">Guardar</Text></Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function AddMedicationModal({ visible, onClose, onSave }: { visible: boolean; onClose: () => void; onSave: (data: AddMedicationForm) => void }) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [instructions, setInstructions] = useState('');

  function save() {
    if (!name.trim() || !frequency.trim()) { Alert.alert('Nombre y frecuencia son requeridos'); return; }
    onSave({ name: name.trim(), dosage: dosage || undefined, frequency, instructions: instructions || undefined });
    setName(''); setDosage(''); setFrequency(''); setInstructions('');
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6">
          <Text className="text-xl font-bold mb-5 font-[Inter_700Bold]">Nuevo Medicamento</Text>
          <TextInput className="border border-[#E2E8F0] rounded-xl px-4 h-12 mb-3 text-[#0F172A]" placeholder="Nombre del medicamento" value={name} onChangeText={setName} />
          <TextInput className="border border-[#E2E8F0] rounded-xl px-4 h-12 mb-3 text-[#0F172A]" placeholder="Dosis (ej. 500mg)" value={dosage} onChangeText={setDosage} />
          <TextInput className="border border-[#E2E8F0] rounded-xl px-4 h-12 mb-3 text-[#0F172A]" placeholder="Frecuencia (ej. Dos veces al día)" value={frequency} onChangeText={setFrequency} />
          <TextInput className="border border-[#E2E8F0] rounded-xl px-4 py-3 mb-4 text-[#0F172A]" placeholder="Instrucciones (opcional)" value={instructions} onChangeText={setInstructions} multiline numberOfLines={2} />
          <View className="flex-row gap-3">
            <Pressable onPress={onClose} className="flex-1 h-12 border border-[#E2E8F0] rounded-xl items-center justify-center"><Text className="text-[#64748B] font-semibold font-[Inter_600SemiBold]">Cancelar</Text></Pressable>
            <Pressable onPress={save} className="flex-1 h-12 bg-[#4338CA] rounded-xl items-center justify-center"><Text className="text-white font-semibold font-[Inter_600SemiBold]">Guardar</Text></Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function AddAllergyModal({ visible, onClose, onSave }: { visible: boolean; onClose: () => void; onSave: (data: AddAllergyForm) => void }) {
  const [name, setName] = useState('');
  const [severity, setSeverity] = useState<'alta' | 'moderada' | 'baja'>('moderada');
  const [reaction, setReaction] = useState('');

  function save() {
    if (!name.trim()) { Alert.alert('Nombre requerido'); return; }
    onSave({ name: name.trim(), severity, reaction: reaction || undefined });
    setName(''); setSeverity('moderada'); setReaction('');
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6">
          <Text className="text-xl font-bold mb-5 font-[Inter_700Bold]">Nueva Alergia</Text>
          <TextInput className="border border-[#E2E8F0] rounded-xl px-4 h-12 mb-3 text-[#0F172A]" placeholder="¿A qué eres alérgico?" value={name} onChangeText={setName} />
          <Text className="text-sm font-medium mb-2 text-[#0F172A] font-[Inter_500Medium]">Severidad</Text>
          <View className="flex-row gap-2 mb-3">
            {(['alta', 'moderada', 'baja'] as const).map((s) => (
              <Pressable key={s} onPress={() => setSeverity(s)} className="flex-1 h-11 rounded-xl items-center justify-center border" style={{ backgroundColor: severity === s ? SEVERITY_COLORS[s].bg : 'white', borderColor: severity === s ? SEVERITY_COLORS[s].border : '#E2E8F0' }}>
                <Text className="font-semibold capitalize font-[Inter_600SemiBold]" style={{ color: SEVERITY_COLORS[s].text }}>{s}</Text>
              </Pressable>
            ))}
          </View>
          <TextInput className="border border-[#E2E8F0] rounded-xl px-4 py-3 mb-4 text-[#0F172A]" placeholder="Reacción (opcional)" value={reaction} onChangeText={setReaction} multiline numberOfLines={2} />
          <View className="flex-row gap-3">
            <Pressable onPress={onClose} className="flex-1 h-12 border border-[#E2E8F0] rounded-xl items-center justify-center"><Text className="text-[#64748B] font-semibold font-[Inter_600SemiBold]">Cancelar</Text></Pressable>
            <Pressable onPress={save} className="flex-1 h-12 bg-[#4338CA] rounded-xl items-center justify-center"><Text className="text-white font-semibold font-[Inter_600SemiBold]">Guardar</Text></Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function HistorialScreen() {
  const { conditions, medications, allergies, loadAll, addCondition, deleteCondition, addMedication, deleteMedication, addAllergy, deleteAllergy, getCriticalAllergies } = useMedicalStore();
  const { user, updateProfile } = useAuthStore();

  const [showAddCondition, setShowAddCondition] = useState(false);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [showAddAllergy, setShowAddAllergy] = useState(false);

  useEffect(() => { loadAll(); }, []);

  const criticalAllergies = getCriticalAllergies();

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <View className="bg-white pt-14 pb-4 px-5 border-b border-[#E2E8F0]">
        <Text className="text-2xl font-bold text-[#0F172A] font-[Inter_700Bold]">Historial Médico</Text>
        <Text className="text-sm text-[#64748B] mt-1 font-[Inter_400Regular]">
          Tu información médica personal
        </Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-4">
        {/* Critical allergies banner */}
        {criticalAllergies.length > 0 && (
          <View className="bg-[#FEF2F2] rounded-2xl p-4 mb-4 border border-[#FCA5A5]">
            <View className="flex-row items-center gap-2 mb-2">
              <Text className="text-lg">🚨</Text>
              <Text className="text-[#DC2626] font-bold text-sm font-[Inter_700Bold]">
                ALERGIAS CRÍTICAS
              </Text>
            </View>
            {criticalAllergies.map((a) => (
              <Text key={a.id} className="text-[#DC2626] text-sm font-[Inter_400Regular]">
                • {a.name}{a.reaction ? `: ${a.reaction}` : ''}
              </Text>
            ))}
          </View>
        )}

        {/* Conditions */}
        <Section title="Condiciones Crónicas" icon="🩺" count={conditions.length} onAdd={() => setShowAddCondition(true)}>
          {conditions.map((c) => (
            <View key={c.id} className="flex-row items-center px-4 py-3 border-b border-[#F1F5F9]">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-[#0F172A] font-[Inter_600SemiBold]">{c.name}</Text>
                {c.diagnosisYear && <Text className="text-xs text-[#64748B] font-[Inter_400Regular]">Desde {c.diagnosisYear}</Text>}
                {c.notes && <Text className="text-xs text-[#94A3B8] font-[Inter_400Regular]" numberOfLines={1}>{c.notes}</Text>}
              </View>
              <View className={`rounded-full px-2 py-0.5 mr-3 ${c.status === 'activa' ? 'bg-[#ECFDF5]' : 'bg-[#F8FAFC]'}`}>
                <Text className={`text-xs font-semibold font-[Inter_600SemiBold] ${c.status === 'activa' ? 'text-[#059669]' : 'text-[#64748B]'}`}>{c.status}</Text>
              </View>
              <Pressable onPress={() => Alert.alert('Eliminar', `¿Eliminar "${c.name}"?`, [{ text: 'Cancelar' }, { text: 'Eliminar', style: 'destructive', onPress: () => deleteCondition(c.id) }])}>
                <Text className="text-[#94A3B8] text-lg">🗑</Text>
              </Pressable>
            </View>
          ))}
        </Section>

        {/* Medications */}
        <Section title="Medicamentos" icon="💊" count={medications.length} onAdd={() => setShowAddMedication(true)}>
          {medications.map((m) => (
            <View key={m.id} className="flex-row items-center px-4 py-3 border-b border-[#F1F5F9]">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-[#0F172A] font-[Inter_600SemiBold]">{m.name}</Text>
                <Text className="text-xs text-[#64748B] font-[Inter_400Regular]">
                  {m.dosage ? `${m.dosage} • ` : ''}{m.frequency}
                </Text>
              </View>
              <Pressable onPress={() => Alert.alert('Eliminar', `¿Eliminar "${m.name}"?`, [{ text: 'Cancelar' }, { text: 'Eliminar', style: 'destructive', onPress: () => deleteMedication(m.id) }])}>
                <Text className="text-[#94A3B8] text-lg">🗑</Text>
              </Pressable>
            </View>
          ))}
        </Section>

        {/* Allergies */}
        <Section title="Alergias" icon="⚠️" count={allergies.length} onAdd={() => setShowAddAllergy(true)}>
          {allergies.map((a) => (
            <View key={a.id} className="flex-row items-center px-4 py-3 border-b border-[#F1F5F9]" style={{ borderLeftWidth: 3, borderLeftColor: SEVERITY_COLORS[a.severity].border }}>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-[#0F172A] font-[Inter_600SemiBold]">{a.name}</Text>
                {a.reaction && <Text className="text-xs text-[#64748B] font-[Inter_400Regular]">{a.reaction}</Text>}
              </View>
              <View className="rounded-full px-2 py-0.5 mr-3" style={{ backgroundColor: SEVERITY_COLORS[a.severity].bg }}>
                <Text className="text-xs font-semibold font-[Inter_600SemiBold] capitalize" style={{ color: SEVERITY_COLORS[a.severity].text }}>{a.severity}</Text>
              </View>
              <Pressable onPress={() => Alert.alert('Eliminar', `¿Eliminar "${a.name}"?`, [{ text: 'Cancelar' }, { text: 'Eliminar', style: 'destructive', onPress: () => deleteAllergy(a.id) }])}>
                <Text className="text-[#94A3B8] text-lg">🗑</Text>
              </Pressable>
            </View>
          ))}
        </Section>

        {/* Profile data */}
        <View className="bg-white rounded-2xl mb-4 border border-[#E2E8F0] p-4">
          <Text className="text-base font-bold text-[#0F172A] mb-4 font-[Inter_700Bold]">📊 Datos de Salud</Text>
          <View className="flex-row flex-wrap gap-3">
            {[
              { label: 'Tipo de sangre', value: user?.bloodType ?? '—', emoji: '🩸' },
              { label: 'Peso', value: user?.weightKg ? `${user.weightKg} kg` : '—', emoji: '⚖️' },
              { label: 'Estatura', value: user?.heightCm ? `${user.heightCm} cm` : '—', emoji: '📏' },
            ].map((item) => (
              <View key={item.label} className="flex-1 min-w-24 bg-[#F8FAFC] rounded-xl p-3 items-center">
                <Text className="text-xl mb-1">{item.emoji}</Text>
                <Text className="text-base font-bold text-[#0F172A] font-[Inter_700Bold]">{item.value}</Text>
                <Text className="text-xs text-[#64748B] text-center font-[Inter_400Regular]">{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="h-6" />
      </ScrollView>

      <AddConditionModal visible={showAddCondition} onClose={() => setShowAddCondition(false)} onSave={addCondition} />
      <AddMedicationModal visible={showAddMedication} onClose={() => setShowAddMedication(false)} onSave={addMedication} />
      <AddAllergyModal visible={showAddAllergy} onClose={() => setShowAddAllergy(false)} onSave={addAllergy} />
    </View>
  );
}
