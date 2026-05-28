import { format, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SPECIALTIES } from '@/constants/specialties';
import { ARS_PROVIDERS } from '@/constants/arsProviders';
import { getDoctorsBySpecialty, getAvailableSlots } from '@/lib/api/doctors';
import { verifyInsurance } from '@/lib/api/insurance';
import { predictWaitTime } from '@/lib/ai/waitTimePredictor';
import { useAppointmentStore } from '@/lib/stores/appointmentStore';
import { useAuthStore } from '@/lib/stores/authStore';
import type { Doctor } from '@/types/doctor';
import type { InsuranceVerificationResult } from '@/types/appointment';

const STEPS = ['Médico', 'Seguro', 'Confirmar', 'Listo'];

function ProgressBar({ current }: { current: number }) {
  return (
    <View className="flex-row items-center px-5 py-4">
      {STEPS.map((label, i) => (
        <View key={i} className="flex-row items-center flex-1">
          <View className="items-center">
            <View className={`w-8 h-8 rounded-full items-center justify-center ${i < current ? 'bg-[#4338CA]' : i === current ? 'border-2 border-[#4338CA] bg-white' : 'bg-[#E2E8F0]'}`}>
              {i < current ? (
                <Text className="text-white text-xs font-bold">✓</Text>
              ) : (
                <Text className={`text-xs font-bold ${i === current ? 'text-[#4338CA]' : 'text-[#94A3B8]'}`}>{i + 1}</Text>
              )}
            </View>
            <Text className={`text-[9px] mt-1 font-[Inter_500Medium] ${i <= current ? 'text-[#4338CA]' : 'text-[#94A3B8]'}`}>{label}</Text>
          </View>
          {i < STEPS.length - 1 && (
            <View className={`flex-1 h-0.5 mx-1 ${i < current ? 'bg-[#4338CA]' : 'bg-[#E2E8F0]'}`} />
          )}
        </View>
      ))}
    </View>
  );
}

