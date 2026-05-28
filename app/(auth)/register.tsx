import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { z } from 'zod';
import { useAuthStore } from '@/lib/stores/authStore';

const schema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string(),
  cedula: z.string().regex(/^\d{3}-\d{7}-\d$/, 'Formato: XXX-XXXXXXX-X').optional().or(z.literal('')),
  phone: z.string().regex(/^\(8[024]9\) \d{3}-\d{4}$/, 'Formato: (809) 000-0000').optional().or(z.literal('')),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof schema>;

function FieldInput({
  label,
  error,
  ...props
}: {
  label: string;
  error?: string;
} & React.ComponentProps<typeof TextInput>) {
  const [focused, setFocused] = useState(false);
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-[#0F172A] mb-1.5 font-[Inter_500Medium]">{label}</Text>
      <TextInput
        {...props}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        className={`border rounded-xl px-4 h-12 text-base text-[#0F172A] bg-white ${
          error ? 'border-[#DC2626]' : focused ? 'border-[#4338CA]' : 'border-[#E2E8F0]'
        }`}
        placeholderTextColor="#94A3B8"
      />
      {error && <Text className="text-[#DC2626] text-xs mt-1">{error}</Text>}
    </View>
  );
}

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [step, setStep] = useState(1);

  const { control, handleSubmit, formState: { errors }, trigger, getValues } = useForm<RegisterForm>({
    resolver: zodResolver(schema),
  });

  async function nextStep() {
    const fields: (keyof RegisterForm)[] = step === 1
      ? ['name', 'email', 'password', 'confirmPassword']
      : ['cedula', 'phone'];
    const valid = await trigger(fields);
    if (valid) setStep(step + 1);
  }

  async function onSubmit(data: RegisterForm) {
    try {
      await register({
        name: data.name,
        email: data.email,
        password: data.password,
        cedula: data.cedula || undefined,
        phone: data.phone || undefined,
      });
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Error al registrar', err?.message ?? 'Ocurrió un error. Inténtalo de nuevo.');
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#F8FAFC]"
    >
      <ScrollView contentContainerClassName="flex-grow" keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-6 pt-14 pb-8">
          {/* Header */}
          <View className="mb-8">
            <Pressable onPress={() => step > 1 ? setStep(step - 1) : router.back()} className="mb-4">
              <Text className="text-[#4338CA] text-base font-[Inter_500Medium]">← Volver</Text>
            </Pressable>
            <View className="items-center mb-2">
              <View className="w-12 h-12 rounded-xl bg-[#4338CA] items-center justify-center mb-3">
                <Text className="text-white text-2xl">🏥</Text>
              </View>
            </View>
            <Text className="text-2xl font-bold text-[#0F172A] font-[Inter_700Bold] text-center">
              Crear cuenta
            </Text>
            <Text className="text-[#64748B] text-center mt-1 font-[Inter_400Regular]">
              Paso {step} de 2
            </Text>
            {/* Progress */}
            <View className="flex-row mt-4 gap-2">
              {[1, 2].map((s) => (
                <View
                  key={s}
                  className={`flex-1 h-1 rounded-full ${s <= step ? 'bg-[#4338CA]' : 'bg-[#E2E8F0]'}`}
                />
              ))}
            </View>
          </View>

          <View className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0]">
            {step === 1 && (
              <>
                <Text className="text-lg font-bold text-[#0F172A] mb-5 font-[Inter_700Bold]">
                  Información básica
                </Text>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, value, onBlur } }) => (
                    <FieldInput
                      label="Nombre completo"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Juan Pérez"
                      autoCapitalize="words"
                      error={errors.name?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, value, onBlur } }) => (
                    <FieldInput
                      label="Correo electrónico"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="tu@correo.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      error={errors.email?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, value, onBlur } }) => (
                    <FieldInput
                      label="Contraseña"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Mínimo 6 caracteres"
                      secureTextEntry
                      error={errors.password?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, value, onBlur } }) => (
                    <FieldInput
                      label="Confirmar contraseña"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Repite tu contraseña"
                      secureTextEntry
                      error={errors.confirmPassword?.message}
                    />
                  )}
                />
                <Pressable
                  onPress={nextStep}
                  className="bg-[#4338CA] h-12 rounded-xl items-center justify-center mt-2"
                >
                  <Text className="text-white font-semibold text-base font-[Inter_600SemiBold]">
                    Continuar
                  </Text>
                </Pressable>
              </>
            )}

            {step === 2 && (
              <>
                <Text className="text-lg font-bold text-[#0F172A] mb-2 font-[Inter_700Bold]">
                  Datos personales
                </Text>
                <Text className="text-[#64748B] text-sm mb-5 font-[Inter_400Regular]">
                  Opcional — puedes completarlos después en tu perfil
                </Text>
                <Controller
                  control={control}
                  name="cedula"
                  render={({ field: { onChange, value, onBlur } }) => (
                    <FieldInput
                      label="Cédula de identidad"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="001-0000000-0"
                      keyboardType="numeric"
                      error={errors.cedula?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="phone"
                  render={({ field: { onChange, value, onBlur } }) => (
                    <FieldInput
                      label="Teléfono"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="(809) 000-0000"
                      keyboardType="phone-pad"
                      error={errors.phone?.message}
                    />
                  )}
                />

                <Pressable
                  onPress={handleSubmit(onSubmit)}
                  disabled={isLoading}
                  className="bg-[#4338CA] h-12 rounded-xl items-center justify-center mt-2 mb-3"
                >
                  <Text className="text-white font-semibold text-base font-[Inter_600SemiBold]">
                    {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => handleSubmit(onSubmit)({ name: getValues('name'), email: getValues('email'), password: getValues('password'), confirmPassword: getValues('confirmPassword') } as RegisterForm)}
                  className="items-center"
                >
                  <Text className="text-[#64748B] text-sm font-[Inter_400Regular]">Omitir por ahora</Text>
                </Pressable>
              </>
            )}
          </View>

          <View className="flex-row justify-center mt-6">
            <Text className="text-[#64748B] font-[Inter_400Regular]">¿Ya tienes cuenta? </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text className="text-[#4338CA] font-semibold font-[Inter_600SemiBold]">
                  Inicia sesión
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
