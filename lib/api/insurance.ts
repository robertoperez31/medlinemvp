import type { InsuranceVerificationResult } from '@/types/appointment';
import { getARSById, getPlanById } from '@/constants/arsProviders';

export async function verifyInsurance(
  arsId: string,
  planId: string,
  affiliateNumber: string,
  specialtyId: string,
  doctorPrice: number
): Promise<InsuranceVerificationResult> {
  await new Promise((r) => setTimeout(r, 2000 + Math.random() * 1000));

  const ars = getARSById(arsId);
  const plan = getPlanById(arsId, planId);

  if (!ars || !plan) {
    throw new Error('ARS o plan no encontrado');
  }

  const coveragePercent = plan.specialtyCoverage[specialtyId] ?? plan.coveragePercent;
  const covered = Math.round((doctorPrice * coveragePercent) / 100);
  const copay = doctorPrice - covered;

  const allPlans = ars.plans.map((p) => ({
    id: p.id,
    coverage: p.specialtyCoverage[specialtyId] ?? p.coveragePercent,
  }));
  const bestCoverage = Math.max(...allPlans.map((p) => p.coverage));
  const isBestCoverage = coveragePercent >= bestCoverage;

  return {
    verified: true,
    totalCost: doctorPrice,
    coveragePercent,
    copay,
    arsName: ars.name,
    planName: plan.name,
    affiliateNumber,
    isBestCoverage,
  };
}