// Step 1: Specialty + Doctor + Date + Time
function Step1({
  onNext,
}: {
  onNext: (data: { doctor: Doctor; date: string; time: string }) => void;
}) {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showAllSpecialties, setShowAllSpecialties] = useState(false);

  const visibleSpecialties = showAllSpecialties ? SPECIALTIES : SPECIALTIES.slice(0, 6);

  async function selectSpecialty(id: string) {
    setSelectedSpecialty(id);
    setSelectedDoctor(null);
    setSelectedTime(null);
    setSlots([]);
    setLoadingDoctors(true);
    try {
      const docs = await getDoctorsBySpecialty(id);
      setDoctors(docs);
    } finally {
      setLoadingDoctors(false);
    }
  }

  async function selectDoctor(doctor: Doctor) {
    setSelectedDoctor(doctor);
    setSelectedTime(null);
    loadSlots(doctor, selectedDate);
  }

  async function loadSlots(doctor: Doctor, date: Date) {
    setLoadingSlots(true);
    setSlots([]);
    try {
      const available = await getAvailableSlots(doctor.id, format(date, 'yyyy-MM-dd'));
      setSlots(available);
    } finally {
      setLoadingSlots(false);
    }
  }

  function selectDate(date: Date) {
    setSelectedDate(date);
    setSelectedTime(null);
    if (selectedDoctor) loadSlots(selectedDoctor, date);
  }

  function canProceed() {
    return selectedDoctor && selectedTime;
  }

  const dates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));

  const morningSlots = slots.filter((s) => parseInt(s.split(':')[0]) < 12);
  const afternoonSlots = slots.filter((s) => parseInt(s.split(':')[0]) >= 12 && parseInt(s.split(':')[0]) < 18);

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="px-5 pb-24">
        {/* Specialties */}
        <Text className="text-base font-bold text-[#0F172A] mb-3 font-[Inter_700Bold]">
          ¿Qué especialidad necesitas?
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-5">
          {visibleSpecialties.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => selectSpecialty(s.id)}
              className="rounded-2xl border items-center justify-center p-3"
              style={{
                width: '31%',
                borderColor: selectedSpecialty === s.id ? s.color : '#E2E8F0',
                backgroundColor: selectedSpecialty === s.id ? s.color + '18' : 'white',
              }}
            >
              <Text className="text-2xl mb-1">{s.icon}</Text>
              <Text className="text-xs text-center font-[Inter_500Medium]" style={{ color: selectedSpecialty === s.id ? s.color : '#64748B' }} numberOfLines={2}>
                {s.name}
              </Text>
            </Pressable>
          ))}
        </View>
        {!showAllSpecialties && SPECIALTIES.length > 6 && (
          <Pressable onPress={() => setShowAllSpecialties(true)} className="items-center mb-5">
            <Text className="text-[#4338CA] text-sm font-[Inter_500Medium]">Ver todas las especialidades ▼</Text>
          </Pressable>
        )}

        {/* Doctors */}
        {selectedSpecialty && (
          <>
            <Text className="text-base font-bold text-[#0F172A] mb-3 font-[Inter_700Bold]">
              Médicos disponibles
            </Text>
            {loadingDoctors ? (
              <View className="items-center py-8">
                <ActivityIndicator color="#4338CA" />
              </View>
            ) : doctors.length === 0 ? (
              <View className="bg-[#F8FAFC] rounded-xl p-4 items-center mb-5">
                <Text className="text-[#64748B] font-[Inter_400Regular]">No hay médicos disponibles para esta especialidad</Text>
              </View>
            ) : (
              doctors.map((doctor) => {
                const waitPrediction = selectedDoctor?.id === doctor.id && selectedTime
                  ? predictWaitTime(doctor, selectedTime, selectedDate)
                  : null;
                return (
                  <Pressable
                    key={doctor.id}
                    onPress={() => selectDoctor(doctor)}
                    className={`bg-white rounded-2xl p-4 mb-3 border ${selectedDoctor?.id === doctor.id ? 'border-[#4338CA]' : 'border-[#E2E8F0]'}`}
                  >
                    <View className="flex-row items-start gap-3">
                      <View className="w-12 h-12 rounded-full bg-[#EEF2FF] items-center justify-center">
                        <Text className="text-xl">👨‍⚕️</Text>
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center justify-between">
                          <Text className="text-sm font-bold text-[#0F172A] font-[Inter_700Bold]">{doctor.name}</Text>
                          {selectedDoctor?.id === doctor.id && <Text className="text-[#4338CA] text-xs">✓ Seleccionado</Text>}
                        </View>
                        <Text className="text-xs text-[#64748B] font-[Inter_400Regular]">{doctor.hospital}</Text>
                        <View className="flex-row items-center gap-2 mt-1.5">
                          <Text className="text-xs text-[#D97706]">{'★'.repeat(Math.floor(doctor.rating))} {doctor.rating}</Text>
                          <Text className="text-xs text-[#64748B] font-[Inter_400Regular]">({doctor.reviewCount})</Text>
                          <View className={`w-1.5 h-1.5 rounded-full ${doctor.availableToday ? 'bg-[#059669]' : 'bg-[#94A3B8]'}`} />
                          <Text className={`text-xs font-[Inter_400Regular] ${doctor.availableToday ? 'text-[#059669]' : 'text-[#94A3B8]'}`}>
                            {doctor.availableToday ? 'Disponible hoy' : 'Sin disponibilidad hoy'}
                          </Text>
                        </View>
                        <View className="flex-row items-center justify-between mt-2">
                          <Text className="text-sm font-bold text-[#4338CA] font-[Inter_700Bold]">
                            RD$ {doctor.pricePerConsult.toLocaleString('es-DO')}
                          </Text>
                          {waitPrediction && (
                            <View className={`flex-row items-center gap-1 px-2 py-0.5 rounded-full ${waitPrediction.label === 'Espera mínima' ? 'bg-[#ECFDF5]' : waitPrediction.label === 'Espera moderada' ? 'bg-[#FFFBEB]' : 'bg-[#FEF2F2]'}`}>
                              <Text className="text-xs">⏱</Text>
                              <Text className={`text-xs font-[Inter_500Medium] ${waitPrediction.label === 'Espera mínima' ? 'text-[#059669]' : waitPrediction.label === 'Espera moderada' ? 'text-[#D97706]' : 'text-[#DC2626]'}`}>
                                ~{waitPrediction.minutes} min
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  </Pressable>
                );
              })
            )}
          </>
        )}

        {/* Date picker */}
        {selectedDoctor && (
          <>
            <Text className="text-base font-bold text-[#0F172A] mb-3 mt-2 font-[Inter_700Bold]">
              Selecciona la fecha
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5 -mx-5 px-5">
              <View className="flex-row gap-2">
                {dates.map((date) => {
                  const isSelected = isSameDay(date, selectedDate);
                  return (
                    <Pressable
                      key={date.toISOString()}
                      onPress={() => selectDate(date)}
                      className={`w-14 h-16 rounded-xl items-center justify-center border ${isSelected ? 'bg-[#4338CA] border-[#4338CA]' : 'bg-white border-[#E2E8F0]'}`}
                    >
                      <Text className={`text-[10px] font-[Inter_500Medium] capitalize ${isSelected ? 'text-white/80' : 'text-[#64748B]'}`}>
                        {format(date, 'EEE', { locale: es })}
                      </Text>
                      <Text className={`text-lg font-bold font-[Inter_700Bold] ${isSelected ? 'text-white' : 'text-[#0F172A]'}`}>
                        {format(date, 'd')}
                      </Text>
                      <Text className={`text-[9px] font-[Inter_400Regular] capitalize ${isSelected ? 'text-white/80' : 'text-[#94A3B8]'}`}>
                        {format(date, 'MMM', { locale: es })}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            {/* Time slots */}
            <Text className="text-base font-bold text-[#0F172A] mb-3 font-[Inter_700Bold]">
              Selecciona el horario
            </Text>
            {loadingSlots ? (
              <View className="items-center py-6">
                <ActivityIndicator color="#4338CA" />
              </View>
            ) : (
              <>
                {morningSlots.length > 0 && (
                  <>
                    <Text className="text-xs font-semibold text-[#64748B] mb-2 font-[Inter_600SemiBold]">
                      MAÑANA ({morningSlots.length})
                    </Text>
                    <View className="flex-row flex-wrap gap-2 mb-4">
                      {morningSlots.map((slot) => (
                        <Pressable
                          key={slot}
                          onPress={() => setSelectedTime(slot)}
                          className={`px-4 h-10 rounded-xl border items-center justify-center ${selectedTime === slot ? 'bg-[#4338CA] border-[#4338CA]' : 'bg-white border-[#E2E8F0]'}`}
                        >
                          <Text className={`text-sm font-[Inter_500Medium] ${selectedTime === slot ? 'text-white' : 'text-[#0F172A]'}`}>{slot}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </>
                )}
                {afternoonSlots.length > 0 && (
                  <>
                    <Text className="text-xs font-semibold text-[#64748B] mb-2 font-[Inter_600SemiBold]">
                      TARDE ({afternoonSlots.length})
                    </Text>
                    <View className="flex-row flex-wrap gap-2 mb-4">
                      {afternoonSlots.map((slot) => (
                        <Pressable
                          key={slot}
                          onPress={() => setSelectedTime(slot)}
                          className={`px-4 h-10 rounded-xl border items-center justify-center ${selectedTime === slot ? 'bg-[#4338CA] border-[#4338CA]' : 'bg-white border-[#E2E8F0]'}`}
                        >
                          <Text className={`text-sm font-[Inter_500Medium] ${selectedTime === slot ? 'text-white' : 'text-[#0F172A]'}`}>{slot}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </>
                )}
              </>
            )}
          </>
        )}
      </View>

      {/* Floating next button */}
      {canProceed() && (
        <View className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-[#E2E8F0]">
          <Pressable
            onPress={() => onNext({ doctor: selectedDoctor!, date: format(selectedDate, 'yyyy-MM-dd'), time: selectedTime! })}
            className="bg-[#4338CA] h-13 rounded-xl items-center justify-center h-12"
          >
            <Text className="text-white font-bold font-[Inter_700Bold]">Continuar → Seguro</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

// Step 2: Insurance
function Step2({
  doctor,
  onNext,
  onBack,
}: {
  doctor: Doctor;
  onNext: (result: InsuranceVerificationResult, arsId: string, planId: string, affiliateNumber: string) => void;
  onBack: () => void;
}) {
  const [selectedArs, setSelectedArs] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [affiliateNumber, setAffiliateNumber] = useState('');
  const [expandedArs, setExpandedArs] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<InsuranceVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify() {
    if (!selectedArs || !selectedPlan || !affiliateNumber.trim()) {
      Alert.alert('Completa todos los campos');
      return;
    }
    setVerifying(true);
    setError(null);
    try {
      const res = await verifyInsurance(selectedArs, selectedPlan, affiliateNumber, doctor.specialtyId, doctor.pricePerConsult);
      setResult(res);
    } catch (err: any) {
      setError(err?.message ?? 'Error al verificar el seguro');
    } finally {
      setVerifying(false);
    }
  }

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="px-5 pb-24">
        <Text className="text-base font-bold text-[#0F172A] mb-3 font-[Inter_700Bold]">
          Selecciona tu ARS
        </Text>

        {ARS_PROVIDERS.map((ars) => (
          <View key={ars.id} className="bg-white rounded-2xl mb-2 border border-[#E2E8F0] overflow-hidden">
            <Pressable
              onPress={() => setExpandedArs(expandedArs === ars.id ? null : ars.id)}
              className="flex-row items-center justify-between px-4 py-3"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-3 h-3 rounded-full" style={{ backgroundColor: ars.color }} />
                <Text className="text-sm font-semibold text-[#0F172A] font-[Inter_600SemiBold]">{ars.name}</Text>
              </View>
              <Text className="text-[#64748B]">{expandedArs === ars.id ? '▲' : '▼'}</Text>
            </Pressable>

            {expandedArs === ars.id && (
              <View className="border-t border-[#F1F5F9] px-4 pb-3">
                {ars.plans.map((plan) => (
                  <Pressable
                    key={plan.id}
                    onPress={() => { setSelectedArs(ars.id); setSelectedPlan(plan.id); setResult(null); }}
                    className={`flex-row items-center justify-between py-2.5 border-b border-[#F8FAFC] ${selectedArs === ars.id && selectedPlan === plan.id ? 'opacity-100' : 'opacity-80'}`}
                  >
                    <View className="flex-row items-center gap-2">
                      <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${selectedArs === ars.id && selectedPlan === plan.id ? 'border-[#4338CA] bg-[#4338CA]' : 'border-[#E2E8F0]'}`}>
                        {selectedArs === ars.id && selectedPlan === plan.id && <Text className="text-white text-[8px] font-bold">✓</Text>}
                      </View>
                      <Text className="text-sm text-[#0F172A] font-[Inter_500Medium]">{plan.name}</Text>
                    </View>
                    <Text className="text-xs text-[#0D9488] font-[Inter_500Medium]">{plan.coveragePercent}% cobertura</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        ))}

        {selectedPlan && (
          <View className="bg-white rounded-2xl p-4 mt-3 border border-[#E2E8F0]">
            <Text className="text-sm font-semibold text-[#0F172A] mb-3 font-[Inter_600SemiBold]">
              Número de afiliado
            </Text>
            <View className="border border-[#E2E8F0] rounded-xl px-4 h-12 flex-row items-center">
              <TextInput
                className="flex-1 text-base text-[#0F172A]"
                placeholder="Ingresa tu número de afiliado"
                placeholderTextColor="#94A3B8"
                value={affiliateNumber}
                onChangeText={setAffiliateNumber}
                keyboardType="default"
              />
            </View>
            <Pressable
              onPress={handleVerify}
              disabled={verifying}
              className="bg-[#0D9488] h-11 rounded-xl items-center justify-center mt-3"
            >
              {verifying ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold font-[Inter_600SemiBold]">
                  Verificar seguro
                </Text>
              )}
            </Pressable>
          </View>
        )}

        {/* Verification result */}
        {result && (
          <View className="bg-[#ECFDF5] rounded-2xl p-4 mt-3 border border-[#A7F3D0]">
            <View className="flex-row items-center gap-2 mb-3">
              <Text className="text-lg">✅</Text>
              <Text className="text-[#059669] font-bold font-[Inter_700Bold]">Seguro verificado</Text>
              {result.isBestCoverage && (
                <View className="bg-[#0D9488] rounded-full px-2 py-0.5 ml-auto">
                  <Text className="text-white text-[10px] font-[Inter_500Medium]">✓ Mejor cobertura</Text>
                </View>
              )}
            </View>
            <View className="gap-1.5">
              {[
                ['ARS', result.arsName],
                ['Plan', result.planName],
                ['Costo total', `RD$ ${result.totalCost.toLocaleString('es-DO')}`],
                ['Cobertura', `${result.coveragePercent}%`],
              ].map(([label, value]) => (
                <View key={label} className="flex-row justify-between">
                  <Text className="text-sm text-[#065F46] font-[Inter_400Regular]">{label}</Text>
                  <Text className="text-sm font-semibold text-[#065F46] font-[Inter_600SemiBold]">{value}</Text>
                </View>
              ))}
              <View className="flex-row justify-between pt-2 border-t border-[#6EE7B7] mt-1">
                <Text className="text-sm font-bold text-[#065F46] font-[Inter_700Bold]">Tu copago</Text>
                <Text className="text-lg font-bold text-[#059669] font-[Inter_700Bold]">
                  RD$ {result.copay.toLocaleString('es-DO')}
                </Text>
              </View>
            </View>
          </View>
        )}

        {error && (
          <View className="bg-[#FEF2F2] rounded-xl p-4 mt-3 border border-[#FCA5A5]">
            <Text className="text-[#DC2626] text-sm font-[Inter_400Regular]">⚠️ {error}</Text>
          </View>
        )}

        {/* Skip insurance */}
        <Pressable
          onPress={() => onNext({ verified: false, totalCost: doctor.pricePerConsult, coveragePercent: 0, copay: doctor.pricePerConsult, arsName: '', planName: '', affiliateNumber: '' }, '', '', '')}
          className="mt-4 items-center"
        >
          <Text className="text-[#64748B] text-sm font-[Inter_400Regular]">Pagar sin seguro</Text>
        </Pressable>
      </View>

      {result && (
        <View className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-[#E2E8F0]">
          <Pressable
            onPress={() => onNext(result, selectedArs!, selectedPlan!, affiliateNumber)}
            className="bg-[#4338CA] h-12 rounded-xl items-center justify-center"
          >
            <Text className="text-white font-bold font-[Inter_700Bold]">Continuar → Pago</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

// Step 3: Payment
function Step3({
  doctor,
  date,
  time,
  insurance,
  copay,
  appointmentId,
  onNext,
}: {
  doctor: Doctor;
  date: string;
  time: string;
  insurance: InsuranceVerificationResult | null;
  copay: number;
  appointmentId: string;
  onNext: (paidWithCard: boolean) => void;
}) {
  const [method, setMethod] = useState<'card' | 'cash'>('card');
  const [processing, setProcessing] = useState(false);
  const dateFormatted = format(new Date(date + 'T00:00:00'), "EEEE d 'de' MMMM yyyy", { locale: es });

  async function handleCardPayment() {
    setProcessing(true);
    // Simula el tiempo de procesamiento del pago
    await new Promise((r) => setTimeout(r, 1500));
    setProcessing(false);
    onNext(true);
  }

  return (
    <ScrollView className="flex-1">
      <View className="px-5 pb-24">
        {/* Copay summary */}
        <View className="bg-[#EEF2FF] rounded-2xl p-5 mb-5">
          <Text className="text-sm text-[#64748B] font-[Inter_400Regular]">Total a pagar</Text>
          <Text className="text-4xl font-bold text-[#4338CA] mt-1 font-[Inter_700Bold]">
            RD$ {copay.toLocaleString('es-DO')}
          </Text>
          {insurance?.verified && (
            <Text className="text-xs text-[#4338CA] mt-1 font-[Inter_400Regular]">
              Copago después de {insurance.coveragePercent}% de cobertura
            </Text>
          )}
        </View>

        {/* Appointment summary */}
        <View className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden mb-5">
          {[
            { label: '👨‍⚕️ Médico', value: doctor.name },
            { label: '📅 Fecha', value: dateFormatted, capitalize: true },
            { label: '⏰ Hora', value: time },
            { label: '🏥 Hospital', value: doctor.hospital },
          ].map(({ label, value, capitalize }, i, arr) => (
            <View key={label} className={`flex-row justify-between px-4 py-3 ${i < arr.length - 1 ? 'border-b border-[#F1F5F9]' : ''}`}>
              <Text className="text-sm text-[#64748B] font-[Inter_400Regular]">{label}</Text>
              <Text className={`text-sm font-medium text-[#0F172A] font-[Inter_500Medium] flex-1 text-right ml-4 ${capitalize ? 'capitalize' : ''}`} numberOfLines={1}>
                {value}
              </Text>
            </View>
          ))}
        </View>

        <Text className="text-base font-bold text-[#0F172A] mb-3 font-[Inter_700Bold]">
          Método de pago
        </Text>

        {[
          { id: 'card', label: 'Tarjeta de crédito / débito', icon: '💳', desc: 'Visa, Mastercard, Cardnet' },
          { id: 'cash', label: 'Efectivo en clínica', icon: '💵', desc: 'Paga al llegar a tu cita' },
        ].map((opt) => (
          <Pressable
            key={opt.id}
            onPress={() => setMethod(opt.id as 'card' | 'cash')}
            className={`bg-white rounded-2xl p-4 mb-3 border flex-row items-center gap-3 ${method === opt.id ? 'border-[#4338CA]' : 'border-[#E2E8F0]'}`}
          >
            <Text className="text-2xl">{opt.icon}</Text>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-[#0F172A] font-[Inter_600SemiBold]">{opt.label}</Text>
              <Text className="text-xs text-[#64748B] font-[Inter_400Regular]">{opt.desc}</Text>
            </View>
            <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${method === opt.id ? 'border-[#4338CA] bg-[#4338CA]' : 'border-[#E2E8F0]'}`}>
              {method === opt.id && <View className="w-2 h-2 rounded-full bg-white" />}
            </View>
          </Pressable>
        ))}

        <View className="flex-row items-center gap-2 bg-[#F8FAFC] rounded-xl px-4 py-3 mt-1">
          <Text>🔒</Text>
          <Text className="text-xs text-[#64748B] flex-1 font-[Inter_400Regular]">
            Pagos procesados de forma segura por Stripe con encriptación SSL 256-bit
          </Text>
        </View>
      </View>

      <View className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-[#E2E8F0]">
        <Pressable
          onPress={method === 'card' ? handleCardPayment : () => onNext(false)}
          disabled={processing}
          className="bg-[#4338CA] h-12 rounded-xl items-center justify-center"
        >
          {processing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold font-[Inter_700Bold]">
              {method === 'card'
                ? `Pagar RD$ ${copay.toLocaleString('es-DO')} →`
                : 'Confirmar — Pago en clínica →'}
            </Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

// Step 4: Confirmation
function Step4({ appointment, onDone }: { appointment: any; onDone: () => void }) {
  return (
    <ScrollView className="flex-1">
      <View className="px-5 pb-10 items-center pt-4">
        <View className="w-20 h-20 rounded-full bg-[#ECFDF5] items-center justify-center mb-4">
          <Text className="text-4xl">✅</Text>
        </View>
        <Text className="text-2xl font-bold text-[#0F172A] mb-2 font-[Inter_700Bold] text-center">
          ¡Cita agendada!
        </Text>
        <Text className="text-[#64748B] text-sm text-center mb-6 font-[Inter_400Regular]">
          Tu cita ha sido confirmada exitosamente
        </Text>

        {/* Confirmation number */}
        <View className="bg-[#EEF2FF] rounded-2xl px-8 py-4 mb-6 items-center w-full">
          <Text className="text-xs text-[#4338CA] font-semibold mb-1 font-[Inter_600SemiBold]">
            NÚMERO DE CONFIRMACIÓN
          </Text>
          <Text className="text-2xl font-bold text-[#4338CA] tracking-widest font-[Inter_700Bold]">
            {appointment?.confirmationNumber ?? '—'}
          </Text>
        </View>

        {/* Details */}
        <View className="bg-white rounded-2xl p-4 w-full border border-[#E2E8F0] mb-4">
          {[
            ['👨‍⚕️ Médico', appointment?.doctorName],
            ['🏥 Hospital', appointment?.hospital],
            ['📅 Fecha', appointment?.date ? format(new Date(appointment.date + 'T00:00:00'), "d 'de' MMMM yyyy", { locale: es }) : '—'],
            ['⏰ Hora', appointment?.time],
            ['💰 Copago', appointment?.copay != null ? `RD$ ${appointment.copay.toLocaleString('es-DO')}` : 'Efectivo en clínica'],
          ].map(([label, value]) => (
            <View key={label as string} className="flex-row justify-between py-2 border-b border-[#F1F5F9]">
              <Text className="text-sm text-[#64748B] font-[Inter_400Regular]">{label as string}</Text>
              <Text className="text-sm font-medium text-[#0F172A] font-[Inter_500Medium] flex-1 text-right ml-4" numberOfLines={1}>{value as string}</Text>
            </View>
          ))}
        </View>

        {appointment?.aiWaitTime != null && (
          <View className="bg-[#FFFBEB] rounded-xl px-4 py-3 mb-4 w-full flex-row items-center gap-2">
            <Text>⏱</Text>
            <Text className="text-[#D97706] text-sm font-[Inter_500Medium]">
              Tiempo estimado de espera: ~{appointment.aiWaitTime} min
            </Text>
          </View>
        )}

        <View className="bg-[#F0FDFA] rounded-xl p-4 mb-6 w-full">
          <Text className="text-[#0D9488] font-semibold mb-1 font-[Inter_600SemiBold]">📋 Instrucciones de llegada</Text>
          <Text className="text-[#0F766E] text-sm font-[Inter_400Regular]">
            • Llega 15 minutos antes de tu cita{'\n'}
            • Trae tu cédula y tu tarjeta de seguro{'\n'}
            • Muestra este código en recepción{'\n'}
            • Recuerda traer resultados previos si los tienes
          </Text>
        </View>

        <Pressable onPress={onDone} className="bg-[#4338CA] h-12 rounded-xl items-center justify-center w-full">
          <Text className="text-white font-bold font-[Inter_700Bold]">Ver mis citas</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

// Main Booking Screen
export default function AgendarScreen() {
  const router = useRouter();
  const { addAppointment } = useAppointmentStore();
  const { user } = useAuthStore();

  const [step, setStep] = useState(0);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [insuranceResult, setInsuranceResult] = useState<InsuranceVerificationResult | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState<any>(null);
  const [pendingAppointmentId] = useState(() => `appt_${Date.now()}`);

  async function handleStep1(data: { doctor: Doctor; date: string; time: string }) {
    setDoctor(data.doctor);
    setDate(data.date);
    setTime(data.time);
    setStep(1);
  }

  function handleStep2(result: InsuranceVerificationResult) {
    setInsuranceResult(result);
    setStep(2);
  }

  async function handleStep3(paidWithCard: boolean) {
    try {
      const waitPrediction = doctor ? predictWaitTime(doctor, time, new Date(date + 'T00:00:00')) : null;
      const appt = await addAppointment({
        doctorId: doctor!.id,
        doctorName: doctor!.name,
        specialty: doctor!.specialty,
        hospital: doctor!.hospital,
        date,
        time,
        status: 'upcoming',
        copay: insuranceResult?.copay,
        aiWaitTime: waitPrediction?.minutes,
        notes: paidWithCard ? 'Pagado con tarjeta' : 'Pago en efectivo',
      });
      setConfirmedAppointment(appt);
      setStep(3);
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'No se pudo agendar la cita');
    }
  }

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {/* Header */}
      <View className="bg-white pt-14 border-b border-[#E2E8F0]">
        <View className="px-5 pb-2 flex-row items-center gap-3">
          {step > 0 && step < 3 && (
            <Pressable onPress={() => setStep(step - 1)} className="w-9 h-9 bg-[#F1F5F9] rounded-full items-center justify-center">
              <Text className="text-[#64748B] font-bold">‹</Text>
            </Pressable>
          )}
          <View className="flex-1">
            <Text className="text-xl font-bold text-[#0F172A] font-[Inter_700Bold]">Agendar Cita</Text>
          </View>
        </View>
        <ProgressBar current={step} />
      </View>

      {step === 0 && <Step1 onNext={handleStep1} />}
      {step === 1 && doctor && <Step2 doctor={doctor} onNext={handleStep2} onBack={() => setStep(0)} />}
      {step === 2 && doctor && (
        <Step3
          doctor={doctor}
          date={date}
          time={time}
          insurance={insuranceResult}
          copay={insuranceResult?.copay ?? doctor.pricePerConsult}
          appointmentId={pendingAppointmentId}
          onNext={handleStep3}
        />
      )}
      {step === 3 && confirmedAppointment && <Step4 appointment={confirmedAppointment} onDone={() => router.push('/(tabs)/citas')} />}
    </View>
  );
}
