import type { WaitTimePrediction } from '@/types/appointment';
import type { Doctor } from '@/types/doctor';

export function predictWaitTime(
  doctor: Doctor,
  selectedTime: string,
  date: Date
): WaitTimePrediction {
  const baseWait = doctor.avgWaitTimeMinutes;
  const hour = parseInt(selectedTime.split(':')[0], 10);
  const isRushHour = (hour >= 9 && hour <= 11) || (hour >= 14 && hour <= 16);
  const hourMultiplier = isRushHour ? 1.3 : 1.0;

  const dayOfWeek = date.getDay();
  const dayMultiplier =
    dayOfWeek === 1 ? 1.2 :
    dayOfWeek === 5 ? 1.15 :
    dayOfWeek === 0 || dayOfWeek === 6 ? 0.85 :
    1.0;

  const estimatedWait = Math.round(baseWait * hourMultiplier * dayMultiplier);

  const label: WaitTimePrediction['label'] =
    estimatedWait < 10 ? 'Espera mínima' :
    estimatedWait < 20 ? 'Espera moderada' :
    'Espera alta';

  return {
    minutes: estimatedWait,
    confidence: 0.82,
    label,
  };
}
