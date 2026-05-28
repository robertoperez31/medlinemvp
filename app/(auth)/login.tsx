import { zodResolver } from '@hookform/resolvers/zod';
import * as LocalAuthentication from 'expo-local-authentication';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { z } from 'zod';
import { useAuthStore } from '@/lib/stores/authStore';

const schema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginForm = z.infer<typeof schema>;

export default function LoginScreen() {
  const router = useRouter();
  const { login, isBiometricEnabled, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (isBiometricEnabled) {
      attemptBiometric();
    }
  }, [isBiometricEnabled]);

  async function attemptBiometric() {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Accede a InstaSalud',
      fallbackLabel: 'Usar contraseña',
    });
    if (result.success) {
      router.replace('/(tabs)');
    }
  }

  async function onSubmit(data: LoginForm) {
    try {
      await login(data.email, data.password);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Credenciales incorrectas. Verifica tu correo y contraseña.');
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#F8FAFC]"
    >
      <ScrollView contentContainerClassName="flex-grow" keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-6 pt-16 pb-8">
          {/* Logo */}
          <View className="items-center mb-10">
            <View className="w-16 h-16 rounded-2xl bg-[#4338CA] items-center justify-center mb-4">
              <Text className="text-white text-3xl">🏥</Text>
            </View>
            <Text className="text-3xl font-bold text-[#0F172A] font-[Inter_700Bold]">
              InstaSalud
            </Text>
            <Text className="text-[#64748B] mt-1 text-base font-[Inter_400Regular]">
              Tu salud, siempre contigo
            </Text>
          </View>

          {/* Form */}
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0]">
            <Text className="text-xl font-bold text-[#0F172A] mb-6 font-[Inter_700Bold]">
              Iniciar Sesión
            </Text>

            {/* Email */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-[#0F172A] mb-1.5 font-[Inter_500Medium]">
                Correo electrónico
              </Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value, onBlur } }) => (
                  <View
                    className={`flex-row items-center border rounded-xl px-4 h-12 bg-white ${
                      errors.email ? 'border-[#DC2626]' : 'border-[#E2E8F0]'
                    }`}
                  >
                    <Text className="mr-2 text-base">✉️</Text>
                    <View className="flex-1">
                      <Text
                        className="text-base text-[#0F172A]"
                        // @ts-ignore
                        onChangeText={onChange}
                        onBlur={onBlur}
                        value={value}
                        placeholder="tu@correo.com"
                        placeholderTextColor="#94A3B8"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        as="TextInput"
                      />
                    </View>
                  </View>
                )}
              />
              {errors.email && (
                <Text className="text-[#DC2626] text-xs mt-1">{errors.email.message}</Text>
              )}
            </View>

            {/* Password */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-[#0F172A] mb-1.5 font-[Inter_500Medium]">
                Contraseña
              </Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value, onBlur } }) => (
                  <View
                    className={`flex-row items-center border rounded-xl px-4 h-12 bg-white ${
                      errors.password ? 'border-[#DC2626]' : 'border-[#E2E8F0]'
                    }`}
                  >
                    <Text className="mr-2 text-base">🔒</Text>
                    <View className="flex-1">
                      <Text
                        className="text-base text-[#0F172A]"
                        // @ts-ignore
                        onChangeText={onChange}
                        onBlur={onBlur}
                        value={value}
                        placeholder="••••••••"
                        placeholderTextColor="#94A3B8"
                        secureTextEntry={!showPassword}
                        as="TextInput"
                      />
                    </View>
                    <Pressable onPress={() => setShowPassword(!showPassword)}>
                      <Text className="text-[#64748B]">{showPassword ? '🙈' : '👁️'}</Text>
                    </Pressable>
                  </View>
                )}
              />
              {errors.password && (
                <Text className="text-[#DC2626] text-xs mt-1">{errors.password.message}</Text>
              )}
            </View>

            {/* Login Button */}
            <Pressable
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              className="bg-[#4338CA] h-12 rounded-xl items-center justify-center mb-3"
            >
              <Text className="text-white font-semibold text-base font-[Inter_600SemiBold]">
                {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
              </Text>
            </Pressable>

            {/* Biometric */}
            {isBiometricEnabled && (
              <Pressable
                onPress={attemptBiometric}
                className="border border-[#E2E8F0] h-12 rounded-xl items-center justify-center flex-row gap-2"
              >
                <Text className="text-lg">👆</Text>
                <Text className="text-[#4338CA] font-medium font-[Inter_500Medium]">
                  Usar biometría
                </Text>
              </Pressable>
            )}
          </View>

          {/* Register link */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-[#64748B] font-[Inter_400Regular]">¿No tienes cuenta? </Text>
            <Link href="/(auth)/register" asChild>
              <Pressable>
                <Text className="text-[#4338CA] font-semibold font-[Inter_600SemiBold]">
                  Regístrate
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
